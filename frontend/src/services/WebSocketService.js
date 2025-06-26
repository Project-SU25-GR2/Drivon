import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { API_URL } from '../api/configApi';
import { useEffect, useRef } from 'react';

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
      console.log('WebSocket already connected for user:', userId);
      onConnected?.();
      return;
    }
  
    console.log('Initializing WebSocket connection for user:', userId);
    
    // Sử dụng endpoint đúng cho WebSocket
    // API_URL = "/api" trong production, nên cần thay thế thành "/ws"
    const wsUrl = API_URL.replace('/api', '/ws');
    console.log('WebSocket URL:', wsUrl);
    
    const socket = new SockJS(wsUrl);
  
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
      console.log('WebSocket not connected, adding to pending subscriptions for user:', userId);
      this.pendingSubscriptions.add(userId);
      return;
    }

    console.log('Subscribing to topics for user:', userId);

    // Subscribe to personal messages
    const messageSubscription = this.stompClient.subscribe(
      `/user/${userId}/topic/messages`,
      (message) => {
        const newMessage = JSON.parse(message.body);
        console.log('Received new message for user:', userId, newMessage);
        this.notifySubscribers('messages', newMessage);
      },
      (error) => {
        console.error('Error subscribing to messages for user:', userId, error);
      }
    );

    console.log('Subscribed to messages topic for user:', userId);

    // Subscribe to broadcast messages
    const broadcastSubscription = this.stompClient.subscribe(
      '/topic/broadcast',
      (message) => {
        const broadcastMessage = JSON.parse(message.body);
        console.log('Received broadcast message:', broadcastMessage);
        this.notifySubscribers('broadcast', broadcastMessage);
      },
      (error) => {
        console.error('Error subscribing to broadcast:', error);
      }
    );

    console.log('Subscribed to broadcast topic');

    // Subscribe to error messages
    const errorSubscription = this.stompClient.subscribe(
      `/user/${userId}/topic/errors`,
      (message) => {
        const errorMessage = JSON.parse(message.body);
        console.error('Received error message for user:', userId, errorMessage);
        this.notifySubscribers('errors', errorMessage);
      },
      (error) => {
        console.error('Error subscribing to errors for user:', userId, error);
      }
    );

    console.log('Subscribed to errors topic for user:', userId);

    // Subscribe to personal notifications
    const notificationSubscription = this.stompClient.subscribe(
      `/user/${userId}/notifications/new`,
      (message) => {
        const newNotification = JSON.parse(message.body);
        console.log('Received new notification for user:', userId, newNotification);
        this.notifySubscribers('notifications', newNotification);
      },
      (error) => {
        console.error('Error subscribing to notifications for user:', userId, error);
      }
    );

    console.log('Subscribed to notifications topic for user:', userId);

    // Subscribe to broadcast notifications
    const broadcastNotificationSubscription = this.stompClient.subscribe(
      '/notifications/broadcast',
      (message) => {
        const broadcastNotification = JSON.parse(message.body);
        console.log('Received broadcast notification:', broadcastNotification);
        this.notifySubscribers('notifications_broadcast', broadcastNotification);
      },
      (error) => {
        console.error('Error subscribing to broadcast notifications:', error);
      }
    );

    console.log('Subscribed to broadcast notifications topic');
  }

  subscribe(topic, callback) {
    console.log('Subscribing to topic:', topic);
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
    console.log('Unsubscribing from topic:', topic);
    if (this.subscribers.has(topic)) {
      this.subscribers.get(topic).delete(callback);
    }
  }

  notifySubscribers(topic, data) {
    console.log('Notifying subscribers for topic:', topic, 'with data:', data);
    if (this.subscribers.has(topic)) {
      this.subscribers.get(topic).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in subscriber callback:', error);
        }
      });
    }
  }

  sendMessage(message) {
    if (!this.isConnected) {
      console.error('WebSocket not connected, cannot send message');
      return false;
    }

    if (!this.stompClient?.connected) {
      console.error('STOMP client not connected, cannot send message');
      return false;
    }

    try {
      console.log('Sending message via WebSocket:', message);
      this.stompClient.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(message)
      });
      console.log('Message sent successfully via WebSocket');
      return true;
    } catch (error) {
      console.error('Error sending message via WebSocket:', error);
      return false;
    }
  }

  sendNotification(notificationData) {
    if (!this.isConnected) {
      console.error('WebSocket not connected, cannot send notification');
      return false;
    }

    if (!this.stompClient?.connected) {
      console.error('STOMP client not connected, cannot send notification');
      return false;
    }

    try {
      console.log('Sending notification via WebSocket:', notificationData);
      this.stompClient.publish({
        destination: '/app/notification.send',
        body: JSON.stringify(notificationData)
      });
      console.log('Notification sent successfully via WebSocket');
      return true;
    } catch (error) {
      console.error('Error sending notification via WebSocket:', error);
      return false;
    }
  }

  sendBroadcastNotification(notificationData) {
    if (!this.isConnected) {
      console.error('WebSocket not connected, cannot send broadcast notification');
      return false;
    }

    if (!this.stompClient?.connected) {
      console.error('STOMP client not connected, cannot send broadcast notification');
      return false;
    }

    try {
      console.log('Sending broadcast notification via WebSocket:', notificationData);
      this.stompClient.publish({
        destination: '/app/notification.broadcast',
        body: JSON.stringify(notificationData)
      });
      console.log('Broadcast notification sent successfully via WebSocket');
      return true;
    } catch (error) {
      console.error('Error sending broadcast notification via WebSocket:', error);
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
    return this.currentUserId;
  }
}

// Create a singleton instance
const webSocketService = new WebSocketService();

// React Hook for WebSocket
export const useWebSocket = () => {
  const webSocketServiceRef = useRef(null);

  useEffect(() => {
    if (!webSocketServiceRef.current) {
      webSocketServiceRef.current = new WebSocketService();
    }

    return () => {
      if (webSocketServiceRef.current) {
        webSocketServiceRef.current.disconnect();
      }
    };
  }, []);

  const subscribe = (topic, callback) => {
    if (webSocketServiceRef.current) {
      webSocketServiceRef.current.subscribe(topic, callback);
    }
  };

  const unsubscribe = (topic, callback) => {
    if (webSocketServiceRef.current) {
      webSocketServiceRef.current.unsubscribe(topic, callback);
    }
  };

  return { subscribe, unsubscribe };
};

export default webSocketService; 