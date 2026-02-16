import { API_BASE_URL, getAuthHeaders, handleResponse } from "./config";

export const allergenApi = {
  getAllergens: async () => {
    const response = await fetch(`${API_BASE_URL}/allergens`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};
