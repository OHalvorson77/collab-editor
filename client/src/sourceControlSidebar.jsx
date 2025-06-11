// SourceControlSidebar.jsx
import React from 'react';

const SourceControlSidebar = () => {
  return (
    <div
      style={{
        width: '300px',
        backgroundColor: '#252526',
        padding: '1rem',
        borderLeft: '1px solid #444',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h3 style={{ marginBottom: '1rem', color: '#ccc' }}>🔃 Source Control</h3>

      <div>
        <h4 style={{ color: '#bbb' }}>Staged Files</h4>
        <ul>
          <li style={{ color: '#888' }}>index.js</li>
          <li style={{ color: '#888' }}>App.js</li>
        </ul>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <h4 style={{ color: '#bbb' }}>Commit Message</h4>
        <textarea
          rows="4"
          placeholder="Describe your changes..."
          style={{
            width: '100%',
            background: '#1e1e1e',
            color: '#eee',
            border: '1px solid #444',
            padding: '0.5rem',
            borderRadius: '4px',
          }}
        />
      </div>

      <button
        style={{
          marginTop: '1rem',
          padding: '8px',
          backgroundColor: '#0e639c',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
        onClick={() => alert('✅ Changes committed!')}
      >
        Commit
      </button>
    </div>
  );
};

export default SourceControlSidebar;
