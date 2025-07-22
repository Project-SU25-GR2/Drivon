import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import webSocketService from '../../services/WebSocketService';
import './Messages.css';
import Loader from '../others/loader';
import { API_URL } from '../../api/configApi';
import { showErrorToast, showSuccessToast } from '../notification/notification';
import cloudinaryConfig from '../../config/cloudinary';
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
  //binhvuong
  // Polling intervals (in milliseconds)
  // const MESSAGES_POLL_INTERVAL = 3000; // 3 seconds
  // const CONVERSATIONS_POLL_INTERVAL = 5000; // 5 seconds
  
  // Refs for polling intervals
  // const messagesPollingRef = useRef(null);
  // const conversationsPollingRef = useRef(null);
  
  // State to track if tab is active
  const [isTabActive, setIsTabActive] = useState(true);
  const [lastPollTime, setLastPollTime] = useState(null);

  // Thêm state để điều khiển hiển thị sidebar khi đang trong đoạn chat
  const [showSidebar, setShowSidebar] = useState(false);
  
  // Thêm ref để tránh gửi tin nhắn tự động 2 lần
  const hasAutoSentMessage = useRef(false);

  const [loading, setLoading] = useState(false);
  
  // File input ref for image uploads
  const fileInputRef = useRef(null);

  // Start polling for messages
  // const startMessagesPolling = () => {
  //   if (messagesPollingRef.current) {
  //     clearInterval(messagesPollingRef.current);
  //   }
    
  //   messagesPollingRef.current = setInterval(() => {
  //     if (selectedUser && currentUser && isTabActive) {
  //       console.log('Polling for messages...');
  //       setLastPollTime(new Date());
  //       fetchMessages(currentUser.userId, selectedUser.id);
  //     }
  //   }, MESSAGES_POLL_INTERVAL);
  // };

  // Start polling for conversations
  // const startConversationsPolling = () => {
  //   if (conversationsPollingRef.current) {
  //     clearInterval(conversationsPollingRef.current);
  //   }
    
  //   conversationsPollingRef.current = setInterval(() => {
  //     if (currentUser && isTabActive) {
  //       console.log('Polling for conversations...');
  //       setLastPollTime(new Date());
  //       fetchConversations();
  //     }
  //   }, CONVERSATIONS_POLL_INTERVAL);
  // };

  // Stop all polling
  // const stopPolling = () => {
  //   if (messagesPollingRef.current) {
  //     clearInterval(messagesPollingRef.current);
  //     messagesPollingRef.current = null;
  //   }
  //   if (conversationsPollingRef.current) {
  //     clearInterval(conversationsPollingRef.current);
  //     conversationsPollingRef.current = null;
  //   }
  // };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // Reset auto-send flag khi component mount hoặc location.state thay đổi
  useEffect(() => {
    hasAutoSentMessage.current = false;
  }, [location.state?.initialMessage]);

  // Handle tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      console.log('Tab visibility changed:', isVisible);
      setIsTabActive(isVisible);
      
      // If tab becomes visible, immediately fetch latest data
      if (isVisible) {
        if (selectedUser && currentUser) {
          console.log('Tab became visible, fetching latest messages...');
          fetchMessages(currentUser.userId, selectedUser.id);
        }
        if (currentUser) {
          console.log('Tab became visible, fetching latest conversations...');
          fetchConversations();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [selectedUser, currentUser]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
  
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
              const response = await axios.get(`${API_URL}/messages/conversations/${currentUser.userId}`);
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
          // Gán type nếu là ảnh
          const msgToAdd = (!newMessage.type && isImageUrl(newMessage.content)) ? { ...newMessage, type: 'image' } : newMessage;
          return [...prev, msgToAdd];
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
    
    // Start polling
    // startConversationsPolling();
    // if (selectedUser) {
    //   startMessagesPolling();
    // }
  
    return () => {
      webSocketService.unsubscribe('messages', handleNewMessage);
      // stopPolling();
    };
  }, [currentUser?.userId, selectedConversationId, selectedUser]);
  
  useEffect(() => {
    if (selectedUser) {
      fetchMessages(currentUser.userId, selectedUser.id);

      // Chỉ gửi tin nhắn tự động 1 lần khi có initialMessage và chưa gửi
      // Chỉ auto-send nếu input đang rỗng (tránh gửi 2 lần nếu input đã có sẵn)
      if (location.state?.initialMessage && !hasAutoSentMessage.current && message === '') {
        hasAutoSentMessage.current = true;
        setMessage(location.state.initialMessage); // Đảm bảo input có nội dung trước khi gửi
        setTimeout(() => {
          handleSendMessage(new Event('submit'), true); // truyền cờ autoSend
        }, 500);
      }
      // Start polling for messages when a user is selected
      // startMessagesPolling();
    } else {
      // Stop polling for messages when no user is selected
      // if (messagesPollingRef.current) {
      //   clearInterval(messagesPollingRef.current);
      //   messagesPollingRef.current = null;
      // }
      // Reset flag khi không có user được chọn
      hasAutoSentMessage.current = false;
    }
  }, [selectedUser?.id]);

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

  const handleSendMessage = async (e, autoSend = false) => {
    if (e && e.preventDefault) e.preventDefault();
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

      // Optimistically update messages list
      setMessages(prev => [...prev, newMessage]);

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

      // Only clear initialMessage and input after auto-send
      if (autoSend && location.state?.initialMessage) {
        // Only clear history and input, do not navigate again
        window.history.replaceState({}, document.title);
        setMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showErrorToast('Failed to send message. Please try again.');
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
      axios.put(`${API_URL}/messages/read/${currentUser.userId}/${user.conversationId}`);
    }
    
    setConversations(prev =>
      prev.map(conv => (conv.id === user.id ? { ...conv, unread: 0 } : conv))
    );
    
    // Restart polling for messages with the new user
    // startMessagesPolling();
  };

  if (loading) return <div className="loading"><Loader /></div>;

  const scrollToBottom = () => {
    const chatBox = chatMessagesRef.current;
    if (chatBox) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  };

  const isImageUrl = (url) => {
    return typeof url === 'string' && url.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i);
  };

  const fetchMessages = async (userId1, userId2) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/messages/conversation/${userId1}/${userId2}`
      );
      // Gán type: 'image' nếu là link ảnh
      const processedMessages = response.data.map(msg => {
        if (!msg.type && isImageUrl(msg.content)) {
          return { ...msg, type: 'image' };
        }
        return msg;
      });
      setMessages(processedMessages);
      const conversation = conversations.find(conv => conv.id === userId2);
      if (conversation && conversation.conversationId) {
        setSelectedConversationId(conversation.conversationId);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/messages/conversations/${currentUser.userId}`);
      setConversations(prevConversations => {
        const newConversations = response.data;
        const existingConversationsMap = new Map();
        prevConversations.forEach(conv => {
          existingConversationsMap.set(conv.id, conv);
        });
        const mergedConversations = newConversations.map(newConv => {
          const existingConv = existingConversationsMap.get(newConv.id);
          if (existingConv) {
            return {
              ...newConv,
              unread: existingConv.unread || newConv.unread || 0
            };
          }
          return newConv;
        });
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
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showErrorToast('File size must not exceed 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      showErrorToast('Please select an image file');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', cloudinaryConfig.uploadPreset);
      formData.append('api_key', cloudinaryConfig.apiKey);
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`;
      const res = await axios.post(cloudinaryUrl, formData);
      const imageUrl = res.data.secure_url;
      sendImageMessage(imageUrl);
    } catch (err) {
      showErrorToast('Error uploading image');
    }
  };

  const sendImageMessage = (imageUrl) => {
    if (!selectedUser) return;
    const newMessage = {
      sender_id: currentUser.userId,
      receiver_id: selectedUser.id,
      content: imageUrl,
      type: 'image',
      sent_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMessage]);
    webSocketService.sendMessage(newMessage);
  };

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
                    <h3 style={{ display: 'inline-block', marginRight: 8 }}>{conv.name}</h3>
                    {conv.unread > 0 && (
                      <span className="unread-badge">new</span>
                    )}
                  </div>
                  <div className="conversation-meta">
                    <span className="conversation-time">{
                      (() => {
                        const d = new Date(conv.time);
                        return conv.time && !isNaN(d) ? d.toISOString().slice(0, 10) : '';
                      })()
                    }</span>
                  </div>
                  <p className="conversation-last-message">{
                    isImageUrl(conv.lastMessage)
                      ? 'New image:'
                      : conv.lastMessage
                  }</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="messages-main">
        {selectedUser ? (
          <>
            <div className="chat-header">
              {/* Icon menu to open/close sidebar */}
              <button
                className="menu-btn"
                title="Show/hide conversation list"
                onClick={() => setShowSidebar((prev) => !prev)}
                style={{ background: 'none', border: 'none', marginRight: 8, fontSize: 22, cursor: 'pointer' }}
              >
                <i className="bi bi-list"></i>
              </button>
              <img src={selectedUser.avatar} alt={selectedUser.name} className="chat-avatar" />
              <h3>{selectedUser.name}</h3>
              {/* Close and delete chat buttons */}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                <button
                  className="close-chat-btn"
                  title="Close chat"
                  onClick={() => setSelectedUser(null)}
                  style={{ padding: '4px', borderRadius: '4px', border: 'none', background: '#eee', cursor: 'pointer', fontSize: 20 }}
                >
                  <i className="bi bi-x"></i>
                </button>
              </div>
            </div>
            <div className="chat-messages" ref={chatMessagesRef}>
              {(() => {
                const elements = [];
                let lastDate = null;
                messages.forEach((msg, index) => {
                  const msgDate = new Date(msg.sent_at);
                  let showDate = false;
                  if (!lastDate || (msgDate - lastDate) > 24 * 60 * 60 * 1000) {
                    showDate = true;
                  }
                  if (showDate) {
                    elements.push(
                      <div key={`date-${index}`} className="message-date-separator" style={{textAlign:'center',color:'#888',margin:'10px 0',fontSize:'0.95rem'}}>
                        {msgDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </div>
                    );
                  }
                  elements.push(
                    <div
                      key={index}
                      className={`message ${msg.sender_id === currentUser.userId ? 'sent' : 'received'}`}
                    >
                      {msg.type === 'image' ? (
                        <img src={msg.content} alt="sent-img" style={{ maxWidth: 200, borderRadius: 8 }} />
                      ) : (
                        <p>{msg.content}</p>
                      )}
                      <span className="message-time">
                        {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                  lastDate = msgDate;
                });
                return elements;
              })()}
              <div />
            </div>
            <form className="message-input" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleImageChange}
              />
              <button type="button" className="send-image-btn" onClick={() => fileInputRef.current.click()} title="Send image">
                <i className="bi bi-image" style={{fontSize:22}}></i>
              </button>
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
//6/18/2025
export default Messages;