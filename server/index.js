import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import express from 'express';
import cors from 'cors';
import Groq from 'groq-sdk';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import connectDB from './db.js';
import User from './models/User.js';
import Review from './models/Review.js';

// Load .env located next to this file (server/.env)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// Debug logs to verify environment configuration
console.log("Loaded API KEY:", process.env.GROQ_API_KEY);
console.log("Loaded MODEL:", process.env.GROQ_MODEL);

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3001;

// JWT Secret - use environment variable or default
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';

app.use(cors({
  origin: "*"
}));
app.use(express.json({ limit: '10mb' }));

// Auth middleware to protect routes
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

let browser = null;

async function getBrowser() {
  if (browser) return browser;
  try {
    const puppeteer = await import('puppeteer');
    browser = await puppeteer.default.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    return browser;
  } catch (e) {
    console.warn('Puppeteer not available, screenshots disabled:', e.message);
    return null;
  }
}

app.post('/api/auth/signup', async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email and password' });
    }

    // Validate password and confirm password match
    if (!confirmPassword) {
      return res.status(400).json({ error: 'Please confirm your password' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new user (password will be hashed by pre-save hook in User model using bcrypt)
    const user = await User.create({
      name,
      email,
      password
    });

    // Return success response as specified
    res.json({ message: "User created successfully" });
  } catch (error) {
    console.error('Signup error:', error);
    next(error);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      message: 'Login successful', 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
});

// Protected route - requires authentication
app.post('/api/fetch-page', authMiddleware, async (req, res, next) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid URL' });
  }

  let parsed;
  try {
    parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Invalid protocol');
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  let html = '';
  let screenshotBase64 = null;

  try {
    const response = await fetch(parsed.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36',
      },
      redirect: 'follow',
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    html = await response.text();
  } catch (e) {
    return res.status(502).json({ error: `Could not fetch URL: ${e.message}` });
  }

  if (!process.env.SKIP_SCREENSHOT) {
    try {
      const b = await getBrowser();
      if (b) {
        const page = await b.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        await page.goto(parsed.toString(), { waitUntil: 'networkidle2', timeout: 20000 });
        const buf = await page.screenshot({ type: 'png', fullPage: false });
        await page.close();
        screenshotBase64 = Buffer.from(buf).toString('base64');
      }
    } catch (e) {
      console.warn('Screenshot failed:', e.message);
    }
  }

  res.json({ html, screenshotBase64, url: parsed.toString() });
});

// Allow overriding the model with an env var. If you change this, update server/.env
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const REVIEW_PROMPT = `You are an expert UX reviewer. Analyze the provided website HTML to produce a structured UX review.

Output a valid JSON object (no markdown, no code fences) with this exact structure:

{
  "score": <number 1-10, overall UX score>,
  "summary": "<2-3 sentence overall summary>",
  "issues": [
    {
      "id": "<short-id>",
      "category": "clarity" | "layout" | "navigation" | "accessibility" | "trust",
      "title": "<short issue title>",
      "description": "<why this is an issue, 1-3 sentences>",
      "evidence": "<proof: exact text, element reference, or what appears in the UI>",
      "severity": "high" | "medium" | "low"
    }
  ],
  "beforeAfter": [
    {
      "issueId": "<id from issues>",
      "before": "<current state description>",
      "after": "<recommended change>"
    }
  ]
}

Rules:
- Include 8 to 12 issues total, spread across categories.
- beforeAfter must have exactly 3 items, for the 3 most important issues (by severity/impact).
- Be specific: quote exact button text, heading levels, or layout problems.
- Categories: clarity (copy, hierarchy), layout (spacing, structure), navigation (menus, links), accessibility (a11y), trust (security, credibility).`;

