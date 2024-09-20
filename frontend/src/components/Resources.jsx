// src/components/Resources.jsx
import React, { useEffect, useState, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";

const Resources = () => {
  const { auth } = useContext(AuthContext);
  const [teamNames, setTeamNames] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [pdfs, setPdfs] = useState([]);
  const [status, setStatus] = useState("");
  const BASE_URL = "http://localhost:8000";

  // Fetch team names on component mount
  useEffect(() => {
    const fetchTeamNames = async () => {
      try {
        const response = await fetch(`${BASE_URL}/teams/names`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTeamNames(data);

          // Set default selected team to user's own team
          const userTeamName = auth.user.teamName; // Ensure 'teamName' is available in 'auth.user'
          setSelectedTeam(userTeamName);
        } else {
          const errorData = await response.json();
          setStatus(errorData.detail || "Failed to fetch team names.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setStatus("An unexpected error occurred while fetching team names.");
      }
    };

    fetchTeamNames();
  }, [auth.token, auth.user.teamName]);

  // Fetch PDFs when selected team changes
  const fetchPdfs = useCallback(
    async (teamName) => {
      try {
        const response = await fetch(
          `${BASE_URL}/team-pdfs/?team_name=${encodeURIComponent(teamName)}`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setPdfs(data);
          setStatus("");
        } else {
          const errorData = await response.json();
          setPdfs([]);
          setStatus(errorData.detail || "Failed to fetch PDFs.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setPdfs([]);
        setStatus("An unexpected error occurred while fetching PDFs.");
      }
    },
    [auth.token]
  );

  useEffect(() => {
    if (selectedTeam) {
      fetchPdfs(selectedTeam);
    }
  }, [selectedTeam, fetchPdfs]);

  const handleTeamChange = (e) => {
    setSelectedTeam(e.target.value);
  };

  const handlePdfClick = (pdf) => {
    // Create a Blob from the base64-encoded PDF content
    const byteCharacters = atob(pdf.content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    // Open the PDF in a new tab
    window.open(url, "_blank");

    // If you want to trigger a download instead, you can use:
    // const link = document.createElement('a');
    // link.href = url;
    // link.setAttribute('download', pdf.name);
    // document.body.appendChild(link);
    // link.click();
    // link.parentNode.removeChild(link);
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Resources</h1>

      {/* Team Selection */}
      <div className="mb-4">
        <label
          htmlFor="teamSelect"
          className="block text-sm font-medium text-gray-700"
        >
          Select Team:
        </label>
        <select
          id="teamSelect"
          value={selectedTeam}
          onChange={handleTeamChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        >
          {teamNames.map((teamName, index) => (
            <option key={index} value={teamName}>
              {teamName}
            </option>
          ))}
        </select>
      </div>

      {/* PDFs List */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">PDFs for {selectedTeam}</h2>
        {status && <div className="text-red-500 mb-2">{status}</div>}
        <ul className="list-disc pl-5">
          {pdfs.map((pdf, index) => (
            <li key={index}>
              <button
                onClick={() => handlePdfClick(pdf)}
                className="text-blue-500 underline"
              >
                {pdf.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Resources;
