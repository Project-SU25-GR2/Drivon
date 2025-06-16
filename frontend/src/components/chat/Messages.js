import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import './Messages.css';

const Messages = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(location.state?.selectedUser || null);
  const [message, setMessage] = useState(location.state?.initialMessage || '');
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const stompClientRef = useRef();
  const messagesEndRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const selectedUserRef = useRef(selectedUser);
  const chatMessagesRef = useRef(null);
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    const chatBox = chatMessagesRef.current;
    if (chatBox) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  const connectWebSocket = () => {
    if (!currentUser) return;

    console.log('Initializing WebSocket connection...');
    const socket = new SockJS('http://localhost:8080/ws');
    stompClientRef.current = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        login: currentUser.userId,
        passcode: 'guest'
      },
      debug: function (str) {
        console.log('STOMP Debug:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket Connected!');
        setIsConnected(true);
        // Subscribe to personal messages
        const subscription = stompClientRef.current.subscribe(
          `/user/${currentUser.userId}/topic/messages`,
          (message) => {
            console.log('Received WebSocket message:', message);
            const newMessage = JSON.parse(message.body);
            console.log('Parsed message:', newMessage);

            // Always use the latest selectedUser
            const currentSelectedUser = selectedUserRef.current;
            if (
              currentSelectedUser &&
              (
                (newMessage.sender_id === currentSelectedUser.id && newMessage.receiver_id === currentUser.userId) ||
                (newMessage.receiver_id === currentSelectedUser.id && newMessage.sender_id === currentUser.userId)
              )
            ) {
              setMessages(prev => {
                const updated = [...prev, newMessage];
                return updated;
              });
            }

            // Update conversation list
            setConversations(prev => {
              const updated = prev.map(conv => {
                if (conv.id === newMessage.sender_id || conv.id === newMessage.receiver_id) {
                  const isCurrentUser = conv.id === currentUser.userId;
                  const isSelected = currentSelectedUser && conv.id === currentSelectedUser.id;
                  return {
                    ...conv,
                    lastMessage: newMessage.content,
                    time: new Date(newMessage.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    unread: !isSelected && !isCurrentUser ? (conv.unread || 0) + 1 : conv.unread
                  };
                }
                return conv;
              });
              return updated;
            });
          }
        );
        console.log('Subscribed to messages with subscription:', subscription);
      },
      onDisconnect: () => {
        console.log('WebSocket Disconnected');
        setIsConnected(false);
        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connectWebSocket();
        }, 5000);
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        setIsConnected(false);
      }
    });

    stompClientRef.current.activate();
    console.log('WebSocket client activated');
  };

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    connectWebSocket();

    // Fetch conversations
    const fetchConversations = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/messages/conversations/${currentUser.userId}`);
        console.log('Fetched conversations:', response.data);
        setConversations(response.data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up WebSocket connection');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [currentUser?.userId]);

  // Add effect to fetch messages when selected user changes
  useEffect(() => {
    if (selectedUser) {
      const fetchMessages = async () => {
        try {
          const response = await axios.get(
            `http://localhost:8080/api/messages/${currentUser.userId}/${selectedUser.id}`
          );
          setMessages(response.data);

          // Nếu có tin nhắn ban đầu và chưa có tin nhắn nào, tự động gửi tin nhắn
          if (location.state?.initialMessage && response.data.length === 0) {
            handleSendMessage(new Event('submit'));
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };

      fetchMessages();
    }
  }, [selectedUser?.id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser) return;

    try {
      const newMessage = {
        sender_id: currentUser.userId,
        receiver_id: selectedUser.id,
        content: message,
        sent_at: new Date().toISOString()
      };

      console.log('Sending message:', newMessage);
      
      if (!isConnected) {
        console.log('WebSocket not connected, attempting to reconnect...');
        connectWebSocket();
        // Wait for connection
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (!stompClientRef.current?.connected) {
        throw new Error('WebSocket connection not available');
      }

      // Send message through STOMP
      stompClientRef.current.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(newMessage)
      });
      console.log('Message sent through WebSocket');

      // Update conversation list immediately
      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv.id === selectedUser.id) {
            return {
              ...conv,
              lastMessage: message,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
          }
          return conv;
        });
        return updated;
      });

      setMessage('');

      // Clear initial message state after sending
      if (location.state?.initialMessage) {
        navigate('/messages', { state: { selectedUser } });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    // Mark messages as read
    axios.put(`http://localhost:8080/api/messages/read/${currentUser.userId}/${user.id}`);
  };

  return (
    <div className="messages-container">
      <div className="messages-sidebar">
        <div className="messages-header">
          <h2>Messages</h2>
        </div>
        <div className="conversations-list">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`conversation-item ${selectedUser?.id === conv.id ? 'active' : ''}`}
              onClick={() => handleUserSelect(conv)}
            >
              <img src={conv.avatar} alt={conv.name} className="conversation-avatar" />
              <div className="conversation-info">
                <div className="conversation-header">
                  <h3>{conv.name}</h3>
                  <span className="conversation-time">{conv.time}</span>
                </div>
                <p className="conversation-last-message">{conv.lastMessage}</p>
              </div>
              {conv.unread > 0 && (
                <div className="unread-badge">{conv.unread}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="messages-main">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <img src={selectedUser.avatar} alt={selectedUser.name} className="chat-avatar" />
              <h3>{selectedUser.name}</h3>
            </div>
            <div className="chat-messages" ref={chatMessagesRef}>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${msg.sender_id === currentUser.userId ? 'sent' : 'received'}`}
                >
                  <p>{msg.content}</p>
                  <span className="message-time">
                    {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              <div/>
            </div>
            <form className="message-input" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button type="submit">
                <i className="bi bi-send"></i>
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <i className="bi bi-chat-dots"></i>
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages; 