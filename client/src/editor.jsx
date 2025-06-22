import React, { useRef, useEffect} from 'react';
import Editor from '@monaco-editor/react';
import { MonacoBinding } from 'y-monaco';
import { ydoc, provider } from './socket';

const CollaborativeEditor = ({ openFile, fileContents }) => {
  const editorRef = useRef(null);

  useEffect(() => {
  if (editorRef.current && fileContents !== null) {
    const model = editorRef.current.getModel();
    model.setValue(fileContents);
  }
}, [fileContents]);

const detectLanguage = (fileName) => {
  if (!fileName) return 'plaintext';

  const ext = fileName.split('.').pop().toLowerCase();
  switch (ext) {
    case 'js': return 'javascript';
    case 'ts': return 'typescript';
    case 'py': return 'python';
    case 'java': return 'java';
    case 'cpp':
    case 'cc':
    case 'cxx': return 'cpp';
    case 'cs': return 'csharp';
    case 'html': return 'html';
    case 'css': return 'css';
    case 'json': return 'json';
    case 'md': return 'markdown';
    case 'sh': return 'shell';
    default: return 'plaintext';
  }
};
  const language = detectLanguage(openFile);



  function handleEditorDidMount(monacoEditor, monaco) {
    editorRef.current = monacoEditor;

    const yText = ydoc.getText('monaco');

    new MonacoBinding(
      yText,
      monacoEditor.getModel(),
      new Set([monacoEditor]),
      provider.awareness
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Tabs row */}
      <div style={{ height: '40px', background: '#eee', display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
        <div style={{ marginRight: '1rem' }}>file1.js</div>
        <div style={{ marginRight: '1rem' }}>file2.js</div>
        {/* Add more tabs as needed */}
      </div>

      {/* Editor + Terminal/Prompt Area */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Editor */}
        <div style={{ flexGrow: 1 }}>
          <Editor
            height="100%"
            defaultLanguage={language}
            theme="vs-white"
            onMount={handleEditorDidMount}
             value={fileContents}
              onChange={(value, ev) => {
    const lastLines = value?.split('\n').slice(-10).join('\n'); // send last 10 lines
    fetch('http://localhost:3001/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: lastLines }),
    })
      .then(res => res.json())
      .then(data => {
        // display in UI or ghost text
        console.log('Suggested code:', data.suggestion);
      });
  }}
          />
        </div>

        {/* Terminal + Prompt Row */}
        <div style={{ height: '25vh', display: 'flex', background: '#1e1e1e', color: 'white', fontFamily: 'monospace' }}>
          {/* Terminal (left half) */}
          <div style={{ width: '50%', padding: '1rem', borderRight: '1px solid #444' }}>
            <div>> terminal output here</div>
            <div>> running server...</div>
          </div>

          {/* Prompt area (right half) */}
          <div style={{ width: '50%', padding: '1rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>Prompt / Input:</div>
            <textarea
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#2e2e2e',
                color: '#fff',
                border: 'none',
                resize: 'none',
                padding: '0.5rem',
                fontSize: '1rem',
                fontFamily: 'monospace'
              }}
              placeholder="Type your code or prompt here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborativeEditor;
