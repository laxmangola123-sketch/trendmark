import api from "./api";

/**
 * Start membership purchase
 */
export async function initiatePurchase(planId) {
  try {
    const { data } = await api.post("/membership/purchase", {
      plan_id: planId,
    });

    return data;
  } catch (error) {
    console.error("Purchase Error:", error);

    if (error.response) {
      throw new Error(
        error.response.data?.detail ||
        error.response.data?.message ||
        "Purchase failed."
      );
    }

    throw new Error("Unable to connect to the server.");
  }
}

/**
 * Get user's purchase history
 */
export async function getPurchases() {
  try {
    const { data } = await api.get("/membership/purchases");

    return data;
  } catch (error) {
    console.error("Purchase History Error:", error);

    if (error.response) {
      throw new Error(
        error.response.data?.detail ||
        error.response.data?.message ||
        "Failed to load purchase history."
      );
    }

    throw new Error("Unable to connect to the server.");
  }
}