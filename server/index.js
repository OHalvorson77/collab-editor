const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai'); // or use Hugging Face inference APIs
require('dotenv').config();
const { exec } = require('child_process');
let currentDir = process.cwd();
const path = require('path'); 
const fs = require('fs');




const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


app.post('/predict', async (req, res) => {
  const { code, line } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: `Please return only completion of this line: ${line} and nothing else. Given context of the following code:\n\n${code}` }],
      temperature: 0.2,
      max_tokens: 60,
    });

    const suggestion = completion.choices[0].message.content.trim();
    res.json({ suggestion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Prediction failed' });
  }
});

app.post('/exec', (req, res) => {
  const { command, cwd } = req.body;

  // Use the cwd from the request if provided
  const workingDir = cwd || process.cwd();

  // Handle 'cd' internally to update the workingDir (same as before)
  if (command.startsWith('cd ')) {
    const targetDir = command.slice(3).trim();
    try {
      const resolvedPath = path.resolve(workingDir, targetDir);
      return res.json({ cwd: resolvedPath, output: `Changed directory to ${resolvedPath}` });
    } catch (err) {
      return res.status(400).json({ cwd: workingDir, error: `Invalid path: ${err.message}` });
    }
  }

  exec(command, { cwd: workingDir }, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ cwd: workingDir, error: error.message });
    }
    if (stderr) {
      return res.status(400).json({ cwd: workingDir, error: stderr });
    }

    res.json({ cwd: workingDir, output: stdout });
  });
});


app.post('/ai-query', async (req, res) => {
  const { code, line } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'system', content: `You are scoped to knowledge of the following code ${code}` }, {role: 'user', content: line}],
      temperature: 0.2,
      max_tokens: 60,
    });

    const answer = completion.choices[0].message.content.trim();
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to answer right now, please try again' });
  }
});

app.post('/ai-comment', async (req, res) => {
  const { code} = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'system', content: `You provide one line comments given code` }, {role: 'user', content: code}],
      temperature: 0.2,
      max_tokens: 60,
    });

    const comment = completion.choices[0].message.content.trim();
    res.json({ comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to answer right now, please try again' });
  }
});

app.post('/save', (req, res) => {
  const { filePath, content } = req.body;

  if (!filePath || typeof content !== 'string') {
    return res.status(400).send('Invalid request');
  }

  const fullPath = path.resolve('/your/project/root', filePath);

  fs.writeFile(fullPath, content, 'utf8', (err) => {
    if (err) {
      console.error('Error saving file:', err);
      return res.status(500).send('Error saving file');
    }

    res.send('File saved');
  });
});

app.listen(3001, () => console.log('Server running on http://localhost:3001'));
