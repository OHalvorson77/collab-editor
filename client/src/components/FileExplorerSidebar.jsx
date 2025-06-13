import React, { useState, useRef } from 'react';
import SourceControlPanel from './SourceControlPanel';

const FileExplorerSidebar = () => {
  const [showSourceControl, setShowSourceControl] = useState(false);
  const [files, setFiles] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const folderInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleDirectoryChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles.map((f) => f.webkitRelativePath || f.name));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles.map((f) => f.name));
  };

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  return (
    <div
      style={{
        width: '300px',
        backgroundColor: '#252526',
        padding: '1rem',
        color: '#ccc',
        borderLeft: '1px solid #444',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Header Row with Dropdown */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <h3 style={{ margin: 0 }}>📁 File Explorer</h3>
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>


        <img
  src="../images/IDELOGO.png"
  alt="IDE Logo"
  style={{
    width: 30,
    height: 30,
    borderRadius: '50%',
    marginRight: 8,
    objectFit: 'cover',
    cursor: 'default',
  }}
/>

        <div style={{ position: 'relative' }}>
          <button
            onClick={toggleDropdown}
            style={{
              background: 'none',
              border: 'none',
              color: '#ccc',
              fontSize: '24px',
              cursor: 'pointer',
            }}
          >
            ☰
          </button>

          {showDropdown && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '30px',
                backgroundColor: '#333',
                border: '1px solid #555',
                borderRadius: '4px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                zIndex: 10,
              }}
            >
              <div
                onClick={() => folderInputRef.current.click()}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Open Folder
              </div>
              <div
                onClick={() => fileInputRef.current.click()}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Open File
              </div>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={folderInputRef}
        type="file"
        webkitdirectory="true"
        directory=""
        multiple
        onChange={handleDirectoryChange}
        style={{ display: 'none' }}
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* File List */}
      <ul style={{ fontSize: '14px', overflowY: 'auto', flex: 1 }}>
        {files.map((file, i) => (
          <li key={i} style={{ padding: '2px 0', color: '#aaa' }}>
            {file}
          </li>
        ))}
      </ul>
      <div style={{ width: '100%', height: '2px', backgroundColor: 'black' }}></div>


      <h3 style={{ margin: 0 }}>🌳 Folder Tree Structure</h3>
      <div style={{ width: '100%', height: '2px', backgroundColor: 'black' }}></div>

      <button
        onClick={() => setShowSourceControl(!showSourceControl)}
        style={{
          marginTop: '10px',
          padding: '8px',
          backgroundColor: '#0e639c',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        {showSourceControl ? 'Hide' : 'Show'} Source Control
      </button>

      {showSourceControl && <SourceControlPanel />}
    </div>
  );
};

export default FileExplorerSidebar;
