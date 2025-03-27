import React, { useState, useRef } from 'react';
import { useProgress } from '../contexts/ProgressContext';
import './FileUpload.css';

function FileUpload({ onProcessComplete }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);
  const { startLearning } = useProgress();
  
  // Handle files selected via file input
  const handleFileSelect = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files);
      setSelectedFiles(files);
      setMessage('');
      console.log("Files selected:", files.map(f => f.name));
    }
  };
  
  // Handle files dropped into drop zone
  const handleDrop = (event) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const files = Array.from(event.dataTransfer.files);
      setSelectedFiles(files);
      setMessage('');
      console.log("Files dropped:", files.map(f => f.name));
    }
  };
  
  // Allow dragover on drop zone
  const handleDragOver = (event) => {
    event.preventDefault();
  };
  
  // Handle click on drop zone
  const handleDropZoneClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Programmatically click the hidden file input
    }
  };
  
  // Upload files to the backend
  const uploadFiles = async () => {
    if (selectedFiles.length === 0) {
      setMessage('No files selected.');
      return;
    }
    setIsLoading(true);
    setMessage('');
    try {
      // Prepare FormData with all selected files
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      console.log("Uploading files:", selectedFiles);

      // Send POST request to backend
      const response = await fetch('http://localhost:5001/upload', {
        method: 'POST',
        body: formData
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      // Return early if response is not ok
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      // Parse the response
      const data = await response.json();
      console.log("Response data:", data);

      // Check if studyConcepts exists in the response
      if (data.studyConcepts) {
        try {
          // Validate data is an array
          if (!Array.isArray(data.studyConcepts)) {
            throw new Error('Study concepts is not an array');
          }

          // Validate first item has required properties
          const firstUnit = data.studyConcepts[0];
          if (!firstUnit || !firstUnit.unit || !firstUnit.sections || !Array.isArray(firstUnit.sections)) {
            throw new Error('Study data has invalid structure');
          }

          // Save the validated data to localStorage
          const jsonString = JSON.stringify(data.studyConcepts);
          
          // Clear any existing data first
          localStorage.removeItem('studyConcepts');
          localStorage.removeItem('studyProgress'); // Also clear progress when loading new content
          
          // Save the validated JSON string
          localStorage.setItem('studyConcepts', jsonString);
          setMessage('✅ Study concepts have been generated and saved!');
          
          // Set study mode to learning in localStorage directly to ensure it persists
          const progressData = {
            currentUnitIndex: 0,
            expandedSections: {},
            completedUnits: [],
            studyMode: 'learning', // Set directly to learning mode
            quizResponses: {},
            unitQuizResponses: {}
          };
          localStorage.setItem('studyProgress', JSON.stringify(progressData));
          
          // Set the learning mode in the context
          startLearning();
          
          // Wait a moment for the success message to be visible
          setTimeout(() => {
            // Force a page refresh to load the new data and progress
            // This is more reliable than trying to update all the necessary state
            window.location.href = window.location.pathname + '?mode=learning&t=' + new Date().getTime();
          }, 1000);
          
        } catch (jsonError) {
          console.error('Invalid study data:', jsonError);
          setMessage('Error: Received invalid study data format. Please try again.');
        }
      } else if (data.error) {
        setMessage(`Error: ${data.error}`);
        console.error('Server returned an error:', data);
      } else {
        console.error('Unexpected response format:', data);
        setMessage('No study concepts returned from API.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setMessage(`Failed to process files: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="file-upload-container">
      <h2>Upload Study Materials</h2>
      
      {/* Drag-and-Drop Zone */}
      <div 
        className="drop-zone" 
        onDragOver={handleDragOver} 
        onDrop={handleDrop}
        onClick={handleDropZoneClick}
      >
        <p>Drag &amp; drop your files here, or click to select files.</p>
        <input 
          type="file" 
          multiple 
          onChange={handleFileSelect} 
          style={{ display: 'none' }} 
          ref={fileInputRef}
        />
        <button className="select-files-btn" onClick={(e) => {
          e.stopPropagation(); // Prevent the click from bubbling to the drop zone
          handleDropZoneClick();
        }}>
          Select Files
        </button>
      </div>
      
      {/* Display selected file names */}
      {selectedFiles.length > 0 && !isLoading && (
        <div className="file-list">
          <p><strong>Selected files:</strong></p>
          <ul>
            {selectedFiles.map((file, idx) => (
              <li key={idx}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Upload button */}
      <button 
        className="upload-button" 
        onClick={uploadFiles} 
        disabled={isLoading || selectedFiles.length === 0}
      >
        {isLoading ? 'Processing...' : 'Upload and Process'}
      </button>
      
      {/* Loading animation */}
      {isLoading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Processing files with AI, please wait...</p>
        </div>
      )}
      
      {/* Status / result message */}
      {message && <div className="status-message">{message}</div>}
    </div>
  );
}

export default FileUpload;