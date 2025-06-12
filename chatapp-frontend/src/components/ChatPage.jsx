import React, { useEffect, useRef, useState } from "react";
import { MdAttachFile, MdSend, MdLogout, MdPerson, MdRoom } from "react-icons/md";
import useChatContext from "../context/ChatContext";
import { useNavigate, useParams } from "react-router";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { baseURL } from "../config/AxiosHelper";
import { getMessagess } from "../services/RoomService";
import { timeAgo } from "../config/helper";
import { useAuth } from "../context/AuthContext";
import Navigation from "./Navigation";

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
  const [stompClient, setStompClient] = useState(null);

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

  // WebSocket connection setup
  useEffect(() => {
    const connectWebSocket = () => {
      const sock = new SockJS(`${baseURL}/chat`);
      const client = Stomp.over(sock);

      client.connect({}, () => {
        setStompClient(client);
        toast.success("Connected to chat!");

        client.subscribe(`/topic/room/${currentRoomId}`, (message) => {
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

    if (connected && currentRoomId) {
      connectWebSocket();
    }

    return () => {
      if (stompClient) {
        stompClient.disconnect();
      }
    };
  }, [currentRoomId, connected]);

  const sendMessage = async () => {
    if (stompClient && connected && input.trim()) {
      console.log("Sending message:", input);

      const message = {
        sender: currentUser || user?.name || 'Anonymous',
        content: input.trim(),
        roomId: currentRoomId,
      };

      stompClient.send(
        `/app/sendMessage/${currentRoomId}`,
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
                : "left-0 border-r-8 border-r-white dark:border-r-gray-800 border-t-4 border-t-transparent border-b-4 border-b-transparent"
            }`}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500 flex flex-col">
      {/* Navigation */}
      <Navigation />
      
      {/* Chat Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <MdRoom className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Room: {currentRoomId}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {connected ? 'Connected' : 'Connecting...'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <MdPerson className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {currentUser || user?.name || 'Anonymous'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {connected ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                title="Leave Room"
              >
                <MdLogout className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col">
        {/* Messages Area */}
        <div
          ref={chatBoxRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#CBD5E0 #EDF2F7' }}
        >
          {isConnecting ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading messages...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <MdRoom className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Welcome to the chat!
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
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
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 p-4">
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
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  disabled={!connected}
                />
              </div>
              
              <button
                onClick={sendMessage}
                disabled={!input.trim() || !connected}
                className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                <MdSend className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
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
      `}</style>
    </div>
  );
};

export default ChatPage;