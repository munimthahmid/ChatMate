// src/components/DashboardHome.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const DashboardHome = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Chat",
      description: "Interact with the chatbot in real-time.",
      onClick: () => navigate("/dashboard/chat"),
      icon: "💬",
    },
    {
      title: "Train Chatbot",
      description: "Upload PDFs to train the chatbot model.",
      onClick: () => navigate("/dashboard/train-chatbot"),
      icon: "📄",
    },
    // Add more cards as needed
  ];

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card) => (
          <div
            key={card.title}
            onClick={card.onClick}
            className="flex items-center p-6 bg-white rounded-lg shadow-md cursor-pointer hover:bg-blue-50 transition duration-200"
          >
            <div className="text-4xl mr-4">{card.icon}</div>
            <div>
              <h2 className="text-xl font-semibold">{card.title}</h2>
              <p className="text-gray-600">{card.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardHome;
