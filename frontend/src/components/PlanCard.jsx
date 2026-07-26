import React, { useState } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import {
  createPaypalOrder,
  capturePaypalOrder,
} from "../lib/purchase";
import { toast } from "sonner";


export default function PlanCard({
  plan,
  onPurchased,
  onClose,
}) {

  const [paymentId, setPaymentId] = useState(null);


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


      <PayPalButtons

        style={{
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "paypal",
        }}


        createOrder={async () => {

          try {

            const data = await createPaypalOrder(
              plan.id || plan._id
            );


            setPaymentId(data.payment_id);


            return data.paypal.id;


          } catch (error) {

            console.error(error);

            toast.error(
              "Unable to create PayPal order"
            );

            throw error;

          }

        }}



        onApprove={async (data) => {

          try {

            await capturePaypalOrder(
              data.orderID,
              paymentId
            );


            toast.success(
              "Membership Activated"
            );


            onPurchased?.();

            onClose?.();


          } catch (error) {

            console.error(error);

            toast.error(
              "Payment capture failed"
            );

          }

        }}



        onError={(err) => {

          console.error(err);

          toast.error(
            "PayPal Payment Failed"
          );

        }}

      />

    </div>
  );
}