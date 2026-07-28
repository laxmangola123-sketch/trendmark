import React from "react";
import api from "../lib/api";
import { toast } from "sonner";

export default function PlanCard({ plan }) {
  const paymentLinks = {
    79: "https://www.paypal.com/ncp/payment/3E8LMGZC6R7GA",
    149: "https://www.paypal.com/ncp/payment/HPAUYB5PRB546",
    199: "https://www.paypal.com/ncp/payment/B29DGYG2ZDN2Q",
    299: "https://www.paypal.com/ncp/payment/N82Y9BAPY4G7Q",
  };

  const paymentLink = paymentLinks[Number(plan.price)];


  const handleChoosePlan = async () => {

    try {

      const res = await api.post("/membership/purchase", {
        plan_id: plan.id
      });


      const data = res.data;


      if (data.ok) {

        // save payment id for confirmation
        localStorage.setItem(
          "payment_id",
          data.payment_id
        );


        // open paypal payment
        window.location.href = paymentLink;

      }


    } catch (error) {

      console.log(error);

      toast.error(
        "Unable to start payment"
      );

    }

  };

  return (
    <div className="card-tactical rounded-xl p-6 border border-white/10">
      <h3 className="font-heading font-bold text-xl mb-2">
        {plan.name}
      </h3>

      <p className="text-white/60 text-sm mb-4">
        {plan.description}
      </p>

      <div className="text-3xl font-bold text-volt mb-4">
        ${plan.price}
      </div>

      <div className="text-white/60 text-sm mb-6">
        Credits : {plan.credits}
      </div>

      <button
        onClick={handleChoosePlan}
        className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white font-semibold py-3 rounded-lg transition"
      >
        Choose Plan
      </button>
    </div>
  );
}