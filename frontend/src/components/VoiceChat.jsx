// src/components/VoiceChat.jsx
import Modal from "react-modal";
import { XIcon, MicrophoneIcon, StopIcon } from "@heroicons/react/outline"; // Using Heroicons for icons
import useSpeechRecognition from "../hooks/useSpeechRecognition";

Modal.setAppElement("#root"); // For accessibility

const VoiceChat = ({ isOpen, onRequestClose }) => {
  const {
    transcript,
    startRecording,
    stopRecording,
    isRecording,
    isProcessing,
    botResponse,
  } = useSpeechRecognition();

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

        <div className="mb-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex items-center px-4 py-2 rounded-full ${
              isRecording
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            } text-white transition duration-200`}
          >
            {isRecording ? (
              <>
                <StopIcon className="w-5 h-5 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <MicrophoneIcon className="w-5 h-5 mr-2" />
                Start Recording
              </>
            )}
          </button>
        </div>

        {transcript && (
          <div className="mb-4">
            <h3 className="font-semibold">You said:</h3>
            <p className="bg-gray-100 p-2 rounded">{transcript}</p>
          </div>
        )}

        {isProcessing && (
          <div className="mb-4 flex items-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-600"
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
            <span>Processing...</span>
          </div>
        )}

        {botResponse && (
          <div className="mb-4">
            <h3 className="font-semibold">Bot says:</h3>
            <p className="bg-gray-100 p-2 rounded">{botResponse}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default VoiceChat;
