import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { toast } from "sonner";
import { usePlans } from "../lib/usePlans";
import { initiatePurchase } from "../lib/purchase";
import PlanCard from "./PlanCard";

export default function MembershipModal({ open, onClose, onPurchased, allowSkip = true }) {
  const plans = usePlans(open);
  const [loadingId, setLoadingId] = useState(null);

  const purchase = async (planId) => {
    setLoadingId(planId);
    try {
      const data = await initiatePurchase(planId);
      onPurchased?.(data);
      onClose?.();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Could not start payment. Please try again.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          data-testid="membership-modal"
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => allowSkip && onClose?.()} />
          <motion.div
            initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 w-full max-w-6xl bg-panel border border-white/10 rounded-xl p-6 sm:p-10 overflow-y-auto max-h-[92vh]"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="tag-uppercase text-volt mb-2">Unlock full access</div>
                <h2 className="font-heading font-black text-3xl sm:text-4xl tracking-tight">Pick your membership</h2>
                <p className="text-white/60 mt-2 max-w-lg">Each dollar becomes 1 credit. 1 credit is consumed per day. Each plan includes a private WhatsApp group.</p>
              </div>
              {allowSkip && (
                <button data-testid="membership-close-btn" className="text-white/50 hover:text-white transition-colors p-2" onClick={onClose}><X size={22}/></button>
              )}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((p) => (
                <PlanCard key={p.id} plan={p} loading={loadingId === p.id} onBuy={purchase} />
              ))}
            </div>

            {allowSkip && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-6">
                <div className="text-sm text-white/60">Not ready? You can try the platform free for 7 days.</div>
                <button
                  data-testid="skip-membership-btn"
                  onClick={onClose}
                  className="btn-outline px-5 py-2.5 rounded-md text-sm font-semibold"
                >
                  Skip → Start 7-day free trial
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
