"""
TrendTracker Pro — backend integration tests.
Covers: health/config, auth, plans, stocks, membership async purchase,
admin approvals, KYC upload, admin CRUD, and auth guards.
"""
import io
import os
import time
import uuid

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # Fallback to local backend if env var missing (should not happen in CI)
    BASE_URL = "http://localhost:8001"

API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@tredtracker.net"
ADMIN_PASSWORD = "admin@123"

# ---------- Helpers ----------

def _new_user_payload():
    tag = uuid.uuid4().hex[:8]
    return {
        "name": f"TEST User {tag}",
        "email": f"TEST_user_{tag}@example.com",
        "password": "secret123",
    }


def _minimal_pdf_bytes() -> bytes:
    # Very small but valid enough PDF stream
    return (
        b"%PDF-1.4\n1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n"
        b"2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n"
        b"3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 300] >>endobj\n"
        b"xref\n0 4\n0000000000 65535 f \n0000000010 00000 n \n"
        b"0000000060 00000 n \n0000000110 00000 n \n"
        b"trailer<< /Size 4 /Root 1 0 R >>\nstartxref\n170\n%%EOF\n"
    )


# ---------- Fixtures ----------

@pytest.fixture(scope="session")
def s():
    sess = requests.Session()
    sess.headers.update({"Accept": "application/json"})
    return sess


@pytest.fixture(scope="session")
def admin_token(s):
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    data = r.json()
    assert data["user"]["is_admin"] is True
    return data["token"]


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture(scope="session")
def user_creds(s):
    payload = _new_user_payload()
    r = s.post(f"{API}/auth/signup", json=payload)
    assert r.status_code == 200, f"signup failed: {r.status_code} {r.text}"
    data = r.json()
    return {"payload": payload, "token": data["token"], "user": data["user"]}


@pytest.fixture(scope="session")
def user_headers(user_creds):
    return {"Authorization": f"Bearer {user_creds['token']}"}


# ---------- Health & Config ----------

class TestHealth:
    def test_health(self, s):
        r = s.get(f"{API}/health")
        assert r.status_code == 200
        assert r.json().get("status") == "ok"

    def test_config(self, s):
        r = s.get(f"{API}/config")
        assert r.status_code == 200
        data = r.json()
        assert data["external_payment_url"] == "https://penmarksolutions.net/plan.php"
        assert data["support"]["phone"]
        assert "@" in data["support"]["email"]
        assert data["support"]["address"]


# ---------- Plans & Stocks (public) ----------

