import React, { useState, useEffect } from "react";
import axios from "axios";

// This object stores disease information including symptoms and treatments
const diseaseInfo = {
  "Apple Scab": {
    symptoms: "Dark olive-green spots on leaves and fruit, lesions turn dark and scabby, premature leaf drop.",
    treatment: "Apply fungicides early in the season, remove and destroy fallen leaves, prune to improve air circulation, plant resistant varieties."
  },
  "Black Rot": {
    symptoms: "Circular purple spots on leaves, rotting fruit with concentric rings, cankers on branches.",
    treatment: "Prune out infected branches, remove mummified fruit, apply fungicides, ensure good air circulation, avoid overhead irrigation."
  },
  "Cedar Apple Rust": {
    symptoms: "Bright orange-yellow spots on leaves, small yellow cups on underside of leaves, premature leaf drop.",
    treatment: "Remove nearby cedar trees if possible, apply protective fungicides, plant resistant varieties, maintain tree vigor with proper fertilization."
  },
  "Healthy": {
    symptoms: "Normal leaf color and texture, no visible lesions or discoloration, vigorous growth.",
    treatment: "Maintain regular watering, proper fertilization, and routine pruning for continued plant health."
  },
  // Add more diseases as needed
};

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [response, setResponse] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
    setIsDragging(false);
  };

  // Generate image preview whenever file changes
  useEffect(() => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  }, [file]);

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
      <div className="bg-green-200 shadow-lg rounded-lg p-6 w-full max-w-md">
        <h1 className="text-2xl text-center font-bold mb-4 text-gray-700">Plant Disease Detector</h1>
        <div
          className={`border-2 h-44 border-dashed rounded-lg p-4 mb-4 transition flex flex-col items-center justify-center ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-green-800"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {imagePreview ? (
            <div className="h-full w-full flex items-center justify-center">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-h-full max-w-full object-contain" 
              />
            </div>
          ) : (
            <p className="text-gray-500 text-center">
              Drag and drop an image here, or click to select one
            </p>
          )}
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="fileInput"
            accept="image/*"
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
          disabled={!file}
          className={`w-full mt-4 py-2 px-4 rounded-lg transition ${
            file 
              ? "bg-green-500 text-white hover:bg-green-600" 
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Upload
        </button>

        {response && (
          <div className="mt-6 p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-lg text-gray-800 border-b pb-2 mb-3">Diagnosis Results</h3>
            
            <div className="mb-4">
              <p className="text-gray-700">
                <span className="font-medium">Predicted Disease:</span> 
                <span className="ml-2 py-1 px-2 bg-yellow-100 text-yellow-800 rounded">{response.class}</span>
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Confidence:</span> 
                <span className="ml-2">{(response.confidence * 100).toFixed(2)}%</span>
              </p>
            </div>

            {diseaseInfo[response.class] && (
              <>
                <div className="mb-4">
                  <h4 className="font-medium text-gray-800 mb-1">Common Symptoms:</h4>
                  <p className="text-gray-600 bg-gray-50 p-2 rounded">
                    {diseaseInfo[response.class].symptoms}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Recommended Treatment:</h4>
                  <p className="text-gray-600 bg-gray-50 p-2 rounded">
                    {diseaseInfo[response.class].treatment}
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;