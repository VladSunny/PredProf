import { API_BASE_URL, getAuthHeaders, handleResponse } from "./config";

export const chefApi = {
  getAllOrders: async () => {
    const response = await fetch(`${API_BASE_URL}/chef/orders`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getTodayOrders: async () => {
    const response = await fetch(`${API_BASE_URL}/chef/orders/today`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getDishesWithStock: async () => {
    const response = await fetch(`${API_BASE_URL}/chef/dishes`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createPurchaseRequest: async (itemName, quantity) => {
    const response = await fetch(`${API_BASE_URL}/chef/purchase-requests`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ item_name: itemName, quantity }),
    });
    return handleResponse(response);
  },

  getMyPurchaseRequests: async (status = null) => {
    const params = new URLSearchParams();
    if (status) {
      params.append("status", status);
    }
    const response = await fetch(
      `${API_BASE_URL}/chef/purchase-requests/my?${params}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return handleResponse(response);
  },
};
