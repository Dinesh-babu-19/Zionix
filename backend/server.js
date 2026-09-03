import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { getCrossReferencesForChapter, BIBLE_BOOKS_ORDER, BIBLE_BOOK_NAMES } from './crossReferences.js';

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const PRAYER_RECIPIENT_EMAIL = process.env.PRAYER_EMAIL_RECIPIENT || 'dineshbabu192006@gmail.com';

app.use(cors());
app.use(express.json());

// Preload Bible data on startup
let bibleData = null;
const biblePath = path.join(__dirname, 'data', 'bible.json');
try {
  if (fs.existsSync(biblePath)) {
    const fileData = fs.readFileSync(biblePath, 'utf8');
    bibleData = JSON.parse(fileData);
    console.log('Bible data preloaded successfully into memory.');
  } else {
    console.error('bible.json not found in data directory.');
  }
} catch (error) {
  console.error('Error preloading bible data:', error);
}

const memoryCache = new Map();

// Helper function to read data files
const readDataFile = (filename) => {
  if (memoryCache.has(filename)) {
    return memoryCache.get(filename);
  }
  const filePath = path.join(__dirname, 'data', filename);
  try {
    if (!fs.existsSync(filePath)) return null;
    const fileData = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(fileData);
    memoryCache.set(filename, parsed);
    return parsed;
  } catch (error) {
    console.error(`Error reading file ${filename}:`, error);
    return null;
  }
};

// Helper function to write data files
const writeDataFile = (filename, data) => {
  memoryCache.set(filename, data);
  const filePath = path.join(__dirname, 'data', filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    // In serverless read-only environments (like Vercel lambda), disk writes may fail, but memoryCache preserves data
    console.warn(`Note: Could not write to disk (${error.message}). Cached in memory.`);
    return true;
  }
};

// Helper to create mail transporter
const createMailTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER.trim(),
        pass: process.env.SMTP_PASS.trim()
      }
    });
  }

  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASS) {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER.trim(),
        pass: process.env.GMAIL_APP_PASS.replace(/\s+/g, '')
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  return null;
};

// Admin Credentials
const ADMIN_USERNAME = 'dineshbabu19';
const ADMIN_PASSWORD = 'Din19@2006';
const ADMIN_AUTH_TOKEN = 'zionix_admin_token_secure_din19_2006';

// Admin Auth Middleware
const requireAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : req.headers['x-admin-token'];

  if (token === ADMIN_AUTH_TOKEN) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized: Invalid or missing developer token' });
};

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running successfully!', timestamp: new Date() });
});

// Admin Login API
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return res.json({
      success: true,
      token: ADMIN_AUTH_TOKEN,
      user: { username: ADMIN_USERNAME, role: 'developer' },
      message: 'Developer authenticated successfully'
    });
  }

  return res.status(401).json({ error: 'Invalid username or password' });
});

// Helper to calculate exact calendar date and relative label for past days
const getPastDateInfo = (index) => {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - (index + 1));
  
  const formattedDate = targetDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  let label = 'Yesterday';
  if (index === 1) label = '2 Days Ago';
  else if (index === 2) label = '3 Days Ago';
  else if (index === 3) label = '4 Days Ago';
  else if (index >= 4) label = '5 Days Ago';

  return { label, date: formattedDate };
};

// Daily Verse API (Public)
app.get('/api/daily-verse', (req, res) => {
  const dailyVerse = readDataFile('dailyVerse.json');
  const recentReflections = readDataFile('recentReflections.json') || [];
  
  if (dailyVerse) {
    const formattedReflections = recentReflections.slice(0, 5).map((item, idx) => {
      const dateInfo = getPastDateInfo(idx);
      return {
        ...item,
        label: dateInfo.label,
        date: dateInfo.date
      };
    });
    res.json({
      ...dailyVerse,
      recentReflections: formattedReflections
    });
  } else {
    res.status(500).json({ error: 'Failed to retrieve daily verse data' });
  }
});

