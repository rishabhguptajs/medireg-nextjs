"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Link from "next/link";
import { toast, Toaster } from "react-hot-toast";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";

const Chat: React.FC = () => {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [availableChatrooms, setAvailableChatrooms] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const [selectedChatroom, setSelectedChatroom] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUserSelection, setShowUserSelection] = useState(true);

  const handleApiError = useCallback(
    (err: any) => {
      if (err.response?.data?.code === "token_not_valid") {
        setError("Your session has expired. Please log in again.");
        logout();
      } else {
        toast.error('Error occurred!')
      }
    },
    [logout]
  );

  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get("http://3.109.213.173:5000/api/users/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err: any) {
      handleApiError(err);
    }
  }, [handleApiError]);

  const fetchAvailableChatrooms = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        "http://3.109.213.173:5000/api/chatroom/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAvailableChatrooms(response.data);
    } catch (err: any) {
      handleApiError(err);
    }
  }, [handleApiError]);

  const createChatroom = async (userIds: number[]) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.post(
        "http://3.109.213.173:5000/api/chatroom/create/",
        {
          name: "Chatroom with selected users",
          users: userIds,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAvailableChatrooms((prev) => [...prev, response.data]);
      setShowUserSelection(false);
      toast.success('Chatroom created successfully!');
    } catch (err: any) {
      handleApiError(err);
    }
  };

  const sendMessage = async () => {
    if (selectedChatroom !== null && messageText.trim() !== "") {
      try {
        const token = localStorage.getItem("access_token");
        await axios.post(
          `http://3.109.213.173:5000/api/chatroom/${selectedChatroom}/send/`,
          { content: messageText },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessageText("");
        fetchMessages();
      } catch (err: any) {
        handleApiError(err);
      }
    } else {
      setError("Message cannot be empty.");
    }
  };

  const fetchMessages = useCallback(async () => {
    if (selectedChatroom !== null) {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get(
          `http://3.109.213.173:5000/api/chatroom/${selectedChatroom}/messages/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(response.data);
      } catch (err: any) {
        handleApiError(err);
      }
    }
  }, [selectedChatroom, handleApiError]);

  useEffect(() => {
    fetchUsers();
    fetchAvailableChatrooms();
  }, [fetchUsers, fetchAvailableChatrooms]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (selectedChatroom) {
      interval = setInterval(() => {
        fetchMessages();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [selectedChatroom, fetchMessages]);

  const ChatroomList = () => (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Available Chatrooms
      </h2>
      <div className="space-y-2">
        {availableChatrooms.map((chatroom) => (
          <button
            key={chatroom.id}
            onClick={() => setSelectedChatroom(chatroom.id)}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
          >
            {chatroom.name || `Chatroom ${chatroom.id}`}
          </button>
        ))}
      </div>
    </div>
  );

  const UserSelection = () => (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Create Chatroom
      </h2>
      <div className="space-y-2">
        <select
          multiple
          className="w-full border border-gray-300 rounded-lg shadow-sm"
          onChange={(e) =>
            createChatroom(
              Array.from(e.target.selectedOptions, (option) =>
                Number(option.value)
              )
            )
          }
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.first_name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const MessageList = () => (
    <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg h-64 overflow-y-scroll">
      {messages.map((message, index) => (
        <div
          key={index}
          className="mb-2 p-2 bg-white rounded-lg shadow-sm"
        >
          <strong>{message.sender.first_name}:</strong> {message.content}
        </div>
      ))}
    </div>
  );

  const MessageInput = () => (
    <div className="flex items-center">
      <input
        type="text"
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        placeholder="Type your message..."
      />
      <button
        onClick={sendMessage}
        className="ml-4 px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
      >
        Send
      </button>
    </div>
  );

  return (
    <ProtectedRoute>
      <Toaster />
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <div className="container mx-auto p-6 bg-white rounded-lg shadow-lg mt-6">
          <h1 className="text-4xl font-bold text-primary mb-6">
            <span>Chat Application</span>
            <Link href={'/logout'}>
                <span className="text-red-500 text-sm font-semibold ml-4">Logout</span>
            </Link>
          </h1>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <ChatroomList />
              {showUserSelection && <UserSelection />}
            </div>
            <div className="md:col-span-2">
              {selectedChatroom !== null && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    Messages
                  </h2>
                  <MessageList />
                  <MessageInput />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Chat;