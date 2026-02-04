export const API_BASE_URL = "http://localhost:8000";

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Ошибка сервера" }));
    throw new Error(error.detail || "Произошла ошибка");
  }
  return response.json();
};
