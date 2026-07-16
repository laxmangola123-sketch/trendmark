import React, { useState } from "react";
import { useAuth } from "../lib/auth";
import { motion } from "framer-motion";
import { Coins, CalendarClock, Crown, AlertTriangle, MessageCircle, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import MembershipModal from "../components/MembershipModal";
import SignalsList from "../components/SignalsList";
import AccountPanel from "../components/AccountPanel";
import { useWelcomeFlag, toneForCount } from "../lib/useWelcomeFlag";

function StatCard({ icon: Icon, label, value, sub, tone = "text-white", testId }) {
  return (
    <div className="card-tactical rounded-xl p-6 h-full" data-testid={testId}>
      <div className="flex items-center gap-2 tag-uppercase text-white/50 mb-3"><Icon size={14}/>{label}</div>
      <div className={`font-heading font-black text-4xl tracking-tighter ${tone}`}>{value}</div>
      {sub && <div className="text-white/50 text-xs mt-2">{sub}</div>}
    </div>
  );
}

function ExpiredBanner({ onUpgrade }) {
  return (
    <div data-testid="access-expired-banner" className="mb-6 card-tactical border-blaze/40 rounded-xl p-5 flex items-start gap-3">
      <AlertTriangle className="text-blaze mt-1" size={20}/>
      <div className="flex-1">
        <div className="font-heading font-bold text-lg">Your access has expired</div>
        <div className="text-white/60 text-sm">Your 7-day trial (or membership) has ended. Purchase a plan to regain access to premium signals.</div>
      </div>
      <button onClick={onUpgrade} className="btn-primary px-4 py-2 rounded-md text-sm font-semibold">Get membership</button>
    </div>
  );
}

function KycBanner({ status }) {
  if (status === "approved") return null;
  const msg = status === "pending"
    ? "Your KYC is under review. Some premium features will unlock once approved."
    : status === "rejected"
      ? "Your KYC submission was rejected. Please resubmit updated documents."
      : "Complete KYC (passport + address) to unlock premium features.";
  return (
    <div className="mb-6 card-tactical rounded-xl p-5 flex items-start gap-3 border-amber/40" data-testid="kyc-banner">
      <ShieldCheck className="text-amber mt-1" size={20}/>
      <div className="flex-1">
        <div className="font-heading font-bold text-lg">KYC verification</div>
        <div className="text-white/60 text-sm">{msg}</div>
      </div>
      <Link to="/kyc" className="btn-outline px-4 py-2 rounded-md text-sm font-semibold" data-testid="kyc-cta">
        {status === "none" ? "Start KYC" : "Open KYC"}
      </Link>
    </div>
  );
}

function WhatsAppCard({ url }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="card-tactical rounded-xl p-6 flex items-center gap-4 hover:border-laser/60 transition-colors"
      data-testid="whatsapp-card"
    >
      <MessageCircle className="text-laser" size={32}/>
      <div className="flex-1">
        <div className="font-heading font-bold text-lg">Join your WhatsApp signals group</div>
        <div className="text-white/60 text-sm break-all">{url}</div>
      </div>
      <span className="btn-primary px-4 py-2 rounded-md text-sm font-semibold whitespace-nowrap">Open</span>
    </a>
  );
}

function membershipLabel(user) {
  if (!user.has_membership) return "TRIAL";
  return (user.membership_plan || "Pro").toUpperCase();
}

function membershipSub(user) {
  return user.has_membership ? `Paid: $${user.membership_amount}` : "Not upgraded yet";
}

export default function Dashboard() {
  const { user, refresh } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const welcome = useWelcomeFlag(true);

  React.useEffect(() => {
    if (welcome && user && !user.has_membership) setShowModal(true);
  }, [welcome, user]);

  if (!user) return null;
  const accessExpired = user.access_expired;

  return (
    <>
      <motion.div initial={{opacity:0, y:16}} animate={{opacity:1, y:0}}>
        <div className="tag-uppercase text-volt mb-2">Your dashboard</div>
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <h1 className="font-heading font-black text-4xl tracking-tighter">
            Hey {user.name || user.email.split("@")[0]}.
          </h1>
          {!user.has_membership && (
            <button data-testid="upgrade-btn" onClick={() => setShowModal(true)} className="btn-primary px-4 py-2 rounded-md text-sm font-semibold">
              Upgrade membership
            </button>
          )}
        </div>

        {accessExpired && <ExpiredBanner onUpgrade={() => setShowModal(true)} />}
        <KycBanner status={user.kyc_status} />

        {user.has_membership && user.whatsapp_url && (
          <div className="mb-6">
            <WhatsAppCard url={user.whatsapp_url}/>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            testId="stat-credits"
            icon={Coins}
            label="Remaining credits"
            value={user.credits}
            sub={user.has_membership ? "1 credit consumed per day" : "Buy a plan to add credits"}
            tone={toneForCount(user.credits, { good: 5, warn: 0 })}
          />
          <StatCard
            testId="stat-trial"
            icon={CalendarClock}
            label="Trial days left"
            value={user.trial_days_left}
            sub={user.has_membership ? "Membership active" : "Free trial"}
            tone={toneForCount(user.trial_days_left, { good: 2, warn: 0 })}
          />
          <StatCard
            testId="stat-membership"
            icon={Crown}
            label="Membership"
            value={membershipLabel(user)}
            sub={membershipSub(user)}
            tone={user.has_membership ? "text-volt" : "text-white/70"}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <SignalsList locked={accessExpired} />
          <AccountPanel user={user} onRefresh={refresh} />
        </div>
      </motion.div>

      <MembershipModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onPurchased={() => refresh()}
        allowSkip={true}
      />
    </>
  );
}