// Admin Get Daily Bread & History
app.get('/api/admin/daily-verse', requireAdminAuth, (req, res) => {
  const dailyVerse = readDataFile('dailyVerse.json');
  const recentReflections = readDataFile('recentReflections.json') || [];
  const formattedReflections = recentReflections.slice(0, 5).map((item, idx) => {
    const dateInfo = getPastDateInfo(idx);
    return {
      ...item,
      label: dateInfo.label,
      date: dateInfo.date
    };
  });
  res.json({
    dailyVerse,
    recentReflections: formattedReflections
  });
});

// Admin Update Daily Bread API
app.post('/api/admin/daily-verse', requireAdminAuth, async (req, res) => {
  const { verse, reference, translation, context, devotion, application } = req.body;

  if (!verse || !reference || !context || !devotion) {
    return res.status(400).json({ error: 'Verse, Reference, Context, and Morning Reflection are required' });
  }

  if (!Array.isArray(application) || application.length !== 3 || application.some(p => !p || !p.trim())) {
    return res.status(400).json({ error: 'Living It Out must contain exactly 3 non-empty points' });
  }

  const currentDaily = readDataFile('dailyVerse.json');
  let recentReflections = readDataFile('recentReflections.json') || [];

  const hasChanged = !currentDaily || 
    currentDaily.verse?.trim() !== verse.trim() || 
    currentDaily.reference?.trim() !== reference.trim() ||
    currentDaily.context?.trim() !== context.trim() ||
    currentDaily.devotion?.trim() !== devotion.trim();

  // If there's an existing verse and it differs from the new verse, archive it to recent reflections
  if (currentDaily && currentDaily.verse && currentDaily.verse.trim() !== verse.trim()) {
    const archivedItem = {
      id: `ref-${Date.now()}`,
      verse: currentDaily.verse,
      reference: currentDaily.reference,
      translation: currentDaily.translation || 'English Standard Version',
      timestamp: new Date().toISOString()
    };

    // Prepend to history and keep maximum 5 entries
    recentReflections = [archivedItem, ...recentReflections.filter(r => r.reference !== currentDaily.reference)].slice(0, 5);
    writeDataFile('recentReflections.json', recentReflections);
  }

  const newDailyVerse = {
    verse: verse.trim(),
    reference: reference.trim(),
    translation: (translation && translation.trim()) || 'English Standard Version',
    context: context.trim(),
    devotion: devotion.trim(),
    application: application.map(p => p.trim()),
    updatedAt: new Date().toISOString()
  };

  const written = writeDataFile('dailyVerse.json', newDailyVerse);
  if (!written) {
    return res.status(500).json({ error: 'Failed to write updated daily verse' });
  }

  const formattedReflections = recentReflections.slice(0, 5).map((item, idx) => {
    const dateInfo = getPastDateInfo(idx);
    return {
      ...item,
      label: dateInfo.label,
      date: dateInfo.date
    };
  });

  // Broadcast email notification to ALL registered users ONLY WHEN content has changed
  const usersList = readDataFile('users.json') || [];
  const transporter = createMailTransporter();
  const emailRecipients = usersList
    .map(u => u.email)
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i); // unique emails

  let notifiedCount = 0;

  if (hasChanged && transporter && emailRecipients.length > 0) {
    notifiedCount = emailRecipients.length;
    console.log(`[Daily Verse Broadcast] Content changed. Broadcasting to (${emailRecipients.length}) users: ${emailRecipients.join(', ')}`);

    const broadcastSubject = `🌅 Daily Bread from Zionix: ${newDailyVerse.reference} — "${newDailyVerse.verse.slice(0, 50)}..."`;
    const broadcastHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #fcfcfb;">
        <div style="text-align: center; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
          <h1 style="color: #041534; font-size: 24px; margin: 0; letter-spacing: -0.02em;">🌅 Zionix Daily Bread</h1>
          <p style="color: #755b00; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin: 4px 0 0 0;">Today's Scripture & Morning Reflection</p>
        </div>

        <!-- Scripture Hero Box -->
        <div style="background-color: #041534; color: #ffffff; padding: 24px; border-radius: 14px; margin-top: 20px; text-align: center; box-shadow: 0 4px 12px rgba(4,21,52,0.15);">
          <span style="display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: #fed977; margin-bottom: 8px;">Verse of the Day</span>
          <blockquote style="font-size: 19px; font-style: italic; line-height: 1.6; margin: 0 0 12px 0;">
            "${newDailyVerse.verse}"
          </blockquote>
          <p style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">
            ${newDailyVerse.reference} • <span style="font-weight: 400; color: #c5c6cf;">${newDailyVerse.translation}</span>
          </p>
        </div>

        <!-- The Context -->
        <div style="margin-top: 20px; background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #eef0f4;">
          <h3 style="color: #041534; font-size: 15px; margin: 0 0 8px 0; font-weight: 700;">📜 The Context</h3>
          <p style="color: #45464e; font-size: 14px; line-height: 1.6; margin: 0;">
            ${newDailyVerse.context}
          </p>
        </div>

        <!-- Morning Reflection -->
        <div style="margin-top: 16px; background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #eef0f4;">
          <h3 style="color: #041534; font-size: 15px; margin: 0 0 8px 0; font-weight: 700;">✨ Morning Reflection</h3>
          <p style="color: #45464e; font-size: 14px; line-height: 1.6; font-style: italic; margin: 0;">
            ${newDailyVerse.devotion}
          </p>
        </div>

        <!-- Living It Out -->
        <div style="margin-top: 16px; background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #eef0f4;">
          <h3 style="color: #041534; font-size: 15px; margin: 0 0 12px 0; font-weight: 700;">🛠️ Living It Out Today</h3>
          <ol style="margin: 0; padding-left: 20px; color: #45464e; font-size: 14px; line-height: 1.7;">
            ${newDailyVerse.application.map(pt => `<li style="margin-bottom: 6px;">${pt}</li>`).join('')}
          </ol>
        </div>

        <!-- Read on Site CTA -->
        <div style="text-align: center; margin-top: 28px;">
          <a href="http://localhost:5173/verse" style="display: inline-block; background-color: #041534; color: #ffffff; text-decoration: none; padding: 13px 32px; border-radius: 999px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
            Read & Listen on Zionix →
          </a>
        </div>

        <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e5e7eb; padding-top: 16px;">
          <p style="margin: 0;">You are receiving this spiritual encouragement because you are connected to Zionix.</p>
        </div>
      </div>
    `;

    const senderAddr = process.env.GMAIL_USER ? process.env.GMAIL_USER.trim() : 'daily@zionix.org';
    try {
      const info = await transporter.sendMail({
        from: `"Zionix Daily Bread" <${senderAddr}>`,
        to: emailRecipients.join(', '),
        subject: broadcastSubject,
        html: broadcastHtml
      });
      console.log(`[Daily Verse Broadcast] Successfully delivered to ${emailRecipients.length} users (ID: ${info.messageId})`);
    } catch (err) {
      console.error(`[Daily Verse Broadcast] Error sending broadcast:`, err.message);
    }
  } else if (!hasChanged) {
    console.log(`[Daily Verse Broadcast] No changes detected in Daily Bread. Skipping broadcast to avoid duplicate emails.`);
  }

  res.json({
    success: true,
    message: hasChanged 
      ? `Daily Bread updated successfully! Email notification sent to ${notifiedCount} registered believers.`
      : 'Daily Bread saved. No content changes detected, email broadcast skipped.',
    dailyVerse: newDailyVerse,
    recentReflections: formattedReflections,
    notifiedUsersCount: notifiedCount
  });
});

// Bible Search API
app.get('/api/bible/search', (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 3) {
    return res.json([]);
  }
  if (!bibleData) {
    return res.status(500).json({ error: 'Bible data is not loaded' });
  }

  const query = q.toLowerCase();
  const results = [];

  for (const bookKey of Object.keys(bibleData)) {
    const book = bibleData[bookKey];
    for (const chapterKey of Object.keys(book)) {
      const chapter = book[chapterKey];
      for (const verse of chapter.verses) {
        if (verse.text.toLowerCase().includes(query)) {
          results.push({
            book: chapter.book,
            chapter: chapter.chapter,
            number: verse.number,
            text: verse.text
          });
          if (results.length >= 50) {
            break;
          }
        }
      }
      if (results.length >= 50) break;
    }
    if (results.length >= 50) break;
  }

  res.json(results);
});

const translationMemoryCache = new Map();

// Helper to clean HTML tags from external Bible text
function cleanBibleText(text) {
  if (!text) return '';
  return text
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<S>\d+<\/S>/gi, '') // Strongs numbers if present
    .replace(/<sup>.*?<\/sup>/gi, '') // Footnotes
    .replace(/<[^>]+>/g, '') // Strip remaining html tags
    .replace(/\s+/g, ' ')
    .trim();
}

// Clean KJV text from translator brackets {word} -> word, and omit {Heb. ...} margin notes
function cleanKjvText(text) {
  if (!text) return '';
  let cleaned = text.replace(/\{[^}]*?:[^}]*?\}/g, '');
  cleaned = cleaned.replace(/\{([^}]+)\}/g, '$1');
  return cleaned.replace(/\s+/g, ' ').trim();
}

// Bible Explorer API (supports ?translation=KJV|ESV|NIV and cross-references)
app.get('/api/bible/:book/:chapter', async (req, res) => {
  const { book, chapter } = req.params;
  const translation = (req.query.translation || 'KJV').toUpperCase();
  const bookKey = book.toLowerCase();
  
  if (!bibleData) {
    return res.status(500).json({ error: 'Bible data is not loaded on server' });
  }
  
  const bookData = bibleData[bookKey];
  if (!bookData) {
    return res.status(404).json({ error: `Book '${book}' not found` });
  }
  
  const chapterData = bookData[chapter];
  if (!chapterData) {
    return res.status(404).json({ error: `Chapter ${chapter} of Book '${book}' not found` });
  }

  const cacheKey = `${translation}-${bookKey}-${chapter}`;
  if (translationMemoryCache.has(cacheKey)) {
    return res.json(translationMemoryCache.get(cacheKey));
  }

  const bookIndex = BIBLE_BOOKS_ORDER.indexOf(bookKey) + 1;

  // 1. KJV Translation
  if (translation === 'KJV') {
    const references = getCrossReferencesForChapter(bookKey, parseInt(chapter, 10));
    const formattedChapter = {
      ...chapterData,
      translation: 'KJV',
      verses: chapterData.verses.map(v => ({
        number: v.number,
        text: cleanKjvText(v.text)
      })),
      references
    };
    translationMemoryCache.set(cacheKey, formattedChapter);
    return res.json(formattedChapter);
  }

  // 2. ESV or NIV Translation
  if (translation === 'ESV' || translation === 'NIV') {
    try {
      const bollsTranslation = translation === 'NIV' ? 'NIV' : 'ESV';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const resp = await fetch(`https://bolls.life/get-chapter/${bollsTranslation}/${bookIndex}/${chapter}/`, {
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (resp.ok) {
        const rawVerses = await resp.json();
        if (Array.isArray(rawVerses) && rawVerses.length > 0) {
          const verses = rawVerses.map(v => ({
            number: v.verse,
            text: cleanBibleText(v.text)
          }));

          const references = getCrossReferencesForChapter(bookKey, parseInt(chapter, 10), rawVerses);

          const result = {
            book: chapterData.book,
            chapter: parseInt(chapter, 10),
            testament: chapterData.testament,
            translation,
            verses,
            insights: `${chapterData.book} Chapter ${chapter} (${translation}) — Scripture text and reflections.`,
            references
          };

          translationMemoryCache.set(cacheKey, result);
          return res.json(result);
        }
      }
    } catch (err) {
      console.warn(`Could not fetch external translation ${translation} for ${book} ${chapter}:`, err.message);
    }
  }

  // Fallback if external fetch failed
  const fallbackReferences = getCrossReferencesForChapter(bookKey, parseInt(chapter, 10));
  const fallbackResult = {
    ...chapterData,
    translation,
    verses: chapterData.verses.map(v => ({
      number: v.number,
      text: cleanKjvText(v.text)
    })),
    references: fallbackReferences
  };
  translationMemoryCache.set(cacheKey, fallbackResult);
  res.json(fallbackResult);
});

