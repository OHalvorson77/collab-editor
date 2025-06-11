import React from 'react';

const SourceControlPanel = () => {
  return (
    <div
      style={{
        marginTop: '1rem',
        padding: '1rem',
        backgroundColor: '#1e1e1e',
        borderRadius: '4px',
      }}
    >
      <h4 style={{ marginBottom: '0.5rem', color: '#bbb' }}>🔃 Source Control</h4>
      <textarea
        rows="3"
        placeholder="Commit message"
        style={{
          width: '100%',
          background: '#333',
          color: '#eee',
          border: '1px solid #444',
          padding: '0.5rem',
          borderRadius: '4px',
          marginBottom: '0.5rem',
        }}
      />
      <button
        style={{
          width: '100%',
          backgroundColor: '#0e639c',
          color: 'white',
          padding: '8px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
        onClick={() => alert('✅ Commit executed')}
      >
        Commit Changes
      </button>
    </div>
  );
};

export default SourceControlPanel;
