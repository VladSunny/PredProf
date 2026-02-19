import { API_BASE_URL, getAuthHeaders, handleResponse } from "./config";

export const studentApi = {
  getMenu: async (mealType = null, excludeAllergens = true) => {
    const params = new URLSearchParams();
    if (mealType) {
      params.append("meal_type", mealType);
    }
    params.append("exclude_allergens", excludeAllergens);
    const response = await fetch(`${API_BASE_URL}/menu?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  updateProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/me/profile`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  },

  updatePersonalInfo: async (personalInfoData) => {
    const response = await fetch(`${API_BASE_URL}/me/personal-info`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(personalInfoData),
    });
    return handleResponse(response);
  },

  updatePassword: async (passwordData) => {
    const response = await fetch(`${API_BASE_URL}/me/password`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(passwordData),
    });
    return handleResponse(response);
  },

  addBalance: async (amount) => {
    const response = await fetch(`${API_BASE_URL}/me/balance/topup`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount }),
    });
    return handleResponse(response);
  },

  getMyTopupRequests: async (status = null) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    const response = await fetch(`${API_BASE_URL}/me/balance/requests?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createOrder: async (orderData) => {
    const requestData = {
      dish_id: orderData.dishId,
      payment_type: orderData.paymentType,
    };

    // Add order_date if provided
    if (orderData.orderDate) {
      requestData.order_date = orderData.orderDate;
    }

    // Add subscription weeks if it's a subscription
    if (
      orderData.paymentType === "subscription" &&
      orderData.subscriptionWeeks
    ) {
      requestData.subscription_weeks = orderData.subscriptionWeeks;
    }

    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(requestData),
    });
    return handleResponse(response);
  },

  getMyOrders: async () => {
    const response = await fetch(`${API_BASE_URL}/orders/my`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  markOrderReceived: async (orderId) => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/receive`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createReview: async (dishId, rating, comment) => {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ dish_id: dishId, rating, comment }),
    });
    return handleResponse(response);
  },

  getDishReviews: async (dishId) => {
    const response = await fetch(`${API_BASE_URL}/dishes/${dishId}/reviews`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};
