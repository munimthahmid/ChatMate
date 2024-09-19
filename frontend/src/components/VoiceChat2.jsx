// src/components/VoiceChat.jsx

import { useEffect, useState } from "react";
import Modal from "react-modal";
import {
  XIcon,
  MicrophoneIcon,
  SpeakerphoneIcon,
  PhoneIcon,
  VideoCameraIcon,
} from "@heroicons/react/solid"; // Using solid icons for call actions

import useSpeechRecognition from "../hooks/useSpeechRecognition";
import profilePic from "/public/assets/images/botIcon.jpg";

Modal.setAppElement("#root"); // For accessibility

const VoiceChat = ({ isOpen, onRequestClose }) => {
  const {
    transcript,
    startRecording,
    stopRecording,
    isRecording,
    isProcessing,
    botResponse,
    hasRecognitionSupport,
    isBotSpeaking,
  } = useSpeechRecognition();
  const [callStatus, setCallStatus] = useState("Connected");
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    // Implement mute functionality as needed
  };

  // Toggle speaker functionality
  const handleToggleSpeaker = () => {
    setIsSpeaker(!isSpeaker);
    // Implement speaker functionality as needed
  };

  useEffect(() => {
    if (isOpen) {
      startRecording();
    } else {
      stopRecording();
    }
    // Cleanup when the modal is closed
    return () => {
      stopRecording();
    };
  }, [isOpen, startRecording, stopRecording]);

  if (!hasRecognitionSupport) {
    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        contentLabel="Voice Chat"
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        overlayClassName="fixed inset-0"
      >
        <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md p-6 relative">
          <button
            onClick={onRequestClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            title="Close"
          >
            <XIcon className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-semibold mb-4">Voice Chat</h2>
          <p>Your browser does not support Speech Recognition.</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Voice Chat"
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90"
      overlayClassName="fixed inset-0"
    >
      {/* Main Voice Call UI */}
      <div className="flex flex-col items-center justify-center h-full text-center">
        {/* Profile Image */}
        <div className="relative">
          <div className="rounded-full border-4 border-gray-600 overflow-hidden w-32 h-32">
            <img
              src={profilePic}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Bot Speaking Indicator */}
          {isBotSpeaking && (
            <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-2 animate-pulse">
              <SpeakerphoneIcon className="w-4 h-4 text-white" />
            </div>
          )}
          {/* User Speaking Indicator */}
          {isRecording && (
            <div className="absolute top-0 left-0 bg-blue-500 rounded-full p-2 animate-pulse">
              <MicrophoneIcon className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Caller name and status */}
        <h2 className="text-white text-3xl mt-4">Chatbot</h2>
        <p className="text-gray-400 text-lg">{callStatus}</p>

        {/* Transcript Display */}
        {transcript && (
          <div className="mt-4 w-full px-4">
            <h3 className="text-left text-white font-semibold mb-1">
              You said:
            </h3>
            <p className="bg-gray-800 bg-opacity-50 p-3 rounded-lg text-left text-white">
              {transcript}
            </p>
          </div>
        )}

        {botResponse && (
          <div className="mt-4 w-full px-4">
            <h3 className="text-left text-white font-semibold mb-1">
              Bot says:
            </h3>
            <p className="bg-gray-800 bg-opacity-50 p-3 rounded-lg text-left text-white">
              {botResponse}
            </p>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="mt-4 flex items-center space-x-2">
            <svg
              className="animate-spin h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            <span className="text-gray-400">Processing...</span>
          </div>
        )}

        {/* Call Action Buttons */}
        <div className="flex justify-center space-x-6 mt-12">
          {/* Mute Button */}
          <button
            onClick={handleToggleMute}
            className={`p-3 rounded-full ${
              isMuted ? "bg-red-600" : "bg-gray-700"
            } hover:bg-red-500 text-white transition duration-200`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            <MicrophoneIcon className="w-6 h-6" />
          </button>

          {/* Speaker Button */}
          <button
            onClick={handleToggleSpeaker}
            className={`p-3 rounded-full ${
              isSpeaker ? "bg-green-600" : "bg-gray-700"
            } hover:bg-green-500 text-white transition duration-200`}
            title={isSpeaker ? "Speaker On" : "Speaker Off"}
          >
            <SpeakerphoneIcon className="w-6 h-6" />
          </button>

          {/* Video Button (Optional, can be replaced with another feature) */}
          <button
            className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition duration-200"
            title="Video"
          >
            <VideoCameraIcon className="w-6 h-6" />
          </button>

          {/* End Call Button */}
          <button
            onClick={onRequestClose}
            className="p-3 rounded-full bg-red-600 hover:bg-red-500 text-white transition duration-200"
            title="End Call"
          >
            <PhoneIcon className="w-6 h-6 transform rotate-135" />
          </button>
        </div>

        {/* Speaker Animation */}
        {isBotSpeaking && (
          <div className="mt-6">
            <div className="flex items-center justify-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce animation-delay-200"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce animation-delay-400"></div>
            </div>
            <p className="text-green-400 mt-2">Bot is speaking...</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default VoiceChat;