class TestPlansAndStocks:
    def test_plans_seeded(self, s):
        r = s.get(f"{API}/plans")
        assert r.status_code == 200
        plans = r.json()["plans"]
        ids = {p["id"] for p in plans}
        assert {"starter", "growth", "premium", "ultimate"}.issubset(ids)
        by_id = {p["id"]: p for p in plans}
        assert by_id["starter"]["price"] == 79 and by_id["starter"]["credits"] == 79
        assert by_id["growth"]["price"] == 149 and by_id["growth"]["popular"] is True
        assert by_id["premium"]["price"] == 199
        assert by_id["ultimate"]["price"] == 299
        for p in plans:
            assert "whatsapp_url" in p

    def test_stocks_seeded(self, s):
        r = s.get(f"{API}/stocks")
        assert r.status_code == 200
        stocks = r.json()["stocks"]
        assert len(stocks) >= 8
        symbols = {x["symbol"] for x in stocks}
        for sym in ["AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "META", "GOOGL", "SPY"]:
            assert sym in symbols
        for st in stocks:
            for f in ["symbol", "name", "price", "change_pct", "direction"]:
                assert f in st


# ---------- Auth ----------

class TestAuth:
    def test_admin_login(self, s):
        r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        data = r.json()
        assert data["user"]["is_admin"] is True
        assert data["token"]

    def test_signup_defaults(self, s):
        r = s.post(f"{API}/auth/signup", json=_new_user_payload())
        assert r.status_code == 200
        u = r.json()["user"]
        assert u["is_active"] is True
        assert u["kyc_status"] == "none"
        assert u["has_membership"] is False
        assert u["credits"] == 0
        assert u["trial_days_left"] >= 6

    def test_non_admin_blocked_from_admin_routes(self, s, user_headers):
        for path in ["/admin/users", "/admin/payments", "/admin/kyc", "/admin/stats"]:
            r = s.get(f"{API}{path}", headers=user_headers)
            assert r.status_code == 403, f"{path} should be 403 for non-admin, got {r.status_code}"


# ---------- Membership async purchase ----------

class TestPurchaseFlow:
    def test_purchase_creates_pending_and_returns_external_url(self, s, user_creds, user_headers):
        r = s.post(f"{API}/membership/purchase", json={"plan_id": "growth"}, headers=user_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["external_payment_url"] == "https://penmarksolutions.net/plan.php"
        assert data["payment_id"]
        # Save for later
        user_creds["last_payment_id"] = data["payment_id"]

        # User should still be on trial (no credits granted yet)
        me = s.get(f"{API}/auth/me", headers=user_headers).json()["user"]
        assert me["has_membership"] is False
        assert me["credits"] == 0

    def test_admin_sees_pending_payment(self, s, admin_headers, user_creds):
        r = s.get(f"{API}/admin/payments", headers=admin_headers)
        assert r.status_code == 200
        payments = r.json()["payments"]
        ids = {p["id"] for p in payments}
        assert user_creds["last_payment_id"] in ids
        target = next(p for p in payments if p["id"] == user_creds["last_payment_id"])
        assert target["status"] == "pending"

    def test_admin_approve_activates_membership(self, s, admin_headers, user_headers, user_creds):
        pid = user_creds["last_payment_id"]
        r = s.patch(f"{API}/admin/payments/{pid}/approve", headers=admin_headers)
        assert r.status_code == 200

        me = s.get(f"{API}/auth/me", headers=user_headers).json()["user"]
        assert me["has_membership"] is True
        assert me["credits"] >= 149
        assert me["whatsapp_url"]  # activated

        # Confirmation email exists
        emails = s.get(f"{API}/admin/emails", headers=admin_headers).json()["emails"]
        kinds = [e.get("kind") for e in emails if e.get("user_id") == user_creds["user"]["id"]]
        assert "membership_confirmation" in kinds


# ---------- User activation guard ----------

class TestUserActivationGuard:
    def test_deactivate_regular_user_blocks_login(self, s, admin_headers):
        # create a fresh user
        payload = _new_user_payload()
        s.post(f"{API}/auth/signup", json=payload)
        # Find via admin users list
        users = s.get(f"{API}/admin/users", headers=admin_headers).json()["users"]
        target = next(u for u in users if u["email"] == payload["email"].lower())
        r = s.patch(f"{API}/admin/users/{target['id']}/status?active=false", headers=admin_headers)
        assert r.status_code == 200
        # Attempt login
        r2 = s.post(f"{API}/auth/login", json={"email": payload["email"], "password": payload["password"]})
        assert r2.status_code == 403
        assert "deactivated" in r2.json().get("detail", "").lower()

    def test_cannot_deactivate_admin(self, s, admin_headers):
        users = s.get(f"{API}/admin/users", headers=admin_headers).json()["users"]
        admin = next(u for u in users if u["is_admin"])
        r = s.patch(f"{API}/admin/users/{admin['id']}/status?active=false", headers=admin_headers)
        assert r.status_code == 400


# ---------- KYC ----------

class TestKyc:
    def test_kyc_rejects_non_pdf(self, s, user_headers):
        files = {"document": ("evil.txt", b"hello", "text/plain")}
        data = {
            "full_name": "Jane Doe",
            "dob": "1990-01-15",
            "address_line1": "1 Main St",
            "address_city": "Princeton",
            "address_state": "NJ",
            "address_zip": "08540",
            "passport_number": "X1234567",
        }
        r = requests.post(f"{API}/kyc/submit", data=data, files=files, headers=user_headers)
        assert r.status_code == 400

    def test_kyc_submit_pdf_ok(self, s, user_headers, user_creds):
        pdf = _minimal_pdf_bytes()
        files = {"document": ("id.pdf", pdf, "application/pdf")}
        data = {
            "full_name": "Jane Doe",
            "dob": "1990-01-15",
            "address_line1": "1 Main St",
            "address_city": "Princeton",
            "address_state": "NJ",
            "address_zip": "08540",
            "passport_number": "X1234567",
        }
        r = requests.post(f"{API}/kyc/submit", data=data, files=files, headers=user_headers)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["kyc"]["status"] == "pending"
        assert body["kyc"]["document_url"].startswith("/uploads/kyc/")
        # user kyc_status should reflect
        me = s.get(f"{API}/auth/me", headers=user_headers).json()["user"]
        assert me["kyc_status"] == "pending"
        user_creds["kyc_id"] = body["kyc"]["id"]

    def test_admin_can_list_kyc(self, s, admin_headers, user_creds):
        r = s.get(f"{API}/admin/kyc", headers=admin_headers)
        assert r.status_code == 200
        ids = [k["id"] for k in r.json()["kyc"]]
        assert user_creds["kyc_id"] in ids

    def test_admin_approve_kyc(self, s, admin_headers, user_headers, user_creds):
        kid = user_creds["kyc_id"]
        r = s.patch(f"{API}/admin/kyc/{kid}/status?status=approved", headers=admin_headers)
        assert r.status_code == 200
        me = s.get(f"{API}/auth/me", headers=user_headers).json()["user"]
        assert me["kyc_status"] == "approved"


# ---------- Admin Plans CRUD ----------

class TestAdminPlansCrud:
    def test_plans_crud(self, s, admin_headers):
        pid = f"test_plan_{uuid.uuid4().hex[:6]}"
        payload = {
            "id": pid, "name": "Test Plan", "price": 25, "credits": 25,
            "features": ["A", "B"], "whatsapp_url": "https://chat.whatsapp.com/TEST",
            "popular": False, "active": True,
        }
        r = s.post(f"{API}/admin/plans", json=payload, headers=admin_headers)
        assert r.status_code == 200, r.text
        # Public GET reflects it
        plans = s.get(f"{API}/plans").json()["plans"]
        assert any(p["id"] == pid for p in plans)

        # Update
        payload["price"] = 33
        payload["whatsapp_url"] = "https://chat.whatsapp.com/UPDATED"
        r = s.put(f"{API}/admin/plans/{pid}", json=payload, headers=admin_headers)
        assert r.status_code == 200
        plans = s.get(f"{API}/plans").json()["plans"]
        found = next(p for p in plans if p["id"] == pid)
        assert found["price"] == 33
        assert "UPDATED" in found["whatsapp_url"]

        # Update growth plan price to test the specific admin path
        growth_get = s.get(f"{API}/admin/plans", headers=admin_headers).json()["plans"]
        growth = next(p for p in growth_get if p["id"] == "growth")
        original_price = growth["price"]
        growth["price"] = 150
        r = s.put(f"{API}/admin/plans/growth", json=growth, headers=admin_headers)
        assert r.status_code == 200
        # restore
        growth["price"] = original_price
        s.put(f"{API}/admin/plans/growth", json=growth, headers=admin_headers)

        # Delete
        r = s.delete(f"{API}/admin/plans/{pid}", headers=admin_headers)
        assert r.status_code == 200
        plans = s.get(f"{API}/plans").json()["plans"]
        assert not any(p["id"] == pid for p in plans)


# ---------- Admin Stocks CRUD ----------

class TestAdminStocksCrud:
    def test_stocks_crud(self, s, admin_headers):
        payload = {"symbol": "TSTX", "name": "Test Stock X", "price": 10.0, "change_pct": 2.5}
        r = s.post(f"{API}/admin/stocks", json=payload, headers=admin_headers)
        assert r.status_code == 200, r.text
        sid = r.json()["stock"]["id"]
        assert r.json()["stock"]["direction"] == "up"

        # Update - flip direction
        payload_neg = {"symbol": "TSTX", "name": "Test Stock X", "price": 9.5, "change_pct": -1.2}
        r = s.put(f"{API}/admin/stocks/{sid}", json=payload_neg, headers=admin_headers)
        assert r.status_code == 200

        stocks = s.get(f"{API}/stocks").json()["stocks"]
        found = next(x for x in stocks if x.get("id") == sid)
        assert found["direction"] == "down"

        # Delete
        r = s.delete(f"{API}/admin/stocks/{sid}", headers=admin_headers)
        assert r.status_code == 200
        stocks = s.get(f"{API}/stocks").json()["stocks"]
        assert not any(x.get("id") == sid for x in stocks)


if __name__ == "__main__":
    raise SystemExit(pytest.main([__file__, "-v", "--tb=short"]))
