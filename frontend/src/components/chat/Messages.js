import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import webSocketService from '../../services/WebSocketService';
import onlineStatusService from '../../services/OnlineStatusService';
import './Messages.css';

const Messages = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(location.state?.selectedUser || null);
  const [message, setMessage] = useState(location.state?.initialMessage || '');
  const [messages, setMessages] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const chatMessagesRef = useRef(null);
  const selectedUserRef = useRef(selectedUser);
  
  // Polling intervals (in milliseconds)
  const MESSAGES_POLL_INTERVAL = 3000; // 3 seconds
  const CONVERSATIONS_POLL_INTERVAL = 5000; // 5 seconds
  const OFFLINE_POLL_INTERVAL = 30000; // 30 seconds khi user offline
  
  // Refs for polling intervals
  const messagesPollingRef = useRef(null);
  const conversationsPollingRef = useRef(null);
  const onlineStatusPollingRef = useRef(null);
  
  // State to track if tab is active
  const [isTabActive, setIsTabActive] = useState(true);
  const [lastPollTime, setLastPollTime] = useState(null);
  
  // Online status state
  const [selectedUserOnline, setSelectedUserOnline] = useState(false);
  const [onlineStatusCache, setOnlineStatusCache] = useState(new Map());

  // Thêm state để điều khiển hiển thị sidebar khi đang trong đoạn chat
  const [showSidebar, setShowSidebar] = useState(false);

  const scrollToBottom = () => {
    const chatBox = chatMessagesRef.current;
    if (chatBox) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  };

  // Kiểm tra online status của selected user
  const checkSelectedUserOnlineStatus = async () => {
    if (!selectedUser) return;
    
    try {
      // Clear cache trước để lấy data mới nhất
      setOnlineStatusCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(selectedUser.id);
        return newCache;
      });
      
      const isOnline = await onlineStatusService.checkUserOnlineStatus(selectedUser.id);
      setSelectedUserOnline(isOnline);
      
      // Cập nhật cache
      setOnlineStatusCache(prev => new Map(prev.set(selectedUser.id, isOnline)));
      
      console.log(`Selected user ${selectedUser.name} online status:`, isOnline);
    } catch (error) {
      console.error('Error checking selected user online status:', error);
    }
  };

  // Kiểm tra online status của tất cả users trong conversations
  const checkConversationsOnlineStatus = async () => {
    if (conversations.length === 0) return;
    
    try {
      const userIds = conversations.map(conv => conv.id);
      
      // Clear cache cho các user này
      setOnlineStatusCache(prev => {
        const newCache = new Map(prev);
        userIds.forEach(userId => newCache.delete(userId));
        return newCache;
      });
      
      const onlineStatus = await onlineStatusService.checkUsersOnlineStatus(userIds);
      
      // Cập nhật cache
      setOnlineStatusCache(prev => {
        const newCache = new Map(prev);
        Object.entries(onlineStatus).forEach(([userId, isOnline]) => {
          newCache.set(parseInt(userId), isOnline);
        });
        return newCache;
      });
      
      console.log('Conversations online status updated:', onlineStatus);
    } catch (error) {
      console.error('Error checking conversations online status:', error);
    }
  };

  // Lấy online status từ cache
  const getCachedOnlineStatus = (userId) => {
    return onlineStatusCache.get(userId) || false;
  };

  // Tối ưu polling interval dựa trên online status
  const getOptimizedPollingInterval = (isUserOnline) => {
    return isUserOnline ? MESSAGES_POLL_INTERVAL : OFFLINE_POLL_INTERVAL;
  };

  const fetchMessages = async (userId1, userId2) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/messages/conversation/${userId1}/${userId2}`
      );
      
      // Thay vì merge, set luôn danh sách tin nhắn mới từ server
      setMessages(response.data);
      
      // Get the conversation ID for this user pair
      const conversation = conversations.find(conv => conv.id === userId2);
      if (conversation && conversation.conversationId) {
        setSelectedConversationId(conversation.conversationId);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/messages/conversations/${currentUser.userId}`);
      
      // Merge new conversations with existing ones to preserve unread counts and other state
      setConversations(prevConversations => {
        const newConversations = response.data;
        
        // Create a map of existing conversations by ID
        const existingConversationsMap = new Map();
        prevConversations.forEach(conv => {
          existingConversationsMap.set(conv.id, conv);
        });
        
        // Merge conversations, preserving existing state like unread counts
        const mergedConversations = newConversations.map(newConv => {
          const existingConv = existingConversationsMap.get(newConv.id);
          if (existingConv) {
            // Preserve unread count and other state from existing conversation
            return {
              ...newConv,
              unread: existingConv.unread || newConv.unread || 0
            };
          }
          return newConv;
        });
        
        // Check if we have any new conversations
        const hasNewConversations = newConversations.some(newConv => 
          !existingConversationsMap.has(newConv.id)
        );
        
        if (hasNewConversations) {
          console.log('New conversations found via polling');
        }
        
        return mergedConversations;
      });
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  // Start polling for messages
  const startMessagesPolling = () => {
    console.log('🔄 startMessagesPolling called', {
      selectedUser: selectedUser?.id,
      selectedUserOnline,
      currentInterval: messagesPollingRef.current
    });
    
    if (messagesPollingRef.current) {
      clearInterval(messagesPollingRef.current);
      console.log('🔄 Cleared existing messages polling interval');
    }
    
    // Chỉ start polling nếu selected user online
    if (selectedUser && selectedUserOnline) {
      messagesPollingRef.current = setInterval(() => {
        if (selectedUser && currentUser && isTabActive) {
          console.log('🔄 Polling for messages...', {
            selectedUser: selectedUser.id,
            currentUser: currentUser.userId
          });
          setLastPollTime(new Date());
          fetchMessages(currentUser.userId, selectedUser.id);
        }
      }, MESSAGES_POLL_INTERVAL);
      console.log('🔄 Started messages polling (user online)');
    } else if (selectedUser && !selectedUserOnline) {
      console.log('🔄 Skipped messages polling (user offline)');
    }
  };

  // Start polling for conversations
  const startConversationsPolling = () => {
    console.log('🔄 startConversationsPolling called', {
      currentInterval: conversationsPollingRef.current
    });
    
    if (conversationsPollingRef.current) {
      clearInterval(conversationsPollingRef.current);
      console.log('🔄 Cleared existing conversations polling interval');
    }
    
    conversationsPollingRef.current = setInterval(() => {
      if (currentUser && isTabActive) {
        console.log('🔄 Polling for conversations...');
        setLastPollTime(new Date());
        fetchConversations();
      }
    }, CONVERSATIONS_POLL_INTERVAL);
    console.log('🔄 Started conversations polling');
  };

  // Stop all polling
  const stopPolling = () => {
    console.log('🔄 stopPolling called', {
      messagesInterval: messagesPollingRef.current,
      conversationsInterval: conversationsPollingRef.current,
      onlineStatusInterval: onlineStatusPollingRef.current
    });
    
    if (messagesPollingRef.current) {
      clearInterval(messagesPollingRef.current);
      messagesPollingRef.current = null;
      console.log('🔄 Stopped messages polling');
    }
    if (conversationsPollingRef.current) {
      clearInterval(conversationsPollingRef.current);
      conversationsPollingRef.current = null;
      console.log('🔄 Stopped conversations polling');
    }
    if (onlineStatusPollingRef.current) {
      clearInterval(onlineStatusPollingRef.current);
      onlineStatusPollingRef.current = null;
      console.log('🔄 Stopped online status polling');
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // Effect to handle tab visibility changes
  useEffect(() => {
    console.log('🔄 Tab visibility changed:', isTabActive);
    
    if (isTabActive) {
      // Tab became active, resume polling if needed
      if (selectedUser && selectedUserOnline) {
        console.log('🔄 Tab active, resuming messages polling');
        startMessagesPolling();
      }
      if (currentUser) {
        console.log('🔄 Tab active, resuming conversations polling');
        startConversationsPolling();
      }
      
      // Immediately fetch latest data when tab becomes visible
      if (selectedUser && currentUser) {
        console.log('🔄 Tab became visible, fetching latest messages...');
        fetchMessages(currentUser.userId, selectedUser.id);
      }
      if (currentUser) {
        console.log('🔄 Tab became visible, fetching latest conversations...');
        fetchConversations();
      }
    } else {
      // Tab became inactive, stop polling to save resources
      console.log('🔄 Tab inactive, stopping all polling');
      stopPolling();
    }
  }, [isTabActive]);

  // Track tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      console.log('🔄 Document visibility changed:', isVisible);
      setIsTabActive(isVisible);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    // Bắt đầu heartbeat cho current user khi vào Messages page
    onlineStatusService.startHeartbeat(currentUser.userId);
  
    const handleNewMessage = (newMessage) => {
      console.log('Received new message via WebSocket:', newMessage);
      console.log('Current state:', {
        selectedConversationId,
        selectedUser: selectedUser?.id,
        currentUser: currentUser?.userId
      });

      // Check if this message belongs to the current conversation
      // First, check if we have a selectedUser and the message involves this user
      const isMessageForSelectedUser = selectedUser && (
        (newMessage.sender_id === selectedUser.id && newMessage.receiver_id === currentUser.userId) ||
        (newMessage.sender_id === currentUser.userId && newMessage.receiver_id === selectedUser.id)
      );

      // Also check by conversation ID
      const isMessageForCurrentConversation = selectedConversationId === newMessage.conversation_id;

      // Determine if this message should be shown in the current chat
      let shouldShowInCurrentChat = isMessageForSelectedUser || isMessageForCurrentConversation;

      // If this is a message for the selected user but we don't have the conversation ID set,
      // we need to find the conversation and update it
      if (isMessageForSelectedUser && !selectedConversationId && newMessage.conversation_id) {
        console.log('Updating selectedConversationId to:', newMessage.conversation_id);
        setSelectedConversationId(newMessage.conversation_id);
      }

      // If we don't have a selectedUser but this message is for us, we should find the sender
      // and select that conversation
      if (!selectedUser && newMessage.receiver_id === currentUser.userId) {
        console.log('No selected user, but received message from:', newMessage.sender_id);
        // Find the conversation for this sender
        const conversation = conversations.find(conv => conv.id === newMessage.sender_id);
        if (conversation) {
          console.log('Found conversation for sender, selecting it');
          setSelectedUser(conversation);
          setSelectedConversationId(newMessage.conversation_id);
          // Since we're now selecting this conversation, we should show the message
          shouldShowInCurrentChat = true;
          // Add the message to chat immediately since we're now viewing this conversation
          setMessages(prev => {
            const exists = prev.some(
              (msg) =>
                (msg.message_id && newMessage.message_id && msg.message_id === newMessage.message_id) ||
                (
                  msg.sender_id === newMessage.sender_id &&
                  msg.content === newMessage.content &&
                  Math.abs(new Date(msg.sent_at) - new Date(newMessage.sent_at)) < 2000
                )
            );
            if (exists) return prev;
            return [...prev, newMessage];
          });
        } else {
          // If conversation not found in current list, we need to fetch conversations first
          console.log('Conversation not found in current list, fetching conversations...');
          const fetchAndSelectConversation = async () => {
            try {
              const response = await axios.get(`http://localhost:8080/api/messages/conversations/${currentUser.userId}`);
              const updatedConversations = response.data;
              const foundConversation = updatedConversations.find(conv => conv.id === newMessage.sender_id);
              if (foundConversation) {
                console.log('Found conversation after fetching, selecting it');
                setSelectedUser(foundConversation);
                setSelectedConversationId(newMessage.conversation_id);
                // Since we're now selecting this conversation, we should show the message
                shouldShowInCurrentChat = true;
                // Add the message to chat immediately since we're now viewing this conversation
                setMessages(prev => {
                  const exists = prev.some(
                    (msg) =>
                      (msg.message_id && newMessage.message_id && msg.message_id === newMessage.message_id) ||
                      (
                        msg.sender_id === newMessage.sender_id &&
                        msg.content === newMessage.content &&
                        Math.abs(new Date(msg.sent_at) - new Date(newMessage.sent_at)) < 2000
                      )
                  );
                  if (exists) return prev;
                  return [...prev, newMessage];
                });
              }
            } catch (error) {
              console.error('Error fetching conversations for new message:', error);
            }
          };
          fetchAndSelectConversation();
        }
      }

      // Update conversations list
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.conversationId === newMessage.conversation_id) {
            return {
              ...conv,
              lastMessage: newMessage.content,
              time: new Date(newMessage.sent_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
              unread: !shouldShowInCurrentChat ? (conv.unread || 0) + 1 : conv.unread,
            };
          }
          return conv;
        })
      );

      // If currently viewing this conversation, add message to chat
      if (shouldShowInCurrentChat && selectedUser) {
        console.log('Adding message to current chat:', newMessage);
        setMessages((prev) => {
          const exists = prev.some(
            (msg) =>
              (msg.message_id && newMessage.message_id && msg.message_id === newMessage.message_id) ||
              (
                msg.sender_id === newMessage.sender_id &&
                msg.content === newMessage.content &&
                Math.abs(new Date(msg.sent_at) - new Date(newMessage.sent_at)) < 2000
              )
          );
          if (exists) return prev;
          return [...prev, newMessage];
        });
      } else {
        console.log('Message not for current conversation:', {
          selectedConversationId,
          messageConversationId: newMessage.conversation_id,
          selectedUser: selectedUser?.id,
          messageSender: newMessage.sender_id,
          messageReceiver: newMessage.receiver_id,
          currentUser: currentUser?.userId,
          isMessageForSelectedUser,
          isMessageForCurrentConversation
        });
      }
    };
  
    const setupWebSocket = () => {
      webSocketService.subscribe('messages', handleNewMessage);
    };
  
    if (!webSocketService.isWebSocketConnected()) {
      webSocketService.connect(currentUser.userId, setupWebSocket);
    } else {
      setupWebSocket();
    }
  
    // Initial fetch
    fetchConversations();
    
    // Start conversations polling (chỉ chạy 1 lần)
    startConversationsPolling();

    // Check online status initially
    checkConversationsOnlineStatus();
  
    return () => {
      webSocketService.unsubscribe('messages', handleNewMessage);
      stopPolling();
      // Dừng heartbeat khi rời khỏi Messages page
      onlineStatusService.stopHeartbeat();
    };
  }, [currentUser?.userId]); // Chỉ phụ thuộc vào currentUser.userId
  
  useEffect(() => {
    if (selectedUser) {
      console.log('🔄 Selected user changed:', selectedUser.id);
      
      fetchMessages(currentUser.userId, selectedUser.id);

      if (location.state?.initialMessage) {
        handleSendMessage(new Event('submit'));
      }
      
      // Check online status of selected user
      checkSelectedUserOnlineStatus();
      
      // Start checking online status periodically for this user
      startOnlineStatusChecking();
    }
  }, [selectedUser?.id]); // Chỉ phụ thuộc vào selectedUser.id

  // Update selectedConversationId when conversations are loaded and we have a selectedUser
  useEffect(() => {
    if (selectedUser && conversations.length > 0) {
      const conversation = conversations.find(conv => conv.id === selectedUser.id);
      if (conversation && conversation.conversationId) {
        console.log('Found conversation for selected user, setting conversationId:', conversation.conversationId);
        setSelectedConversationId(conversation.conversationId);
      } else {
        console.log('No conversation found for selected user:', selectedUser.id);
      }
    }
  }, [conversations, selectedUser]);

  // Refetch messages when selectedConversationId changes
  useEffect(() => {
    if (selectedUser && selectedConversationId) {
      console.log('Refetching messages for conversation:', selectedConversationId);
      fetchMessages(currentUser.userId, selectedUser.id);
    }
  }, [selectedConversationId]);

  // Handle when selectedUser changes (e.g., when receiving a message from a new user)
  useEffect(() => {
    if (selectedUser && selectedConversationId) {
      console.log('Selected user changed, fetching messages for:', selectedUser.id);
      fetchMessages(currentUser.userId, selectedUser.id);
    }
  }, [selectedUser?.id, selectedConversationId]);

  // Debug logging to help track the issue
  useEffect(() => {
    console.log('Selected conversation ID:', selectedConversationId);
    console.log('Selected user:', selectedUser);
    console.log('Current user:', currentUser);
  }, [selectedConversationId, selectedUser, currentUser]);

  // Khi chọn user, sidebar sẽ ẩn, nhưng có thể mở lại bằng icon menu
  useEffect(() => {
    if (selectedUser) setShowSidebar(false);
  }, [selectedUser]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser) return;

    const messageContent = message.trim();
    setMessage(''); // Clear input immediately

    try {
      const newMessage = {
        sender_id: currentUser.userId,
        receiver_id: selectedUser.id,
        content: messageContent,
        sent_at: new Date().toISOString()
      };

      // Update conversations list immediately
      setConversations(prev => {
        return prev.map(conv =>
          conv.id === selectedUser.id
            ? {
                ...conv,
                lastMessage: messageContent,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            : conv
        );
      });

      if (!webSocketService.isWebSocketConnected()) {
        console.log('WebSocket not connected, reconnecting...');
        await new Promise((resolve) => {
          webSocketService.connect(currentUser.userId, resolve);
        });
      }

      const success = webSocketService.sendMessage(newMessage);
      if (!success) {
        throw new Error('Failed to send message');
      }

      if (location.state?.initialMessage) {
        navigate('/messages', { state: { selectedUser } });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
      // Put the message back in the input field so user can try again
      setMessage(messageContent);
    }
  };

  const handleUserSelect = (user) => {
    console.log('Selecting user:', user);
    setSelectedUser(user);
    
    // Ensure we have the conversation ID set
    if (user.conversationId) {
      console.log('Setting selectedConversationId to:', user.conversationId);
      setSelectedConversationId(user.conversationId);
    }
    
    // Mark conversation as read
    if (user.conversationId) {
      axios.put(`http://localhost:8080/api/messages/read/${currentUser.userId}/${user.conversationId}`);
    }
    
    setConversations(prev =>
      prev.map(conv => (conv.id === user.id ? { ...conv, unread: 0 } : conv))
    );
    
    // Restart polling for messages with the new user
    startMessagesPolling();
  };

  // Debug function to log all active intervals
  const debugIntervals = () => {
    console.log('🔍 DEBUG INTERVALS:', {
      messagesPolling: messagesPollingRef.current ? 'ACTIVE' : 'INACTIVE',
      conversationsPolling: conversationsPollingRef.current ? 'ACTIVE' : 'INACTIVE', 
      onlineStatusPolling: onlineStatusPollingRef.current ? 'ACTIVE' : 'INACTIVE',
      selectedUser: selectedUser?.id,
      selectedUserOnline,
      isTabActive
    });
  };

  // Call debug every 5 seconds
  useEffect(() => {
    const debugInterval = setInterval(debugIntervals, 5000);
    return () => clearInterval(debugInterval);
  }, [selectedUser?.id, selectedUserOnline, isTabActive]);

  return (
    <div className="messages-container">
      {/* Hiển thị sidebar nếu chưa chọn user hoặc showSidebar = true */}
      {(!selectedUser || showSidebar) && (
        <div className="messages-sidebar">
          <div className="messages-header">
            <h2>Messages</h2>
          </div>
          <div className="conversations-list">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`conversation-item ${selectedUser?.id === conv.id ? 'active' : ''}`}
                onClick={() => { setShowSidebar(false); handleUserSelect(conv); }}
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
      )}

      <div className="messages-main">
        {selectedUser ? (
          <>
            <div className="chat-header">
              {/* Icon menu để mở/tắt sidebar */}
              <button
                className="menu-btn"
                title="Hiện/tắt danh sách hội thoại"
                onClick={() => setShowSidebar((prev) => !prev)}
                style={{ background: 'none', border: 'none', marginRight: 8, fontSize: 22, cursor: 'pointer' }}
              >
                <i className="bi bi-list"></i>
              </button>
              <img src={selectedUser.avatar} alt={selectedUser.name} className="chat-avatar" />
              <h3>{selectedUser.name}</h3>
              {/* Nút icon đóng và xóa đoạn chat */}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                <button
                  className="close-chat-btn"
                  title="Đóng đoạn chat"
                  onClick={() => setSelectedUser(null)}
                  style={{ padding: '4px', borderRadius: '4px', border: 'none', background: '#eee', cursor: 'pointer', fontSize: 20 }}
                >
                  <i className="bi bi-x"></i>
                </button>
                <button
                  className="delete-chat-btn"
                  title="Xóa đoạn chat"
                  onClick={async () => {
                    if (window.confirm('Bạn có chắc muốn xóa toàn bộ đoạn chat này?')) {
                      try {
                        await axios.delete(`http://localhost:8080/api/messages/conversation/${currentUser.userId}/${selectedUser.id}`);
                        setMessages([]);
                        setSelectedUser(null);
                        fetchConversations();
                      } catch (err) {
                        alert('Xóa đoạn chat thất bại!');
                      }
                    }
                  }}
                  style={{ padding: '4px', borderRadius: '4px', border: 'none', background: '#ffdddd', color: '#c00', cursor: 'pointer', fontSize: 20 }}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
            <div className="chat-messages" ref={chatMessagesRef}>
              {messages.filter(msg => !msg.pending).map((msg, index) => (
                <div
                  key={index}
                  className={`message ${msg.sender_id === currentUser.userId ? 'sent' : 'received'}${msg.error ? ' error-message' : ''}`}
                >
                  <p>{msg.content}</p>
                  <span className="message-time">
                    {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {msg.pending && <span className="sending-indicator"> • Đang gửi...</span>}
                  </span>
                  {msg.error && (
                    <div className="error-text">Gửi thất bại. <button onClick={() => alert('TODO: resend logic')}>Gửi lại</button></div>
                  )}
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