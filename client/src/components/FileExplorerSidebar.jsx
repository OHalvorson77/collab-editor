import React, { useState } from 'react';
import SourceControlPanel from './SourceControlPanel';

const FileExplorerSidebar = () => {
  const [showSourceControl, setShowSourceControl] = useState(false);
  const [files, setFiles] = useState([]);

  const handleDirectoryChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles.map((f) => f.webkitRelativePath || f.name));
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
      }}
    >
      <h3>📁 File Explorer</h3>

      <label style={{ margin: '10px 0', display: 'block' }}>
        <input
          type="file"
          webkitdirectory="true"
          directory=""
          multiple
          onChange={handleDirectoryChange}
          style={{ display: 'none' }}
        />
        <span
          style={{
            padding: '8px 12px',
            backgroundColor: '#333',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'inline-block',
          }}
        >
          Open Folder
        </span>
      </label>

      <ul style={{ fontSize: '14px', overflowY: 'auto', flex: 1 }}>
        {files.map((file, i) => (
          <li key={i} style={{ padding: '2px 0', color: '#aaa' }}>
            {file}
          </li>
        ))}
      </ul>

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
