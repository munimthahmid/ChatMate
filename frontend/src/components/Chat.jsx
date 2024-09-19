// src/components/Chat.jsx
import React, { useState, useEffect, useRef } from "react";
import { AuthContext, useAuth } from "../context/AuthContext";
import { PhoneIcon } from "@heroicons/react/outline"; // Using Heroicons for the call button icon
import VoiceChat from "./VoiceChat";
const BASE_URL = "http://localhost:8000";

const Chat = () => {
  const { auth } = useAuth();
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingBotMessage, setTypingBotMessage] = useState(""); // For typewriter effect
  const [isVoiceChatOpen, setIsVoiceChatOpen] = useState(false); // State to manage VoiceChat modal

  // Scroll to the latest message
  const scrollToBottom = (smooth = false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
      });
    }
  };

  const typeMessage = (messageText) => {
    setIsTyping(true);
    let currentIndex = 0;
    setTypingBotMessage(messageText[currentIndex]);
    // Clear previous typing message
    const interval = setInterval(() => {
      console.log(messageText[currentIndex]);

      setTypingBotMessage((prev) => prev + messageText[currentIndex]);
      scrollToBottom();
      currentIndex++;
      if (currentIndex === messageText.length) {
        clearInterval(interval);
        // Once typing is done, add the complete message to the messages state
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: messageText },
        ]);
        setTypingBotMessage(""); // Clear the typing message after completion
        setIsTyping(false);
      }
    }, 5); // Adjust the speed of typing here
  };

  const handleSend = async () => {
    if (input.trim() === "") return;

    const userMessage = { sender: "user", text: input };
    setMessages([...messages, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ message: input }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage = { sender: "bot", text: data.reply };
        typeMessage(botMessage.text); // Call the typewriter effect here
      } else {
        const errorData = await response.json();
        const errorMsg =
          errorData.detail || "Failed to get response from chatbot.";
        const botMessage = { sender: "bot", text: errorMsg };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      const botMessage = {
        sender: "bot",
        text: "An error occurred while processing your request.",
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  useEffect(() => {
    if (typingBotMessage) {
      scrollToBottom();
    }
  }, [typingBotMessage]);

  // Ensure scrolling after the full message is added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-semibold">Chat with Chatbot</h1>
        <button
          onClick={() => setIsVoiceChatOpen(true)}
          className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition duration-200"
          title="Start Voice Call"
        >
          <PhoneIcon className="w-6 h-6" />
        </button>
      </div>
      <div
        className="flex-1 p-4 mb-4 bg-white rounded shadow overflow-y-auto"
        style={{ maxHeight: "500px" }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex mb-2 ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-2xl break-words ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Render the typing bot message separately */}
        {typingBotMessage && (
          <div className="flex mb-2 justify-start">
            <div className="px-4 py-2 rounded-lg max-w-2xl break-words bg-gray-200 text-gray-800">
              {typingBotMessage}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="flex">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none focus:ring focus:border-blue-300 resize-none"
          rows={2}
        />
        <button
          onClick={handleSend}
          disabled={isTyping}
          className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>

      {/* Voice Call Modal */}
      {isVoiceChatOpen && (
        <VoiceChat
          isOpen={isVoiceChatOpen}
          onRequestClose={() => setIsVoiceChatOpen(false)}
        />
      )}
    </div>
  );
};

export default Chat;
