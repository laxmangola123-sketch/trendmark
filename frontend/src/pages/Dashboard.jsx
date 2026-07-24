import React, { useState } from "react";
import { useAuth } from "../lib/auth";
import { motion } from "framer-motion";
import {
  Coins,
  CalendarClock,
  Crown,
  AlertTriangle,
  MessageCircle,
} from "lucide-react";
import MembershipModal from "../components/MembershipModal";
import SignalsList from "../components/SignalsList";
import AccountPanel from "../components/AccountPanel";
import { toneForCount } from "../lib/useWelcomeFlag";

function StatCard({ icon: Icon, label, value, sub, tone = "text-white", testId }) {
  return (
    <div className="card-tactical rounded-xl p-6 h-full" data-testid={testId}>
      <div className="flex items-center gap-2 tag-uppercase text-white/50 mb-3">
        <Icon size={14} />
        {label}
      </div>

      <div className={`font-heading font-black text-4xl tracking-tighter ${tone}`}>
        {value}
      </div>

      {sub && (
        <div className="text-white/50 text-xs mt-2">
          {sub}
        </div>
      )}
    </div>
  );
}

function ExpiredBanner({ onUpgrade }) {
  return (
    <div className="mb-6 card-tactical border-blaze/40 rounded-xl p-5 flex items-start gap-3">
      <AlertTriangle className="text-blaze mt-1" size={20} />

      <div className="flex-1">
        <div className="font-heading font-bold text-lg">
          Your access has expired
        </div>

        <div className="text-white/60 text-sm">
          Your trial or membership has expired.
        </div>
      </div>

      <button
        onClick={onUpgrade}
        className="btn-primary px-4 py-2 rounded-md"
      >
        Get Membership
      </button>
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
      className="card-tactical rounded-xl p-6 flex items-center gap-4"
    >
      <MessageCircle className="text-laser" size={30} />

      <div className="flex-1">
        <div className="font-heading font-bold">
          WhatsApp Group
        </div>

        <div className="text-white/60 text-sm">
          {url}
        </div>
      </div>
    </a>
  );
}

function membershipLabel(user) {
  return user.has_membership
    ? (user.membership_plan || "PRO").toUpperCase()
    : "TRIAL";
}

function membershipSub(user) {
  return user.has_membership
    ? `Paid $${user.membership_amount}`
    : "Trial Account";
}

export default function Dashboard() {
  const { user, refresh } = useAuth();

  const [showModal, setShowModal] = useState(false);

  if (!user) return null;

  const accessExpired = user.access_expired;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="tag-uppercase text-volt mb-2">
          Dashboard
        </div>

        <div className="flex justify-between items-end mb-8">
          <h1 className="font-heading font-black text-4xl">
            Welcome {user.name || user.email}
          </h1>

          {!user.has_membership && (
            <button
              className="btn-primary px-5 py-2 rounded-md"
              onClick={() => setShowModal(true)}
            >
              Upgrade Membership
            </button>
          )}
        </div>

        {accessExpired && (
          <ExpiredBanner
            onUpgrade={() => setShowModal(true)}
          />
        )}

        {user.has_membership && (
          <WhatsAppCard url={user.whatsapp_url} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-8">
          <StatCard
            icon={Coins}
            label="Credits"
            value={user.credits}
            sub="Remaining"
            tone={toneForCount(user.credits, {
              good: 5,
              warn: 0,
            })}
          />

          <StatCard
            icon={CalendarClock}
            label="Trial"
            value={user.trial_days_left}
            sub="Days Left"
            tone={toneForCount(user.trial_days_left, {
              good: 2,
              warn: 0,
            })}
          />

          <StatCard
            icon={Crown}
            label="Membership"
            value={membershipLabel(user)}
            sub={membershipSub(user)}
            tone={user.has_membership ? "text-volt" : "text-white"}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <SignalsList locked={accessExpired} />
          <AccountPanel
            user={user}
            onRefresh={refresh}
          />
        </div>
      </motion.div>

      <MembershipModal
        open={showModal}
        allowSkip={true}
        onClose={() => setShowModal(false)}
        onPurchased={async () => {
          await refresh();
          setShowModal(false);
        }}
      />
    </>
  );
}