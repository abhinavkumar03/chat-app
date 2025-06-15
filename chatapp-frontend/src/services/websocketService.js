import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { baseURL } from "../config/AxiosHelper";

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.messageHandlers = new Map();
    this.connectionAttempts = 0;
    this.maxRetries = 3;
  }

  // Connect to WebSocket
  connect(token) {
    return new Promise((resolve, reject) => {
      try {        
        if (this.connected) {
          console.log('Already connected, skipping re-connection');
          resolve();
          return;
        }
        // Use SockJS for better compatibility
        const socket = new SockJS(`${baseURL}/ws?token=${token}`);
        console.log("Socket:", socket);
        this.stompClient = new Client({
          webSocketFactory: () => socket,
          connectHeaders: {
            'Authorization': `Bearer ${token}`
          },
          onConnect: () => {
            this.connected = true;
            this.connectionAttempts = 0;
            console.log('WebSocket connected successfully');
            resolve();
          },
          onDisconnect: () => {
            this.connected = false;
            console.log('WebSocket disconnected');
          },
          onStompError: (error) => {
            console.error('STOMP error:', error);
            this.connected = false;
            this.connectionAttempts++;
            
            if (this.connectionAttempts < this.maxRetries) {
              console.log(`Retrying connection (${this.connectionAttempts}/${this.maxRetries})...`);
              setTimeout(() => {
                this.connect(token).then(resolve).catch(reject);
              }, 2000 * this.connectionAttempts); // Exponential backoff
            } else {
              reject(new Error('Failed to connect after maximum retries'));
            }
          },
          onWebSocketError: (error) => {
            console.error('WebSocket error:', error);
            this.connected = false;
            this.connectionAttempts++;
            
            if (this.connectionAttempts < this.maxRetries) {
              console.log(`Retrying connection (${this.connectionAttempts}/${this.maxRetries})...`);
              setTimeout(() => {
                this.connect(token).then(resolve).catch(reject);
              }, 2000 * this.connectionAttempts); // Exponential backoff
            } else {
              reject(new Error('Failed to connect after maximum retries'));
            }
          }
        });

        this.stompClient.activate();
      } catch (error) {
        console.error('WebSocket connection failed:', error);
        reject(error);
      }
    });
  }

  // Disconnect from WebSocket
  disconnect() {
    if (this.stompClient && this.connected) {
      this.stompClient.deactivate();
      this.connected = false;
      this.subscriptions.clear();
      this.messageHandlers.clear();
      this.connectionAttempts = 0;
      console.log('WebSocket disconnected');
    }
  }

  // Subscribe to room messages
  subscribeToRoom(roomId, messageHandler) {
    if (!this.connected) {
      console.error('WebSocket not connected');
      return false;
    }

    try {
      const subscription = this.stompClient.subscribe(`/topic/room/${roomId}`, (message) => {
        try {
          const messageData = JSON.parse(message.body);
          console.log('Received message:', messageData);
          messageHandler(messageData);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });

      this.subscriptions.set(roomId, subscription);
      this.messageHandlers.set(roomId, messageHandler);
      console.log(`Subscribed to room: ${roomId}`);
      return true;
    } catch (error) {
      console.error('Error subscribing to room:', error);
      return false;
    }
  }

  // Unsubscribe from room messages
  unsubscribeFromRoom(roomId) {
    const subscription = this.subscriptions.get(roomId);
    if (subscription) {
      try {
        subscription.unsubscribe();
        this.subscriptions.delete(roomId);
        this.messageHandlers.delete(roomId);
        console.log(`Unsubscribed from room: ${roomId}`);
      } catch (error) {
        console.error('Error unsubscribing from room:', error);
      }
    }
  }

  // Send message to room
  sendMessage(roomId, messageData) {
    if (!this.connected) {
      console.error('WebSocket not connected');
      return false;
    }

    try {
      this.stompClient.publish({
        destination: `/app/sendMessage/${roomId}`,
        body: JSON.stringify(messageData)
      });
      console.log(`Message sent to room: ${roomId}`, messageData);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  // Check if connected
  isConnected() {
    return this.connected;
  }

  // Get all subscribed rooms
  getSubscribedRooms() {
    return Array.from(this.subscriptions.keys());
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.connected,
      attempts: this.connectionAttempts,
      maxRetries: this.maxRetries
    };
  }
}

// Create singleton instance
const websocketService = new WebSocketService();
export default websocketService; 