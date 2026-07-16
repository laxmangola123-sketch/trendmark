import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { toast } from "sonner";
import { usePlans } from "../lib/usePlans";
import { initiatePurchase } from "../lib/purchase";
import PlanCard from "./PlanCard";

export default function MembershipModal({
    open,
    onClose,
    onPurchased,
    allowSkip = true,
}) {
    const { plans, loading, error } = usePlans();

    const [loadingId, setLoadingId] = useState(null);

    const purchase = async (planId) => {
        setLoadingId(planId);

        try {
            const data = await initiatePurchase(planId);

            if (onPurchased) {
                onPurchased(data);
            }

            if (onClose) {
                onClose();
            }
        } catch (e) {
            toast.error(
                e?.response?.data?.detail ||
                "Could not start payment. Please try again."
            );
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    data-testid="membership-modal"
                >
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={() => allowSkip && onClose?.()}
                    />

                    <motion.div
                        initial={{ y: 24, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 24, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="relative z-10 w-full max-w-6xl bg-panel border border-white/10 rounded-xl p-6 sm:p-10 overflow-y-auto max-h-[92vh]"
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <div className="tag-uppercase text-volt mb-2">
                                    Unlock full access
                                </div>

                                <h2 className="font-heading font-black text-3xl sm:text-4xl tracking-tight">
                                    Pick your membership
                                </h2>

                                <p className="text-white/60 mt-2 max-w-lg">
                                    Each dollar becomes 1 credit. One credit is consumed every
                                    day. Every membership includes private WhatsApp access.
                                </p>
                            </div>

                            {allowSkip && (
                                <button
                                    className="text-white/50 hover:text-white transition-colors p-2"
                                    onClick={onClose}
                                >
                                    <X size={22} />
                                </button>
                            )}
                        </div>

                        {/* Loading */}
                        {loading && (
                            <div className="text-center py-10 text-white">
                                Loading membership plans...
                            </div>
                        )}

                        {/* Error */}
                        {!loading && error && (
                            <div className="text-center py-10 text-red-500">
                                Failed to load plans.
                            </div>
                        )}

                        {/* Plans */}
                        {!loading && !error && (
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {plans.map((plan) => (
                                    <PlanCard
                                        key={plan.id}
                                        plan={plan}
                                        loading={loadingId === plan.id}
                                        onBuy={purchase}
                                    />
                                ))}
                            </div>
                        )}

                        {allowSkip && (
                            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-6">
                                <div className="text-sm text-white/60">
                                    Not ready? Try the platform free for 7 days.
                                </div>

                                <button
                                    onClick={onClose}
                                    className="btn-outline px-5 py-2.5 rounded-md text-sm font-semibold"
                                >
                                    Skip → Start Free Trial
                                </button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}