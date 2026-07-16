import React from "react";

export default function PlanCard({
  plan,
}) {

  const choosePlan = () => {
    window.location.href = "https://penmarksolutions.net/plan.php";
  };

  return (
    <div className="card-tactical rounded-xl p-6 border border-white/10">

      <h3 className="font-heading font-bold text-xl mb-2">
        {plan?.name || "Plan"}
      </h3>

      <p className="text-white/60 text-sm mb-4">
        {plan?.description || "Premium trading signals access"}
      </p>

      <div className="text-3xl font-bold text-volt mb-4">
        ${plan?.price || 0}
      </div>

      <div className="text-white/60 text-sm mb-5">
        Credits: {plan?.credits || 0}
      </div>

      <button
        onClick={choosePlan}
        className="btn-primary w-full py-2 rounded-md font-semibold"
      >
        Choose Plan
      </button>

    </div>
  );
}