import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { ydoc, provider } from './socket';

const CollaborativeEditor = () => {
  const editorRef = useRef(null);

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
    <Editor
      height="90vh"
      defaultLanguage="javascript"
      theme="vs-dark"
      onMount={handleEditorDidMount}
    />
  );
};

export default CollaborativeEditor;
