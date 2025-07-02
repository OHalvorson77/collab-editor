const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai'); // or use Hugging Face inference APIs
require('dotenv').config();
const { spawn } = require('child_process');


const app = express();
app.use(cors());
app.use(express.json());


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
  const { command } = req.body;
  const shell = spawn(command, {
    shell: true,
    cwd: './your/project/folder' // Set your working directory here
  });

  let output = '';
  shell.stdout.on('data', (data) => {
    output += data.toString();
  });

  shell.stderr.on('data', (data) => {
    output += data.toString();
  });

  shell.on('close', (code) => {
    res.json({ output, code });
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

app.listen(3001, () => console.log('Server running on http://localhost:3001'));
