from fastapi import FastAPI, HTTPException, Depends, Header, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr, Field
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timezone, timedelta
from typing import Optional, List
import os, uuid, logging, pathlib, shutil
import httpx
import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from dotenv import load_dotenv
import os

load_dotenv()

FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("trendtracker")

async def get_finnhub_quote(symbol: str):
    url = "https://finnhub.io/api/v1/quote"

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            params={
                "symbol": symbol,
                "token": FINNHUB_API_KEY
            }
        )

        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Finnhub API Error")

        return response.json()

# ---------- Config ----------
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGO = os.environ["JWT_ALGO"]
ADMIN_EMAIL = os.environ["ADMIN_EMAIL"]
ADMIN_PASSWORD = os.environ["ADMIN_PASSWORD"]
EXTERNAL_PAYMENT_URL = os.environ["EXTERNAL_PAYMENT_URL"]
SUPPORT_PHONE = os.environ["SUPPORT_PHONE"]
SUPPORT_EMAIL = os.environ["SUPPORT_EMAIL"]
SUPPORT_ADDRESS = os.environ["SUPPORT_ADDRESS"]
TWELVE_DATA_API_KEY = os.getenv("TWELVE_DATA_API_KEY", "")


UPLOAD_ROOT = pathlib.Path(__file__).parent / "uploads"
KYC_DIR = UPLOAD_ROOT / "kyc"
IMAGES_DIR = UPLOAD_ROOT / "images"
KYC_DIR.mkdir(parents=True, exist_ok=True)
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="TrendTracker Pro API")
scheduler = AsyncIOScheduler()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=str(UPLOAD_ROOT)), name="uploads")

# ---------- Utility ----------
def now_utc() -> datetime:
    return datetime.now(timezone.utc)

def iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).isoformat()

