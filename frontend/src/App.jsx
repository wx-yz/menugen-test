import React, { useState, useRef } from 'react';
import { Settings, Camera, Image, FolderOpen, Upload } from 'lucide-react';
import './App.css';

function App() {
  const [openAIKey, setOpenAIKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const apiUrl = window.config?.apiUrl || 'http://localhost:3001';

  const handleFileSelect = (file) => {
    if (file && file.size <= 10 * 1024 * 1024) { // 10MB limit
      processMenu(file);
    } else {
      alert('File size must be under 10MB');
    }
    setShowUploadOptions(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const processMenu = async (file) => {
    if (!openAIKey) {
      alert('Please set your OpenAI API key in settings');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('openaiKey', openAIKey);

    try {
      const response = await fetch(`${apiUrl}/api/process-menu`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setMenuItems(result.menuItems || []);
      } else {
        alert('Error processing menu');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error connecting to server');
    } finally {
      setUploading(false);
    }
  };

  const takePhoto = () => {
    cameraInputRef.current?.click();
  };

  const chooseFromLibrary = () => {
    fileInputRef.current?.click();
  };

  const chooseFile = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1 className="app-title">MenuGen</h1>
        <div className="header-actions">
          <button 
            className="settings-btn"
            onClick={() => setShowSettings(true)}
          >
            <Settings size={20} />
          </button>
          <div className="profile">
            <div className="profile-avatar">U</div>
            <span className="profile-name">User</span>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Settings</h3>
            <div className="form-group">
              <label>OpenAI API Key:</label>
              <input
                type="password"
                value={openAIKey}
                onChange={(e) => setOpenAIKey(e.target.value)}
                placeholder="sk-..."
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowSettings(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="main-content">
        <div className="hero-section">
          <h2 className="hero-title">Turn Menus into Magic</h2>
          <p className="hero-subtitle">
            Upload any menu and watch as AI transforms each dish into stunning, mouth watering visuals. ✨🍽️
          </p>

          {/* Upload Area */}
          <div className="upload-container">
            <div
              className="upload-area"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => setShowUploadOptions(true)}
            >
              {uploading ? (
                <div className="progress-container">
                  <div className="progress-bar">
                    <div className="progress-fill"></div>
                  </div>
                  <p>Processing your menu...</p>
                </div>
              ) : (
                <>
                  <Upload size={48} className="upload-icon" />
                  <p>Click to upload or drag and drop</p>
                  <p className="upload-info">PNG, JPG, GIF up to 10MB</p>
                </>
              )}
            </div>

            {/* Upload Options */}
            {showUploadOptions && !uploading && (
              <div className="upload-options">
                <button 
                  className="upload-option"
                  onClick={chooseFromLibrary}
                >
                  <Image size={24} />
                  Photo Library
                </button>
                <button 
                  className="upload-option"
                  onClick={takePhoto}
                >
                  <Camera size={24} />
                  Take Photo
                </button>
                <button 
                  className="upload-option"
                  onClick={chooseFile}
                >
                  <FolderOpen size={24} />
                  Choose File
                </button>
              </div>
            )}
          </div>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelect(e.target.files[0])}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelect(e.target.files[0])}
          />
        </div>

        {/* Menu Items Grid */}
        {menuItems.length > 0 && (
          <div className="menu-results">
            <h3>Your Menu Visualization</h3>
            <div className="menu-grid">
              {menuItems.map((item, index) => (
                <div key={index} className="menu-item">
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="menu-item-image"
                  />
                  <div className="menu-item-content">
                    <h4 className="menu-item-name">{item.name}</h4>
                    <p className="menu-item-description">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