// Protected route - requires authentication
app.post('/api/review', authMiddleware, async (req, res, next) => {
  const { html, url, screenshotBase64 } = req.body;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
  }
  if (!html || typeof html !== 'string') {
    return res.status(400).json({ error: 'Missing HTML content' });
  }

  try {
    const groq = new Groq({ apiKey });
    const cleanHtml = html
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '');

    const htmlSnippet = cleanHtml.substring(0, 10000);
    const userContent = `Website URL: ${url || 'Unknown'}\n\nAnalyze the following HTML and produce the UX review JSON.\n\n--- HTML (excerpt) ---\n${htmlSnippet}\n--- End HTML ---`;
    const prompt = `${REVIEW_PROMPT}\n\n${userContent}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: GROQ_MODEL,
      max_tokens: 2048,
      temperature: 0.3,
    });

    const text = (completion.choices?.[0]?.message?.content || '').trim();
    let json = {};
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        json = JSON.parse(jsonMatch[0]);
      } catch (_) {
        json = {};
      }
    }

    // Auto-save review to MongoDB
    let savedReview = null;
    try {
      savedReview = await Review.create({
        userId: req.user.userId,
        url: url || 'Unknown',
        reviewJSON: json,
        screenshotBase64: screenshotBase64 || null
      });
      console.log('Review auto-saved:', savedReview._id);
    } catch (saveError) {
      // Log error but don't fail the request - still return the review
      console.error('Failed to auto-save review:', saveError.message);
    }

    res.json({ 
      review: json, 
      raw: text,
      savedReview: savedReview ? {
        id: savedReview._id,
        createdAt: savedReview.createdAt
      } : null
    });
  } catch (e) {
    console.error('Groq API error:', e?.message || e);

    // Detect decommissioned model errors and return a helpful message
    let message = (e && (e.message || (e.error && e.error.message))) || String(e);

    // If message wraps a status code plus JSON (e.g. "400 {\"error\":{...}}"), try to extract inner JSON message
    try {
      const firstBrace = message.indexOf('{');
      if (firstBrace !== -1) {
        const jsonPart = message.slice(firstBrace);
        const parsed = JSON.parse(jsonPart);
        if (parsed) {
          if (parsed.error && typeof parsed.error === 'object' && parsed.error.message) {
            message = parsed.error.message;
          } else if (parsed.message) {
            message = parsed.message;
          }
        }
      }
    } catch (_) {
      // ignore parse errors and keep original message
    }

    const isDecommissioned = /decommissioned|model_decommissioned/i.test(message) || (e && e.code === 'model_decommissioned');
    if (isDecommissioned) {
      const docs = 'https://console.groq.com/docs/deprecations';
      return res.status(500).json({
        error: `Model ${GROQ_MODEL} has been decommissioned. Set a supported model via GROQ_MODEL in server/.env. See ${docs} for recommended models.`,
      });
    }

    return next(new Error(message || 'Failed to generate review'));
  }
});

app.get('/api/status', async (req, res) => {
  // Check database connection
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'ping' }],
      model: process.env.GROQ_MODEL,
      max_tokens: 5,
    });

    res.json({
      backend: 'running',
      llm: 'connected',
      database: dbStatus
    });
  } catch (e) {
    res.json({
      backend: 'running',
      llm: 'error',
      database: dbStatus
    });
  }
});

// POST /api/reviews - Save a review to database (protected route)
app.post('/api/reviews', authMiddleware, async (req, res, next) => {
  try {
    const { url, reviewJSON, screenshotBase64 } = req.body;
    
    if (!url || !reviewJSON) {
      return res.status(400).json({ error: 'Missing required fields: url and reviewJSON' });
    }

    // Create new review
    const review = await Review.create({
      userId: req.user.userId,
      url,
      reviewJSON,
      screenshotBase64: screenshotBase64 || null
    });

    res.status(201).json({ 
      message: 'Review saved successfully',
      review: {
        id: review._id,
        url: review.url,
        createdAt: review.createdAt
      }
    });
  } catch (error) {
    console.error('Save review error:', error);
    next(error);
  }
});

// GET /api/reviews/recent - Get last 5 reviews per user (protected route)
app.get('/api/reviews/recent', authMiddleware, async (req, res, next) => {
  try {
    const reviews = await Review.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('url reviewJSON screenshotBase64 createdAt');

    const formattedReviews = reviews.map(r => ({
      id: r._id,
      url: r.url,
      review: r.reviewJSON,
      screenshotBase64: r.screenshotBase64,
      createdAt: r.createdAt
    }));

    res.json({ reviews: formattedReviews });
  } catch (error) {
    console.error('Get recent reviews error:', error);
    next(error);
  }
});

// 404 handler - must return JSON, not HTML
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler - must return JSON, not HTML
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  const hasKey = !!process.env.GROQ_API_KEY;
  console.log(`UX Reviewer API running at http://localhost:${PORT}`);
  console.log(`GROQ_API_KEY configured: ${hasKey ? 'yes' : 'no'}`);
  console.log(`GROQ model: ${GROQ_MODEL}`);
});
