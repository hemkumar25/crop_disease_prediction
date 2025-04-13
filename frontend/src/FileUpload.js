import React, { useState } from "react";
import axios from "axios";
import { diseaseInfo } from "./disease_treatment";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setFile(event.dataTransfer.files[0]);
    setIsDragging(false);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      alert("Please select or drop a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://localhost:8000/predict", // FastAPI endpoint
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setResponse(res.data); // Handle response data from backend
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("File upload failed.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-100">
      <div className="bg-green-200 shadow-lg rounded-lg p-6 w-96 h-96 max-w-md">
        <h1 className="text-2xl text-center font-bold mb-4 text-gray-700">Upload Your File</h1>
        <div
          className={`border-2 h-44 border-dashed rounded-lg p-4 mb-4 transition ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-green-800"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <p className="text-gray-500 text-center ">
            {file ? (
              <span className="font-semibold">{file.name}</span>
            ) : (
              "Drag and drop a file here, or click to select one"
            )}
          </p>
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="fileInput"
          />
        </div>
        <label
          htmlFor="fileInput"
          className="block text-center py-2 px-4 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition"
        >
          Choose File
        </label>
        <button
          onClick={handleSubmit}
          className="w-full mt-4 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          Upload
        </button>

        {response && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700">Prediction Result:</h3>
            <p className="text-gray-600">
              <strong>Predicted Disease:</strong> {response.class}
            </p>
            <p className="text-gray-600">
              <strong>Confidence:</strong> {response.confidence}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
