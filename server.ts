import express from 'express';
import Database from 'better-sqlite3';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load dotenv from .env.local and .env
dotenv.config({ path: path.resolve(__dirname, '.env.local') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Google Gen AI on the backend
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('WARNING: GEMINI_API_KEY is not defined in environment variables.');
}
const ai = new GoogleGenAI(apiKey ? { apiKey } : {});

// Initialize SQLite Database
const dbPath = process.env.DATABASE_PATH || 
  (process.env.NODE_ENV === 'production' ? path.join(os.tmpdir(), 'lumina.db') : 'lumina.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    onboarding_completed BOOLEAN DEFAULT 0
  );
  
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER,
    role TEXT,
    content TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    emotion TEXT,
    mood_score INTEGER,
    stress_level INTEGER,
    crisis_detected BOOLEAN,
    suggested_strategy TEXT,
    cognitive_distortion TEXT,
    therapeutic_focus TEXT,
    trigger_identified TEXT
  );
`);

// Safe migrations for new columns
try {
  db.exec('ALTER TABLE messages ADD COLUMN cognitive_distortion TEXT;');
  db.exec('ALTER TABLE messages ADD COLUMN therapeutic_focus TEXT;');
} catch (e) {
  // Columns likely already exist
}

try {
  db.exec('ALTER TABLE messages ADD COLUMN trigger_identified TEXT;');
} catch (e) {}

// Seed user if not exists
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
if (userCount.count === 0) {
  db.prepare('INSERT INTO users (name, onboarding_completed) VALUES (?, ?)').run('User', 0);
}

// API Routes
app.get('/api/user', (req, res) => {
  const user = db.prepare('SELECT * FROM users LIMIT 1').get();
  res.json(user);
});

app.post('/api/user/onboard', (req, res) => {
  const { name } = req.body;
  db.prepare('UPDATE users SET name = ?, onboarding_completed = 1 WHERE id = 1').run(name);
  res.json({ success: true });
});

app.get('/api/dashboard', (req, res) => {
  // Get recent mood entries and messages to build dashboard data
  const messages = db.prepare(`
    SELECT timestamp, emotion, mood_score, stress_level 
    FROM messages 
    WHERE role = 'user' AND timestamp >= datetime('now', '-7 days')
    ORDER BY timestamp ASC
  `).all();
  
  const recentEmotions = db.prepare(`
    SELECT emotion, COUNT(*) as count 
    FROM messages 
    WHERE role = 'user' AND emotion IS NOT NULL AND emotion != ''
    GROUP BY emotion 
    ORDER BY count DESC 
    LIMIT 5
  `).all();

  const cognitiveDistortions = db.prepare(`
    SELECT cognitive_distortion as distortion, COUNT(*) as count
    FROM messages
    WHERE role = 'user' AND cognitive_distortion IS NOT NULL AND cognitive_distortion != ''
    GROUP BY cognitive_distortion
    ORDER BY count DESC
    LIMIT 4
  `).all();

  res.json({
    trends: messages,
    topEmotions: recentEmotions,
    distortions: cognitiveDistortions
  });
});

app.get('/api/user/stats', (req, res) => {
  const messagesCount = db.prepare("SELECT COUNT(*) as count FROM messages WHERE role = 'user'").get() as {count: number};
  const sessionsCount = db.prepare("SELECT COUNT(*) as count FROM sessions").get() as {count: number};
  const since = db.prepare("SELECT start_time FROM sessions ORDER BY start_time ASC LIMIT 1").get() as {start_time: string};
  
  res.json({
    totalMessages: messagesCount.count,
    totalSessions: sessionsCount.count,
    memberSince: since ? since.start_time : new Date().toISOString()
  });
});

app.delete('/api/user/data', (req, res) => {
  db.prepare("DELETE FROM messages").run();
  db.prepare("DELETE FROM sessions").run();
  res.json({ success: true });
});

app.get('/api/chat/sessions', (req, res) => {
  const sessions = db.prepare(`
    SELECT s.id, s.start_time, 
           (SELECT content FROM messages WHERE session_id = s.id AND role = 'user' ORDER BY timestamp ASC LIMIT 1) as first_message
    FROM sessions s 
    ORDER BY s.start_time DESC
  `).all();
  res.json(sessions);
});

app.post('/api/chat/session', (req, res) => {
  const info = db.prepare('INSERT INTO sessions (user_id) VALUES (1)').run();
  res.json({ sessionId: info.lastInsertRowid });
});

app.get('/api/chat/history', (req, res) => {
  const querySessionId = req.query.sessionId;
  let session;
  
  if (querySessionId) {
    session = db.prepare('SELECT id FROM sessions WHERE id = ?').get(querySessionId) as { id: number } | undefined;
  } else {
    session = db.prepare('SELECT id FROM sessions ORDER BY start_time DESC LIMIT 1').get() as { id: number } | undefined;
  }

  if (!session) {
    const info = db.prepare('INSERT INTO sessions (user_id) VALUES (1)').run();
    session = { id: info.lastInsertRowid as number };
  }
  
  const messages = db.prepare('SELECT role, content, timestamp, emotion, mood_score, stress_level, crisis_detected, suggested_strategy, cognitive_distortion, therapeutic_focus, trigger_identified FROM messages WHERE session_id = ? ORDER BY timestamp ASC').all(session.id);
  
  // Format metrics for frontend
  const formattedMessages = messages.map((m: any) => ({
    role: m.role,
    content: m.content,
    metrics: m.role === 'ai' ? {
      emotion: m.emotion,
      strategy: m.suggested_strategy,
      crisis: m.crisis_detected === 1,
      distortion: m.cognitive_distortion,
      focus: m.therapeutic_focus,
      trigger: m.trigger_identified
    } : undefined
  }));

  res.json({ sessionId: session.id, messages: formattedMessages });
});

// Secure API endpoint for AI responses
app.post('/api/chat/generate', async (req, res) => {
  const { sessionId, content } = req.body;

  if (!sessionId || !content) {
    return res.status(400).json({ error: 'sessionId and content are required' });
  }

  try {
    // 1. Save user message
    db.prepare('INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)')
      .run(sessionId, 'user', content);

    // 2. Fetch context information
    const history = db.prepare('SELECT role, content FROM messages WHERE session_id = ? ORDER BY timestamp ASC LIMIT 10').all(sessionId) as { role: string, content: string }[];
    
    const recentDistortions = db.prepare(`
      SELECT cognitive_distortion FROM messages 
      WHERE role = 'user' AND cognitive_distortion IS NOT NULL AND timestamp >= datetime('now', '-7 days')
      GROUP BY cognitive_distortion ORDER BY COUNT(*) DESC LIMIT 3
    `).all() as { cognitive_distortion: string }[];
    
    const avgStress = db.prepare(`
      SELECT AVG(stress_level) as avg_stress FROM messages 
      WHERE role = 'user' AND stress_level IS NOT NULL AND timestamp >= datetime('now', '-7 days')
    `).get() as { avg_stress: number };

    const distortionContext = recentDistortions.length > 0 
      ? `User's recent cognitive distortions (last 7 days): ${recentDistortions.map(d => d.cognitive_distortion).join(', ')}.` 
      : '';
    const stressContext = avgStress?.avg_stress 
      ? `User's average stress level over the last 7 days is ${Math.round(avgStress.avg_stress)}/10.` 
      : '';

    // Check crisis keywords
    const crisisKeywords = /\b(suicide|kill myself|end it all|want to die|self harm|hurt myself|can't go on)\b/i;
    const ruleBasedCrisis = crisisKeywords.test(content);

    const prompt = `
You are Lumina, a highly structured mental wellness intelligence platform and companion.
Your goal is to help the user deeply reflect on their emotions, understand their experiences, and recognize patterns like exhaustion or being overwhelmed.
Do NOT act as a medical professional or diagnose the user.

Follow a therapist-inspired dialogue pattern:
1. Deep Emotional Exploration: Ask probing, open-ended questions to uncover the root causes of their feelings. Specifically, inquire about their energy levels, cognitive load, and physical sensations to accurately gauge if they are "exhausted" or "overwhelmed".
2. Reflective Listening & Validation: Mirror feelings without judgment. Acknowledge their context and validate their emotional state.
3. Cognitive Clarification: Gently help them notice if they are falling into cognitive distortions (e.g., catastrophizing, all-or-nothing thinking).
4. Supportive Coping: Offer strategies only when the user is ready, keeping them small, actionable, and tailored to their specific state (e.g., grounding for overwhelm, rest for exhaustion).

Context on User's Mental Patterns:
${distortionContext}
${stressContext}

Rule-based crisis flag: ${ruleBasedCrisis} (If true, you MUST prioritize safety protocols and suggest professional help).

Recent conversation history:
${history.map((m: any) => `${m.role === 'user' ? 'User' : 'Lumina'}: ${m.content}`).join('\n')}

User's latest message: "${content}"

Analyze the user's latest message. Provide a supportive, inquisitive response that applies the therapeutic principles above. Your response should gently guide the user to elaborate on their feelings so you can better understand their level of exhaustion or overwhelm.
Also, extract the following metrics based on their message:
- detected_emotion: The primary emotion (e.g., "exhausted", "overwhelmed", "anxious", "calm", "sad", "frustrated"). Be specific if they show signs of burnout.
- mood_score: Estimate their mood from 1 (very bad) to 10 (very good).
- stress_level: Estimate their stress from 1 (very low) to 10 (very high).
- crisis_detected: true ONLY if they express severe distress, self-harm, or suicidal thoughts (or if the rule-based flag is true).
- suggested_coping_strategy: A short, actionable strategy (e.g., "4-7-8 Breathing", "5-Senses Grounding", "Journaling") or null if not applicable right now.
- cognitive_distortion: Identify if the user's message exhibits a specific cognitive distortion (e.g., "Catastrophizing", "All-or-Nothing Thinking", "Personalization"). Return null if none is detected.
- therapeutic_focus: The primary technique you used in your response (e.g., "Validation", "Deep Exploration", "Cognitive Reframing").
- trigger_identified: The situational trigger causing the emotion (e.g., "Work deadline", "Argument with partner", "Financial stress"). Return null if unclear.

If crisis_detected is true, your response MUST gently suggest seeking professional help and provide a general helpline suggestion (e.g., "Please consider reaching out to a crisis text line or a professional therapist. You don't have to go through this alone.").
`;

    // Attempt Gemini call with multiple model fallbacks for robustness
    let responseText = '';
    const modelsToTry = [
      process.env.GEMINI_CHAT_MODEL || 'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
      'gemini-flash-latest',
      'gemini-1.5-flash'
    ];

    let lastError: any = null;
    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                response: { type: Type.STRING, description: "Your supportive response to the user." },
                detected_emotion: { type: Type.STRING },
                mood_score: { type: Type.INTEGER },
                stress_level: { type: Type.INTEGER },
                crisis_detected: { type: Type.BOOLEAN },
                suggested_coping_strategy: { type: Type.STRING },
                cognitive_distortion: { type: Type.STRING },
                therapeutic_focus: { type: Type.STRING },
                trigger_identified: { type: Type.STRING }
              },
              required: ["response", "detected_emotion", "mood_score", "stress_level", "crisis_detected", "therapeutic_focus"]
            }
          }
        });
        responseText = response.text || '';
        if (responseText) break;
      } catch (err) {
        lastError = err;
        console.error(`Gemini call failed with model ${model}, trying next...`, err);
      }
    }

    if (!responseText) {
      throw lastError || new Error('Failed to generate content from Gemini API');
    }

    const result = JSON.parse(responseText);

    const normalize = (val: any) => {
      if (val === null || val === undefined) return null;
      const str = String(val).trim();
      if (str === '' || str.toLowerCase() === 'null' || str.toLowerCase() === 'none') return null;
      return str;
    };

    const metrics = {
      emotion: normalize(result.detected_emotion),
      mood: result.mood_score,
      stress: result.stress_level,
      crisis: result.crisis_detected,
      strategy: normalize(result.suggested_coping_strategy),
      distortion: normalize(result.cognitive_distortion),
      focus: normalize(result.therapeutic_focus),
      trigger: normalize(result.trigger_identified)
    };

    // Update user message with metrics
    db.prepare(`
      UPDATE messages 
      SET emotion = ?, mood_score = ?, stress_level = ?, crisis_detected = ?, suggested_strategy = ?, cognitive_distortion = ?, therapeutic_focus = ?, trigger_identified = ?
      WHERE id = (SELECT id FROM messages WHERE session_id = ? AND role = 'user' ORDER BY timestamp DESC LIMIT 1)
    `).run(
      metrics.emotion, 
      metrics.mood, 
      metrics.stress, 
      metrics.crisis ? 1 : 0, 
      metrics.strategy || null,
      metrics.distortion || null,
      metrics.focus || null,
      metrics.trigger || null,
      sessionId
    );

    // Save AI response
    db.prepare('INSERT INTO messages (session_id, role, content, emotion, suggested_strategy, crisis_detected, cognitive_distortion, therapeutic_focus, trigger_identified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(
        sessionId, 
        'ai', 
        result.response,
        metrics.emotion,
        metrics.strategy || null,
        metrics.crisis ? 1 : 0,
        metrics.distortion || null,
        metrics.focus || null,
        metrics.trigger || null
      );

    res.json({
      success: true,
      response: result.response,
      metrics
    });
  } catch (error: any) {
    console.error('Error in /api/chat/generate:', error);
    res.status(500).json({ error: error.message || 'Internal server error during generation' });
  }
});

