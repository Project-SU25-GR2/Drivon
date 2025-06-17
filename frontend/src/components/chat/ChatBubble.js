import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ChatBubble.css';

const ChatBubble = () => {
  const [position, setPosition] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!currentUser) return;

    // Fetch conversations
    const fetchConversations = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/messages/conversations/${currentUser.user_id}`);
        setConversations(response.data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    if (selectedUser) {
      // Fetch messages for selected user
      const fetchMessages = async () => {
        try {
          const response = await axios.get(
            `http://localhost:8080/api/messages/${currentUser.user_id}/${selectedUser.id}`
          );
          setMessages(response.data);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };

      fetchMessages();
    }
  }, [selectedUser, currentUser]);

  const handleMouseDown = (e) => {
    if (e.target.closest('.chat-box')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      let newX = e.clientX - dragOffset.x;
      let newY = e.clientY - dragOffset.y;

      newX = Math.min(Math.max(newX, window.innerWidth - 80), window.innerWidth - 20);
      newY = Math.min(Math.max(newY, 20), window.innerHeight - 80);

      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSelectedUser(null);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    // Mark messages as read
    axios.put(`http://localhost:8080/api/messages/read/${currentUser.user_id}/${user.id}`);
  };

  const handleBack = () => {
    setSelectedUser(null);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser) return;

    try {
      const newMessage = {
        sender_id: currentUser.user_id,
        receiver_id: selectedUser.id,
        content: message,
        sent_at: new Date().toISOString()
      };

      // Send message to backend
      await axios.post('http://localhost:8080/api/messages', newMessage);

      // Update local state
      setMessages(prev => [...prev, newMessage]);
      setMessage('');

      // Update conversation list
      const updatedConversations = conversations.map(conv => {
        if (conv.id === selectedUser.id) {
          return {
            ...conv,
            lastMessage: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
        return conv;
      });
      setConversations(updatedConversations);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div
      className="chat-bubble-container"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div
        className="chat-bubble"
        style={{
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
        onClick={toggleChat}
      >
        <i className="bi bi-chat-dots"></i>
      </div>
      
      {isOpen && (
        <div className="chat-box">
          <div className="chat-box-header">
            {selectedUser ? (
              <>
                <button className="back-button" onClick={handleBack}>
                  <i className="bi bi-arrow-left"></i>
                </button>
                <div className="selected-user-info">
                  <img src={selectedUser.avatar} alt={selectedUser.name} className="selected-user-avatar" />
                  <h3>{selectedUser.name}</h3>
                </div>
              </>
            ) : (
              <h3>Messages</h3>
            )}
            <button className="close-button" onClick={toggleChat}>
              <i className="bi bi-x"></i>
            </button>
          </div>

          {selectedUser ? (
            // Chat messages view
            <>
              <div className="chat-box-content">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`message ${msg.sender_id === currentUser.user_id ? 'sent' : 'received'}`}
                  >
                    <p>{msg.content}</p>
                    <span className="message-time">
                      {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
              <form className="chat-box-input" onSubmit={handleSendMessage}>
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
            // Users list view
            <div className="users-list">
              {conversations.map(user => (
                <div
                  key={user.id}
                  className="user-item"
                  onClick={() => handleUserSelect(user)}
                >
                  <img src={user.avatar} alt={user.name} className="user-avatar" />
                  <div className="user-info">
                    <div className="user-header">
                      <h4>{user.name}</h4>
                      <span className="message-time">{user.time}</span>
                    </div>
                    <p className="last-message">{user.lastMessage}</p>
                  </div>
                  {user.unread > 0 && (
                    <div className="unread-badge">{user.unread}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatBubble; 