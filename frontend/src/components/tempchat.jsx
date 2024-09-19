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
    <div className="flex flex-col h-full bg-gray-100">
      <h1 className="text-3xl font-semibold mb-4 text-center text-gray-800">
        Chat with Chatbot
      </h1>

      <div
        className="flex-1 p-4 mb-4 bg-white rounded-lg shadow-md overflow-y-auto"
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
              className={`px-4 py-2 rounded-lg max-w-2xl break-words shadow-md ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-800 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Render the typing bot message separately */}
        {typingBotMessage && (
          <div className="flex mb-2 justify-start">
            <div className="px-4 py-2 rounded-lg max-w-2xl break-words bg-gray-200 text-gray-800 animate-pulse">
              {typingBotMessage}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center p-4 bg-gray-50 rounded-lg shadow-inner">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-sm"
          rows={1}
        />

        <div className="flex items-center space-x-2 ml-4">
          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={isTyping}
            className={`px-4 py-3 rounded-lg text-white shadow-lg transition duration-200 ${
              isTyping
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            } focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
          >
            {loading ? "Sending..." : "Send"}
          </button>

          {/* Call Button */}
          <button
            onClick={() => setIsVoiceChatOpen(true)}
            className="px-4 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 shadow-lg"
            title="Start Voice Call"
          >
            <PhoneIcon className="w-5 h-5" />
          </button>
        </div>
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
