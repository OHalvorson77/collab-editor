import React from 'react';
import CollaborativeEditor from './Editor';
import FileExplorerSidebar from './components/FileExplorerSidebar';

function App() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1 }}>
        <CollaborativeEditor />
      </div>
      <FileExplorerSidebar />
    </div>
  );
}

export default App;
