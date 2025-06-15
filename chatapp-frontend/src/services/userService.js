import { httpClient } from "../config/AxiosHelper";

export const userService = {
  // Get active users
  async getActiveUsers() {
    try {
      const response = await httpClient.get(`/api/users/active`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Failed to fetch active users' 
      };
    }
  }
}; 