import { httpClient } from "../config/AxiosHelper";

export const roomService = {
  // Create room
  async createRoom(roomDetail) {
    try {
      const response = await httpClient.post(`/api/v1/rooms`, roomDetail);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Failed to create room' 
      };
    }
  },

  // Get all rooms
  async getAllRooms() {
    try {
      const response = await httpClient.get(`/api/v1/rooms`);
      console.log(response, ":");
      return { success: true, data: response.data };
    } catch (error) {
      console.log(error,":");
      return { 
        success: false, 
        error: error.response?.data || 'Failed to fetch rooms' 
      };
    }
  },

  // Join room
  async joinRoom(roomId, userId) {
    try {
      const response = await httpClient.post(`/api/v1/rooms/join`, { roomId, userId });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Failed to join room' 
      };
    }
  },

  // Leave room
  async leaveRoom(roomId, userId) {
    try {
      const response = await httpClient.post(`/api/v1/rooms/leave`, { roomId, userId });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Failed to leave room' 
      };
    }
  },

  // Promote user
  async promoteUser(roomId, userId) {
    try {
      const response = await httpClient.post(`/api/v1/rooms/promote`, { roomId, userId });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Failed to promote user' 
      };
    }
  },

  // Demote user
  async demoteUser(roomId, userId) {
    try {
      const response = await httpClient.post(`/api/v1/rooms/demote`, { roomId, userId });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Failed to demote user' 
      };
    }
  },

  // Get paginated messages
  async getMessages(roomId, page = 0, size = 20) {
    try {
      const response = await httpClient.get(
        `/api/v1/rooms/${roomId}/messages?page=${page}&size=${size}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Failed to fetch messages' 
      };
    }
  }
};

// Legacy functions for backward compatibility
export const createRoomApi = async (roomDetail) => {
  const result = await roomService.createRoom(roomDetail);
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error);
};

export const joinChatApi = async (roomId, userId) => {
  const result = await roomService.joinRoom(roomId, userId);
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error);
};

export const getAllRoomsApi = async () => {
  const result = await roomService.getAllRooms();
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error);
};

export const getMessagess = async (roomId, size = 20, page = 0) => {
  const result = await roomService.getMessages(roomId, page, size);
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error);
};
