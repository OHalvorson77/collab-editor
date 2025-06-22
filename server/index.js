const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai'); // or use Hugging Face inference APIs
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());


app.post('/predict', async (req, res) => {
  const { code } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: `Complete the following code:\n\n${code}` }],
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

app.listen(3001, () => console.log('Server running on http://localhost:3001'));
