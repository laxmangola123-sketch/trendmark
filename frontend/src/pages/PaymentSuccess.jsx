import React, { useEffect, useState } from "react";
import api from "../lib/api";

export default function PaymentSuccess() {

    const [status, setStatus] = useState("Verifying payment...");


    useEffect(() => {

        const activate = async () => {

            try {

                const payment_id = localStorage.getItem("payment_id");


                if (!payment_id) {
                    setStatus("Payment ID not found");
                    return;
                }


                const res = await api.post(
                    "/membership/payment-success",
                    {
                        payment_id
                    }
                );


                if (res.data.ok) {

                    setStatus(
                        "✅ Payment successful. Membership activated!"
                    );

                    localStorage.removeItem("payment_id");

                }


            } catch (err) {

                console.log(err);

                setStatus(
                    "❌ Payment verification failed"
                );

            }

        };


        activate();

    }, []);



    return (
        <div className="min-h-screen flex items-center justify-center">

            <h1 className="text-2xl text-white">
                {status}
            </h1>

        </div>
    );
}