// Secure API endpoint for Dashboard AI Insights
app.get('/api/dashboard/insight', async (req, res) => {
  try {
    // Get recent user trends (last 7 days of user inputs)
    const messages = db.prepare(`
      SELECT timestamp, emotion, mood_score, stress_level 
      FROM messages 
      WHERE role = 'user' AND timestamp >= datetime('now', '-7 days')
      ORDER BY timestamp ASC
    `).all();

    if (messages.length < 3) {
      return res.json({ insight: null });
    }

    const prompt = `
You are Lumina, a mental wellness intelligence platform.
Analyze the following user data from the last 7 days and provide a single, highly insightful, and empathetic paragraph (max 3 sentences).
Focus on connecting their stress levels, emotions, cognitive distortions, and triggers. Point out a pattern they might not have noticed.
Do NOT diagnose. Speak directly to the user (e.g., "I noticed that...").

User Data (Last 7 Days):
${JSON.stringify(messages, null, 2)}
    `;

    let insightText = '';
    const modelsToTry = [
      process.env.GEMINI_DASHBOARD_MODEL || 'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
      'gemini-flash-latest',
      'gemini-1.5-flash'
    ];

    let lastError: any = null;
    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
        });
        insightText = response.text || '';
        if (insightText) break;
      } catch (err) {
        lastError = err;
        console.error(`Gemini dashboard insight failed with model ${model}, trying next...`, err);
      }
    }

    if (!insightText) {
      throw lastError || new Error('Failed to generate insight from Gemini API');
    }

    res.json({ insight: insightText });
  } catch (error: any) {
    console.error('Error in /api/dashboard/insight:', error);
    res.status(500).json({ error: error.message || 'Internal server error during insight generation' });
  }
});


async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
