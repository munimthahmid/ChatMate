import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  PaperClipIcon,
  PhotographIcon,
  MicrophoneIcon,
} from "@heroicons/react/outline"; // For the icons in input
import { ChatIcon } from "@heroicons/react/solid"; // For the chatbot icon in messages
import VoiceChat from "./VoiceChat"; // Import the VoiceChat component
import { useChatbot } from "../context/ChatbotContext";

const BASE_URL = "http://localhost:8000";

const Chat = () => {
  const [isVoiceChatOpen, setIsVoiceChatOpen] = useState(false); // State to manage VoiceChat modal

  const {
    typingBotMessage,
    scrollToBottom,
    messages,
    messagesEndRef,
    setInput,
    input,
    handleKeyPress,
    handleSend,
    isTyping,
    loading,
  } = useChatbot();

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
      <h1 className="text-3xl font-semibold mb-4">Chat with Chatbot</h1>
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
            {msg.sender === "bot" && (
              <ChatIcon className="w-8 h-8 text-gray-400 mr-2" />
            )}
            <div
              className={`px-4 py-2 rounded-full max-w-7xl break-words ${
                msg.sender === "user"
                  ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white"
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
            <ChatIcon className="w-8 h-8 text-gray-400 mr-2" />
            <div className="px-4 py-2 rounded-full max-w-7xl break-words bg-gray-200 text-gray-800">
              {typingBotMessage}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center bg-gray-100 rounded-full p-2 shadow">
        <button className="p-2 hover:bg-gray-200 rounded-full">
          <PaperClipIcon className="w-6 h-6 text-gray-600" />
        </button>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 border-0 focus:outline-none bg-gray-100 rounded-full resize-none"
          rows={1}
        />
        {/* Voice Chat button */}
        <button
          onClick={() => setIsVoiceChatOpen(true)}
          className="ml-2 p-2 bg-green-500 text-white rounded-full hover:bg-green-600"
          title="Voice Chat"
        >
          <MicrophoneIcon className="w-6 h-6" />
        </button>
        <button
          onClick={handleSend}
          disabled={isTyping}
          title="Send"
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>

      {/* Voice Chat Modal */}
      {isVoiceChatOpen && (
        <VoiceChat
          isOpen={isVoiceChatOpen}
          onRequestClose={() => setIsVoiceChatOpen(false)}
          setInput={setInput}
        />
      )}
    </div>
  );
};

export default Chat;
