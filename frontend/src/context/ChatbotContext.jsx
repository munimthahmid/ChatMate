import { createContext, useContext, useRef, useState } from "react";
import { useAuth } from "./AuthContext";

export const ChatbotContext = createContext();

const ChatbotProvider = ({ children }) => {
  const { auth, BASE_URL } = useAuth();
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingBotMessage, setTypingBotMessage] = useState("");

  // Scroll to the latest message
  const scrollToBottom = (smooth = false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
      });
    }
  };

  const typeMessage = (messageText) => {
    console.log("Bot text in ChatbotContext", messageText);
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

  const handleSetUserMessage = (input) => {
    const userMessage = { sender: "user", text: input };
    setMessages([...messages, userMessage]);
    setInput("");
    setLoading(true);
  };
  const handleSend = async () => {
    if (input.trim() === "") return;

    handleSetUserMessage(input);
    console.log("User message has been set");
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
  return (
    <ChatbotContext.Provider
      value={{
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
        typeMessage,
        handleSetUserMessage,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
};

const useChatbot = () => {
  const context = useContext(ChatbotContext);

  if (context == undefined) {
    throw new Error("ChatbotContext was used outside ChatbotProvider");
  }
  return context;
};

export { useChatbot, ChatbotProvider };
