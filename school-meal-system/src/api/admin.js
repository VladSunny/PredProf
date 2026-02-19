import { API_BASE_URL, getAuthHeaders, handleResponse } from "./config";

export const adminApi = {
  getPaymentStatistics: async (startDate = null, endDate = null) => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const response = await fetch(
      `${API_BASE_URL}/admin/statistics/payments?${params}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return handleResponse(response);
  },

  getAttendanceStatistics: async (startDate = null, endDate = null) => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const response = await fetch(
      `${API_BASE_URL}/admin/statistics/attendance?${params}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return handleResponse(response);
  },

  getAllPurchaseRequests: async (status = null) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    const response = await fetch(
      `${API_BASE_URL}/admin/purchase-requests?${params}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return handleResponse(response);
  },

  updatePurchaseRequestStatus: async (requestId, status) => {
    const response = await fetch(
      `${API_BASE_URL}/admin/purchase-requests/${requestId}`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      },
    );
    return handleResponse(response);
  },

  getAllBalanceTopupRequests: async (status = null) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    const response = await fetch(
      `${API_BASE_URL}/admin/balance-topup-requests?${params}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return handleResponse(response);
  },

  updateBalanceTopupRequestStatus: async (requestId, status, adminComment = null) => {
    const response = await fetch(
      `${API_BASE_URL}/admin/balance-topup-requests/${requestId}`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, admin_comment: adminComment }),
      },
    );
    return handleResponse(response);
  },

  createDish: async (dishData) => {
    const response = await fetch(`${API_BASE_URL}/admin/dishes`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(dishData),
    });
    return handleResponse(response);
  },

  updateDish: async (dishId, dishData) => {
    const response = await fetch(`${API_BASE_URL}/admin/dishes/${dishId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(dishData),
    });
    return handleResponse(response);
  },

  deleteDish: async (dishId) => {
    const response = await fetch(`${API_BASE_URL}/admin/dishes/${dishId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "Ошибка сервера" }));
      throw new Error(error.detail || "Произошла ошибка");
    }
    return { success: true };
  },

  getPaymentReport: async (startDate = null, endDate = null) => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const response = await fetch(
      `${API_BASE_URL}/admin/reports/payments?${params}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return handleResponse(response);
  },
};