def make_token(user_id: str, is_admin: bool) -> str:
    payload = {
        "sub": user_id,
        "adm": is_admin,
        "iat": int(now_utc().timestamp()),
        "exp": int((now_utc() + timedelta(days=30)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ", 1)[1].strip()
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    uid = payload.get("sub")
    if not uid:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    user = await db.users.find_one({"id": uid})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if user.get("is_active") is False:
        raise HTTPException(status_code=403, detail="Your account is deactivated. Please contact support.")
    user = await refresh_user_state(user)
    return user

async def require_admin(user=Depends(get_current_user)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin only")
    return user

# ---------- Credit / Trial logic ----------
async def refresh_user_state(user: dict) -> dict:
    changed = False
    now = now_utc()

    if user.get("has_membership") and user.get("credits", 0) > 0:
        last = user.get("credits_updated_at")
        if isinstance(last, str):
            last_dt = datetime.fromisoformat(last)
        elif isinstance(last, datetime):
            last_dt = last if last.tzinfo else last.replace(tzinfo=timezone.utc)
        else:
            last_dt = now
        days_elapsed = int((now - last_dt).total_seconds() // 86400)
        if days_elapsed > 0:
            new_credits = max(0, user["credits"] - days_elapsed)
            user["credits"] = new_credits
            user["credits_updated_at"] = iso(last_dt + timedelta(days=days_elapsed))
            if new_credits == 0:
                user["has_membership"] = False
                user["membership_expired_at"] = iso(now)
            changed = True

    if changed:
        await db.users.update_one({"id": user["id"]}, {"$set": {
            "credits": user["credits"],
            "credits_updated_at": user["credits_updated_at"],
            "has_membership": user.get("has_membership", False),
            "membership_expired_at": user.get("membership_expired_at"),
        }})
    return user

def compute_trial_days_left(user: dict) -> int:
    if user.get("has_membership"):
        return 0
    ends = user.get("trial_ends_at")
    if not ends:
        return 0
    if isinstance(ends, str):
        ends_dt = datetime.fromisoformat(ends)
    else:
        ends_dt = ends if ends.tzinfo else ends.replace(tzinfo=timezone.utc)
    delta = ends_dt - now_utc()
    return max(0, int(delta.total_seconds() // 86400) + (1 if delta.total_seconds() > 0 else 0))

def user_public(user: dict) -> dict:
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user.get("name", ""),
        "is_admin": user.get("is_admin", False),
        "is_active": user.get("is_active", True),
        "credits": user.get("credits", 0),
        "has_membership": user.get("has_membership", False),
        "membership_plan": user.get("membership_plan"),
        "membership_amount": user.get("membership_amount", 0),
        "membership_started_at": user.get("membership_started_at"),
        "whatsapp_url": user.get("whatsapp_url"),
        "trial_ends_at": user.get("trial_ends_at"),
        "trial_days_left": compute_trial_days_left(user),
        "access_expired": (not user.get("has_membership")) and compute_trial_days_left(user) == 0 and user.get("is_active", True),
        "kyc_status": user.get("kyc_status", "none"),
        "created_at": user.get("created_at"),
    }

# ---------- Schemas ----------
class SignupIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class PurchaseIn(BaseModel):
    plan_id: str

class PlanIn(BaseModel):
    id: str
    name: str
    price: int
    credits: int
    features: List[str]
    whatsapp_url: str = ""
    popular: bool = False
    active: bool = True

class StockIn(BaseModel):
    symbol: str
    name: str
    price: float
    change_pct: float

# ---------- Defaults ----------
DEFAULT_PLANS = [
    {"id": "starter",  "name": "Starter",  "price": 79,  "credits": 79,  "features": ["Access to core dashboard", "Daily stock picks", "Standard signal alerts", "Email support"], "whatsapp_url": "https://chat.whatsapp.com/FDGHHv9oAuJ27TZaqsRcBi", "popular": False, "active": True},
    {"id": "growth",   "name": "Growth",   "price": 149, "credits": 149, "features": ["Everything in Starter", "Premium signal alerts", "Weekly market briefing", "Priority email support"], "whatsapp_url": "https://chat.whatsapp.com/HFTApzhioAz36zO9pdJoeh", "popular": True, "active": True},
    {"id": "premium",  "name": "Premium",  "price": 199, "credits": 199, "features": ["Everything in Growth", "AI-driven stock picks", "Portfolio tracking", "VIP chat support"], "whatsapp_url": "https://chat.whatsapp.com/EFerzgeoxuV7e5NKMoZESC", "popular": False, "active": True},
    {"id": "ultimate", "name": "Ultimate", "price": 299, "credits": 299, "features": ["Everything included", "Personal advisor 1-on-1", "Unlimited access", "24/7 concierge"], "whatsapp_url": "https://chat.whatsapp.com/G7lIHBUUnitKFtMQnY99F2", "popular": False, "active": True},
]

DEFAULT_STOCKS = [
    {"symbol": "AAPL",  "name": "Apple Inc.",         "price": 189.42, "change_pct":  1.28},
    {"symbol": "MSFT",  "name": "Microsoft Corp.",    "price": 421.16, "change_pct":  0.84},
    {"symbol": "NVDA",  "name": "NVIDIA Corp.",       "price": 612.55, "change_pct":  2.71},
    {"symbol": "TSLA",  "name": "Tesla Inc.",         "price": 244.12, "change_pct": -1.44},
    {"symbol": "AMZN",  "name": "Amazon.com Inc.",    "price": 172.89, "change_pct":  0.65},
    {"symbol": "META",  "name": "Meta Platforms",     "price": 468.20, "change_pct": -0.32},
    {"symbol": "GOOGL", "name": "Alphabet Inc.",      "price": 158.71, "change_pct":  0.51},
    {"symbol": "SPY",   "name": "S&P 500 ETF",        "price": 511.36, "change_pct":  0.18},
]

# ---------- Startup ----------
@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    # Seed admin
    existing = await db.users.find_one({"email": ADMIN_EMAIL})
    if not existing:
        admin = {
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL,
            "name": "Admin",
            "password_hash": pwd_ctx.hash(ADMIN_PASSWORD),
            "is_admin": True,
            "is_active": True,
            "credits": 0,
            "has_membership": True,
            "membership_plan": "ultimate",
            "membership_amount": 0,
            "membership_started_at": iso(now_utc()),
            "credits_updated_at": iso(now_utc()),
            "trial_ends_at": iso(now_utc() + timedelta(days=3650)),
            "created_at": iso(now_utc()),
            "kyc_status": "approved",
        }
        await db.users.insert_one(admin)
        logger.info("Seeded admin user %s", ADMIN_EMAIL)
        # Start live market scheduler

    if not scheduler.running:
            
            scheduler.add_job(

                refresh_market_cache,

                "interval",

                seconds=30,

                id="market_refresh",

                replace_existing=True,

                max_instances=1,
            )
            scheduler.start()

            # Server start hote hi ek baar live data fetch karo
    await refresh_market_cache()
    

    logger.info("Finnhub live market scheduler started.")

        

    # Seed plans if empty
    if await db.plans.count_documents({}) == 0:
        await db.plans.insert_many([dict(p) for p in DEFAULT_PLANS])
        logger.info("Seeded default plans")

    # Seed stocks if empty
    if await db.stocks.count_documents({}) == 0:
        for s in DEFAULT_STOCKS:
            doc = dict(s)
            doc["id"] = str(uuid.uuid4())
            doc["direction"] = "up" if doc["change_pct"] >= 0 else "down"
            doc["updated_at"] = iso(now_utc())
            await db.stocks.insert_one(doc)
        logger.info("Seeded default stocks")
        

def strip_id(d):
    d = dict(d)
    d.pop("_id", None)
    return d

STOCKS = {
    "AAPL": "Apple Inc.",
    "MSFT": "Microsoft Corp.",
    "NVDA": "NVIDIA Corp.",
    "AMZN": "Amazon.com Inc.",
    "META": "Meta Platforms",
    "GOOGL": "Alphabet Inc.",
    "TSLA": "Tesla Inc.",
    "SPY": "S&P 500 ETF"
}

async def refresh_market_cache():
    if not FINNHUB_API_KEY:
        return

    async with httpx.AsyncClient(timeout=20) as client:
        await db.live_stocks.delete_many({})

        for symbol, name in STOCKS.items():
            try:
                response = await client.get(
                    "https://finnhub.io/api/v1/quote",
                    params={
                        "symbol": symbol,
                        "token": FINNHUB_API_KEY
                    }
                )

                if response.status_code != 200:
                    continue

                quote = response.json()

                stock = {
                    "id": str(uuid.uuid4()),
                    "symbol": symbol,
                    "name": name,
                    "price": quote.get("c", 0),
                    "change_pct": quote.get("dp", 0),
                    "direction": "up" if quote.get("dp", 0) >= 0 else "down",
                    "updated_at": iso(now_utc())
                }

                await db.live_stocks.insert_one(stock)

            except Exception as e:
                logger.error(f"{symbol}: {e}")
# ---------- Health / Config ----------
@app.get("/api/health")
async def health():
    return {"status": "ok", "time": iso(now_utc())}

@app.get("/api/config")
async def public_config():
    return {
        "external_payment_url": EXTERNAL_PAYMENT_URL,
        "support": {
            "phone": SUPPORT_PHONE,
            "email": SUPPORT_EMAIL,
            "address": SUPPORT_ADDRESS,
        },
    }

# ---------- Auth ----------
@app.post("/api/auth/signup")
async def signup(body: SignupIn):
    email = body.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists. Please log in instead.")
    now = now_utc()
    user = {
        "id": str(uuid.uuid4()),
        "email": email,
        "name": body.name.strip(),
        "password_hash": pwd_ctx.hash(body.password),
        "is_admin": False,
        "is_active": True,
        "credits": 0,
        "has_membership": False,
        "membership_plan": None,
        "membership_amount": 0,
        "membership_started_at": None,
        "credits_updated_at": iso(now),
        "trial_ends_at": iso(now + timedelta(days=7)),
        "created_at": iso(now),
        "kyc_status": "none",
    }
    await db.users.insert_one(user)
    token = make_token(user["id"], False)
    return {"token": token, "user": user_public(user)}

@app.post("/api/auth/login")
async def login(body: LoginIn):
    email = body.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not pwd_ctx.verify(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if user.get("is_active") is False:
        raise HTTPException(status_code=403, detail="Your account is deactivated. Please contact support.")
    user = await refresh_user_state(user)
    token = make_token(user["id"], user.get("is_admin", False))
    return {"token": token, "user": user_public(user)}

@app.get("/api/auth/me")
async def me(user=Depends(get_current_user)):
    return {"user": user_public(user)}

# ---------- Public plans & stocks ----------
@app.get("/api/plans")
async def get_plans():
    docs = await db.plans.find({"active": True}).to_list(50)
    docs = [strip_id(d) for d in docs]
    docs.sort(key=lambda p: p["price"])
    return {"plans": docs}

@app.get("/api/stocks")
async def get_stocks():

    docs = await db.live_stocks.find({}).to_list(100)

    if docs:
        return {
            "stocks": [strip_id(d) for d in docs],
            "source": "live"
        }

    docs = await db.stocks.find({}).to_list(100)

    return {
        "stocks": [strip_id(d) for d in docs],
        "source": "database"
    }
@app.get("/api/signals")
async def get_signals():

    stocks = await db.live_stocks.find({}).to_list(100)

    if not stocks:
        stocks = await db.stocks.find({}).to_list(100)

    signals = []

    for stock in stocks:

        change = stock.get("change_pct", 0)

        if change >= 2:
            signal = "BUY"
            color = "green"

        elif change <= -2:
            signal = "SELL"
            color = "red"

        else:
            signal = "HOLD"
            color = "yellow"

        signals.append({
            "symbol": stock["symbol"],
            "name": stock["name"],
            "price": stock["price"],
            "change_pct": change,
            "signal": signal,
            "color": color,
            "updated_at": stock["updated_at"]
        })

    signals.sort(key=lambda x: abs(x["change_pct"]), reverse=True)

    return {
        "signals": signals
    }

# ---------- Membership helpers ----------
async def _find_plan(plan_id: str):
    plan = await db.plans.find_one({"id": plan_id, "active": True})
    if not plan:
        raise HTTPException(status_code=400, detail="Invalid plan id")
    return strip_id(plan)

async def _apply_membership_to_user(user: dict, plan: dict, now: datetime):
    updates = {
        "credits": user.get("credits", 0) + plan["credits"],
        "credits_updated_at": iso(now),
        "has_membership": True,
        "membership_plan": plan["id"],
        "membership_amount": plan["price"],
        "membership_started_at": iso(now),
        "membership_expired_at": None,
        "whatsapp_url": plan.get("whatsapp_url", ""),
    }
    await db.users.update_one({"id": user["id"]}, {"$set": updates})

async def _send_email(user: dict, subject: str, body_text: str, kind: str):
    email_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "to_email": user["email"],
        "subject": subject,
        "body": body_text,
        "kind": kind,
        "sent_at": iso(now_utc()),
        "status": "sent_mock",
    }
    await db.email_logs.insert_one(email_doc)
    logger.info("[MOCK EMAIL] To=%s Subject=%s", user["email"], subject)
    return email_doc

# ---------- Membership: create pending payment + external URL ----------
@app.post("/api/membership/purchase")
async def purchase(body: PurchaseIn, user=Depends(get_current_user)):
    plan = await _find_plan(body.plan_id)
    now = now_utc()
    payment = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "user_email": user["email"],
        "user_name": user.get("name", ""),
        "plan_id": plan["id"],
        "plan_name": plan["name"],
        "amount": plan["price"],
        "credits_added": plan["credits"],
        "whatsapp_url": plan.get("whatsapp_url", ""),
        "status": "pending",
        "created_at": iso(now),
    }
    await db.memberships.insert_one(payment)

    

    # Email: purchase initiated
    subject = f"Payment initiated for {plan['name']} — TrendTracker Pro"
    body_text = (
        f"Hi {user.get('name', 'there')},\n\n"
        f"Thanks for choosing the {plan['name']} plan (${plan['price']}).\n"
        f"We have opened the secure payment page for you. Once your payment is confirmed by our team,\n"
        f"your membership and {plan['credits']} credits will be activated and you'll receive access to\n"
        f"the exclusive WhatsApp group.\n\n"
        f"Payment ID: {payment['id']}\n\n"
        f"— TrendTracker Pro"
    )
    await _send_email(user, subject, body_text, "payment_initiated")

    return {
        "ok": True,
        "payment_id": payment["id"],
        "external_payment_url": EXTERNAL_PAYMENT_URL,
        "message": "Complete your payment on the secure page. Your membership will be activated once approved.",
    }
# ---------- Payment Success Callback ----------
class PaymentSuccessIn(BaseModel):
    payment_id: str


@app.post("/api/membership/payment-success")
async def payment_success(body: PaymentSuccessIn):

    # Find payment
    payment = await db.memberships.find_one(
        {"id": body.payment_id}
    )

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    # Already activated
    if payment.get("status") == "approved":
        return {
            "ok": True,
            "message": "Membership already activated"
        }


    # Find user
    user = await db.users.find_one(
        {"id": payment["user_id"]}
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )


    # Find plan
    plan = await db.plans.find_one(
        {"id": payment["plan_id"]}
    )

    if not plan:
        raise HTTPException(
            status_code=404,
            detail="Plan not found"
        )


    now = now_utc()


    # Activate membership
    await _apply_membership_to_user(
        user,
        strip_id(plan),
        now
    )


    # Update payment status
    await db.memberships.update_one(
        {"id": body.payment_id},
        {
            "$set":{
                "status":"approved",
                "approved_at":iso(now),
                "approved_by":"payment_gateway"
            }
        }
    )


    # Confirmation email log
    await _send_email(
        user,
        f"Welcome to TrendTracker Pro {plan['name']}!",
        f"""
Hi {user.get('name','User')},

Your payment is successful.

Plan:
{plan['name']}

Credits Added:
{plan['credits']}

Your membership is now active.

Thank you,
TrendTracker Pro
""",
        "membership_confirmation"
    )


    return {
        "ok":True,
        "message":"Payment successful. Membership activated."
    }

# ---------- KYC ----------
@app.get("/api/kyc/me")
async def kyc_me(user=Depends(get_current_user)):
    doc = await db.kyc.find_one({"user_id": user["id"]})
    if not doc:
        return {"kyc": None}
    return {"kyc": strip_id(doc)}

@app.post("/api/kyc/submit")
async def kyc_submit(
    full_name: str = Form(...),
    dob: str = Form(...),
    address_line1: str = Form(...),
    address_city: str = Form(...),
    address_state: str = Form(...),
    address_zip: str = Form(...),
    passport_number: str = Form(...),
    document: UploadFile = File(...),
    user=Depends(get_current_user),
):
    if document.content_type not in ("application/pdf",):
        raise HTTPException(status_code=400, detail="Only PDF documents are accepted for KYC verification.")

    ext = ".pdf"
    filename = f"{user['id']}_{uuid.uuid4().hex[:8]}{ext}"
    dest = KYC_DIR / filename
    with dest.open("wb") as f:
        shutil.copyfileobj(document.file, f)

    now = now_utc()
    kyc_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "user_email": user["email"],
        "full_name": full_name.strip(),
        "dob": dob.strip(),
        "address_line1": address_line1.strip(),
        "address_city": address_city.strip(),
        "address_state": address_state.strip(),
        "address_zip": address_zip.strip(),
        "passport_number": passport_number.strip(),
        "document_filename": filename,
        "document_url": f"/uploads/kyc/{filename}",
        "status": "pending",
        "submitted_at": iso(now),
        "reviewed_at": None,
        "reviewed_by": None,
        "notes": None,
    }
    # Upsert: replace previous submission for same user
    await db.kyc.replace_one({"user_id": user["id"]}, kyc_doc, upsert=True)
    await db.users.update_one({"id": user["id"]}, {"$set": {"kyc_status": "pending"}})

    return {"ok": True, "kyc": kyc_doc}

# ---------- Admin: Users ----------
@app.get("/api/admin/users")
async def admin_users(user=Depends(require_admin)):
    docs = await db.users.find({}, {"password_hash": 0}).to_list(1000)
    users = []
    for d in docs:
        d.pop("_id", None)
        d = await refresh_user_state(d)
        users.append(user_public(d))
    users.sort(key=lambda x: x.get("created_at") or "", reverse=True)
    return {"users": users}

@app.patch("/api/admin/users/{uid}/status")
async def admin_toggle_user(uid: str, active: bool, user=Depends(require_admin)):
    target = await db.users.find_one({"id": uid})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.get("is_admin"):
        raise HTTPException(status_code=400, detail="Cannot deactivate an admin.")
    await db.users.update_one({"id": uid}, {"$set": {"is_active": active}})
    await _send_email(target, f"Your account has been {'activated' if active else 'deactivated'}",
                      f"Hi {target.get('name','there')},\n\nYour TrendTracker Pro account has been "
                      f"{'activated' if active else 'deactivated'} by an administrator.\n\n— TrendTracker Pro",
                      "account_status")
    return {"ok": True, "is_active": active}

# ---------- Admin: Stats & Payments ----------
@app.get("/api/admin/stats")
async def admin_stats(user=Depends(require_admin)):
    total_users = await db.users.count_documents({"is_admin": {"$ne": True}})
    members = await db.users.count_documents({"has_membership": True, "is_admin": {"$ne": True}})
    trial = total_users - members
    inactive = await db.users.count_documents({"is_active": False, "is_admin": {"$ne": True}})

    pipeline = [{"$match": {"status": "approved"}}, {"$group": {"_id": None, "revenue": {"$sum": "$amount"}, "count": {"$sum": 1}}}]
    agg = await db.memberships.aggregate(pipeline).to_list(1)
    revenue = agg[0]["revenue"] if agg else 0
    approved_count = agg[0]["count"] if agg else 0
    pending_count = await db.memberships.count_documents({"status": "pending"})

    recent = await db.memberships.find().sort("created_at", -1).to_list(20)
    return {
        "total_users": total_users,
        "active_members": members,
        "trial_users": trial,
        "inactive_users": inactive,
        "total_revenue": revenue,
        "payments_count": approved_count,
        "pending_payments": pending_count,
        "recent_payments": [strip_id(r) for r in recent],
    }

@app.get("/api/admin/payments")
async def admin_payments(user=Depends(require_admin)):
    docs = await db.memberships.find({}).sort("created_at", -1).to_list(500)
    return {"payments": [strip_id(d) for d in docs]}

@app.patch("/api/admin/payments/{pid}/approve")
async def admin_approve_payment(pid: str, user=Depends(require_admin)):
    payment = await db.memberships.find_one({"id": pid})
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    if payment.get("status") == "approved":
        return {"ok": True, "already": True}

    target = await db.users.find_one({"id": payment["user_id"]})
    if not target:
        raise HTTPException(status_code=404, detail="User not found for this payment")

    plan = await db.plans.find_one({"id": payment["plan_id"]}) or {
        "id": payment["plan_id"], "name": payment["plan_name"], "credits": payment["credits_added"],
        "price": payment["amount"], "whatsapp_url": payment.get("whatsapp_url", ""),
    }
    plan = strip_id(plan) if plan else plan

    now = now_utc()
    await _apply_membership_to_user(target, plan, now)
    await db.memberships.update_one({"id": pid}, {"$set": {"status": "approved", "approved_at": iso(now), "approved_by": user["email"]}})

    subject = f"Welcome to TrendTracker Pro {payment['plan_name']}!"
    body_text = (
        f"Hi {target.get('name','there')},\n\n"
        f"Your payment of ${payment['amount']} for the {payment['plan_name']} plan has been confirmed.\n"
        f"You have received {payment['credits_added']} credits (1 credit per day).\n"
        f"Join the exclusive WhatsApp group here: {plan.get('whatsapp_url','(link coming soon)')}\n\n"
        f"— TrendTracker Pro"
    )
    await _send_email(target, subject, body_text, "membership_confirmation")
    return {"ok": True}

@app.patch("/api/admin/payments/{pid}/reject")
async def admin_reject_payment(pid: str, user=Depends(require_admin)):
    payment = await db.memberships.find_one({"id": pid})
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    await db.memberships.update_one({"id": pid}, {"$set": {"status": "rejected", "reviewed_at": iso(now_utc()),             "reviewed_by": user["email"]}})
    return {"ok": True}

# ---------- Admin: Emails ----------
@app.get("/api/admin/emails")
async def admin_emails(user=Depends(require_admin)):
    docs = await db.email_logs.find().sort("sent_at", -1).to_list(200)
    return {"emails": [strip_id(d) for d in docs]}

# ---------- Admin: Plans CRUD ----------
@app.get("/api/admin/plans")
async def admin_list_plans(user=Depends(require_admin)):
    docs = await db.plans.find({}).to_list(50)
    docs = [strip_id(d) for d in docs]
    docs.sort(key=lambda p: p.get("price", 0))
    return {"plans": docs}

@app.post("/api/admin/plans")
async def admin_create_plan(body: PlanIn, user=Depends(require_admin)):
    existing = await db.plans.find_one({"id": body.id})
    if existing:
        raise HTTPException(status_code=409, detail="Plan id already exists")
    await db.plans.insert_one(body.model_dump())
    return {"ok": True}

@app.put("/api/admin/plans/{plan_id}")
async def admin_update_plan(plan_id: str, body: PlanIn, user=Depends(require_admin)):
    data = body.model_dump()
    data["id"] = plan_id
    result = await db.plans.update_one({"id": plan_id}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Plan not found")
    return {"ok": True}

@app.delete("/api/admin/plans/{plan_id}")
async def admin_delete_plan(plan_id: str, user=Depends(require_admin)):
    result = await db.plans.delete_one({"id": plan_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Plan not found")
    return {"ok": True}

# ---------- Admin: Stocks CRUD ----------
@app.get("/api/admin/stocks")
async def admin_list_stocks(user=Depends(require_admin)):
    docs = await db.stocks.find({}).to_list(200)
    return {"stocks": [strip_id(d) for d in docs]}

@app.post("/api/admin/stocks")
async def admin_create_stock(body: StockIn, user=Depends(require_admin)):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["direction"] = "up" if doc["change_pct"] >= 0 else "down"
    doc["updated_at"] = iso(now_utc())
    await db.stocks.insert_one(doc)
    return {"ok": True, "stock": strip_id(doc)}

@app.put("/api/admin/stocks/{sid}")
async def admin_update_stock(sid: str, body: StockIn, user=Depends(require_admin)):
    doc = body.model_dump()
    doc["direction"] = "up" if doc["change_pct"] >= 0 else "down"
    doc["updated_at"] = iso(now_utc())
    result = await db.stocks.update_one({"id": sid}, {"$set": doc})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Stock not found")
    return {"ok": True}

@app.delete("/api/admin/stocks/{sid}")
async def admin_delete_stock(sid: str, user=Depends(require_admin)):
    result = await db.stocks.delete_one({"id": sid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Stock not found")
    return {"ok": True}

# ---------- Admin: KYC ----------
@app.get("/api/admin/kyc")
async def admin_kyc_list(user=Depends(require_admin)):
    docs = await db.kyc.find({}).sort("submitted_at", -1).to_list(500)
    return {"kyc": [strip_id(d) for d in docs]}

@app.patch("/api/admin/kyc/{kid}/status")
async def admin_kyc_status(kid: str, status: str, notes: str = "", user=Depends(require_admin)):
    if status not in ("approved", "rejected", "pending"):
        raise HTTPException(status_code=400, detail="Invalid status")
    doc = await db.kyc.find_one({"id": kid})
    if not doc:
        raise HTTPException(status_code=404, detail="KYC not found")
    await db.kyc.update_one({"id": kid}, {"$set": {
        "status": status, "reviewed_at": iso(now_utc()),
        "reviewed_by": user["email"], "notes": notes,
    }})
    await db.users.update_one({"id": doc["user_id"]}, {"$set": {"kyc_status": status}})
    target = await db.users.find_one({"id": doc["user_id"]})
    if target:
        subject = f"KYC {status.upper()} — TrendTracker Pro"
        body_text = (f"Hi {target.get('name','there')},\n\nYour KYC submission has been {status}.\n"
                     + (f"Reviewer notes: {notes}\n" if notes else "")
                     + "\n— TrendTracker Pro")
        await _send_email(target, subject, body_text, "kyc_status")
    return {"ok": True}

# ---------- Dashboard content (admin-managed images per section) ----------
VALID_SECTIONS = {"portfolio", "markets", "analytics", "watchlist"}

@app.get("/api/content/{section}")
async def list_content(section: str):
    if section not in VALID_SECTIONS:
        raise HTTPException(status_code=400, detail="Invalid section")

    docs = await db.content.find({"section": section}).sort("created_at", -1).to_list(200)

    return {
        "items": [strip_id(d) for d in docs]
    }

@app.get("/api/admin/content")
async def admin_list_content(user=Depends(require_admin)):
    docs = await db.content.find({}).sort("created_at", -1).to_list(500)
    return {"items": [strip_id(d) for d in docs]}

@app.post("/api/admin/content")
async def admin_create_content(
    section: str = Form(...),
    title: str = Form(...),
    description: str = Form(""),
    image: UploadFile = File(...),
    user=Depends(require_admin),
):
    if section not in VALID_SECTIONS:
        raise HTTPException(status_code=400, detail="Invalid section")
    if image.content_type not in ("image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"):
        raise HTTPException(status_code=400, detail="Only PNG / JPEG / WEBP / GIF images accepted")
    ext = {"image/png":".png","image/jpeg":".jpg","image/jpg":".jpg","image/webp":".webp","image/gif":".gif"}[image.content_type]
    filename = f"{section}_{uuid.uuid4().hex[:10]}{ext}"
    dest = IMAGES_DIR / filename
    with dest.open("wb") as f:
        shutil.copyfileobj(image.file, f)
    doc = {
        "id": str(uuid.uuid4()),
        "section": section,
        "title": title.strip(),
        "description": description.strip(),
        "image_url": f"/uploads/images/{filename}",
        "filename": filename,
        "created_at": iso(now_utc()),
        "created_by": user["email"],
    }
    await db.content.insert_one(doc)
    return {"ok": True, "item": strip_id(doc)}

@app.delete("/api/admin/content/{cid}")
async def admin_delete_content(cid: str, user=Depends(require_admin)):
    doc = await db.content.find_one({"id": cid})
    if not doc:
        raise HTTPException(status_code=404, detail="Content not found")
    try:
        (IMAGES_DIR / doc["filename"]).unlink(missing_ok=True)
    except Exception:
        pass
    await db.content.delete_one({"id": cid})
    return {"ok": True}
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=5000,
        reload=True
    )
