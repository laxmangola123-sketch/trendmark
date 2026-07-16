import api from "./api";

export async function initiatePurchase(planId) {
  try {
    const response = await api.post("/purchase", {
      planId,
    });

    return response.data;

  } catch (error) {
    console.error("Purchase error:", error);
    throw error;
  }
}


export async function getPurchases() {
  try {
    const response = await api.get("/purchase");

    return response.data;

  } catch (error) {
    console.error("Get purchase error:", error);
    throw error;
  }
}