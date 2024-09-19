import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

let recognition = null;
if ("webkitSpeechRecognition" in window) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.lang = "en-US";
}

const useSpeechRecognition = () => {
  const BASE_URL = "http://localhost:8000";
  const { auth } = useAuth();
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [botResponse, setBotResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const synthRef = useRef(window.speechSynthesis);
  const sendVoiceMessage = useCallback(
    async (messageText) => {
      setIsProcessing(true);
      try {
        const response = await fetch(`${BASE_URL}/chat/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify({ message: messageText }),
        });

        if (response.ok) {
          const data = await response.json();
          const botReply = data.reply;
          setBotResponse(botReply);
          speak(botReply);
        } else {
          const errorData = await response.json();
          const errorMsg =
            errorData.detail || "Failed to get response from chatbot.";
          setBotResponse(errorMsg);
          speak(errorMsg);
        }
      } catch (err) {
        console.error("Voice Chat error:", err);
        const errorMsg = "An error occurred while processing your request.";
        setBotResponse(errorMsg);
        speak(errorMsg);
      } finally {
        setIsProcessing(false);
      }
    },
    [auth.token]
  );

  useEffect(() => {
    if (!recognition) return;
    recognition.onresult = (event) => {
      console.log("onresult event", event);
      setTranscript(event.results[0][0].transcript);
      sendVoiceMessage(event.results[0][0].transcript);

      recognition.stop();
      setIsRecording(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      alert("An error occurred during speech recognition. Please try again.");
      setIsRecording(false);
    };
  }, [sendVoiceMessage]);

  const startRecording = () => {
    console.log("Listening started");

    setTranscript("");
    setIsRecording(true);
    recognition.start();
  };
  const stopRecording = () => {
    console.log("Listening stopped");
    setIsRecording(false);
    recognition.stop();
  };

  const speak = (text) => {
    if ("speechSynthesis" in window) {
      const utterThis = new SpeechSynthesisUtterance(text);
      synthRef.current.speak(utterThis);
    } else {
      alert(
        "Your browser does not support Speech Synthesis. Please try a different browser."
      );
    }
  };
  return {
    transcript,
    setTranscript,
    isRecording,
    startRecording,
    stopRecording,
    setIsRecording,
    hasRecognitionSupport: !!recognition,
    isProcessing,
    botResponse,
  };
};
export default useSpeechRecognition;
