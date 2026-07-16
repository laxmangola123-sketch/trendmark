import React, { useState } from "react";
import { usePlans } from "../lib/usePlans";
import { useAuth } from "../lib/auth";
import { initiatePurchase } from "../lib/purchase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import PlanCard from "../components/PlanCard";
import Footer from "../components/Footer";

export default function Plans() {
  const { plans, loading, error } = usePlans();
  const [loadingId, setLoadingId] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const buy = async (id) => {
    if (!user) {
      navigate("/signup");
      return;
    }

    setLoadingId(id);

    try {
      await initiatePurchase(id);
      toast.success("Purchase request submitted successfully.");
    } catch (e) {
      toast.error(
        e?.message ||
        e?.response?.data?.detail ||
        "Purchase failed."
      );
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
      <main className="max-w-7xl mx-auto px-6 py-14">
        <div className="tag-uppercase text-volt mb-2">
          Pricing
        </div>

        <h1 className="font-heading font-black text-4xl sm:text-5xl tracking-tighter mb-3">
          Four plans. Four private WhatsApp groups.
        </h1>

        <p className="text-white/60 max-w-2xl mb-10">
          Every dollar you pay becomes 1 credit.
          Each day of premium access consumes 1 credit.
        </p>

        {loading && (
          <div className="text-center py-12 text-white">
            Loading membership plans...
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-red-500">
            <h3 className="font-bold mb-2">
              Failed to load membership plans
            </h3>

            <p className="text-sm">
              {error?.message || String(error)}
            </p>
          </div>
        )}

        {!loading && !error && plans.length === 0 && (
          <div className="text-center py-12 text-yellow-400">
            No membership plans available.
          </div>
        )}

        {!loading && !error && plans.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((p) => (
              <PlanCard
                key={p.id}
                plan={p}
                loading={loadingId === p.id}
                onBuy={buy}
                testId={`plans-page-card-${p.id}`}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}