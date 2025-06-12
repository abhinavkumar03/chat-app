import React, { useState, useEffect } from "react";
import { MessageCircle, Users, Plus, RefreshCw, X, Menu, ArrowRight } from "lucide-react";
import chatIcon from "../assets/chat.png";
import toast from "react-hot-toast";
import { createRoomApi, getAllRoomsApi, joinChatApi } from "../services/RoomService";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import Navigation from "./Navigation";

const JoinCreateChat = () => {
  const { user } = useAuth();
  const [detail, setDetail] = useState({
    roomId: "",
    userName: user?.name || "",
  });

  const [rooms, setRooms] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [focusedInput, setFocusedInput] = useState("");

  const { roomId, userName, setRoomId, setCurrentUser, setConnected } =
    useChatContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.name) {
      setDetail(prev => ({ ...prev, userName: user.name }));
    }
  }, [user]);

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
      navigate(`/chat/${room.roomId}`);
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
    if (window.innerWidth < 1024) setShowSidebar(false);
    joinRoomFromModal(roomId);
  }
  

  async function joinRoomFromModal(roomIdToJoin) {
    const roomToJoin = roomIdToJoin || selectedRoomId;
    if (!roomToJoin) {
      toast.error("No Room ID found");
      return;
    }
  
    if (!user?.name?.trim()) {
      toast.error("User not logged in");
      return;
    }
    setIsJoining(true);
    try {
      const room = await joinChatApi(roomToJoin);
      toast.success("Joined successfully!");
      setCurrentUser(user.name);
      setRoomId(room.roomId);
      setConnected(true);
      navigate(`/chat/${room.roomId}`);
    } catch (error) {
      if (error.status === 400) {
        toast.error(error.response.data);
      } else {
        toast.error("Error in joining room");
      }
      console.log(error);
    } finally {
      setIsJoining(false);
    }
  }
  async function getRooms() {
    setLoadingRooms(true);
    try {
      const fetchedRooms = await getAllRoomsApi();
      console.log(fetchedRooms);
      setRooms(fetchedRooms);
      setShowSidebar(true);
    } catch (error) {
      console.log(error);
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
        navigate(`/chat/${response.roomId}`);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      {/* Navigation */}
      <Navigation />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={`fixed left-0 top-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 transition-all duration-500 ease-out z-50 ${
          showSidebar ? 'translate-x-0 shadow-2xl' : '-translate-x-full shadow-none'
        } w-80 lg:relative lg:translate-x-0 lg:shadow-xl lg:top-0`}>
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
              {loadingRooms ? 'Loading...' : 'Refresh Rooms'}
            </button>
          </div>

          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {rooms.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No rooms available</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Create a room to get started</p>
              </div>
            ) : (
              rooms.map((room) => (
                <div
                  key={room.roomId}
                  className="p-4 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-600/50 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-200 cursor-pointer group"
                  onClick={() => handleJoinRoomClick(room.roomId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                        <MessageCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {room.roomId}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {room.userCount || 0} users
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowSidebar(true)}
              className="lg:hidden fixed top-20 left-4 z-50 p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Main Card */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8">
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <img src={chatIcon} alt="Chat" className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Welcome to ChatApp
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Join existing rooms or create your own
                </p>
              </div>

              {/* Form */}
              <div className="space-y-6">
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="userName"
                    value={detail.userName}
                    onChange={handleFormInputChange}
                    onFocus={() => setFocusedInput("userName")}
                    onBlur={() => setFocusedInput("")}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                      focusedInput === "userName"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                    placeholder="Enter your name"
                    required
                  />
                </div> */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Room ID
                  </label>
                  <input
                    type="text"
                    name="roomId"
                    value={detail.roomId}
                    onChange={handleFormInputChange}
                    onFocus={() => setFocusedInput("roomId")}
                    onBlur={() => setFocusedInput("")}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                      focusedInput === "roomId"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                    placeholder="Enter room ID"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={createRoom}
                    disabled={isCreating}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-4 h-4" />
                    {isCreating ? 'Creating...' : 'Create Room'}
                  </button>
                  <button
                    onClick={() => joinChat()}
                    disabled={isJoining}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <ArrowRight className="w-4 h-4" />
                    {isJoining ? 'Joining...' : 'Join Room'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinCreateChat;