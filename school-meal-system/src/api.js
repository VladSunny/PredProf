const API_URL = "http://localhost:8000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const request = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Ошибка запроса");
  }

  if (response.status === 204) return null;
  return response.json();
};

// Auth
export const register = (data) => request("/register", { method: "POST", body: JSON.stringify(data) });
export const login = (data) => request("/login", { method: "POST", body: JSON.stringify(data) });
export const getMe = () => request("/me");
export const updateProfile = (data) => request("/me/profile", { method: "PATCH", body: JSON.stringify(data) });
export const addBalance = (amount) => request("/me/balance", { method: "POST", body: JSON.stringify({ amount }) });

// Menu
export const getMenu = (isBreakfast = null) => {
  const params = isBreakfast !== null ? `?is_breakfast=${isBreakfast}` : "";
  return request(`/menu${params}`);
};

// Orders (Student)
export const createOrder = (data) => request("/orders", { method: "POST", body: JSON.stringify(data) });
export const getMyOrders = () => request("/orders/my");
export const markOrderReceived = (orderId) => request(`/orders/${orderId}/receive`, { method: "POST" });

// Reviews
export const createReview = (data) => request("/reviews", { method: "POST", body: JSON.stringify(data) });
export const getDishReviews = (dishId) => request(`/dishes/${dishId}/reviews`);

// Chef
export const getChefOrders = () => request("/chef/orders");
export const getTodayOrders = () => request("/chef/orders/today");
export const getChefDishes = () => request("/chef/dishes");
export const createPurchaseRequest = (data) => request("/chef/purchase-requests", { method: "POST", body: JSON.stringify(data) });
export const getMyPurchaseRequests = (status = null) => {
  const params = status ? `?status=${status}` : "";
  return request(`/chef/purchase-requests/my${params}`);
};

// Admin
export const getPaymentStats = (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);
  return request(`/admin/statistics/payments?${params}`);
};

export const getAttendanceStats = (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);
  return request(`/admin/statistics/attendance?${params}`);
};

export const getAllPurchaseRequests = (status = null) => {
  const params = status ? `?status=${status}` : "";
  return request(`/admin/purchase-requests${params}`);
};

export const updatePurchaseRequestStatus = (id, status) => 
  request(`/admin/purchase-requests/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });

export const createDish = (data) => request("/admin/dishes", { method: "POST", body: JSON.stringify(data) });
export const updateDish = (id, data) => request(`/admin/dishes/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteDish = (id) => request(`/admin/dishes/${id}`, { method: "DELETE" });

export const getPaymentReport = (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);
  return request(`/admin/reports/payments?${params}`);
};
