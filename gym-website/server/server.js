import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let client = null;
let anthropicAvailable = false;

async function initializeAnthropicClient() {
  if (client || !process.env.ANTHROPIC_API_KEY) return client;
  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    anthropicAvailable = true;
    return client;
  } catch (error) {
    anthropicAvailable = false;
    console.warn('Anthropic SDK not available. Using fallback chatbot responses.');
    return null;
  }
}

const conversationHistory = new Map();

const GYM_SYSTEM_PROMPT = `You are a helpful customer service chatbot for Wellness Gym, a premium fitness facility.
You should sound natural, warm, and specific, not robotic or overly short.

Key Information about Wellness Gym:
- Location: We have state-of-the-art facilities with professional equipment
- Hours: Open 24/7 for members
- Experience: 15+ years in the fitness industry
- Team: 50+ expert trainers available
- Members: Over 5000+ active members
- Services: Fitness training, diet plans, supplements, personal training
- Contact: Available through the website contact page

When answering questions:
1. Give a complete answer in 2 to 4 sentences when possible.
2. Use a friendly, conversational tone and avoid sounding like a machine.
3. If a question is vague, ask one short follow-up question and offer a helpful default answer.
4. Be encouraging about fitness goals and mention practical next steps.
5. If asked about pricing, memberships, or specific services, explain the basics and then guide them to the contact page for exact details.
6. When appropriate, mention related services such as trainers, diet guidance, supplements, classes, or trial visits.
7. Never say that you cannot help if a reasonable fallback answer exists.

Always maintain a friendly and professional tone.`;

function getFallbackReply(message) {
  const text = String(message || '').toLowerCase();
  if (/hello|hi\b|hey\b|good (morning|afternoon|evening)/.test(text)) return 'Hi. I can help with memberships, class timings, personal training, diet plans, supplements, and general gym questions. Tell me what you want to improve and I will point you in the right direction.';
  if (/hour|open|close|timing|time/.test(text)) return 'We are open 24/7 for members, so you can train at a time that fits your routine. If you need staffed desk timings or the best time to visit, use the contact page and our team will confirm it.';
  if (/price|pricing|cost|fee|membership|plan/.test(text)) return 'We offer different membership options depending on your goals, from basic access to coaching-focused plans. For exact pricing, current offers, and the best fit for you, please use the contact page.';
  if (/trainer|personal|coach/.test(text)) return 'Yes, we have 50+ expert trainers and personal training options for strength, fat loss, muscle gain, and form correction. Share your goal on the contact page and we can match you with the right trainer.';
  if (/diet|nutrition|meal/.test(text)) return 'Absolutely. We provide diet guidance and nutrition support based on goals like fat loss, muscle gain, and better recovery. Reach out through the contact page for a personalized plan.';
  if (/supplement|protein|vitamin/.test(text)) return 'You can explore gym supplements on our Supplements page, including options for recovery, energy, and training support. If you want recommendations, contact us and we will help based on your goal.';
  if (/class|workout|training|program|routine/.test(text)) return 'We can help you choose the right training style, from strength and hypertrophy to conditioning and coach-led transformation plans. If you tell me your goal, I can suggest a suitable direction.';
  if (/guest|trial|visit|tour|touring/.test(text)) return 'If you want to visit first, the best option is to contact us for a trial or guided visit. That lets our team explain the facilities and help you choose a membership with confidence.';
  if (/location|address|where/.test(text)) return 'The contact page has the gym location and contact details. If you are planning your first visit, I can also help you with what to ask before you come in.';
  return 'I can help with gym hours, memberships, trainers, diet plans, supplements, classes, and trial visits. If you share a little more detail, I will give you a more specific and useful answer.';
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message || !sessionId) return res.status(400).json({ error: 'Missing message or sessionId' });
    if (!conversationHistory.has(sessionId)) conversationHistory.set(sessionId, []);
    const history = conversationHistory.get(sessionId);
    history.push({ role: 'user', content: message });

    let assistantMessage = '';
    const initializedClient = await initializeAnthropicClient();
    if (initializedClient && process.env.ANTHROPIC_API_KEY) {
      const response = await initializedClient.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        system: GYM_SYSTEM_PROMPT,
        messages: history
      });
      assistantMessage = response.content[0].text;
    } else {
      assistantMessage = getFallbackReply(message);
    }

    history.push({ role: 'assistant', content: assistantMessage });
    if (history.length > 20) conversationHistory.set(sessionId, history.slice(-20));
    res.json({ message: assistantMessage, sessionId });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: error.message || 'Failed to process chat message' });
  }
});

app.post('/api/chat/clear-session', (req, res) => {
  const { sessionId } = req.body;
  if (sessionId) conversationHistory.delete(sessionId);
  res.json({ success: true });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', chatbot: 'Available' });
});

app.listen(PORT, () => {
  console.log(`🚀 Wellness Gym Server running on http://localhost:${PORT}`);
  console.log(`📧 Chatbot API: POST http://localhost:${PORT}/api/chat`);
  if (!process.env.ANTHROPIC_API_KEY) console.warn('⚠️  Warning: ANTHROPIC_API_KEY not set. Using fallback chatbot responses.');
  else if (!anthropicAvailable) console.warn('⚠️  Warning: Anthropic SDK not installed. Run npm install in server folder for AI responses.');
});
