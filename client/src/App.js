import React from 'react';
import Editor from './Editor';

function App() {
  return (
    <div>
      <h1 style={{ textAlign: 'center', color: '#fff', background: '#1e1e1e', padding: '1rem' }}>
        📝 Realtime Collaborative Code Editor
      </h1>
      <Editor />
    </div>
  );
}

export default App;
