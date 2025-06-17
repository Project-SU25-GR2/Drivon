import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.subscribers = new Map();
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.currentUserId = null;
    this.pendingSubscriptions = new Set();
  }

  connect(userId, onConnected) {
    if (!userId) {
      console.error('Cannot connect WebSocket: userId is required');
      return;
    }

    this.currentUserId = userId;
  
    if (this.stompClient?.connected) {
      console.log('WebSocket already connected');
      onConnected?.();
      return;
    }
  
    console.log('Initializing WebSocket connection for user:', userId);
    const socket = new SockJS('http://localhost:8080/ws');
  
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        login: userId,
        passcode: 'guest'
      },
      debug: (str) => {
        console.log('STOMP Debug:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket Connected for user:', userId);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.subscribeToTopics(userId);
        // Resubscribe any pending subscriptions
        this.pendingSubscriptions.forEach(topic => {
          this.subscribeToTopics(userId);
        });
        this.pendingSubscriptions.clear();
        onConnected?.();
      },
      onDisconnect: () => {
        console.log('WebSocket Disconnected for user:', userId);
        this.isConnected = false;
        this.handleReconnect(userId);
      },
      onStompError: (frame) => {
        console.error('STOMP error for user:', userId, frame);
        this.isConnected = false;
      }
    });
  
    this.stompClient.activate();
  }
  

  handleReconnect(userId) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect(userId), 5000);
    } else {
      console.error('Max reconnection attempts reached');
      // Reset reconnect attempts after a longer delay
      setTimeout(() => {
        this.reconnectAttempts = 0;
        this.connect(userId);
      }, 30000);
    }
  }

  subscribeToTopics(userId) {
    if (!this.stompClient?.connected) {
      console.log('WebSocket not connected, adding to pending subscriptions');
      this.pendingSubscriptions.add(userId);
      return;
    }

    // Subscribe to personal messages
    this.stompClient.subscribe(
      `/user/${userId}/topic/messages`,
      (message) => {
        const newMessage = JSON.parse(message.body);
        console.log('Received new message:', newMessage);
        this.notifySubscribers('messages', newMessage);
      }
    );

    // Subscribe to broadcast messages
    this.stompClient.subscribe(
      '/topic/broadcast',
      (message) => {
        const broadcastMessage = JSON.parse(message.body);
        console.log('Received broadcast message:', broadcastMessage);
        this.notifySubscribers('broadcast', broadcastMessage);
      }
    );
  }

  subscribe(topic, callback) {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }
    this.subscribers.get(topic).add(callback);
    
    // If we have a current user ID, ensure we're subscribed to their topics
    if (this.currentUserId) {
      this.subscribeToTopics(this.currentUserId);
    }
  }

  unsubscribe(topic, callback) {
    if (this.subscribers.has(topic)) {
      this.subscribers.get(topic).delete(callback);
    }
  }

  notifySubscribers(topic, data) {
    if (this.subscribers.has(topic)) {
      this.subscribers.get(topic).forEach(callback => callback(data));
    }
  }

  sendMessage(message) {
    if (!this.isConnected) {
      console.error('WebSocket not connected');
      return false;
    }

    try {
      this.stompClient.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(message)
      });
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
      this.isConnected = false;
      this.subscribers.clear();
    }
  }

  // Add method to handle user logout
  handleLogout() {
    console.log('Handling user logout, disconnecting WebSocket...');
    this.disconnect();
  }

  // Add method to check connection status
  isWebSocketConnected() {
    return this.isConnected && this.stompClient?.connected;
  }

  // Add method to get current user ID
  getCurrentUserId() {
    return this.stompClient?.connectHeaders?.login;
  }
}

// Create a singleton instance
const webSocketService = new WebSocketService();
export default webSocketService; 