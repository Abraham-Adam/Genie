import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

// Load environment variables
dotenv.config();

const app = express();

// Configure CORS for both development and production
app.use(cors({
  origin: [
    'https://radiant-valkyrie-65c923.netlify.app',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST']
}));

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set in environment variables');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/api/process-message', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('Processing message:', message);

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant that can help with various tasks. You can help schedule meetings, send emails, and provide information. For calendar-related requests, provide specific date and time information that can be used to create calendar events.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      max_tokens: 500
    });

    const response = completion.choices[0].message.content;
    console.log('AI Response:', response);
    
    res.json({ response });
  } catch (error) {
    console.error('Error processing OpenAI request:', error);
    res.status(500).json({ 
      error: 'Failed to process request',
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});