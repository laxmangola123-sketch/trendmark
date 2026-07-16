import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../lib/auth";
import { MessageCircle, ArrowRight, CheckCircle } from "lucide-react";

const PLAN_LABEL = { starter: "Starter", growth: "Growth", premium: "Premium", ultimate: "Ultimate" };

export default function WhatsappWelcome() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [ticker, setTicker] = useState(6);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (loading) return;
    // Only members with an actual whatsapp URL should see this page.
    if (!user) { navigate("/login", { replace: true }); return; }
    if (!user.has_membership || !user.whatsapp_url) {
      navigate(user.is_admin ? "/admin" : "/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user?.whatsapp_url || dismissed) return;
    if (ticker <= 0) { navigate("/dashboard", { replace: true }); return; }
    const t = setTimeout(() => setTicker((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [ticker, user, navigate, dismissed]);

  if (!user || !user.whatsapp_url) return null;

  const planName = PLAN_LABEL[user.membership_plan] || user.membership_plan || "your plan";

  return (
    <main className="min-h-[calc(100vh-72px)] flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl card-tactical rounded-2xl p-8 sm:p-10 text-center"
        data-testid="whatsapp-welcome"
      >
        <div className="w-16 h-16 mx-auto rounded-full bg-laser/10 border border-laser/40 flex items-center justify-center mb-5">
          <CheckCircle className="text-laser" size={32}/>
        </div>
        <div className="tag-uppercase text-volt mb-2">Welcome back</div>
        <h1 className="font-heading font-black text-3xl sm:text-4xl tracking-tighter mb-3">
          You&apos;re a {planName} member.
        </h1>
        <p className="text-white/60 text-sm sm:text-base mb-8 max-w-lg mx-auto">
          Don&apos;t miss a single signal — join your private WhatsApp group. Signals, entries, targets and stop-losses drop there every trading day.
        </p>

        <a
          href={user.whatsapp_url}
          target="_blank"
          rel="noreferrer"
          onClick={() => setDismissed(true)}
          className="inline-flex items-center gap-3 btn-primary px-6 py-4 rounded-md font-semibold text-base"
          data-testid="whatsapp-welcome-join"
          style={{ backgroundColor: "#22C55E" }}
        >
          <MessageCircle size={20}/> Join WhatsApp group
        </a>

        <div className="mt-3 text-xs text-white/40 break-all">{user.whatsapp_url}</div>

        <div className="mt-8 border-t border-white/10 pt-5 flex items-center justify-between gap-3 text-sm">
          <button
            data-testid="whatsapp-welcome-skip"
            onClick={() => { setDismissed(true); navigate("/dashboard", { replace: true }); }}
            className="text-white/60 hover:text-white transition-colors"
          >
            Skip and go to dashboard →
          </button>
          {!dismissed && (
            <span className="text-white/40 font-mono text-xs">Auto-continue in {ticker}s</span>
          )}
        </div>
      </motion.div>
    </main>
  );
}
