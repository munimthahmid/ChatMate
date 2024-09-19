// src/components/TrainChatbot.jsx
import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const TrainChatbot = () => {
  const { auth } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(""); // To display status messages
  const [uploading, setUploading] = useState(false);
  const BASE_URL = "http://localhost:8000";

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setStatus("");
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus("Please select a PDF file to upload.");
      return;
    }

    setUploading(true);
    setStatus("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${BASE_URL}/train-chatbot/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
          // 'Content-Type': 'multipart/form-data', // Do not set Content-Type when using FormData
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(
          data.detail || "File uploaded and chatbot trained successfully!"
        );
      } else {
        const errorData = await response.json();
        setStatus(errorData.detail || "Failed to upload the file.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setStatus("An unexpected error occurred during the upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Train Chatbot</h1>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Upload PDF File:
        </label>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="block w-full mb-4 text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
        />
        <button
          onClick={handleUpload}
          disabled={uploading}
          className={`px-4 py-2 font-semibold text-white bg-teal-500 rounded hover:bg-sky-950 focus:outline-none focus:ring focus:border-green-300 transition duration-200 ${
            uploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {uploading ? "Uploading..." : "Upload and Train"}
        </button>
        {status && (
          <div
            className={`mt-4 p-2 rounded ${
              responseOk(status)
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {status}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to determine response status
const responseOk = (statusMsg) => {
  // Simple check; customize as needed
  return (
    statusMsg.toLowerCase().includes("successfully") ||
    statusMsg.toLowerCase().includes("uploaded")
  );
};

export default TrainChatbot;
