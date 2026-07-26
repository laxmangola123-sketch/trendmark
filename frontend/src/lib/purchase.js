import api from "./api";

/**
 * Create PayPal Order
 */
export async function createPaypalOrder(planId) {
  try {
    const { data } = await api.post("/paypal/create-order", {
      plan_id: planId,
    });

    return data;
  } catch (error) {
    console.error(error);

    throw new Error(
      error.response?.data?.detail ||
      "Unable to create PayPal order."
    );
  }
}

/**
 * Capture PayPal Payment
 */
export async function capturePaypalOrder(orderId, paymentId) {
  try {
    const { data } = await api.post("/paypal/capture-order", {
      order_id: orderId,
      payment_id: paymentId,
    });

    return data;
  } catch (error) {
    console.error(error);

    throw new Error(
      error.response?.data?.detail ||
      "Unable to capture PayPal payment."
    );
  }
}

/**
 * Purchase History
 */
export async function getPurchases() {
  const { data } = await api.get("/membership/purchases");
  return data;
}