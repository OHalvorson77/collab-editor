import React, { useState, useRef } from 'react';
import SourceControlPanel from './SourceControlPanel';
import IDELogo from '../images/IDELOGO.png';

const FileExplorerSidebar = ({ setOpenFileApp, setFileContents }) => {
  const [showSourceControl, setShowSourceControl] = useState(false);
  const [files, setFiles] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentFiles, setRecentFiles] = useState([]);
  const [openFile, setOpenFile] = useState(null);
  const [fileMap, setFileMap] = useState(new Map());




  const folderInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleDirectoryChange = (e) => {
  const selectedFiles = Array.from(e.target.files); // File objects

  const map = new Map();
  selectedFiles.forEach(file => {
    const path = file.webkitRelativePath || file.name;
    map.set(path, file);
  });

  setFiles([...map.keys()]);     // Store file paths (for rendering)
  setFileMap(map);               // Store full file map
};

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles.map((f) => f.name));
  };

const handleFileClick = async (filePath) => {
  const file = fileMap.get(filePath); // ✅ Get actual File object

  if (!file) return console.warn(`File not found: ${filePath}`);

  const content = await file.text(); // ✅ Safe now
  setOpenFile(filePath);
  setOpenFileApp(filePath);
  setFileContents(content);

  setRecentFiles((prev) => {
    const updated = [filePath, ...prev.filter(f => f !== filePath)];
    return updated.slice(0, 10);
  });
};


  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  // Converts list of file paths into a tree structure
const buildFolderTree = (filePaths) => {
  const root = {};

  filePaths.forEach((path) => {
    const parts = path.split('/');
    let current = root;
    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = index === parts.length - 1 ? null : {};
      }
      current = current[part] || {};
    });
  });

  return root;
};

const renderFolderTree = (tree, level = 0, currentPath = '') => {
  return Object.entries(tree).map(([name, value]) => {
    const isFolder = value !== null;
    const fullPath = currentPath ? `${currentPath}/${name}` : name;

    return (
      <div
        key={fullPath}
        style={{
          marginLeft: level * 16,
          display: 'flex',
          alignItems: 'center',
          cursor: isFolder ? 'default' : 'pointer',
        }}
        onClick={!isFolder ? () => handleFileClick(fullPath) : undefined}
      >
        <span style={{ color: isFolder ? '#c586c0' : '#d4d4d4' }}>
          {isFolder ? '📁' : '📄'} {name}
        </span>
        {isFolder && renderFolderTree(value, level + 1, fullPath)}
      </div>
    );
  });


};


  return (
    <div
      style={{
        width: '280px',
        backgroundColor: '#1e1e1e',
        padding: '1rem',
        color: '#d4d4d4',
        borderRight: '1px solid #333',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Segoe UI, sans-serif',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={IDELogo}
            alt="IDE Logo"
            style={{
              width: 28,
              height: 28,
              borderRadius: '4px',
              marginRight: 8,
              objectFit: 'cover',
            }}
          />
          <h3 style={{ fontSize: '16px', margin: 0, color: '#dcdcaa' }}>Explorer</h3>
        </div>
        <div style={{ position: 'relative' }}>
          <button
            onClick={toggleDropdown}
            style={{
              background: 'none',
              border: 'none',
              color: '#d4d4d4',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '4px 8px',
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
                backgroundColor: '#252526',
                border: '1px solid #3c3c3c',
                borderRadius: '6px',
                zIndex: 10,
                overflow: 'hidden',
              }}
            >
              <div
                onClick={() => folderInputRef.current.click()}
                style={{
                  padding: '10px 16px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontSize: '14px',
                  borderBottom: '1px solid #3c3c3c',
                  backgroundColor: '#2d2d2d',
                  color: '#d4d4d4',
                }}
              >
                📂 Open Folder
              </div>
              <div
                onClick={() => fileInputRef.current.click()}
                style={{
                  padding: '10px 16px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontSize: '14px',
                  backgroundColor: '#2d2d2d',
                  color: '#d4d4d4',
                }}
              >
                📄 Open File
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden Inputs */}
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

{/* Recently Opened Files */}
<div style={{ marginBottom: '1rem' }}>
  <h4 style={{ fontSize: '14px', color: '#dcdcaa', marginBottom: '8px' }}>
    📄 Recently Opened
  </h4>
  {recentFiles.length > 0 ? (
    recentFiles.map((file) => (
      <div
        key={file}
        onClick={() => handleFileClick(file)}
        style={{
          cursor: 'pointer',
          padding: '4px 8px',
          backgroundColor: openFile === file ? '#2d2d2d' : 'transparent',
          color: '#ffffff',
        }}
      >
        {file.split('/').pop()}
      </div>
    ))
  ) : (
    <span style={{ color: '#777' }}>No files opened yet</span>
  )}
</div>


      {/* Divider */}
      <div
        style={{
          height: '1px',
          backgroundColor: '#333',
          margin: '8px 0',
        }}
      />

      <h4 style={{ margin: '4px 0 8px', fontSize: '14px', color: '#9cdcfe' }}>
  🌳 Folder Tree
</h4>

<div
  style={{
    maxHeight: '200px',
    overflowY: 'auto',
    marginBottom: '1rem',
    fontSize: '13px',
  }}
>
  {files.length > 0 ? (
    renderFolderTree(buildFolderTree(files))
  ) : (
    <span style={{ color: '#777' }}>No folder opened</span>
  )}
</div>

      {/* Source Control Toggle */}
      <button
        onClick={() => setShowSourceControl(!showSourceControl)}
        style={{
          padding: '10px',
          backgroundColor: '#0e639c',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '13px',
        }}
      >
        {showSourceControl ? 'Hide' : 'Show'} Source Control
      </button>

      {/* Source Control Panel */}
      {showSourceControl && <div style={{ marginTop: '1rem' }}><SourceControlPanel /></div>}
    </div>
  );
};

export default FileExplorerSidebar;
