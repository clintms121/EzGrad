import React, { useState } from 'react';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (selectedFile) {
      console.log('Uploading file:', selectedFile.name);
      // Add upload logic here
      alert(`File "${selectedFile.name}" selected for upload`);
    } else {
      alert('Please select a file first');
    }
  };

  return (
    <div className="App">
      <div className="upload-container">
        <div className="upload-section">
          <h1>Upload File</h1>
          <input
            type="file"
            onChange={handleFileChange}
            className="file-input"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="file-label">
            {selectedFile ? selectedFile.name : 'Choose File'}
          </label>
          <button 
            onClick={handleUpload} 
            className="upload-button"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;