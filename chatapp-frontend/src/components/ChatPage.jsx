import React, { useEffect, useRef, useState } from "react";
import { MdAttachFile, MdSend, MdLogout, MdPerson, MdRoom } from "react-icons/md";
import useChatContext from "../context/ChatContext";
import { useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import { getMessagess } from "../services/RoomService";
import { timeAgo } from "../config/helper";
import { useAuth } from "../context/AuthContext";
import Navigation from "./Navigation";
import websocketService from "../services/websocketService";

import { LogOut, User, Settings, MessageSquare, Send, Slash, ChevronsRight, Info, Zap } from 'lucide-react';

const ChatPage = () => {
  const { roomId: urlRoomId } = useParams();
  const { user } = useAuth();
  const {
    roomId,
    currentUser,
    connected,
    setConnected,
    setRoomId,
    setCurrentUser,
  } = useChatContext();

  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [newMessageIds, setNewMessageIds] = useState(new Set());
  const inputRef = useRef(null);
  const chatBoxRef = useRef(null);

  // Use URL roomId if available, otherwise use context roomId
  const currentRoomId = urlRoomId || roomId;

  useEffect(() => {
    if (!connected && currentRoomId) {
      // Auto-connect if we have a roomId from URL
      setRoomId(currentRoomId);
      setCurrentUser(user?.name || 'Anonymous');
      setConnected(true);
    }
  }, [currentRoomId, connected, user]);

  useEffect(() => {
    async function loadMessages() {
      try {
        setIsConnecting(true);
        const messages = await getMessagess(currentRoomId);
        setMessages(messages);
        setIsConnecting(false);
      } catch (error) {
        setIsConnecting(false);
        console.error("Error loading messages:", error);
      }
    }
    if (connected && currentRoomId) {
      loadMessages();
    }
  }, [currentRoomId, connected]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // WebSocket connection setup using the service
  useEffect(() => {
    if (websocketService.isConnected()) return;
    if (connected && currentRoomId) {
      const token = localStorage.getItem("token");
      console.log("Token:", token);
      // Connect to WebSocket using the service
      websocketService.connect(token)
        .then(() => {
          toast.success("Connected to chat!");
          
          // Subscribe to room messages
          const messageHandler = (messageData) => {
            console.log("Received message via service:", messageData);
            const messageId = `${messageData.sender}-${messageData.timeStamp || messageData.timestamp || Date.now()}`;
            
            setMessages((prev) => [...prev, messageData]);
            setNewMessageIds((prev) => new Set([...prev, messageId]));
            
            // Remove animation class after animation completes
            setTimeout(() => {
              setNewMessageIds((prev) => {
                const updated = new Set(prev);
                updated.delete(messageId);
                return updated;
              });
            }, 600); // Match animation duration
          };
          
          websocketService.subscribeToRoom(currentRoomId, messageHandler);
        })
        .catch((error) => {
          console.error("WebSocket connection error via service:", error);
          toast.error("Failed to connect to chat");
        });
    }

    return () => {
      // Cleanup: unsubscribe from room and disconnect
      if (currentRoomId) {
        websocketService.unsubscribeFromRoom(currentRoomId);
      }
      websocketService.disconnect();
    };
  }, [currentRoomId, connected]);

  const sendMessage = () => {
    if (websocketService.isConnected() && input.trim()) {
      const message = {
        sender: currentUser || user?.name || 'Anonymous',
        content: input.trim(),
        roomId: currentRoomId,
      };

      const success = websocketService.sendMessage(currentRoomId, message);
      
      if (success) {
        setInput("");
      } else {
        toast.error("Failed to send message");
      }
    } else {
      toast.error("Message cannot be sent. Not connected or input is empty.");
    }
  };

  function handleLogout() {
    websocketService.disconnect();
    setConnected(false);
    setRoomId("");
    setCurrentUser("");
    navigate("/chat");
  }

  const MessageBubble = ({ message, index, isNewMessage }) => {
    const isOwnMessage = message.sender === (currentUser || user?.name);
    
    return (
      <div
        className={`flex mb-4 ${isNewMessage ? 'animate-fadeInUp' : ''} ${
          isOwnMessage ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`group max-w-xs lg:max-w-md px-4 py-3 rounded-xl relative transform transition-all duration-300 hover:scale-105 ${
            isOwnMessage
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-lg"
              : "bg-gray-700 text-white rounded-bl-lg shadow-lg"
          }`}
        >
          <div className="flex items-start space-x-3">
            {!isOwnMessage && (
              <img
                className="h-8 w-8 rounded-full ring-2 ring-gray-600 dark:ring-gray-700 transition-transform duration-300 group-hover:scale-110"
                src={`https://avatar.iran.liara.run/public/${message.sender.length * 3}`}
                alt={message.sender}
              />
            )}
            <div className="flex-1">
              {!isOwnMessage && (
                <p className="text-xs font-semibold text-gray-300 mb-1">
                  {message.sender}
                </p>
              )}
              <p className="text-sm leading-relaxed">{message.content}</p>
              <p className={`text-xs mt-2 ${
                isOwnMessage ? "text-blue-200" : "text-gray-400"
              }`}>
                {timeAgo(message.timeStamp || message.timestamp)}
              </p>
            </div>
            {isOwnMessage && (
              <img
                className="h-8 w-8 rounded-full ring-2 ring-blue-400 transition-transform duration-300 group-hover:scale-110"
                src={`https://avatar.iran.liara.run/public/${(currentUser || user?.name || 'Anonymous').length * 3}`}
                alt={currentUser || user?.name || 'Anonymous'}
              />
            )}
          </div>
          
          {/* Message tail */}
          <div
            className={`absolute top-4 w-0 h-0 ${
              isOwnMessage
                ? "right-0 border-l-8 border-l-purple-600 border-t-4 border-t-transparent border-b-4 border-b-transparent"
                : "left-0 border-r-8 border-r-gray-700 border-t-4 border-t-transparent border-b-4 border-b-transparent"
            }`}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col font-sans">
      <Navigation />
      {/* Chat Header */}
      <header className="bg-gray-800/80 backdrop-blur-xl border-b border-gray-700/50 z-40 transition-all duration-300">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-900/30 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-white">
                    Room: {currentRoomId}
                  </h1>
                  <p className="text-sm text-gray-400">
                    {connected ? 'Connected' : 'Connecting...'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-green-900/30 rounded-full">
                  <User className="h-4 w-4 text-green-400" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-white">
                    {currentUser || user?.name || 'Anonymous'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {connected ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-gray-800"
                title="Leave Room"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col sm:px-6 lg:px-8">
        {/* Messages Area */}
        <div
          ref={chatBoxRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
        >
          {isConnecting ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
              <span className="ml-3 text-gray-400">Loading messages...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                Welcome to the chat!
              </h3>
              <p className="text-gray-400">
                Start the conversation by sending a message.
              </p>
            </div>
          ) : (
            messages.map((message, index) => {
              const messageId = `${message.sender}-${message.timeStamp || message.timestamp || index}`;
              const isNewMessage = newMessageIds.has(messageId);
              return (
                <MessageBubble
                  key={messageId}
                  message={message}
                  index={index}
                  isNewMessage={isNewMessage}
                />
              );
            })
          )}
        </div>

        {/* Input Area */}
        <div className="bg-gray-900/80 backdrop-blur-xl border-t border-gray-700/50 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type your message..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-500 transition-all duration-200"
                  disabled={!connected}
                />
              </div>
              
              <button
                onClick={sendMessage}
                disabled={!input.trim() || !connected}
                className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-md transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900" // Updated colors, rounded-md, focus styles
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        /* Custom scrollbar for dark theme */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #2d3748; /* gray-800 */
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4a5568; /* gray-600 */
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280; /* gray-500 */
        }
      `}</style>
    </div>
  );
};

export default ChatPage;