import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import os from 'os';
import path from 'path';
import dns from 'dns';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { getCrossReferencesForChapter, BIBLE_BOOKS_ORDER, BIBLE_BOOK_NAMES } from './crossReferences.js';
import { 
  initDb, 
  getAllUsers, 
  findUserByEmail, 
  upsertUser, 
  getAllPrayers, 
  insertPrayerRequest, 
  getAllEmailRecipients, 
  getAppSetting, 
  setAppSetting 
} from './db/index.js';

// Prioritize IPv4 in Node.js to eliminate Windows IPv6 SMTP connection hangs
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

let cachedGmailIp = '192.178.211.108';
try {
  dns.resolve4('smtp.gmail.com', (err, addresses) => {
    if (!err && addresses && addresses.length > 0) {
      cachedGmailIp = addresses[0];
    }
  });
} catch (e) {}

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const PRAYER_RECIPIENT_EMAIL = process.env.PRAYER_EMAIL_RECIPIENT || 'dineshbabu192006@gmail.com';

app.use(cors());
app.use(express.json());

// Initialize Neon PostgreSQL database on startup
initDb().then(ok => {
  if (ok) console.log('Neon PostgreSQL connected and initialized.');
}).catch(err => {
  console.error('Failed to initialize Neon PostgreSQL:', err);
});

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

// Helper function to read data files (checks memoryCache -> /tmp -> bundled project files)
const readDataFile = (filename) => {
  if (memoryCache.has(filename)) {
    return memoryCache.get(filename);
  }

  // 1. Check OS temp directory first (persists across warm serverless requests on Vercel)
  try {
    const tmpPath = path.join(os.tmpdir(), `zionix_${filename}`);
    if (fs.existsSync(tmpPath)) {
      const tmpData = fs.readFileSync(tmpPath, 'utf8');
      const parsed = JSON.parse(tmpData);
      memoryCache.set(filename, parsed);
      return parsed;
    }
  } catch (err) {
    // Fallback to local files
  }

  // 2. Check project bundled data directory
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

// Helper function to write data files (writes to memoryCache + local disk + /tmp)
const writeDataFile = (filename, data) => {
  memoryCache.set(filename, data);

  // 1. Write to local project directory (succeeds in local development & persistent environments)
  const localPath = path.join(__dirname, 'data', filename);
  try {
    fs.writeFileSync(localPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    // Read-only serverless filesystem expected on Vercel
  }

  // 2. Write to OS temp directory (always writable on Vercel /tmp)
  try {
    const tmpPath = path.join(os.tmpdir(), `zionix_${filename}`);
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (tmpErr) {
    console.warn(`Could not write to tmpdir for ${filename}:`, tmpErr.message);
  }

  return true;
};

// Helper to commit file permanently to GitHub repository (Permanent Cloud Persistence)
async function commitFileToGitHub(filePathInRepo, contentObj, commitMessage, token) {
  if (!token) return { success: false, reason: 'No GitHub token provided' };
  const owner = 'Dinesh-babu-19';
  const repo = 'Zionix';
  const branch = 'main';
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePathInRepo}`;

  try {
    let sha = null;
    const getResp = await fetch(`${url}?ref=${branch}`, {
      headers: {
        'Authorization': `Bearer ${token.trim()}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Zionix-Admin-Sync'
      }
    });

    if (getResp.ok) {
      const meta = await getResp.json();
      sha = meta.sha;
    }

    const contentBase64 = Buffer.from(JSON.stringify(contentObj, null, 2), 'utf8').toString('base64');
    const body = {
      message: commitMessage,
      content: contentBase64,
      branch
    };
    if (sha) body.sha = sha;

    const putResp = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token.trim()}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Zionix-Admin-Sync'
      },
      body: JSON.stringify(body)
    });

    if (putResp.ok) {
      const putData = await putResp.json();
      return { success: true, commitSha: putData.commit?.sha };
    } else {
      const err = await putResp.json().catch(() => ({}));
      return { success: false, reason: err.message || 'GitHub API error' };
    }
  } catch (e) {
    return { success: false, reason: e.message };
  }
}

