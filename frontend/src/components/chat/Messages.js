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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const chatMessagesRef = useRef(null);
  const selectedUserRef = useRef(selectedUser);

  const scrollToBottom = () => {
    const chatBox = chatMessagesRef.current;
    if (chatBox) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  };

  const fetchMessages = async (userId1, userId2) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/messages/${userId1}/${userId2}`
      );
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/messages/conversations/${currentUser.userId}`);
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Debug useEffect để theo dõi thay đổi messages
  useEffect(() => {
    console.log('Messages state changed:', messages);
    console.log('Messages count:', messages.length);
  }, [messages]);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
  
    const handleNewMessage = (newMessage) => {
      console.log('=== NEW MESSAGE RECEIVED ===');
      console.log('Received new message:', newMessage);
      console.log('Current selectedUser:', selectedUser);
      console.log('Current user:', currentUser);
      console.log('Message sender_id:', newMessage.sender_id, 'type:', typeof newMessage.sender_id);
      console.log('Message receiver_id:', newMessage.receiver_id, 'type:', typeof newMessage.receiver_id);
      console.log('Current user ID:', currentUser.userId, 'type:', typeof currentUser.userId);
      console.log('Selected user ID:', selectedUser?.id, 'type:', typeof selectedUser?.id);
      
      // Chuyển đổi sang number để so sánh chính xác
      const senderId = Number(newMessage.sender_id);
      const receiverId = Number(newMessage.receiver_id);
      const currentUserId = Number(currentUser.userId);
      const selectedUserId = Number(selectedUser?.id);
      
      const isCurrentConversation =
        (senderId === currentUserId && receiverId === selectedUserId) ||
        (receiverId === currentUserId && senderId === selectedUserId);
  
      console.log('Converted IDs - senderId:', senderId, 'receiverId:', receiverId, 'currentUserId:', currentUserId, 'selectedUserId:', selectedUserId);
      console.log('Is current conversation:', isCurrentConversation);

      // Cập nhật preview hội thoại
      setConversations((prev) => {
        const updatedConversations = prev.map((conv) => {
          // Xác định cuộc trò chuyện cần cập nhật
          // conv.id là ID của người dùng khác trong cuộc trò chuyện
          const isCurrentConv = conv.id === newMessage.sender_id || conv.id === newMessage.receiver_id;
          if (!isCurrentConv) return conv;
    
          // Kiểm tra xem người dùng hiện tại có phải là người gửi không
          const isCurrentUserSender = newMessage.sender_id === currentUser.userId;
          const isCurrentUserReceiver = newMessage.receiver_id === currentUser.userId;
          const isSelected = conv.id === selectedUser?.id;
    
          return {
            ...conv,
            lastMessage: newMessage.content,
            time: new Date(newMessage.sent_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            lastMessageTime: new Date(newMessage.sent_at).getTime(), // Thêm timestamp để sắp xếp
            // Tăng unread count nếu người dùng hiện tại là người nhận và không đang xem cuộc trò chuyện này
            unread: isCurrentUserReceiver && !isSelected ? (conv.unread || 0) + 1 : conv.unread,
          };
        });

        // Sắp xếp conversations theo thời gian tin nhắn mới nhất
        return updatedConversations.sort((a, b) => {
          const timeA = a.lastMessageTime || 0;
          const timeB = b.lastMessageTime || 0;
          return timeB - timeA; // Sắp xếp giảm dần (mới nhất lên đầu)
        });
      });
  
      // Nếu đang xem đúng đoạn hội thoại → thêm tin nhắn vào chat
      if (isCurrentConversation) {
        console.log('Adding message to current conversation');
        setMessages((prev) => {
          // Kiểm tra xem có tin nhắn tạm thời tương ứng không
          const tempMessageIndex = prev.findIndex(
            (msg) => msg.temp && 
                     msg.content === newMessage.content &&
                     msg.sender_id === newMessage.sender_id &&
                     msg.receiver_id === newMessage.receiver_id &&
                     Math.abs(new Date(msg.sent_at) - new Date(newMessage.sent_at)) < 5000
          );
          
          if (tempMessageIndex !== -1) {
            // Thay thế tin nhắn tạm thời bằng tin nhắn thật
            console.log('Replacing temporary message with real message');
            const updatedMessages = [...prev];
            updatedMessages[tempMessageIndex] = newMessage;
            return updatedMessages;
          }
          
          // Nếu không có tin nhắn tạm thời tương ứng, chỉ thêm tin nhắn mới nếu không phải từ người gửi hiện tại
          if (newMessage.sender_id !== currentUser.userId) {
            console.log('Adding new message from other user');
            return [...prev, newMessage];
          } else {
            console.log('Skipping message from current user (should be handled by temp message)');
            return prev;
          }
        });
      } else {
        console.log('Not current conversation, skipping message display');
      }
    };
  
    const setupWebSocket = () => {
      console.log('Setting up WebSocket subscription');
      webSocketService.subscribe('messages', handleNewMessage);
    };
  
    if (!webSocketService.isWebSocketConnected()) {
      console.log('WebSocket not connected, connecting...');
      webSocketService.connect(currentUser.userId, setupWebSocket);
    } else {
      console.log('WebSocket already connected, setting up subscription');
      setupWebSocket();
    }
  
    if (!webSocketService.isWebSocketConnected()) {
      console.log('WebSocket not connected, connecting...');
      webSocketService.connect(currentUser.userId, setupWebSocket);
    } else {
      console.log('WebSocket already connected, setting up subscription');
      setupWebSocket();
    }
  
    fetchConversations();
  
    return () => {
      webSocketService.unsubscribe('messages', handleNewMessage);
    };
  }, [currentUser?.userId, selectedUser?.id]);
  

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(currentUser.userId, selectedUser.id);

      if (location.state?.initialMessage) {
        handleSendMessage(new Event('submit'));
      }
    }
  }, [selectedUser?.id]);

  // Thêm polling để cập nhật tin nhắn mới
  useEffect(() => {
    if (!selectedUser) return;

    const pollInterval = setInterval(() => {
      fetchMessages(currentUser.userId, selectedUser.id);
    }, 3000); // Poll mỗi 3 giây

    return () => clearInterval(pollInterval);
  }, [selectedUser?.id, currentUser?.userId]);

  // Thêm polling để cập nhật conversations
  useEffect(() => {
    const pollConversationsInterval = setInterval(() => {
      fetchConversations();
    }, 5000); // Poll conversations mỗi 5 giây

    return () => clearInterval(pollConversationsInterval);
  }, [currentUser?.userId]);

  // Xử lý click outside để đóng dialog xác nhận xóa
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDeleteConfirm && !event.target.closest('.delete-confirm') && !event.target.closest('.delete-btn')) {
        setShowDeleteConfirm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDeleteConfirm]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser) return;

    console.log('Sending message:', message);
    console.log('To user:', selectedUser);

    try {
      const newMessage = {
        sender_id: currentUser.userId,
        receiver_id: selectedUser.id,
        content: message,
        sent_at: new Date().toISOString()
      };

      console.log('Created message object:', newMessage);

      if (!webSocketService.isWebSocketConnected()) {
        console.log('WebSocket not connected, reconnecting...');
        await new Promise((resolve) => {
          webSocketService.connect(currentUser.userId, resolve);
        });
      }

      const success = webSocketService.sendMessage(newMessage);
      console.log('WebSocket send success:', success);
      
      if (!success) throw new Error('Failed to send message');

      // Thêm tin nhắn tạm thời với flag để tránh trùng lặp
      const tempMessage = {
        ...newMessage,
        temp: true, // Flag để đánh dấu tin nhắn tạm thời
        tempId: Date.now(), // ID tạm thời
        message_id: null // Đảm bảo không có message_id
      };
      
      console.log('Adding temporary message to state');
      setMessages(prevMessages => {
        console.log('Previous messages count:', prevMessages.length);
        const updatedMessages = [...prevMessages, tempMessage];
        console.log('Updated messages count:', updatedMessages.length);
        return updatedMessages;
      });

      // Thêm timeout để xử lý trường hợp tin nhắn tạm thời không được thay thế
      setTimeout(() => {
        setMessages(prevMessages => {
          const tempMessageIndex = prevMessages.findIndex(
            msg => msg.tempId === tempMessage.tempId
          );
          if (tempMessageIndex !== -1) {
            console.log('Removing temporary message after timeout');
            const updatedMessages = [...prevMessages];
            updatedMessages.splice(tempMessageIndex, 1);
            return updatedMessages;
          }
          return prevMessages;
        });
      }, 10000); // 10 giây timeout

      updateConversationPreview(selectedUser.id, message, true);

      setMessage('');

      if (location.state?.initialMessage) {
        navigate('/messages', { state: { selectedUser } });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleUserSelect = (user) => {
    console.log('Selecting user:', user);
    console.log('User ID:', user.id, 'type:', typeof user.id);
    setSelectedUser(user);
    setShowDeleteConfirm(false); // Reset delete confirm khi chọn user mới
    axios.put(`http://localhost:8080/api/messages/read/${currentUser.userId}/${user.id}`);
    setConversations(prev =>
      prev.map(conv => (conv.id === user.id ? { ...conv, unread: 0 } : conv))
    );
  };

  const handleCloseChat = () => {
    setSelectedUser(null);
    setMessages([]);
    setShowDeleteConfirm(false);
  };

  const handleDeleteChat = async () => {
    if (!selectedUser) return;

    try {
      // Gọi API để xóa tất cả tin nhắn trong cuộc trò chuyện
      await axios.delete(`http://localhost:8080/api/messages/conversation/${currentUser.userId}/${selectedUser.id}`);
      
      // Xóa khỏi danh sách conversations
      setConversations(prev => prev.filter(conv => conv.id !== selectedUser.id));
      
      // Đóng chat hiện tại
      handleCloseChat();
      
      console.log('Chat deleted successfully');
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Failed to delete chat. Please try again.');
    }
  };

  const toggleDeleteConfirm = () => {
    setShowDeleteConfirm(!showDeleteConfirm);
  };

  const updateConversationPreview = (userId, lastMessage, isFromCurrentUser = false) => {
    setConversations(prev => {
      const updatedConversations = prev.map(conv =>
        conv.id === userId
          ? {
              ...conv,
              lastMessage: lastMessage,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              lastMessageTime: Date.now(), // Thêm timestamp hiện tại
              // Reset unread count nếu người dùng hiện tại gửi tin nhắn
              unread: isFromCurrentUser ? 0 : conv.unread
            }
          : conv
      );

      // Sắp xếp conversations theo thời gian tin nhắn mới nhất
      return updatedConversations.sort((a, b) => {
        const timeA = a.lastMessageTime || 0;
        const timeB = b.lastMessageTime || 0;
        return timeB - timeA; // Sắp xếp giảm dần (mới nhất lên đầu)
      });
    });
  };

  return (
    <div className="messages-container">
      <div className="messages-sidebar">
        <div className="messages-header">
          <h2>Messages</h2>
          {selectedUser && (
            <button 
              className="sidebar-close-btn" 
              onClick={handleCloseChat}
              title="Đóng chat"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
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
              <div className="chat-actions">
                <button 
                  className="chat-action-btn close-btn" 
                  onClick={handleCloseChat}
                  title="Đóng chat"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
                <button 
                  className="chat-action-btn delete-btn" 
                  onClick={toggleDeleteConfirm}
                  title="Xóa đoạn chat"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
              {showDeleteConfirm && (
                <div className="delete-confirm">
                  <p>Bạn có chắc muốn xóa đoạn chat này?</p>
                  <div className="delete-confirm-buttons">
                    <button 
                      className="confirm-btn confirm-delete" 
                      onClick={handleDeleteChat}
                    >
                      Xóa
                    </button>
                    <button 
                      className="confirm-btn cancel-delete" 
                      onClick={toggleDeleteConfirm}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="chat-messages" ref={chatMessagesRef}>
              {messages.map((msg, index) => (
                <div
                  key={`${msg.sender_id}-${msg.receiver_id}-${msg.sent_at}-${index}`}
                  className={`message ${msg.sender_id === currentUser.userId ? 'sent' : 'received'} ${msg.temp ? 'temp-message' : ''}`}
                >
                  <p>{msg.content}</p>
                  <span className="message-time">
                    {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {msg.temp && <span className="temp-indicator"> (Đang gửi...)</span>}
                  </span>
                </div>
              ))}
              <div />
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