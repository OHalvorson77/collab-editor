import React, {useState} from 'react';
import CollaborativeEditor from './Editor';
import FileExplorerSidebar from './components/FileExplorerSidebar';

function App() {

  const [openFileApp, setOpenFileApp] = useState(null);
const [fileContents, setFileContents] = useState('');
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1 }}>
        <CollaborativeEditor openFile={openFileApp} fileContents={fileContents} />
      </div>
      <FileExplorerSidebar
        setOpenFileApp={setOpenFileApp}
        setFileContents={setFileContents}
      />
    </div>
  );
}

export default App;
