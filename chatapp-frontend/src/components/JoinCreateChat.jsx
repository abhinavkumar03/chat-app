import React, { useState, useEffect } from "react";
import { MessageCircle, Users, Plus, RefreshCw, X, Menu, ArrowRight } from "lucide-react";
import chatIcon from "../assets/chat.png";
import toast from "react-hot-toast";
import { createRoomApi, getAllRoomsApi, joinChatApi } from "../services/RoomService";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";

const JoinCreateChat = () => {
  const [detail, setDetail] = useState({
    roomId: "",
    userName: "",
  });

  const [rooms, setRooms] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [modalUserName, setModalUserName] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [focusedInput, setFocusedInput] = useState("");

  const { roomId, userName, setRoomId, setCurrentUser, setConnected } =
    useChatContext();
  const navigate = useNavigate();

  function handleFormInputChange(event) {
    setDetail({
      ...detail,
      [event.target.name]: event.target.value,
    });
  }

  function validateForm() {
    if (detail.roomId === "" || detail.userName === "") {
      toast.error("Invalid Input !!");
      return false;
    }
    return true;
  }

  async function joinChat(selectedRoomId = null) {
    const roomToJoin = selectedRoomId || detail.roomId;
    
    if (!detail.userName) {
      toast.error("Please enter your name");
      return;
    }
    
    if (!roomToJoin) {
      toast.error("Please select or enter a room ID");
      return;
    }

    setIsJoining(true);
    
    try {
      const room = await joinChatApi(roomToJoin);
      toast.success("Joined successfully!");
      setCurrentUser(detail.userName);
      setRoomId(room.roomId);
      setConnected(true);
      navigate("/chat");
    } catch (error) {
      if (error.status == 400) {
        toast.error(error.response.data);
      } else {
        toast.error("Error in joining room");
      }
      console.log(error);
    } finally {
      setIsJoining(false);
    }
  }

  function handleJoinRoomClick(roomId) {
    setSelectedRoomId(roomId);
    setShowModal(true);
  }

  async function joinRoomFromModal() {
    if (!modalUserName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setIsJoining(true);
    
    try {
      const room = await joinChatApi(selectedRoomId);
      toast.success("Joined successfully!");
      setCurrentUser(modalUserName);
      setRoomId(room.roomId);
      setConnected(true);
      setShowModal(false);
      navigate("/chat");
    } catch (error) {
      if (error.status == 400) {
        toast.error(error.response.data);
      } else {
        toast.error("Error in joining room");
      }
      console.log(error);
    } finally {
      setIsJoining(false);
    }
  }

  function closeModal() {
    setShowModal(false);
    setModalUserName("");
    setSelectedRoomId("");
  }

  async function getRooms() {
    setLoadingRooms(true);
    try {
      const fetchedRooms = await getAllRoomsApi();
      setRooms(fetchedRooms);
      setShowSidebar(true);
    } catch (error) {
      if (error.status == 400) {
        toast.error(error.response.data);
      } else {
        toast.error("Error in loading rooms");
      }
      console.log(error);
    } finally {
      setLoadingRooms(false);
    }
  }

  async function createRoom() {
    if (validateForm()) {
      setIsCreating(true);
      console.log(detail);
      
      try {
        const response = await createRoomApi(detail.roomId);
        console.log(response);
        toast.success("Room Created Successfully !!");
        setCurrentUser(detail.userName);
        setRoomId(response.roomId);
        setConnected(true);
        navigate("/chat");
      } catch (error) {
        console.log(error);
        if (error.status == 400) {
          toast.error("Room already exists !!");
        } else {
          toast.error("Error in creating room");
        }
      } finally {
        setIsCreating(false);
      }
    }
  }

  // Load rooms on component mount
  useEffect(() => {
    getRooms();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
      </div>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 transition-all duration-500 ease-out z-50 ${
        showSidebar ? 'translate-x-0 shadow-2xl' : '-translate-x-full shadow-none'
      } w-80 lg:relative lg:translate-x-0 lg:shadow-xl`}>
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-xl">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Available Rooms
              </h2>
            </div>
            <button
              onClick={() => setShowSidebar(false)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all duration-200 group"
            >
              <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>
          <button
            onClick={getRooms}
            disabled={loadingRooms}
            className="mt-4 px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl disabled:opacity-50 transition-all duration-200 transform hover:scale-105 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <RefreshCw className={`w-4 h-4 ${loadingRooms ? 'animate-spin' : ''}`} />
            {loadingRooms ? "Loading..." : "Refresh"}
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto">
          {rooms.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-center">No rooms available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rooms.map((room, index) => (
                <div
                  key={room.roomId || index}
                  className="group p-4 border border-gray-200/50 dark:border-gray-600/50 rounded-2xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: showSidebar ? 'slideInLeft 0.5s ease-out forwards' : 'none'
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                          {room.roomId}
                        </h3>
                        {room.participantCount && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Users className="w-3 h-3" />
                            {room.participantCount} participants
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleJoinRoomClick(room.roomId)}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 group-hover:animate-pulse"
                    >
                      Join
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Join Room Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl max-w-md w-full mx-4 border border-gray-200/50 dark:border-gray-700/50 transform transition-all duration-300"
            style={{
              animation: 'modalSlideIn 0.3s ease-out forwards'
            }}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Join Room</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full inline-block">
                {selectedRoomId}
              </p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="modalUserName" className="block font-medium mb-3 text-gray-700 dark:text-gray-300">
                Enter your name
              </label>
              <input
                type="text"
                id="modalUserName"
                value={modalUserName}
                onChange={(e) => setModalUserName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-white/50 dark:bg-gray-700/50 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    joinRoomFromModal();
                  }
                }}
                autoFocus
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={joinRoomFromModal}
                disabled={isJoining}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 font-medium flex items-center justify-center gap-2"
              >
                {isJoining ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Joining...
                  </>
                ) : (
                  <>
                    Join Room
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay for mobile */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        {/* Toggle button for mobile */}
        <button
          onClick={() => setShowSidebar(true)}
          className="fixed top-6 left-6 lg:hidden z-30 p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-110"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="p-8 border border-gray-200/50 dark:border-gray-700/50 w-full flex flex-col gap-6 max-w-md rounded-3xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-2xl transition-all duration-500 transform">
          <div className="text-center">
            <img src={chatIcon} className="w-20 h-20 mx-auto mb-4 transform hover:rotate-12 transition-transform duration-300 shadow-xl rounded-2xl" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Join Room / Create Room
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
              Connect with friends instantly
            </p>
          </div>

          {/* Name input */}
          <div className="space-y-2">
            <label htmlFor="name" className="block font-medium text-gray-700 dark:text-gray-300">
              Your name
            </label>
            <div className="relative">
              <input
                onChange={handleFormInputChange}
                value={detail.userName}
                type="text"
                id="name"
                name="userName"
                placeholder="Enter your name"
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput('')}
                className={`w-full bg-white/50 dark:bg-gray-800/50 px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                  focusedInput === 'name' ? 'border-blue-500 shadow-lg transform scale-[1.02]' : 'border-gray-200 dark:border-gray-600'
                }`}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  detail.userName ? 'bg-green-400' : 'bg-gray-300'
                }`}></div>
              </div>
            </div>
          </div>

          {/* Room ID input */}
          <div className="space-y-2">
            <label htmlFor="roomId" className="block font-medium text-gray-700 dark:text-gray-300">
              Room ID / New Room ID
            </label>
            <div className="relative">
              <input
                name="roomId"
                onChange={handleFormInputChange}
                value={detail.roomId}
                type="text"
                id="roomId"
                placeholder="Enter the room id"
                onFocus={() => setFocusedInput('roomId')}
                onBlur={() => setFocusedInput('')}
                className={`w-full bg-white/50 dark:bg-gray-800/50 px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                  focusedInput === 'roomId' ? 'border-blue-500 shadow-lg transform scale-[1.02]' : 'border-gray-200 dark:border-gray-600'
                }`}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  detail.roomId ? 'bg-green-400' : 'bg-gray-300'
                }`}></div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => joinChat()}
              disabled={isJoining}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              {isJoining ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Joining...
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4" />
                  Join Room
                </>
              )}
            </button>
            <button
              onClick={createRoom}
              disabled={isCreating}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Room
                </>
              )}
            </button>
          </div>

          {/* Show available rooms button for mobile */}
          <div className="text-center lg:hidden">
            <button
              onClick={() => setShowSidebar(true)}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center gap-2 mx-auto transition-all duration-200 hover:gap-3"
            >
              <Users className="w-4 h-4" />
              View Available Rooms
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
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

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default JoinCreateChat;