// Helper to create mail transporter (checks headers -> saved mailConfig.json -> process.env -> hardcoded fallback)
const createMailTransporter = (reqHeaders = {}) => {
  const mailConfig = readDataFile('mailConfig.json') || {};

  const rawHost = reqHeaders['x-mail-host'] || mailConfig.host || process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(reqHeaders['x-mail-port'] || mailConfig.port || process.env.SMTP_PORT) || 465;
  const user = (reqHeaders['x-mail-user'] || mailConfig.user || process.env.GMAIL_USER || process.env.SMTP_USER || 'babud4395@gmail.com').trim();
  const pass = (reqHeaders['x-mail-pass'] || mailConfig.pass || process.env.GMAIL_APP_PASS || process.env.SMTP_PASS || 'hzpt sboi okac lgkk').replace(/\s+/g, '');

  if (user && pass) {
    const isGmail = rawHost.includes('gmail') || user.endsWith('@gmail.com');
    return nodemailer.createTransport({
      host: isGmail
        ? (process.platform === 'win32' ? (cachedGmailIp || '192.178.211.108') : 'smtp.gmail.com')
        : rawHost,
      port: port === 587 ? 587 : 465,
      secure: port === 465 || (!port && isGmail),
      family: 4,
      auth: { user, pass },
      tls: {
        servername: isGmail ? 'smtp.gmail.com' : rawHost,
        rejectUnauthorized: false
      },
      connectionTimeout: 10000,
      greetingTimeout: 8000,
      socketTimeout: 15000
    });
  }

  return null;
};

