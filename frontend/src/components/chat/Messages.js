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
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const chatMessagesRef = useRef(null);
  const selectedUserRef = useRef(selectedUser);
  //binhvuong
  // Polling intervals (in milliseconds)
  const MESSAGES_POLL_INTERVAL = 3000; // 3 seconds
  const CONVERSATIONS_POLL_INTERVAL = 5000; // 5 seconds
  
  // Refs for polling intervals
  const messagesPollingRef = useRef(null);
  const conversationsPollingRef = useRef(null);
  
  // State to track if tab is active
  const [isTabActive, setIsTabActive] = useState(true);
  const [lastPollTime, setLastPollTime] = useState(null);

  const scrollToBottom = () => {
    const chatBox = chatMessagesRef.current;
    if (chatBox) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
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
    if (messagesPollingRef.current) {
      clearInterval(messagesPollingRef.current);
    }
    
    messagesPollingRef.current = setInterval(() => {
      if (selectedUser && currentUser && isTabActive) {
        console.log('Polling for messages...');
        setLastPollTime(new Date());
        fetchMessages(currentUser.userId, selectedUser.id);
      }
    }, MESSAGES_POLL_INTERVAL);
  };

  // Start polling for conversations
  const startConversationsPolling = () => {
    if (conversationsPollingRef.current) {
      clearInterval(conversationsPollingRef.current);
    }
    
    conversationsPollingRef.current = setInterval(() => {
      if (currentUser && isTabActive) {
        console.log('Polling for conversations...');
        setLastPollTime(new Date());
        fetchConversations();
      }
    }, CONVERSATIONS_POLL_INTERVAL);
  };

  // Stop all polling
  const stopPolling = () => {
    if (messagesPollingRef.current) {
      clearInterval(messagesPollingRef.current);
      messagesPollingRef.current = null;
    }
    if (conversationsPollingRef.current) {
      clearInterval(conversationsPollingRef.current);
      conversationsPollingRef.current = null;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

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
    
    // Start polling
    startConversationsPolling();
    if (selectedUser) {
      startMessagesPolling();
    }
  
    return () => {
      webSocketService.unsubscribe('messages', handleNewMessage);
      stopPolling();
    };
  }, [currentUser?.userId, selectedConversationId, selectedUser]);
  
  useEffect(() => {
    if (selectedUser) {
      fetchMessages(currentUser.userId, selectedUser.id);

      if (location.state?.initialMessage) {
        handleSendMessage(new Event('submit'));
      }
      
      // Start polling for messages when a user is selected
      startMessagesPolling();
    } else {
      // Stop polling for messages when no user is selected
      if (messagesPollingRef.current) {
        clearInterval(messagesPollingRef.current);
        messagesPollingRef.current = null;
      }
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
              {isTabActive && (
                <div className="polling-indicator" title="Live updates active">
                  <i className="bi bi-circle-fill" style={{ color: '#28a745', fontSize: '8px' }}></i>
                </div>
              )}
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