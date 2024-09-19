// src/hooks/useSpeechRecognition.js

import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useChatbot } from "../context/ChatbotContext";

let recognition = null;
if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = true; // Keep listening until manually stopped
  recognition.lang = "en-US";
  recognition.interimResults = false; // Only final results
}

const useSpeechRecognition = () => {
  const BASE_URL = "http://localhost:8000";
  const { auth } = useAuth();
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [botResponse, setBotResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false); // New state
  const synthRef = useRef(window.speechSynthesis);
  const { typeMessage, handleSetUserMessage } = useChatbot();

  const sendVoiceMessage = useCallback(
    async (messageText) => {
      setIsProcessing(true);
      try {
        handleSetUserMessage(messageText);
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
          console.log("Bot Reply:", botReply);
          typeMessage(botReply);
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
    [auth.token, handleSetUserMessage, typeMessage]
  );

  useEffect(() => {
    if (!recognition) return;

    const handleResult = (event) => {
      console.log("onresult event", event);
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const finalTranscript = event.results[i][0].transcript.trim();
          setTranscript((prev) =>
            prev ? `${prev} ${finalTranscript}` : finalTranscript
          );
          sendVoiceMessage(finalTranscript);
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      // Optionally handle interim transcripts if needed
    };

    const handleError = (event) => {
      console.error("Speech Recognition Error:", event.error);
      alert("An error occurred during speech recognition. Please try again.");
      setIsRecording(false);
    };

    const handleEnd = () => {
      if (isRecording) {
        // Automatically restart recognition if it ends unexpectedly
        recognition.start();
      }
    };

    recognition.onresult = handleResult;
    recognition.onerror = handleError;
    recognition.onend = handleEnd;

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
    };
  }, [sendVoiceMessage, isRecording]);

  const startRecording = () => {
    if (!recognition) {
      alert("Speech Recognition is not supported in your browser.");
      return;
    }

    console.log("Listening started");

    setTranscript("");
    setBotResponse("");
    setIsRecording(true);
    try {
      recognition.start();
    } catch (err) {
      console.error("Recognition start error:", err);
    }
  };

  const stopRecording = () => {
    if (!recognition) return;

    console.log("Listening stopped");
    setIsRecording(false);
    recognition.stop();
  };

  const speak = (text) => {
    if ("speechSynthesis" in window) {
      const utterThis = new SpeechSynthesisUtterance(text);
      setIsBotSpeaking(true); // Set bot speaking to true
      utterThis.onend = () => {
        setIsBotSpeaking(false); // Set bot speaking to false when done
        // Optionally restart recognition after speaking
        if (isRecording && !recognition.continuous) {
          recognition.start();
        }
      };
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
    hasRecognitionSupport: !!recognition,
    isProcessing,
    botResponse,
    isBotSpeaking, // Expose the new state
  };
};

export default useSpeechRecognition;