// Helper to get active mail sender address
const getMailSenderAddress = (reqHeaders = {}) => {
  const mailConfig = readDataFile('mailConfig.json') || {};
  return (reqHeaders['x-mail-user'] || mailConfig.user || process.env.GMAIL_USER || process.env.SMTP_USER || 'babud4395@gmail.com').trim();
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
app.get('/api/daily-verse', async (req, res) => {
  const dbDaily = await getAppSetting('daily_verse');
  const dbReflections = await getAppSetting('recent_reflections');
  const dailyVerse = dbDaily || readDataFile('dailyVerse.json');
  const recentReflections = (Array.isArray(dbReflections) && dbReflections.length > 0) 
    ? dbReflections 
    : (readDataFile('recentReflections.json') || []);
  
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
app.get('/api/admin/daily-verse', requireAdminAuth, async (req, res) => {
  const dbDaily = await getAppSetting('daily_verse');
  const dbReflections = await getAppSetting('recent_reflections');
  const dailyVerse = dbDaily || readDataFile('dailyVerse.json');
  const recentReflections = (Array.isArray(dbReflections) && dbReflections.length > 0) 
    ? dbReflections 
    : (readDataFile('recentReflections.json') || []);

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

  const dbDaily = await getAppSetting('daily_verse');
  const currentDaily = dbDaily || readDataFile('dailyVerse.json');
  const dbReflections = await getAppSetting('recent_reflections');
  let recentReflections = (Array.isArray(dbReflections) && dbReflections.length > 0)
    ? dbReflections
    : (readDataFile('recentReflections.json') || []);

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
    await setAppSetting('recent_reflections', recentReflections);
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

  // 1. Permanently save to Neon PostgreSQL app_settings
  await setAppSetting('daily_verse', newDailyVerse);
  await setAppSetting('recent_reflections', recentReflections);

  // 2. Local JSON fallback
  writeDataFile('dailyVerse.json', newDailyVerse);

  const formattedReflections = recentReflections.slice(0, 5).map((item, idx) => {
    const dateInfo = getPastDateInfo(idx);
    return {
      ...item,
      label: dateInfo.label,
      date: dateInfo.date
    };
  });

  // Broadcast function to email Daily Bread to all registered users and prayer believers in Neon DB
  const emailDeliveryResult = await broadcastDailyVerseToUsers(
    newDailyVerse, 
    req.body.knownUsers || [], 
    req.headers
  );

  // Permanent GitHub Commit Sync (commits changes directly to git repo if GITHUB_TOKEN is available)
  const githubToken = req.headers['x-github-token'] || process.env.GITHUB_TOKEN;
  let githubSyncResult = null;
  if (githubToken) {
    try {
      const usersList = await getAllUsers();
      githubSyncResult = await commitFileToGitHub(
        'backend/data/dailyVerse.json',
        newDailyVerse,
        `feat(daily-bread): Update verse to ${newDailyVerse.reference} via Admin Portal`,
        githubToken
      );
      if (githubSyncResult && githubSyncResult.success) {
        console.log(`[GitHub Permanent Sync] Committed dailyVerse.json to repo: ${githubSyncResult.commitSha}`);
        await commitFileToGitHub(
          'backend/data/recentReflections.json',
          recentReflections,
          `chore(daily-bread): Archive previous reflections via Admin Portal`,
          githubToken
        );
        await commitFileToGitHub(
          'backend/data/users.json',
          usersList,
          `chore(users): Update registered believers list via Admin Portal`,
          githubToken
        );
      }
    } catch (err) {
      console.warn(`[GitHub Permanent Sync] Error:`, err.message);
    }
  }

  res.json({
    success: true,
    message: emailDeliveryResult.sentCount > 0
      ? `Daily Bread updated successfully! Email notification sent individually to ${emailDeliveryResult.sentCount} believers.`
      : (emailDeliveryResult.transporterConfigured
          ? `Daily Bread saved in Neon DB. Email delivery attempted for ${emailDeliveryResult.totalRecipients} recipients, but encountered errors.`
          : 'Daily Bread saved in Neon DB! Note: Email broadcast was not sent because Mail credentials (Gmail/SMTP) are not configured.'),
    dailyVerse: newDailyVerse,
    recentReflections: formattedReflections,
    notifiedUsersCount: emailDeliveryResult.sentCount,
    emailDelivery: emailDeliveryResult,
    githubSync: githubSyncResult
  });
});

// Dedicated Daily Bread Broadcast Helper function
async function broadcastDailyVerseToUsers(dailyVerse, additionalUsers = [], reqHeaders = {}) {
  // 1. Fetch all believers and emails from Neon PostgreSQL database
  const dbEmails = await getAllEmailRecipients().catch(() => []);
  const dbUsers = await getAllUsers().catch(() => []);
  const dbPrayers = await getAllPrayers().catch(() => []);

  // 2. Fallback to local files if any
  const localUsers = readDataFile('users.json') || [];
  const localPrayers = readDataFile('prayerRequests.json') || [];

  // Combine and deduplicate all believers from Neon PostgreSQL, local JSON, and additional client-provided users
  const allCandidateEmails = [
    ...dbEmails,
    ...dbUsers.map(u => u.email),
    ...dbPrayers.map(p => p.email),
    ...localUsers.map(u => u.email),
    ...localPrayers.map(p => p.email),
    ...additionalUsers.map(u => typeof u === 'string' ? u : u?.email),
    'dineshbabu192006@gmail.com',
    'babud4395@gmail.com'
  ];

  const emailRecipients = allCandidateEmails
    .filter(Boolean)
    .map(e => e.trim().toLowerCase())
    .filter(e => e.includes('@') && e.includes('.'))
    .filter((v, i, a) => a.indexOf(v) === i); // unique emails

  const transporter = createMailTransporter(reqHeaders);
  const senderAddr = getMailSenderAddress(reqHeaders);

  const deliveryResult = {
    transporterConfigured: !!transporter,
    sender: senderAddr,
    totalRecipients: emailRecipients.length,
    sentCount: 0,
    failedCount: 0,
    recipients: emailRecipients,
    errors: []
  };

  if (!transporter) {
    console.warn('[Daily Verse Broadcast] Mail transporter not configured. Set GMAIL_USER/GMAIL_APP_PASS or configure in Admin panel.');
    deliveryResult.errors.push('Mail credentials not configured. Please enter your Gmail and 16-character App Password.');
    return deliveryResult;
  }

  if (emailRecipients.length === 0) {
    console.warn('[Daily Verse Broadcast] No email recipients found to broadcast to.');
    return deliveryResult;
  }

  console.log(`[Daily Verse Broadcast] Broadcasting individually to (${emailRecipients.length}) believers for complete privacy.`);

  const broadcastSubject = `🌅 Daily Bread from Zionix: ${dailyVerse.reference} — "${dailyVerse.verse.slice(0, 50)}..."`;
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
          "${dailyVerse.verse}"
        </blockquote>
        <p style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">
          ${dailyVerse.reference} • <span style="font-weight: 400; color: #c5c6cf;">${dailyVerse.translation || 'English Standard Version'}</span>
        </p>
      </div>

      <!-- The Context -->
      <div style="margin-top: 20px; background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #eef0f4;">
        <h3 style="color: #041534; font-size: 15px; margin: 0 0 8px 0; font-weight: 700;">📜 The Context</h3>
        <p style="color: #45464e; font-size: 14px; line-height: 1.6; margin: 0;">
          ${dailyVerse.context}
        </p>
      </div>

      <!-- Morning Reflection -->
      <div style="margin-top: 16px; background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #eef0f4;">
        <h3 style="color: #041534; font-size: 15px; margin: 0 0 8px 0; font-weight: 700;">✨ Morning Reflection</h3>
        <p style="color: #45464e; font-size: 14px; line-height: 1.6; font-style: italic; margin: 0;">
          ${dailyVerse.devotion}
        </p>
      </div>

      <!-- Living It Out -->
      <div style="margin-top: 16px; background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #eef0f4;">
        <h3 style="color: #041534; font-size: 15px; margin: 0 0 12px 0; font-weight: 700;">🛠️ Living It Out Today</h3>
        <ol style="margin: 0; padding-left: 20px; color: #45464e; font-size: 14px; line-height: 1.7;">
          ${(dailyVerse.application || []).map(pt => `<li style="margin-bottom: 6px;">${pt}</li>`).join('')}
        </ol>
      </div>

      <!-- Read on Site CTA (Always directs to deployed production website) -->
      <div style="text-align: center; margin-top: 28px;">
        <a href="https://zionix-nine.vercel.app/verse" style="display: inline-block; background-color: #041534; color: #ffffff; text-decoration: none; padding: 13px 32px; border-radius: 999px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
          Read & Listen on Zionix →
        </a>
      </div>

      <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e5e7eb; padding-top: 16px;">
        <p style="margin: 0;">You are receiving this spiritual encouragement because you are connected to Zionix.</p>
      </div>
    </div>
  `;

  // SEND TO EACH USER INDIVIDUALLY FOR COMPLETE PRIVACY (no shared email headers)
  for (const recipient of emailRecipients) {
    try {
      await transporter.sendMail({
        from: `"Zionix Daily Bread" <${senderAddr}>`,
        to: recipient,
        subject: broadcastSubject,
        html: broadcastHtml
      });
      deliveryResult.sentCount++;
      console.log(`[Daily Verse Broadcast] Sent individual email to: ${recipient}`);
    } catch (err) {
      deliveryResult.failedCount++;
      const errMsg = `${recipient}: ${err.message}`;
      deliveryResult.errors.push(errMsg);
      console.error(`[Daily Verse Broadcast] Failed to send to ${recipient}:`, err.message);
    }
  }

  return deliveryResult;
}

// Dedicated Helper to send Welcome Email + Today's Daily Bread to any new user who signs in or subscribes
async function sendNewUserWelcomeEmail(user, isNew = true, reqHeaders = {}) {
  const transporter = createMailTransporter(reqHeaders);
  if (!transporter) {
    console.log('[New User Welcome] Mail transporter not configured. Skipping email delivery.');
    return { success: false, reason: 'transporter_not_configured' };
  }

  const senderAddr = getMailSenderAddress(reqHeaders);
  const currentDaily = readDataFile('dailyVerse.json') || {
    verse: 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.',
    reference: 'John 3:16',
    translation: 'English Standard Version',
    context: 'Spoken by Jesus to Nicodemus during their nighttime conversation regarding being born again.',
    devotion: 'God’s love is not passive; it gives, redeems, and invites us into everlasting communion with Him.',
    application: [
      'Reflect on the unconditional sacrifice of Jesus today.',
      'Share His love and encouragement with someone in need.',
      'Rest in the eternal assurance of His grace.'
    ]
  };

  const welcomeSubject = isNew
    ? `🌅 Welcome to Zionix, ${user.name}! Today's Daily Bread: ${currentDaily.reference}`
    : `🌅 Welcome back, ${user.name}! Today's Daily Bread: ${currentDaily.reference}`;

  const welcomeHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #fcfcfb;">
      <div style="text-align: center; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
        <h1 style="color: #041534; font-size: 24px; margin: 0; letter-spacing: -0.02em;">🌅 Welcome to Zionix</h1>
        <p style="color: #755b00; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin: 4px 0 0 0;">Spiritual Fellowship & Daily Bread</p>
      </div>

      <div style="padding: 20px 0 12px 0; color: #334155; font-size: 15px; line-height: 1.6;">
        <p style="margin: 0 0 10px 0;">Grace and peace to you, <strong>${user.name}</strong>!</p>
        <p style="margin: 0 0 10px 0;">Thank you for signing in to <strong>Zionix</strong>. You have been successfully recorded in our believers directory. Every morning when our ministry publishes a Scripture reflection, you will receive it directly in your private email.</p>
        <p style="margin: 0;">Here is today's Daily Bread reflection to encourage your soul right now:</p>
      </div>

      <!-- Scripture Hero Box -->
      <div style="background-color: #041534; color: #ffffff; padding: 24px; border-radius: 14px; margin-top: 14px; text-align: center; box-shadow: 0 4px 12px rgba(4,21,52,0.15);">
        <span style="display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: #fed977; margin-bottom: 8px;">Verse of the Day</span>
        <blockquote style="font-size: 18px; font-style: italic; line-height: 1.6; margin: 0 0 12px 0;">
          "${currentDaily.verse}"
        </blockquote>
        <p style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">
          ${currentDaily.reference} • <span style="font-weight: 400; color: #c5c6cf;">${currentDaily.translation || 'English Standard Version'}</span>
        </p>
      </div>

      <!-- Context -->
      <div style="margin-top: 16px; background-color: #ffffff; padding: 18px; border-radius: 12px; border: 1px solid #eef0f4;">
        <h3 style="color: #041534; font-size: 14px; margin: 0 0 6px 0; font-weight: 700;">📜 Scripture Context</h3>
        <p style="color: #45464e; font-size: 13px; line-height: 1.6; margin: 0;">
          ${currentDaily.context}
        </p>
      </div>

      <!-- Morning Devotion -->
      <div style="margin-top: 14px; background-color: #ffffff; padding: 18px; border-radius: 12px; border: 1px solid #eef0f4;">
        <h3 style="color: #041534; font-size: 14px; margin: 0 0 6px 0; font-weight: 700;">✨ Morning Reflection</h3>
        <p style="color: #45464e; font-size: 13px; line-height: 1.6; font-style: italic; margin: 0;">
          ${currentDaily.devotion}
        </p>
      </div>

      <!-- Living It Out -->
      <div style="margin-top: 14px; background-color: #ffffff; padding: 18px; border-radius: 12px; border: 1px solid #eef0f4;">
        <h3 style="color: #041534; font-size: 14px; margin: 0 0 10px 0; font-weight: 700;">🛠️ Living It Out Today</h3>
        <ol style="margin: 0; padding-left: 20px; color: #45464e; font-size: 13px; line-height: 1.6;">
          ${(currentDaily.application || []).map(pt => `<li style="margin-bottom: 4px;">${pt}</li>`).join('')}
        </ol>
      </div>

      <!-- Read on Site CTA (Always directs to deployed production website) -->
      <div style="text-align: center; margin-top: 26px;">
        <a href="https://zionix-nine.vercel.app/verse" style="display: inline-block; background-color: #041534; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 999px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
          Read & Listen on Zionix →
        </a>
      </div>

      <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e5e7eb; padding-top: 16px;">
        <p style="margin: 0;">You received this welcome message because your email was signed in to Zionix.</p>
        <p style="margin: 4px 0 0 0;">Zionix Ministry • "Know Jesus. Know Life."</p>
      </div>
    </div>
  `;

  // 1. Send Welcome Email to user
  try {
    await transporter.sendMail({
      from: `"Zionix Ministry" <${senderAddr}>`,
      to: user.email,
      subject: welcomeSubject,
      html: welcomeHtml
    });
    console.log(`[Welcome Email] Successfully sent welcome email with Daily Bread to: ${user.email}`);
  } catch (err) {
    console.error(`[Welcome Email Error] Failed to send welcome email to ${user.email}:`, err.message);
  }

  // 2. Alert Admin (dineshbabu192006@gmail.com) when a new believer joins
  const adminAlertEmail = 'dineshbabu192006@gmail.com';
  if (isNew && user.email.toLowerCase() !== adminAlertEmail.toLowerCase()) {
    try {
      await transporter.sendMail({
        from: `"Zionix Notification" <${senderAddr}>`,
        to: adminAlertEmail,
        subject: `✨ New Believer Recorded: ${user.name} (${user.email})`,
        html: `
          <div style="font-family: sans-serif; padding: 22px; max-width: 520px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="text-align: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 14px;">
              <h3 style="color: #041534; margin: 0;">✨ New Believer Joined Zionix</h3>
              <p style="color: #755b00; font-size: 12px; font-weight: 700; text-transform: uppercase; margin: 4px 0 0 0;">Email Notification Directory</p>
            </div>
            <p style="color: #334155; font-size: 14px; line-height: 1.5;">
              A new user has signed in and has been recorded in <code>users.json</code> for Daily Bread morning reflections:
            </p>
            <div style="background: #f8fafc; padding: 14px; border-radius: 8px; font-size: 13px; color: #1e293b; line-height: 1.7;">
              <strong>Name:</strong> ${user.name}<br/>
              <strong>Email:</strong> ${user.email}<br/>
              <strong>Joined At:</strong> ${new Date().toLocaleString()}<br/>
              <strong>Daily Bread Status:</strong> Subscribed & Active ✅
            </div>
          </div>
        `
      });
      console.log(`[Admin Alert] Notified admin of new believer: ${user.email}`);
    } catch (err) {
      console.error(`[Admin Alert Error]:`, err.message);
    }
  }

  return { success: true };
}

// On-demand Broadcast API (allows admin to re-send or broadcast anytime from admin portal)
app.post('/api/admin/broadcast-daily-verse', requireAdminAuth, async (req, res) => {
  const currentDaily = readDataFile('dailyVerse.json');
  if (!currentDaily) {
    return res.status(404).json({ error: 'No Daily Bread published yet.' });
  }

  const emailDelivery = await broadcastDailyVerseToUsers(
    currentDaily, 
    req.body.knownUsers || [], 
    req.headers
  );

  res.json({
    success: true,
    message: emailDelivery.sentCount > 0 
      ? `Broadcast complete! Sent to ${emailDelivery.sentCount} believers.`
      : (emailDelivery.transporterConfigured
          ? `Attempted broadcast to ${emailDelivery.totalRecipients} recipients, but failed to send.`
          : 'Mail credentials not configured.'),
    emailDelivery
  });
});

// Admin Email Connection Test API
app.post('/api/admin/test-email', requireAdminAuth, async (req, res) => {
  const transporter = createMailTransporter(req.headers);
  const senderAddr = getMailSenderAddress(req.headers);
  const targetEmail = (req.body.targetEmail || senderAddr).trim();

  if (!transporter) {
    return res.status(400).json({ 
      error: 'Mail credentials (Gmail or SMTP) are not configured. Please enter your Gmail address and 16-character App Password.' 
    });
  }

  try {
    // Send test email
    await transporter.sendMail({
      from: `"Zionix Test" <${senderAddr}>`,
      to: targetEmail,
      subject: '🕊️ Zionix Email Connection Test: Successful!',
      html: `
        <div style="font-family: sans-serif; padding: 24px; max-width: 520px; border: 1px solid #e2e8f0; border-radius: 14px; background: #ffffff;">
          <div style="text-align: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 16px;">
            <h2 style="color: #041534; margin: 0 0 6px 0;">🕊️ Email Connected Successfully</h2>
            <p style="color: #755b00; font-size: 13px; font-weight: 700; text-transform: uppercase; margin: 0;">Zionix Ministry Broadcast System</p>
          </div>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">
            Grace and peace to you! Your email configuration is verified and working properly. Zionix is ready to send Daily Bread reflections individually and privately to all registered believers upon every admin update.
          </p>
          <div style="background-color: #f8fafc; padding: 12px 16px; border-radius: 8px; font-size: 12px; color: #64748b; margin-top: 16px;">
            <strong>Sender:</strong> ${senderAddr}<br/>
            <strong>Recipient:</strong> ${targetEmail}<br/>
            <strong>Verified At:</strong> ${new Date().toLocaleString()}
          </div>
        </div>
      `
    });

    res.json({
      success: true,
      message: `Test email sent successfully to ${targetEmail}!`
    });
  } catch (err) {
    console.error('[Test Email Error]:', err.message);
    let suggestion = '';
    if (err.message.includes('Username and Password not accepted') || err.message.includes('535') || err.message.includes('BadCredentials')) {
      suggestion = 'Gmail requires a 16-character Google App Password (not your normal Google account password). Go to myaccount.google.com/apppasswords with 2-Step Verification enabled to generate one.';
    }
    res.status(500).json({
      error: err.message,
      suggestion
    });
  }
});

// Admin Mail Config Save / Get APIs
app.get('/api/admin/mail-config', requireAdminAuth, (req, res) => {
  const mailConfig = readDataFile('mailConfig.json') || {};
  const user = (mailConfig.user || process.env.GMAIL_USER || process.env.SMTP_USER || '').trim();
  const hasPass = !!(mailConfig.pass || process.env.GMAIL_APP_PASS || process.env.SMTP_PASS);
  res.json({
    configured: !!(user && hasPass),
    user: user ? `${user.slice(0, 3)}***@${user.split('@')[1] || ''}` : '',
    rawUser: user,
    host: mailConfig.host || process.env.SMTP_HOST || 'smtp.gmail.com',
    port: mailConfig.port || process.env.SMTP_PORT || 587
  });
});

app.post('/api/admin/mail-config', requireAdminAuth, (req, res) => {
  const { user, pass, host, port } = req.body;
  const config = {
    user: (user || '').trim(),
    pass: (pass || '').replace(/\s+/g, ''),
    host: (host || 'smtp.gmail.com').trim(),
    port: Number(port) || 587,
    updatedAt: new Date().toISOString()
  };
  writeDataFile('mailConfig.json', config);
  res.json({
    success: true,
    message: 'Mail credentials saved successfully!',
    configured: !!(config.user && config.pass)
  });
});

// Admin endpoint to add believer manually
app.post('/api/admin/users', requireAdminAuth, async (req, res) => {
  const { name, email } = req.body;
  if (!email || !email.includes('@') || !email.includes('.')) {
    return res.status(400).json({ error: 'Valid email address is required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  
  // 1. Permanently upsert believer in Neon PostgreSQL
  const { user: targetUser, isNew } = await upsertUser({
    name: name && name.trim() ? name.trim() : normalizedEmail.split('@')[0],
    email: normalizedEmail
  });

  // Also maintain local file as fallback
  try {
    let usersList = readDataFile('users.json') || [];
    const existingIdx = usersList.findIndex(u => u.email && u.email.toLowerCase() === normalizedEmail);
    if (existingIdx >= 0) {
      usersList[existingIdx] = { ...usersList[existingIdx], ...targetUser };
    } else {
      usersList.push(targetUser);
    }
    writeDataFile('users.json', usersList);
  } catch (err) {}

  const allUsers = await getAllUsers();

  const githubToken = req.headers['x-github-token'] || process.env.GITHUB_TOKEN;
  if (githubToken) {
    commitFileToGitHub('backend/data/users.json', allUsers, `chore(users): Add believer ${normalizedEmail}`, githubToken).catch(() => {});
  }

  // Send Welcome Email with today's Daily Bread reflection
  sendNewUserWelcomeEmail(targetUser, isNew, req.headers).catch(err => {
    console.error('[Admin Add Believer Welcome Error]:', err.message);
  });

  res.json({
    success: true,
    users: allUsers,
    message: `Believer ${normalizedEmail} successfully registered for Daily Bread updates!`
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
      timeZone: 'Asia/Kolkata',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  };

  // 1. Permanently save prayer request to Neon PostgreSQL
  try {
    await insertPrayerRequest(newRequest);
  } catch (dbErr) {
    console.error('[Neon DB] Error saving prayer request:', dbErr.message);
  }

  // Local fallback
  let prayerList = readDataFile('prayerRequests.json') || [];
  prayerList = [newRequest, ...prayerList];
  writeDataFile('prayerRequests.json', prayerList);

  // 1b. Automatically permanently record new believer in Neon users table
  try {
    const { user: recordedUser, isNew } = await upsertUser({
      name: name.trim(),
      email: email.trim().toLowerCase()
    });

    let currentUsers = readDataFile('users.json') || [];
    const normalizedEmail = email.trim().toLowerCase();
    const existingIdx = currentUsers.findIndex(u => u.email && u.email.toLowerCase() === normalizedEmail);
    if (existingIdx === -1) {
      currentUsers.push(recordedUser);
      writeDataFile('users.json', currentUsers);
    }

    if (isNew) {
      console.log(`[Neon DB] New believer permanently recorded from prayer wall: ${recordedUser.email}`);
      sendNewUserWelcomeEmail(recordedUser, true, req.headers).catch(err => {
        console.error('[Prayer User Welcome Error]:', err.message);
      });
    }
  } catch (err) {
    console.error('Error auto-registering user from prayer request:', err.message);
  }

  // 2. Dispatch Email Notification to target admin email: dineshbabu192006@gmail.com
  const transporter = createMailTransporter(req.headers);
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

  let emailDelivered = false;
  if (transporter) {
    const senderAddr = getMailSenderAddress(req.headers);
    try {
      console.log(`[Prayer Wall] Sending prayer email to admin: ${PRAYER_RECIPIENT_EMAIL}...`);
      const sendInfo = await transporter.sendMail({
        from: `"Zionix Prayer Wall" <${senderAddr}>`,
        to: PRAYER_RECIPIENT_EMAIL,
        replyTo: newRequest.email,
        subject: mailSubject,
        html: mailHtml
      });
      emailDelivered = true;
      console.log(`[Prayer Wall] Notification email successfully delivered to admin (${PRAYER_RECIPIENT_EMAIL})! Message ID:`, sendInfo.messageId);
    } catch (err) {
      console.error(`[Prayer Wall] Error sending email via transporter:`, err.message);
    }
  } else {
    console.log(`\n======================================================`);
    console.log(`[PRAYER WALL NOTIFICATION - Transporter Not Configured]`);
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
    requestId: newRequest.id,
    emailDelivered
  });
});

// Admin endpoint to view prayer requests
app.get('/api/admin/prayer-requests', requireAdminAuth, async (req, res) => {
  let prayerList = await getAllPrayers();
  if (!prayerList || prayerList.length === 0) {
    prayerList = readDataFile('prayerRequests.json') || [];
  }
  res.json({ prayerRequests: prayerList, count: prayerList.length });
});

// Google Login API
app.post('/api/auth/google-login', async (req, res) => {
  const { name, email, avatar } = req.body;
  if (!email || !email.trim() || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email address is required' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // 1. Permanently upsert believer in Neon PostgreSQL
  const { user: userProfile, isNew } = await upsertUser({
    name: name && name.trim() ? name.trim() : normalizedEmail.split('@')[0],
    email: normalizedEmail,
    avatar: avatar || (name && name.trim() ? name.trim()[0].toUpperCase() : 'Z')
  });

  // Local fallback
  try {
    let usersList = readDataFile('users.json') || [];
    const existingIdx = usersList.findIndex(u => u.email && u.email.toLowerCase() === normalizedEmail);
    if (existingIdx >= 0) {
      usersList[existingIdx] = { ...usersList[existingIdx], ...userProfile };
    } else {
      usersList.push(userProfile);
    }
    writeDataFile('users.json', usersList);
  } catch (err) {}

  // Sync users to GitHub repository if GITHUB_TOKEN is configured
  const githubToken = process.env.GITHUB_TOKEN;
  if (githubToken && isNew) {
    getAllUsers().then(allUsers => {
      commitFileToGitHub('backend/data/users.json', allUsers, `chore(users): Auto-register new believer ${normalizedEmail}`, githubToken).catch(() => {});
    }).catch(() => {});
  }

  // Send Welcome Email with today's Daily Bread to the user on sign-in if new
  if (isNew) {
    sendNewUserWelcomeEmail(userProfile, true, req.headers).catch(err => {
      console.error(`[Google Login Welcome Email Error]:`, err.message);
    });
  }

  res.json({ 
    success: true, 
    message: isNew 
      ? 'Welcome to Zionix! You are now permanently recorded for Daily Bread email notifications.' 
      : 'Logged in successfully! Your email is recorded for ministry updates.',
    user: userProfile,
    isNewUser: isNew
  });
});

// Daily Bread Email Subscription API
app.post('/api/subscribe', async (req, res) => {
  const { email, name } = req.body;
  if (!email || !email.trim() || !email.includes('@') || !email.includes('.')) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const { user: subscriber, isNew } = await upsertUser({
    name: name && name.trim() ? name.trim() : normalizedEmail.split('@')[0],
    email: normalizedEmail
  });

  try {
    let usersList = readDataFile('users.json') || [];
    const existingIdx = usersList.findIndex(u => u.email && u.email.toLowerCase() === normalizedEmail);
    if (existingIdx >= 0) {
      usersList[existingIdx] = { ...usersList[existingIdx], ...subscriber };
    } else {
      usersList.push(subscriber);
    }
    writeDataFile('users.json', usersList);
  } catch (err) {}

  // Send Welcome Email with today's Daily Bread immediately if new
  if (isNew) {
    sendNewUserWelcomeEmail(subscriber, true, req.headers).catch(err => {
      console.error('[Subscribe Welcome Email Error]:', err.message);
    });
  }

  res.json({
    success: true,
    message: 'You have been successfully registered for Zionix Daily Bread!'
  });
});

// Admin endpoint to view registered users
app.get('/api/admin/users', requireAdminAuth, async (req, res) => {
  let usersList = await getAllUsers();
  if (!usersList || usersList.length === 0) {
    usersList = readDataFile('users.json') || [];
  }
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

