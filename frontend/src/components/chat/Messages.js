import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import webSocketService from '../../services/WebSocketService';
import './Messages.css';

const Messages = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(location.state?.selectedUser || null);
  const [message, setMessage] = useState(location.state?.initialMessage || '');
  const [messages, setMessages] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const chatMessagesRef = useRef(null);
  const selectedUserRef = useRef(selectedUser);

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

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    // Connect to WebSocket
    webSocketService.connect(currentUser.userId);

    // Subscribe to messages
    const handleNewMessage = (newMessage) => {
      const currentSelectedUser = selectedUserRef.current;
      
      // Update messages if the message is relevant to current conversation
      if (
        currentSelectedUser &&
        (
          (newMessage.sender_id === currentSelectedUser.id && newMessage.receiver_id === currentUser.userId) ||
          (newMessage.receiver_id === currentSelectedUser.id && newMessage.sender_id === currentUser.userId)
        )
      ) {
        setMessages(prev => [...prev, newMessage]);
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
    };

    webSocketService.subscribe('messages', handleNewMessage);

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
      webSocketService.unsubscribe('messages', handleNewMessage);
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

          // If there's an initial message and no messages yet, send it automatically
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
      
      const success = webSocketService.sendMessage(newMessage);
      if (!success) {
        throw new Error('Failed to send message');
      }

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
    // Reset unread count in conversations
    setConversations(prev => prev.map(conv => 
      conv.id === user.id ? { ...conv, unread: 0 } : conv
    ));
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