// App.js
import React, { useState } from 'react';
import CollaborativeEditor from './Editor';
import SourceControlSidebar from './sourceControlSidebar';

function App() {
  const [showSidebar, setShowSidebar] = useState(true);

  const toggleSidebar = () => setShowSidebar(!showSidebar);

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#1e1e1e', color: '#fff' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <button
          onClick={toggleSidebar}
          style={{
            position: 'absolute',
            top: 10,
            right: showSidebar ? 310 : 10,
            zIndex: 1,
            padding: '6px 12px',
            backgroundColor: '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {showSidebar ? 'Hide' : 'Show'} Source Control
        </button>
        <CollaborativeEditor />
      </div>
      {showSidebar && <SourceControlSidebar />}
    </div>
  );
}

export default App;
