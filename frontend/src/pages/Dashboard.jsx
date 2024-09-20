// src/pages/Dashboard.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import DashboardHome from "../components/DashboardHome";
import Chat from "../components/Chat";
import TrainChatbot from "../components/TrainChatbot";
import Resources from "../components/Resources";
import { useAuth } from "../context/AuthContext";
const Dashboard = () => {
  const { auth } = useAuth();
  console.log(auth.user);

  return (
    <div className="flex md:flex-row min-h-screen page-container">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-auto bg-gradient-to-b from-teal-200 to-white">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="chat" element={<Chat />} />
          <Route path="train-chatbot" element={<TrainChatbot />} />
          <Route path="resources" element={<Resources />} />
          {/* Redirect any unknown nested routes to the dashboard home */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
