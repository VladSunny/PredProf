import { API_BASE_URL, getAuthHeaders, handleResponse } from "./config";

export const studentApi = {
  getMenu: async (isBreakfast = null) => {
    const params = new URLSearchParams();
    if (isBreakfast !== null) {
      params.append("is_breakfast", isBreakfast);
    }
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
    const response = await fetch(`${API_BASE_URL}/me/balance`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount }),
    });
    return handleResponse(response);
  },

  createOrder: async (dishId, paymentType, orderDate) => {
    const orderData = {
      dish_id: dishId,
      payment_type: paymentType
    };
    
    // Add order_date if provided
    if (orderDate) {
      orderData.order_date = orderDate;
    }
    
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
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
