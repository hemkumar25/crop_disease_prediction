import React, { useState, useEffect } from "react";
import axios from "axios";
import { diseaseInfo } from "./disease_treatment";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [prediction, setPrediction] = useState("");
  const [confidence, setConfidence] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState(null);
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

  const handleSubmit = async () => {
    if (!file) {
      alert("Please select or drop a file first!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:8000/predict", formData);
      
      if (response.data.class && response.data.confidence) {
        setPrediction(response.data.class);
        setConfidence(response.data.confidence);

        const imageBlob = new Blob([new Uint8Array(response.data.image.match(/.{1,2}/g).map(byte => parseInt(byte, 16)))], { type: "image/jpeg" });
        setResultImage(URL.createObjectURL(imageBlob));
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("File upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      {/* Left Section: File Upload */}
      <div className="flex items-center justify-center min-h-screen bg-green-100 w-1/2">
        <div className="bg-green-200 shadow-lg rounded-lg p-6 w-full max-w-md">
          <h1 className="text-2xl text-center font-bold mb-4 text-gray-700">
            Plant Disease Detector
          </h1>
          <div
            className={`border-2 h-44 border-dashed rounded-lg p-4 mb-4 transition ${
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
            className="w-full mt-4 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>

      {/* Right Section: Results */}
      <div className="w-1/2 flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <h3 className="text-2xl font-semibold text-center text-gray-800 border-b pb-2 mb-4">
            Diagnosis Results
          </h3>

          {prediction ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-4 text-center">
                <p className="text-gray-700 mb-2">
                  <span className="font-medium">Predicted Disease:</span>
                  <span className="ml-2 py-1 px-2 bg-yellow-100 text-yellow-800 rounded">
                    {prediction}
                  </span>
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Confidence:</span>
                  <span className="ml-2">
                    {(confidence * 100).toFixed(2)}%
                  </span>
                </p>
              </div>

              {diseaseInfo[prediction] && (
                <>
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-800 mb-1 text-center">
                      Common Symptoms:
                    </h4>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded">
                      {diseaseInfo[prediction].symptoms}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-800 mb-1 text-center">
                      Recommended Treatment:
                    </h4>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded">
                      {diseaseInfo[prediction].treatment}
                    </p>
                  </div>
                </>
              )}

              {resultImage && (
                <div className="mt-4 text-center">
                  <h4 className="font-medium text-gray-800">Heatmap</h4>
                  <img
                    src={resultImage}
                    alt="Grad-CAM Result"
                    className="w-full mt-2 rounded-lg shadow"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Upload an image to see diagnosis results
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
