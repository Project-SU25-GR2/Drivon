import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.subscribers = new Map();
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(userId) {
    if (this.stompClient?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    console.log('Initializing WebSocket connection...');
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
        console.log('WebSocket Connected!');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.subscribeToTopics(userId);
      },
      onDisconnect: () => {
        console.log('WebSocket Disconnected');
        this.isConnected = false;
        this.handleReconnect(userId);
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
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
    }
  }

  subscribeToTopics(userId) {
    // Subscribe to personal messages
    this.stompClient.subscribe(
      `/user/${userId}/topic/messages`,
      (message) => {
        const newMessage = JSON.parse(message.body);
        this.notifySubscribers('messages', newMessage);
      }
    );

    // Subscribe to broadcast messages
    this.stompClient.subscribe(
      '/topic/broadcast',
      (message) => {
        const broadcastMessage = JSON.parse(message.body);
        this.notifySubscribers('broadcast', broadcastMessage);
      }
    );
  }

  subscribe(topic, callback) {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }
    this.subscribers.get(topic).add(callback);
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
}

// Create a singleton instance
const webSocketService = new WebSocketService();
export default webSocketService; 