// src/components/Chat.jsx
import { useState, useEffect } from "react";
import { PhoneIcon } from "@heroicons/react/outline"; // Using Heroicons for the call button icon
import VoiceChat from "./VoiceChat";
import { useChatbot } from "../context/ChatbotContext";

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
  }, [typingBotMessage, scrollToBottom]);

  // Ensure scrolling after the full message is added
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

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
          setInput={setInput}
        />
      )}
    </div>
  );
};

export default Chat;
