import React, { useState } from 'react';
import { Octokit } from '@octokit/rest';

const SourceControlPanel = () => {
  const [commitMessage, setCommitMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [octokit, setOctokit] = useState(null);

  const loginWithGitHub = () => {
    const accessToken = prompt('Paste your GitHub Access Token:');
    if (accessToken) {
      const newOctokit = new Octokit({ auth: accessToken });
      setOctokit(newOctokit);
      setIsLoggedIn(true);
    }
  };

  const commitChanges = async () => {
    if (!octokit) return;

    try {
      const owner = 'your-username';
      const repo = 'your-repo';
      const branch = 'main';

      const { data: refData } = await octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${branch}`,
      });
      const latestCommitSha = refData.object.sha;

      const { data: blobData } = await octokit.rest.git.createBlob({
        owner,
        repo,
        content: 'Example content',
        encoding: 'utf-8',
      });

      const { data: treeData } = await octokit.rest.git.createTree({
        owner,
        repo,
        base_tree: latestCommitSha,
        tree: [
          {
            path: 'example.txt',
            mode: '100644',
            type: 'blob',
            sha: blobData.sha,
          },
        ],
      });

      const { data: commitData } = await octokit.rest.git.createCommit({
        owner,
        repo,
        message: commitMessage,
        tree: treeData.sha,
        parents: [latestCommitSha],
      });

      await octokit.rest.git.updateRef({
        owner,
        repo,
        ref: `heads/${branch}`,
        sha: commitData.sha,
      });

      alert('✅ Commit successful!');
    } catch (error) {
      console.error(error);
      alert('❌ Commit failed');
    }
  };

  return (
    <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#1e1e1e', borderRadius: '4px' }}>
      <h4 style={{ marginBottom: '0.5rem', color: '#bbb' }}>🔃 Source Control</h4>

      {!isLoggedIn ? (
        <button
          onClick={loginWithGitHub}
          style={{
            width: '100%',
            backgroundColor: '#24292e',
            color: 'white',
            padding: '8px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '0.5rem',
          }}
        >
          Login with GitHub
        </button>
      ) : (
        <>
          <textarea
            rows="3"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
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
            onClick={commitChanges}
          >
            Commit Changes
          </button>
        </>
      )}
    </div>
  );
};

export default SourceControlPanel;