// Gospel Topics API
app.get('/api/gospel/topics', (req, res) => {
  const gospelData = readDataFile('gospel.json');
  if (gospelData) {
    res.json(gospelData);
  } else {
    res.status(500).json({ error: 'Failed to retrieve gospel topics' });
  }
});

// Prayer Request Submission API
app.post('/api/prayer-request', async (req, res) => {
  const { name, email, prayerPoints, category, isPrivate } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Please provide your name.' });
  }

  if (!email || !email.trim() || !email.includes('@')) {
    return res.status(400).json({ error: 'Please provide a valid email / Gmail address.' });
  }

  if (!prayerPoints || !prayerPoints.trim()) {
    return res.status(400).json({ error: 'Please share your prayer points or burden.' });
  }

  const newRequest = {
    id: `prayer-${Date.now()}`,
    name: name.trim(),
    email: email.trim(),
    prayerPoints: prayerPoints.trim(),
    category: category ? category.trim() : 'General Support',
    isPrivate: !!isPrivate,
    submittedAt: new Date().toISOString(),
    formattedDate: new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    })
  };

  // 1. Save to local storage database
  let prayerList = readDataFile('prayerRequests.json') || [];
  prayerList = [newRequest, ...prayerList];
  writeDataFile('prayerRequests.json', prayerList);

  // 2. Dispatch Email Notification to target email: dineshbabu192006@gmail.com
  const transporter = createMailTransporter();
  const mailSubject = `🙏 New Prayer Request: ${newRequest.name} (${newRequest.category}) — Zionix Prayer Wall`;
  const mailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #fcfcfb;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb;">
        <h2 style="color: #041534; font-size: 22px; margin: 0; letter-spacing: -0.02em;">🙏 Zionix Prayer Wall</h2>
        <p style="color: #755b00; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin: 6px 0 0 0;">New Intercession Request</p>
      </div>

      <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; margin-top: 20px; border: 1px solid #eef0f4; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 140px;">Believer Name:</td>
            <td style="padding: 8px 0; color: #041534; font-weight: 700;">${newRequest.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Gmail / Email:</td>
            <td style="padding: 8px 0; color: #041534;"><a href="mailto:${newRequest.email}" style="color: #755b00; text-decoration: none; font-weight: 600;">${newRequest.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Prayer Category:</td>
            <td style="padding: 8px 0; color: #041534;">
              <span style="background-color: #fed977; color: #584400; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 700;">
                ${newRequest.category}
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Confidentiality:</td>
            <td style="padding: 8px 0; color: ${newRequest.isPrivate ? '#ba1a1a' : '#041534'}; font-weight: 600;">
              ${newRequest.isPrivate ? '🔒 Private (Core Prayer Team Only)' : '🌐 Open for Intercessory Agreement'}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Submitted Time:</td>
            <td style="padding: 8px 0; color: #475569;">${newRequest.formattedDate}</td>
          </tr>
        </table>

        <div style="margin-top: 20px; padding-top: 18px; border-top: 1px solid #f1f5f9;">
          <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #041534; text-transform: uppercase; letter-spacing: 0.05em;">
            Prayer Points & Burdens:
          </p>
          <div style="background-color: #fafaf9; border-left: 4px solid #755b00; padding: 16px; border-radius: 6px; font-size: 15px; line-height: 1.6; color: #1e293b; white-space: pre-wrap;">
${newRequest.prayerPoints}
          </div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #94a3b8; line-height: 1.5;">
        <p style="margin: 0;">Zionix Ministry • "Pray without ceasing." — 1 Thessalonians 5:17</p>
        <p style="margin: 4px 0 0 0;">Recipient: ${PRAYER_RECIPIENT_EMAIL}</p>
      </div>
    </div>
  `;

  if (transporter) {
    const senderAddr = process.env.GMAIL_USER ? process.env.GMAIL_USER.trim() : 'prayer@zionix.org';
    transporter.sendMail({
      from: `"Zionix Prayer Wall" <${senderAddr}>`,
      to: PRAYER_RECIPIENT_EMAIL,
      replyTo: newRequest.email,
      subject: mailSubject,
      html: mailHtml
    }).then(() => {
      console.log(`[Prayer Wall] Notification email successfully delivered to ${PRAYER_RECIPIENT_EMAIL}`);
    }).catch(err => {
      console.error(`[Prayer Wall] Error sending email via transporter:`, err.message);
    });
  } else {
    console.log(`\n======================================================`);
    console.log(`[PRAYER WALL NOTIFICATION]`);
    console.log(`To: ${PRAYER_RECIPIENT_EMAIL}`);
    console.log(`Subject: ${mailSubject}`);
    console.log(`From: ${newRequest.name} <${newRequest.email}>`);
    console.log(`Category: ${newRequest.category}`);
    console.log(`Prayer Points:\n${newRequest.prayerPoints}`);
    console.log(`======================================================\n`);
  }

  res.json({
    success: true,
    message: 'Your prayer request has been received. Our prayer team is lifting your request before God.',
    requestId: newRequest.id
  });
});

// Admin endpoint to view prayer requests
app.get('/api/admin/prayer-requests', requireAdminAuth, (req, res) => {
  const prayerList = readDataFile('prayerRequests.json') || [];
  res.json({ prayerRequests: prayerList });
});

// Google Login API
app.post('/api/auth/google-login', async (req, res) => {
  const { name, email, avatar } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Upsert user in users.json
  let usersList = readDataFile('users.json') || [];
  const existingIdx = usersList.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

  const userProfile = {
    id: existingIdx >= 0 ? usersList[existingIdx].id : `usr-${Date.now()}`,
    name: name || (email.split('@')[0]),
    email: email.trim(),
    avatar: avatar || (name ? name[0].toUpperCase() : 'Z'),
    lastLoginAt: new Date().toISOString(),
    joinedAt: existingIdx >= 0 ? usersList[existingIdx].joinedAt : new Date().toISOString(),
    subscribedToDailyVerse: true
  };

  if (existingIdx >= 0) {
    usersList[existingIdx] = { ...usersList[existingIdx], ...userProfile };
  } else {
    usersList.push(userProfile);
  }

  writeDataFile('users.json', usersList);

  res.json({ 
    success: true, 
    message: 'Logged in successfully via Google Auth!',
    user: userProfile 
  });
});

// Admin endpoint to view registered users
app.get('/api/admin/users', requireAdminAuth, (req, res) => {
  const usersList = readDataFile('users.json') || [];
  res.json({ users: usersList, count: usersList.length });
});

// Start HTTP server if run directly or outside serverless
const isDirectRun = process.argv[1] && (process.argv[1].endsWith('server.js') || process.argv[1].includes('server'));
if (isDirectRun || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;

