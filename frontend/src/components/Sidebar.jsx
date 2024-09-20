// src/components/Sidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaTachometerAlt,
  FaComments,
  FaCogs,
  FaSignOutAlt,
  FaBook,
} from "react-icons/fa";
import { useState } from "react";

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const [isSelected, setIsSelected] = useState("");

  // Define navigation links with icons
  const navigation = [
    { name: "Dashboard", path: "/dashboard", icon: <FaTachometerAlt /> },
    { name: "Chat", path: "/dashboard/chat", icon: <FaComments /> },
    {
      name: "Train Chatbot",
      path: "/dashboard/train-chatbot",
      icon: <FaCogs />,
    },
    {
      name: "Resources",
      path: "/dashboard/resources",
      icon: <FaBook />,
    },
  ];
  const handleClick = (value) => {
    setIsSelected(value);
  };

  return (
    <div className="w-64 bg-white shadow-md">
      <div className="p-6 text-2xl font-bold text-teal-500 flex flex-row items-center justify-center gap-2">
        <img src="/src/assets/images/botIcon.jpg" width={50} />
        <p>ChatMate</p>
      </div>
      <nav className="mt-10">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => handleClick(item.name)}
            className={({ isActive }) =>
              `flex items-center py-2.5 px-4 rounded transition duration-200 ${
                isActive && isSelected == item.name
                  ? "bg-sky-950 text-white"
                  : "text-gray-700 hover:bg-blue-100 hover:text-teal-600"
              }`
            }
          >
            <span className="text-lg mr-3">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className="flex items-center w-full text-left py-2.5 px-4 mt-4 rounded transition duration-200 text-gray-700 hover:bg-red-100 hover:text-red-600"
        >
          <FaSignOutAlt className="text-lg mr-3" />
          Logout
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
