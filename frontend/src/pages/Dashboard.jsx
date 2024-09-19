import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // Context to manage auth state
import { useNavigate } from "react-router-dom"; // For navigation

const Dashboard = () => {
  const { auth, logout } = useContext(AuthContext); // Access auth state and logout function
  const navigate = useNavigate(); // Hook for navigation

  // Handle logout
  const handleLogout = () => {
    logout(); // Clear auth state
    navigate("/login"); // Redirect to login page
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-8 space-y-4 bg-white rounded shadow">
        <h1 className="text-3xl font-bold text-center">
          Welcome, {auth.user.username}!
        </h1>
        <p className="text-center">This is your dashboard.</p>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 font-semibold text-white bg-red-500 rounded hover:bg-red-600 transition duration-200"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
