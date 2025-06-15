import React, { useState, useEffect } from "react";
import { MessageCircle, Users, Plus, RefreshCw, X, Menu, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { roomService } from "../services/RoomService";
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
      const result = await roomService.joinRoom(roomToJoin, user?.id || detail.userName);
      if (result.success) {
        toast.success("Joined successfully!");
        setCurrentUser(detail.userName);
        setRoomId(result.data.roomId);
        setConnected(true);
        navigate(`/chat/${result.data.roomId}`);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Error in joining room");
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
      const result = await roomService.joinRoom(roomToJoin, user?.id || user.name);
      if (result.success) {
        toast.success("Joined successfully!");
        setCurrentUser(user.name);
        setRoomId(result.data.roomId);
        setConnected(true);
        navigate(`/chat/${result.data.roomId}`);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Error in joining room");
      console.log(error);
    } finally {
      setIsJoining(false);
    }
  }

  async function getRooms() {
    setLoadingRooms(true);
    try {
      const result = await roomService.getAllRooms();
      if (result.success) {
        console.log(result.data);
        setRooms(result.data);
        setShowSidebar(true);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error in loading rooms");
    } finally {
      setLoadingRooms(false);
    }
  }

  async function createRoom() {
    if (validateForm()) {
      setIsCreating(true);
      console.log(detail);
      
      try {
        const result = await roomService.createRoom({
          roomId: detail.roomId,
          userId: user?.id || detail.userName
        });
        if (result.success) {
          console.log(result.data);
          toast.success("Room Created Successfully !!");
          setCurrentUser(detail.userName);
          setRoomId(result.data.roomId);
          setConnected(true);
          navigate(`/chat/${result.data.roomId}`);
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        console.log(error);
        toast.error("Error in creating room");
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
    <div className="min-h-screen bg-gray-900 flex flex-col font-sans">
      <Navigation />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={`fixed left-0 top-0 h-full bg-gray-800/90 backdrop-blur-xl border-r border-gray-700/50 transition-all duration-500 ease-out z-50 ${
          showSidebar ? 'translate-x-0 shadow-2xl' : '-translate-x-full shadow-none'
        } w-80 lg:relative lg:translate-x-0 lg:shadow-xl lg:w-96`}>
          <div className="p-6 border-b border-gray-700/50 bg-gray-700/50">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-xl">
                  <Users className="w-5 h-5 text-indigo-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">
                  Available Rooms
                </h2>
              </div>
              <button
                onClick={() => setShowSidebar(false)}
                className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-gray-800"
              >
                <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>
            <button
              onClick={getRooms}
              disabled={loadingRooms}
              className="mt-4 px-4 py-3 text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] flex items-center gap-2 shadow-lg hover:shadow-xl w-full justify-center"
            >
              <RefreshCw className={`w-4 h-4 ${loadingRooms ? 'animate-spin' : ''}`} />
              {loadingRooms ? 'Loading Rooms...' : 'Refresh Rooms'}
            </button>
          </div>

          <div className="p-4 space-y-3 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
            {rooms.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No rooms available</p>
                <p className="text-sm text-gray-500">Create a room to get started</p>
              </div>
            ) : (
              rooms.map((room) => (
                <div
                  key={room.roomId}
                  className="p-4 bg-gray-700/60 backdrop-blur-sm rounded-lg border border-gray-600/50 hover:bg-gray-700/80 transition-all duration-200 cursor-pointer group flex items-center justify-between"
                  onClick={() => handleJoinRoomClick(room.roomId)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-900/30 rounded-md group-hover:bg-indigo-900/50 transition-colors">
                      <MessageCircle className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white group-hover:text-indigo-300 transition-colors">
                        {room.roomId}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {room.participants ? Object.keys(room.participants).length : 0} users
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-200" />
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
              className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-700/50 hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-gray-900"
            >
              <Menu className="w-5 h-5 text-gray-400" />
            </button>

            {/* Main Card */}
            <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 p-8">
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  {/* Placeholder for chatIcon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 7.6 4.7 8.38 8.38 0 0 1 .9 3.8z"></path>
                  </svg>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  Welcome to ChatApp
                </h1>
                <p className="text-gray-400">
                  Join existing rooms or create your own
                </p>
              </div>

              {/* Form */}
              <div className="space-y-6">

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Room ID
                  </label>
                  <input
                    type="text"
                    name="roomId"
                    value={detail.roomId}
                    onChange={handleFormInputChange}
                    onFocus={() => setFocusedInput("roomId")}
                    onBlur={() => setFocusedInput("")}
                    className={`w-full px-4 py-3 rounded-md border ${
                      focusedInput === "roomId"
                        ? "border-indigo-500 bg-gray-700 focus:ring-indigo-500"
                        : "border-gray-600 bg-gray-700"
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 text-white placeholder-gray-500 transition-all duration-200`}
                    placeholder="Enter room ID"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={createRoom}
                    disabled={isCreating}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-md transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800"
                  >
                    <Plus className="w-4 h-4" />
                    {isCreating ? 'Creating...' : 'Create Room'}
                  </button>
                  <button
                    onClick={() => joinChat()}
                    disabled={isJoining}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-md transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800"
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