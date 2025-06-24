import React, { useRef, useEffect, useState} from 'react';
import Editor from '@monaco-editor/react';
import { MonacoBinding } from 'y-monaco';
import { ydoc, provider } from './socket';

const CollaborativeEditor = ({ openFile, fileContents }) => {
  const editorRef = useRef(null);
  const [ctrlPressed, setCtrlPressed] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState('');
const [command, setCommand] = useState('');
const [promptInput, setPromptInput] = useState('');
const [aiResponse, setAiResponse] = useState('');
const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
  // Only handle editor model update here
  if (editorRef.current && fileContents !== null) {
    const model = editorRef.current.getModel();
    model.setValue(fileContents);
  }
}, [fileContents]);

useEffect(() => {
  const handleKeyDown = (e) => {
    console.log('Key pressed:', e.key, 'Ctrl:', e.ctrlKey); // ✅ DEBUG LOG
    if (e.ctrlKey) setCtrlPressed(true);

    if (e.ctrlKey) {
      e.preventDefault();
      console.log('Triggering prediction...'); // ✅ DEBUG LOG
      triggerPrediction();
    }
  };

  const handleKeyUp = () => {
    setCtrlPressed(false);
  };

 
  // Register listeners on mount
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  // Clean up on unmount
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };
}, []);

 const runCommand = () => {
  fetch('http://localhost:3001/exec', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command })
  })
    .then((res) => res.json())
    .then((data) => setTerminalOutput(data.output))
    .catch((err) => setTerminalOutput(`Error: ${err.message}`));
};



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
  console.log('Detected language:', language); // ✅ Add this line



  const triggerPrediction = () => {
    console.log("Reached");
  if (!editorRef.current) return;

  const model = editorRef.current.getModel();
const position = editorRef.current.getPosition(); // { lineNumber, column }

// Get the starting line: max so we don't go below line 1
const endLine = position.lineNumber;
const startLine = Math.max(endLine - 9, 1); // Get 10 lines max, including current

// Collect lines from startLine to endLine (inclusive)
const lines = [];
for (let i = startLine; i <= endLine; i++) {
  lines.push(model.getLineContent(i));
}

const last10FromCursor = lines.join('\n');
console.log('Last 10 lines from cursor (up):', last10FromCursor);
  

  fetch('http://localhost:3001/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: last10FromCursor, line: endLine }),
  })
    .then((res) => res.json())
    .then((data) => {
  if (!data.suggestion) return;
  console.log(data.suggestion);

  const { lineNumber, column } = position; // get current cursor line and column

  model.pushEditOperations(
    [],
    [{
      range: new window.monaco.Range(lineNumber, column, lineNumber, model.getLineMaxColumn(lineNumber)),
      text: data.suggestion,
    }],
    () => null
  );
})
    .catch((err) => console.error('Prediction error:', err));
};


  const handleEditorChange = (value, event) => {
  if (!ctrlPressed || !value || !editorRef.current) return;

  const model = editorRef.current.getModel();
  const lines = value.split('\n');
  const last10Lines = lines.slice(-10).join('\n');

  fetch('http://localhost:3001/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: last10Lines }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.suggestion) return;

      const totalLines = model.getLineCount();
      const startLine = Math.max(totalLines - 9, 1); // Start line for last 10 lines
      const endLine = totalLines;

      model.pushEditOperations(
        [],
        [{
          range: new window.monaco.Range(startLine, 1, endLine, model.getLineMaxColumn(endLine)),
          text: data.suggestion,
        }],
        () => null
      );
    })
    .catch((err) => console.error('Prediction error:', err));
};




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
    </div>

    {/* Editor + Terminal/Prompt Area */}
    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Editor */}
      <div style={{ flexGrow: 1 }}>
        <Editor
          height="100%"
          language={language}
          theme="vs-white"
          onMount={handleEditorDidMount}
          value={fileContents}
          onChange={handleEditorChange}
        />
      </div>

      {/* Terminal + Prompt Row */}
      <div style={{
        height: '25vh',
        display: 'flex',
        background: '#1e1e1e',
        color: 'white',
        fontFamily: 'monospace'
      }}>
        {/* Terminal (left half) */}
        <div style={{
          width: '50%',
          padding: '1rem',
          borderRight: '1px solid #444',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          backgroundColor: '#000',
          color: '#0f0'
        }}>
          {/* Output */}
          <pre style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '0.5rem' }}>
            {terminalOutput || '> terminal ready...'}
          </pre>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runCommand();
            }}
            style={{ display: 'flex' }}
          >
            <span style={{ marginRight: '0.5rem' }}>{'>'}</span>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              style={{
                flexGrow: 1,
                backgroundColor: '#000',
                border: 'none',
                color: '#0f0',
                fontFamily: 'monospace',
                fontSize: '1rem',
                outline: 'none'
              }}
              placeholder="Enter shell command..."
            />
          </form>
        </div>

        {/* Prompt area (right half) - unchanged */}
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
            placeholder="This is for something else..."
          />
        </div>
      </div>
    </div>
  </div>
);
};

export default CollaborativeEditor;
