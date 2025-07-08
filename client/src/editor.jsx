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
const [recentFiles, setRecentFiles] = useState([]);
const [openFileTab, setOpenFileTab]=useState(openFile);
const [fileContentTab, setFileContentsTab]=useState(fileContents);
const [currentDir, setCurrentDir] = useState('~');


useEffect(() => {
  if (openFile) {
    setRecentFiles(prev => {
      const filtered = prev.filter(f => f !== openFile);
      return [openFile, ...filtered].slice(0, 10); // max 10 recent
    });

    const folderPath = openFile.split('/').slice(0, -1).join('/') || '.';
    console.log('Setting initial working dir to:', folderPath);
    setCurrentDir(folderPath);
  }
  setOpenFileTab(openFile);
}, [openFile]);


  useEffect(() => {
  // Only handle editor model update here
  if (editorRef.current && fileContents !== null) {
    const model = editorRef.current.getModel();
    model.setValue(fileContents);
  }
  setFileContentsTab(fileContents);
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
    body: JSON.stringify({ 
      command,
      cwd: currentDir  // ✅ Send the directory to use
    })
  })
    .then(async (res) => {
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server responded with ${res.status}: ${text}`);
      }
      return res.json();
    })
    .then((data) => {
      setTerminalOutput(data.output);
      setCurrentDir(data.cwd || '~');  // Update to whatever cwd backend reports
    })
    .catch((err) => {
      setTerminalOutput(`Error: ${err.message}`);
    });
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
  const language = detectLanguage(openFileTab);
  console.log('Detected language:', language);

  const askAI = () => {
  if (!promptInput.trim()) return;

  setIsLoading(true);
  fetch('http://localhost:3001/ai-query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ line: promptInput, code: fileContents }),
  })
    .then(res => res.json())
    .then(data => {
      setAiResponse(data.answer || 'No response from AI.');
      setIsLoading(false);
    })
    .catch(err => {
      setAiResponse(`Error: ${err.message}`);
      setIsLoading(false);
    });
};



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

const addCommentAboveSelection = async () => {
  const editor = editorRef.current;
  if (!editor) return;

  const selection = editor.getSelection();
  const model = editor.getModel();

  if (!selection || selection.isEmpty()) return;

  const selectedText = model.getValueInRange(selection);
  const startLineNumber = selection.startLineNumber;

  const commentText = await fetchAIComment(selectedText);

  model.pushEditOperations(
    [],
    [{
      range: new window.monaco.Range(startLineNumber, 1, startLineNumber, 1),
      text: commentText + '\n',
    }],
    () => null
  );
};

const fetchAIComment = async (codeSnippet) => {
  try {
    const res = await fetch('http://localhost:3001/ai-comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: codeSnippet })
    });
    const data = await res.json();
    return data.comment || '//No comment generated.';
  } catch (err) {
    return '// COMMENT: [Error generating comment]';
  }
};

function openTab (filePath) {

  console.log(filePath);
  
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
    monacoEditor.addAction({
  id: 'add-comment-above',
  label: 'Add Comment Above Selection',
  keybindings: [
    monaco.KeyCode.Quote
  ],
  run: () => {
    addCommentAboveSelection();
  }
});
  }

return (
  <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
    {/* Tabs row */}
    <div style={{
  height: '40px',
  background: '#eee',
  display: 'flex',
  alignItems: 'center',
  padding: '0 1rem',
  overflowX: 'auto'
}}>
  {recentFiles.map((file, index) => (
    <div
      key={index}
      onClick={openTab(file)}
      style={{
        marginRight: '1rem',
        padding: '0.25rem 0.5rem',
        backgroundColor: file === openFileTab ? '#ccc' : '#fff',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: file === openFile ? 'bold' : 'normal',
      }}
    >
      {file.split('/').pop()}
    </div>
  ))}
</div>

    {/* Editor + Terminal/Prompt Area */}
    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Editor */}
      <div style={{ flexGrow: 1 }}>
          {openFileTab ? (
    <Editor
      height="100%"
      language={language}
      theme="vs-white"
      onMount={handleEditorDidMount}
      value={fileContentTab}
      onChange={handleEditorChange}
    />
  ) : (
    <div style={{
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      backgroundColor: '#f9f9f9',
      color: '#333',
      fontFamily: 'sans-serif',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h2>Welcome to my Collaborative Editor Made by Owen Halvorson</h2>
      <p>Open a file to start collaborating in real-time.</p>
      <ul style={{ textAlign: 'left', marginTop: '1rem' }}>
        <li>Supports multiple programming languages (JS, Python, etc.)</li>
        <li>AI-assisted code suggestions (press <strong>Ctrl</strong>)</li>
        <li>Generate comments with <strong>'</strong> shortcut</li>
        <li>Run shell commands in the terminal below</li>
        <li>Ask the AI questions about your code in the prompt area</li>
      </ul>
    </div>
  )}
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
            <span style={{ marginRight: '0.5rem' }}>{`${currentDir} >`}</span>
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
        <div style={{ width: '50%', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
  <div style={{ marginBottom: '0.5rem' }}>Ask AI about your code:</div>
  <textarea
    value={promptInput}
    onChange={(e) => setPromptInput(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        askAI();
      }
    }}
    style={{
      width: '100%',
      height: '100px',
      backgroundColor: '#2e2e2e',
      color: '#fff',
      border: 'none',
      resize: 'none',
      padding: '0.5rem',
      fontSize: '1rem',
      fontFamily: 'monospace'
    }}
    placeholder="Type your question here and press Enter..."
  />

  <div style={{
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#1e1e1e',
    color: '#0f0',
    fontFamily: 'monospace',
    height: '300px',
    overflowY: 'auto',
    whiteSpace: 'pre-wrap',
    borderRadius: '4px'
  }}>
    {isLoading ? 'Loading AI response...' : (aiResponse || 'AI response will appear here')}
  </div>
</div>
      </div>
    </div>
  </div>
);
};

export default CollaborativeEditor;
