import React, { useEffect, useRef, useState } from "react";
import { MdAttachFile, MdSend, MdLogout, MdPerson, MdRoom } from "react-icons/md";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { baseURL } from "../config/AxiosHelper";
import { getMessagess } from "../services/RoomService";
import { timeAgo } from "../config/helper";

const ChatPage = () => {
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
  const [stompClient, setStompClient] = useState(null);

  useEffect(() => {
    if (!connected) {
      navigate("/");
    }
  }, [connected, roomId, currentUser]);

  useEffect(() => {
    async function loadMessages() {
      try {
        setIsConnecting(true);
        const messages = await getMessagess(roomId);
        setMessages(messages);
        setIsConnecting(false);
      } catch (error) {
        setIsConnecting(false);
        console.error("Error loading messages:", error);
      }
    }
    if (connected) {
      loadMessages();
    }
  }, [roomId, connected]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // WebSocket connection setup
  useEffect(() => {
    const connectWebSocket = () => {
      const sock = new SockJS(`${baseURL}/chat`);
      const client = Stomp.over(sock);

      client.connect({}, () => {
        setStompClient(client);
        toast.success("Connected to chat!");

        client.subscribe(`/topic/room/${roomId}`, (message) => {
          console.log("Received message:", message);
          const newMessage = JSON.parse(message.body);
          const messageId = `${newMessage.sender}-${newMessage.timeStamp || newMessage.timestamp || Date.now()}`;
          
          setMessages((prev) => [...prev, newMessage]);
          setNewMessageIds((prev) => new Set([...prev, messageId]));
          
          // Remove animation class after animation completes
          setTimeout(() => {
            setNewMessageIds((prev) => {
              const updated = new Set(prev);
              updated.delete(messageId);
              return updated;
            });
          }, 600); // Match animation duration
        });
      }, (error) => {
        console.error("WebSocket connection error:", error);
        toast.error("Failed to connect to chat");
      });
    };

    if (connected && roomId) {
      connectWebSocket();
    }

    return () => {
      if (stompClient) {
        stompClient.disconnect();
      }
    };
  }, [roomId, connected]);

  const sendMessage = async () => {
    if (stompClient && connected && input.trim()) {
      console.log("Sending message:", input);

      const message = {
        sender: currentUser,
        content: input.trim(),
        roomId: roomId,
      };

      stompClient.send(
        `/app/sendMessage/${roomId}`,
        {},
        JSON.stringify(message)
      );
      setInput("");
    }
  };

  function handleLogout() {
    if (stompClient) {
      stompClient.disconnect();
    }
    setConnected(false);
    setRoomId("");
    setCurrentUser("");
    navigate("/");
  }

  const MessageBubble = ({ message, index, isNewMessage }) => {
    const isOwnMessage = message.sender === currentUser;
    
    return (
      <div
        className={`flex mb-4 ${isNewMessage ? 'animate-fadeInUp' : ''} ${
          isOwnMessage ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`group max-w-xs lg:max-w-md px-4 py-3 rounded-2xl relative transform transition-all duration-300 hover:scale-105 ${
            isOwnMessage
              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md"
              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md shadow-lg"
          }`}
        >
          <div className="flex items-start space-x-3">
            {!isOwnMessage && (
              <img
                className="h-8 w-8 rounded-full ring-2 ring-gray-200 dark:ring-gray-700 transition-transform duration-300 group-hover:scale-110"
                src={`https://avatar.iran.liara.run/public/${message.sender.length * 3}`}
                alt={message.sender}
              />
            )}
            <div className="flex-1">
              {!isOwnMessage && (
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  {message.sender}
                </p>
              )}
              <p className="text-sm leading-relaxed">{message.content}</p>
              <p className={`text-xs mt-2 ${
                isOwnMessage ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
              }`}>
                {timeAgo(message.timeStamp || message.timestamp)}
              </p>
            </div>
            {isOwnMessage && (
              <img
                className="h-8 w-8 rounded-full ring-2 ring-blue-200 transition-transform duration-300 group-hover:scale-110"
                src={`https://avatar.iran.liara.run/public/${currentUser.length * 3}`}
                alt={currentUser}
              />
            )}
          </div>
          
          {/* Message tail */}
          <div
            className={`absolute top-4 w-0 h-0 ${
              isOwnMessage
                ? "right-0 border-l-8 border-l-purple-600 border-t-4 border-t-transparent border-b-4 border-b-transparent"
                : "left-0 border-r-8 border-r-white dark:border-r-gray-800 border-t-4 border-t-transparent border-b-4 border-b-transparent"
            }`}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
      {/* Animated Header */}
      <header className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 z-50 transition-all duration-300">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Room Info */}
            <div className="flex items-center space-x-4 animate-slideInLeft">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full">
                <MdRoom className="w-5 h-5" />
                <span className="font-semibold text-sm">{roomId}</span>
              </div>
              <div className="hidden sm:flex items-center space-x-2 bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {messages.length} messages
                </span>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-4 animate-slideInRight">
              <div className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full">
                <MdPerson className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                  {currentUser}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="group flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                <MdLogout className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                <span className="text-sm font-medium">Leave</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <main
        ref={chatBoxRef}
        className="pt-24 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto h-screen overflow-y-auto"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#CBD5E0 transparent'
        }}
      >
        {isConnecting && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading messages...</span>
          </div>
        )}
        
        {messages.map((message, index) => {
          const messageId = `${message.sender}-${message.timeStamp || message.timestamp || Date.now()}-${index}`;
          const isNewMessage = newMessageIds.has(messageId);
          
          return (
            <MessageBubble 
              key={messageId} 
              message={message} 
              index={index} 
              isNewMessage={isNewMessage}
            />
          );
        })}
        
        {/* Remove typing indicator since we're using real WebSocket data */}
      </main>

      {/* Enhanced Input Container */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 p-4 transition-all duration-300">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-800 rounded-2xl p-2 shadow-lg">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                type="text"
                placeholder="Type your message..."
                className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none text-sm resize-none"
                style={{ minHeight: '44px' }}
              />
              {input.length > 0 && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                  {input.length}/1000
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
              >
                😊
              </button>
              
              <button className="p-2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-all duration-200 transform hover:scale-110">
                <MdAttachFile size={20} />
              </button>
              
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className={`p-2 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95 ${
                  input.trim()
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl"
                    : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                }`}
              >
                <MdSend size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.5s ease-out;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #CBD5E0;
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #A0AEC0;
        }
      `}</style>
    </div>
  );
};

export default ChatPage;