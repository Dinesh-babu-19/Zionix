import { useState, useEffect } from 'react';
import { 
  Lock, 
  User, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  Eye, 
  Edit3, 
  ExternalLink, 
  Sparkles, 
  History, 
  LogOut, 
  Calendar,
  Check,
  BookOpen,
  HeartHandshake,
  Mail,
  RefreshCw,
  Clock,
  ShieldAlert,
  Users,
  Copy
} from 'lucide-react';

export default function AdminDailyVerse() {
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('zionix_admin_token') || '');
  const [adminUser, setAdminUser] = useState(() => localStorage.getItem('zionix_admin_user') || '');
  
  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Editor form state
  const [verse, setVerse] = useState('');
  const [reference, setReference] = useState('');
  const [translation, setTranslation] = useState('English Standard Version');
  const [context, setContext] = useState('');
  const [devotion, setDevotion] = useState('');
  const [appPoint1, setAppPoint1] = useState('');
  const [appPoint2, setAppPoint2] = useState('');
  const [appPoint3, setAppPoint3] = useState('');

  const [recentReflections, setRecentReflections] = useState([]);
  const [prayerRequests, setPrayerRequests] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null);
  const [saveError, setSaveError] = useState('');
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'preview' | 'history' | 'prayers' | 'users'
  
  // Permanent Storage & GitHub Sync state
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('zionix_github_token') || '');
  const [showGitSyncSettings, setShowGitSyncSettings] = useState(false);
  const [copyJsonSuccess, setCopyJsonSuccess] = useState(false);

  const handleExportJson = () => {
    const exportObj = {
      verse: verse.trim(),
      reference: reference.trim(),
      translation: translation.trim() || 'English Standard Version',
      context: context.trim(),
      devotion: devotion.trim(),
      application: [appPoint1.trim(), appPoint2.trim(), appPoint3.trim()],
      updatedAt: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "dailyVerse.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyJson = async () => {
    const exportObj = {
      verse: verse.trim(),
      reference: reference.trim(),
      translation: translation.trim() || 'English Standard Version',
      context: context.trim(),
      devotion: devotion.trim(),
      application: [appPoint1.trim(), appPoint2.trim(), appPoint3.trim()],
      updatedAt: new Date().toISOString()
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(exportObj, null, 2));
      setCopyJsonSuccess(true);
      setTimeout(() => setCopyJsonSuccess(false), 3000);
    } catch (e) {}
  };

  // Format prayer request time accurately according to local timezone
  const formatRequestDate = (req) => {
    if (!req) return 'Recently';

    if (req.submittedAt) {
      const d = new Date(req.submittedAt);
      if (!isNaN(d.getTime())) {
        return d.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      }
    }

    if (req.id && typeof req.id === 'string' && req.id.startsWith('prayer-')) {
      const ts = parseInt(req.id.replace('prayer-', ''), 10);
      if (!isNaN(ts) && ts > 1000000000000) {
        const d = new Date(ts);
        return d.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      }
    }

    return req.formattedDate || 'Recently';
  };

  // Fetch current daily verse & prayer requests if authenticated
  const loadAdminData = () => {
    if (!authToken) return;

    setIsLoadingData(true);
    Promise.all([
      fetch('/api/admin/daily-verse', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }).then(res => res.json()).catch(() => ({})),
      fetch('/api/admin/prayer-requests', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }).then(res => res.json()).catch(() => ({})),
      fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }).then(res => res.json()).catch(() => ({ users: [] }))
    ])
      .then(([dailyData, prayerData, usersData]) => {
        // If token expired, cleanly log out and redirect to login card
        if (dailyData?.error?.toLowerCase().includes('token') || prayerData?.error?.toLowerCase().includes('token')) {
          handleSignOut();
          setLoginError('Your session has expired. Please sign in again.');
          setIsLoadingData(false);
          return;
        }

        if (dailyData?.dailyVerse) {
          setVerse(dailyData.dailyVerse.verse || '');
          setReference(dailyData.dailyVerse.reference || '');
          setTranslation(dailyData.dailyVerse.translation || 'English Standard Version');
          setContext(dailyData.dailyVerse.context || '');
          setDevotion(dailyData.dailyVerse.devotion || '');
          if (Array.isArray(dailyData.dailyVerse.application)) {
            setAppPoint1(dailyData.dailyVerse.application[0] || '');
            setAppPoint2(dailyData.dailyVerse.application[1] || '');
            setAppPoint3(dailyData.dailyVerse.application[2] || '');
          }
        }
        if (Array.isArray(dailyData?.recentReflections)) {
          setRecentReflections(dailyData.recentReflections);
        }
        if (Array.isArray(prayerData?.prayerRequests)) {
          setPrayerRequests(prayerData.prayerRequests);
        }
        if (Array.isArray(usersData?.users)) {
          setRegisteredUsers(usersData.users);
        }
        setIsLoadingData(false);
      })
      .catch(err => {
        console.error('Error fetching admin data:', err);
        setIsLoadingData(false);
      });
  };

  useEffect(() => {
    loadAdminData();
  }, [authToken]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername.trim(),
          password: loginPassword
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid credentials');
      }

      localStorage.setItem('zionix_admin_token', data.token);
      localStorage.setItem('zionix_admin_user', data.user?.username || 'dineshbabu19');
      setAuthToken(data.token);
      setAdminUser(data.user?.username || 'dineshbabu19');
    } catch (err) {
      setLoginError(err.message || 'Login failed. Please verify username and password.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('zionix_admin_token');
    localStorage.removeItem('zionix_admin_user');
    setAuthToken('');
    setAdminUser('');
    setLoginPassword('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess(null);

    // Validate living it out 3 points
    if (!verse.trim() || !reference.trim() || !context.trim() || !devotion.trim()) {
      setSaveError('Please fill in Verse of the Day, Reference, Context, and Morning Reflection.');
      return;
    }

    if (!appPoint1.trim() || !appPoint2.trim() || !appPoint3.trim()) {
      setSaveError('Living It Out requires all 3 points to be filled in.');
      return;
    }

    setIsSaving(true);

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      };
      if (githubToken && githubToken.trim()) {
        headers['x-github-token'] = githubToken.trim();
        localStorage.setItem('zionix_github_token', githubToken.trim());
      }

      const res = await fetch('/api/admin/daily-verse', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          verse: verse.trim(),
          reference: reference.trim(),
          translation: translation.trim() || 'English Standard Version',
          context: context.trim(),
          devotion: devotion.trim(),
          application: [appPoint1.trim(), appPoint2.trim(), appPoint3.trim()]
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save changes');
      }

      // Persist permanently in client browser storage
      if (data.dailyVerse) {
        localStorage.setItem('zionix_custom_daily_verse', JSON.stringify(data.dailyVerse));
      }

      if (data.githubSync && data.githubSync.success) {
        setSaveSuccess(`Daily Bread published & permanently committed to GitHub repository! (Commit: ${data.githubSync.commitSha?.slice(0, 7)})`);
      } else {
        setSaveSuccess('Daily Bread has been updated & permanently saved! Previous verse has been archived into reflections history.');
      }

      if (Array.isArray(data.recentReflections)) {
        setRecentReflections(data.recentReflections);
      }
      setTimeout(() => {
        setSaveSuccess(null);
      }, 6000);
    } catch (err) {
      setSaveError(err.message || 'Failed to update Daily Bread. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // If not logged in, render the login card
  if (!authToken) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/60 shadow-lg rounded-2xl p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center mb-4 shadow-md">
              <Lock size={26} />
            </div>
            <h1 className="font-headline-sm text-2xl font-bold text-primary">Developer Portal</h1>
            <p className="text-on-surface-variant text-sm mt-1">
              Private access for Daily Bread management
            </p>
          </div>

          {loginError && (
            <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/30 text-error flex items-center gap-3 text-sm">
              <AlertCircle size={18} className="shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5 text-left">
            <div>
              <label className="block font-label-caps text-xs uppercase tracking-wider text-on-surface-variant font-semibold mb-2">
                Developer Username
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
                <input 
                  type="text" 
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Enter username (e.g. dineshbabu19)"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block font-label-caps text-xs uppercase tracking-wider text-on-surface-variant font-semibold mb-2">
                Developer Password
              </label>
              <div className="relative">
                <Key size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
                <input 
                  type="password" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter developer password"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 px-4 bg-primary text-white rounded-xl font-label-caps text-xs uppercase tracking-widest hover:bg-primary-container transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {isLoggingIn ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <Lock size={16} />
                  <span>Access Admin Portal</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-outline-variant/30 text-center">
            <span className="text-xs text-on-surface-variant/70">
              Zionix Developer Console • Direct URL Only
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Admin Navigation Bar */}
      <header className="bg-surface border-b border-outline-variant/40 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline-sm font-bold text-primary text-base">Zionix Developer Console</span>
                <span className="bg-secondary/15 text-secondary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Daily Bread Admin
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant">Logged in as: <strong className="text-primary">{adminUser}</strong></p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a 
              href="/verse" 
              target="_blank" 
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
            >
              <ExternalLink size={14} />
              View Live Page
            </a>
            <button 
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Banner Messages */}
        {saveSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 flex items-start gap-3 shadow-sm animate-fade-in">
            <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">Update Successful!</p>
              <p className="text-green-700 mt-0.5">{saveSuccess}</p>
            </div>
          </div>
        )}

        {saveError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 shadow-sm">
            <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">Validation Error</p>
              <p className="text-red-700 mt-0.5">{saveError}</p>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex items-center justify-between border-b border-outline-variant/40 pb-4 mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-2 bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/40 overflow-x-auto no-scrollbar max-w-full">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold font-label-caps uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'editor' 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <Edit3 size={14} />
              Editor Form
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold font-label-caps uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'preview' 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <Eye size={14} />
              Live Preview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold font-label-caps uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'history' 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <History size={14} />
              5-Day History ({recentReflections.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('prayers')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold font-label-caps uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'prayers' 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <HeartHandshake size={14} />
              Prayer Requests ({prayerRequests.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold font-label-caps uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'users' 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <Users size={14} />
              Believers ({registeredUsers.length})
            </button>
          </div>

          <div className="text-xs text-on-surface-variant">
            Target Email: <strong className="text-primary font-mono">dineshbabu192006@gmail.com</strong>
          </div>
        </div>

        {isLoadingData ? (
          <div className="py-20 text-center text-on-surface-variant">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-3"></div>
            <p className="text-sm font-medium">Loading Daily Bread content...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: EDITOR FORM */}
            {activeTab === 'editor' && (
              <form onSubmit={handleSave} className="space-y-8 text-left">
                {/* Section A: Scripture Verse of the Day */}
                <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-2 mb-6 border-b border-outline-variant/30 pb-4">
                    <span className="w-8 h-8 rounded-full bg-secondary/15 text-secondary flex items-center justify-center font-bold text-xs">
                      01
                    </span>
                    <div>
                      <h2 className="font-headline-sm text-lg font-bold text-primary">Verse of the Day & Scripture Reference</h2>
                      <p className="text-xs text-on-surface-variant">The central anchor verse displayed in the hero section.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-12">
                      <label className="block font-label-caps text-xs uppercase tracking-wider text-primary font-semibold mb-2">
                        Verse of the Day (Scripture Quotation) <span className="text-error">*</span>
                      </label>
                      <textarea
                        rows={3}
                        value={verse}
                        onChange={(e) => setVerse(e.target.value)}
                        placeholder="e.g. And we know that for those who love God all things work together for good, for those who are called according to his purpose."
                        required
                        className="w-full p-4 bg-surface border border-outline-variant rounded-xl text-base font-verse-quote italic leading-relaxed focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>

                    <div className="md:col-span-6">
                      <label className="block font-label-caps text-xs uppercase tracking-wider text-primary font-semibold mb-2">
                        Verse Number / Reference <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        placeholder="e.g. Romans 8:28 or John 3:16"
                        required
                        className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>

                    <div className="md:col-span-6">
                      <label className="block font-label-caps text-xs uppercase tracking-wider text-primary font-semibold mb-2">
                        Bible Translation
                      </label>
                      <input
                        type="text"
                        value={translation}
                        onChange={(e) => setTranslation(e.target.value)}
                        placeholder="e.g. English Standard Version"
                        className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Section B: The Context */}
                <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-2 mb-6 border-b border-outline-variant/30 pb-4">
                    <span className="w-8 h-8 rounded-full bg-secondary/15 text-secondary flex items-center justify-center font-bold text-xs">
                      02
                    </span>
                    <div>
                      <h2 className="font-headline-sm text-lg font-bold text-primary flex items-center gap-2">
                        <History className="text-secondary" size={18} />
                        The Context
                      </h2>
                      <p className="text-xs text-on-surface-variant">Historical background, author intent, and surrounding scriptural passage.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block font-label-caps text-xs uppercase tracking-wider text-primary font-semibold mb-2">
                      Context Explanation <span className="text-error">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="Explain the background circumstances, who wrote the verse, to whom, and under what conditions..."
                      required
                      className="w-full p-4 bg-surface border border-outline-variant rounded-xl text-sm leading-relaxed focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                {/* Section C: Morning Reflection */}
                <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-2 mb-6 border-b border-outline-variant/30 pb-4">
                    <span className="w-8 h-8 rounded-full bg-secondary/15 text-secondary flex items-center justify-center font-bold text-xs">
                      03
                    </span>
                    <div>
                      <h2 className="font-headline-sm text-lg font-bold text-primary flex items-center gap-2">
                        <Sparkles className="text-secondary" size={18} />
                        Morning Reflection
                      </h2>
                      <p className="text-xs text-on-surface-variant">Devotional message providing spiritual warmth and theological illumination.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block font-label-caps text-xs uppercase tracking-wider text-primary font-semibold mb-2">
                      Devotional Reflection <span className="text-error">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={devotion}
                      onChange={(e) => setDevotion(e.target.value)}
                      placeholder="Write the morning reflection inspiring the believer's walk today..."
                      required
                      className="w-full p-4 bg-surface border border-outline-variant rounded-xl text-sm leading-relaxed italic focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                {/* Section D: Living It Out (Only 3 Points) */}
                <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-6 border-b border-outline-variant/30 pb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-secondary/15 text-secondary flex items-center justify-center font-bold text-xs">
                        04
                      </span>
                      <div>
                        <h2 className="font-headline-sm text-lg font-bold text-primary flex items-center gap-2">
                          <span className="material-symbols-outlined text-secondary text-xl">handyman</span>
                          Living It Out (Strictly 3 Points)
                        </h2>
                        <p className="text-xs text-on-surface-variant">Three direct action steps for believers to apply today.</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-secondary bg-secondary/10 px-3 py-1 rounded-full uppercase tracking-wider">
                      3 Points Required
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* Point 1 */}
                    <div className="p-4 bg-surface rounded-xl border border-outline-variant/40">
                      <label className="block font-label-caps text-xs uppercase tracking-wider text-primary font-bold mb-1.5 flex items-center gap-2">
                        <span className="text-secondary">01.</span> First Action Point <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        value={appPoint1}
                        onChange={(e) => setAppPoint1(e.target.value)}
                        placeholder="e.g. Identify one current struggle in your life and surrender it to God today."
                        required
                        className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    {/* Point 2 */}
                    <div className="p-4 bg-surface rounded-xl border border-outline-variant/40">
                      <label className="block font-label-caps text-xs uppercase tracking-wider text-primary font-bold mb-1.5 flex items-center gap-2">
                        <span className="text-secondary">02.</span> Second Action Point <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        value={appPoint2}
                        onChange={(e) => setAppPoint2(e.target.value)}
                        placeholder="e.g. Look back at a past trial that produced spiritual fruit, and thank God for His faithfulness."
                        required
                        className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    {/* Point 3 */}
                    <div className="p-4 bg-surface rounded-xl border border-outline-variant/40">
                      <label className="block font-label-caps text-xs uppercase tracking-wider text-primary font-bold mb-1.5 flex items-center gap-2">
                        <span className="text-secondary">03.</span> Third Action Point <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        value={appPoint3}
                        onChange={(e) => setAppPoint3(e.target.value)}
                        placeholder="e.g. Encourage someone else who is struggling by sharing the hope of God's sovereignty."
                        required
                        className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Permanent Storage & Cloud Sync Card */}
                <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                        <Sparkles size={16} className="text-secondary" />
                        Permanent Cloud Sync & Codebase Persistence
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-1">
                        All changes are automatically saved to server memory, local disk, and temporary cloud storage.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={handleCopyJson}
                        className="px-3.5 py-1.5 bg-surface-container hover:bg-surface-container-high text-primary border border-outline-variant rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        {copyJsonSuccess ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                        <span>{copyJsonSuccess ? 'Copied JSON!' : 'Copy JSON'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleExportJson}
                        className="px-3.5 py-1.5 bg-surface-container hover:bg-surface-container-high text-primary border border-outline-variant rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span>📥 Export dailyVerse.json</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowGitSyncSettings(!showGitSyncSettings)}
                        className={`px-3.5 py-1.5 border rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          githubToken 
                            ? 'bg-green-50 text-green-800 border-green-300' 
                            : 'bg-surface-container text-primary border-outline-variant'
                        }`}
                      >
                        <Key size={14} />
                        <span>{githubToken ? 'GitHub Token Linked' : 'Link GitHub Token'}</span>
                      </button>
                    </div>
                  </div>

                  {showGitSyncSettings && (
                    <div className="mt-4 pt-4 border-t border-outline-variant/30 text-left space-y-3 animate-fade-in">
                      <p className="text-xs text-on-surface-variant">
                        To commit changes directly to the <strong>Dinesh-babu-19/Zionix</strong> GitHub repository so they remain permanent forever across every Vercel redeployment, enter your GitHub Personal Access Token (PAT) with <code>repo</code> scope below:
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          value={githubToken}
                          onChange={(e) => {
                            setGithubToken(e.target.value);
                            localStorage.setItem('zionix_github_token', e.target.value);
                          }}
                          placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                          className="flex-1 px-4 py-2 bg-surface border border-outline-variant rounded-lg text-xs font-mono focus:outline-none focus:border-primary"
                        />
                        {githubToken && (
                          <button
                            type="button"
                            onClick={() => {
                              setGithubToken('');
                              localStorage.removeItem('zionix_github_token');
                            }}
                            className="px-3 py-2 text-xs text-error hover:bg-error/10 rounded-lg font-semibold"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <span className="text-[11px] text-on-surface-variant/70 block">
                        🔒 Token is stored locally in your browser and used only to commit <code>dailyVerse.json</code> when you click Publish.
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Action Toolbar */}
                <div className="sticky bottom-6 bg-surface/90 backdrop-blur-md border border-outline-variant/60 p-4 rounded-2xl shadow-xl flex items-center justify-between flex-wrap gap-4 z-30">
                  <div className="text-xs text-on-surface-variant flex items-center gap-2">
                    <Check size={16} className="text-green-600" />
                    <span>All changes will immediately reflect on the public <strong>Daily Bread</strong> page.</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('preview')}
                      className="px-5 py-2.5 bg-surface-container hover:bg-surface-container-high text-primary rounded-xl font-label-caps text-xs uppercase tracking-wider transition-all font-semibold cursor-pointer"
                    >
                      Preview First
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-7 py-2.5 bg-primary hover:bg-primary-container text-white rounded-xl font-label-caps text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2 font-bold"
                    >
                      {isSaving ? (
                        <span>Publishing...</span>
                      ) : (
                        <>
                          <Save size={16} />
                          <span>Publish Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* TAB 2: LIVE PREVIEW */}
            {activeTab === 'preview' && (
              <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl overflow-hidden shadow-lg text-left">
                <div className="bg-surface-container-low px-6 py-3 border-b border-outline-variant/40 flex items-center justify-between">
                  <span className="text-xs font-bold font-label-caps uppercase tracking-wider text-secondary flex items-center gap-1.5">
                    <Eye size={14} /> Live Mockup Preview
                  </span>
                  <button 
                    onClick={() => setActiveTab('editor')}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Return to Editor
                  </button>
                </div>

                {/* Simulated Hero */}
                <div className="py-16 px-6 text-center bg-gradient-heaven border-b border-outline-variant/30">
                  <span className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-secondary mb-3 block text-xs font-semibold">
                    Verse of the Day
                  </span>
                  <h1 className="font-display-lg text-3xl md:text-5xl italic text-primary leading-tight mb-4 font-semibold max-w-3xl mx-auto">
                    "{verse || 'Your verse quotation will appear here...'}"
                  </h1>
                  <p className="font-headline-sm text-lg text-on-surface-variant font-medium">
                    {reference || 'Book Reference'}
                  </p>
                  <span className="inline-block mt-2 px-3 py-1 border border-outline-variant text-[10px] font-bold tracking-widest uppercase text-on-surface-variant rounded-full">
                    {translation || 'English Standard Version'}
                  </span>
                </div>

                {/* Simulated Content */}
                <div className="p-6 md:p-12 space-y-10 max-w-4xl mx-auto">
                  {/* The Context */}
                  <div className="space-y-3">
                    <h2 className="font-headline-md text-2xl text-primary flex items-center gap-2 font-semibold">
                      <History className="text-secondary" size={22} />
                      The Context
                    </h2>
                    <p className="font-body-lg text-base text-on-surface-variant leading-relaxed">
                      {context || 'Context text will display here.'}
                    </p>
                  </div>

                  {/* Morning Reflection */}
                  <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl space-y-3">
                    <h2 className="font-headline-md text-2xl text-primary flex items-center gap-2 font-semibold">
                      <Sparkles className="text-secondary" size={22} />
                      Morning Reflection
                    </h2>
                    <p className="font-body-lg text-base text-on-surface-variant leading-relaxed italic">
                      {devotion || 'Devotional reflection will appear here.'}
                    </p>
                  </div>

                  {/* Living It Out */}
                  <div className="space-y-3 border-l-2 border-secondary pl-6">
                    <h2 className="font-headline-md text-2xl text-primary flex items-center gap-2 font-semibold">
                      <span className="material-symbols-outlined text-secondary">handyman</span>
                      Living It Out
                    </h2>
                    <ul className="space-y-3 font-body-lg text-base text-on-surface-variant">
                      <li className="flex gap-4 items-start">
                        <span className="text-secondary font-bold">01.</span>
                        <span>{appPoint1 || 'First practical point'}</span>
                      </li>
                      <li className="flex gap-4 items-start">
                        <span className="text-secondary font-bold">02.</span>
                        <span>{appPoint2 || 'Second practical point'}</span>
                      </li>
                      <li className="flex gap-4 items-start">
                        <span className="text-secondary font-bold">03.</span>
                        <span>{appPoint3 || 'Third practical point'}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: 5-DAY HISTORY */}
            {activeTab === 'history' && (
              <div className="space-y-6 text-left">
                <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-6 border-b border-outline-variant/30 pb-4 flex-wrap gap-2">
                    <div>
                      <h2 className="font-headline-sm text-xl font-bold text-primary flex items-center gap-2">
                        <History className="text-secondary" size={22} />
                        Recent Reflections Archive (Past 5 Days)
                      </h2>
                      <p className="text-xs text-on-surface-variant mt-1">
                        Every time you publish a new Daily Bread verse, the previous active verse is automatically archived here for up to 5 days.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-primary bg-surface-container px-3 py-1.5 rounded-lg">
                      {recentReflections.length} / 5 Days Stored
                    </span>
                  </div>

                  {recentReflections.length === 0 ? (
                    <div className="py-12 text-center text-on-surface-variant text-sm">
                      No previous reflections archived yet. Publish your next verse to begin building history!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recentReflections.map((item, index) => (
                        <div 
                          key={item.id || index}
                          className="bg-surface p-5 border border-outline-variant/50 rounded-xl flex flex-col justify-between hover:border-secondary transition-all"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-bold text-secondary uppercase tracking-widest flex items-center gap-1">
                                <Calendar size={12} />
                                {item.label || `${index + 1} Day(s) Ago`}
                              </span>
                              <span className="text-[10px] text-on-surface-variant/70 font-mono">
                                {item.date || ''}
                              </span>
                            </div>
                            <blockquote className="font-verse-quote italic text-primary text-sm leading-relaxed mb-3">
                              "{item.verse}"
                            </blockquote>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-outline-variant/30">
                            <span className="font-label-caps text-xs font-bold text-on-surface-variant">
                              {item.reference}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-on-surface-variant/70">
                              {item.translation || 'ESV'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: PRAYER REQUESTS INBOX */}
            {activeTab === 'prayers' && (
              <div className="space-y-6 text-left">
                {/* Top Controls & Status Card */}
                <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-6 border-b border-outline-variant/30 pb-4 flex-wrap gap-4">
                    <div>
                      <h2 className="font-headline-sm text-xl font-bold text-primary flex items-center gap-2">
                        <HeartHandshake className="text-secondary" size={24} />
                        Prayer Requests Inbox
                      </h2>
                      <p className="text-xs text-on-surface-variant mt-1">
                        All prayer points submitted from the public <strong className="text-primary">Prayer Wall</strong> are logged here and dispatched to <strong className="text-primary">dineshbabu192006@gmail.com</strong>.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={loadAdminData}
                        className="px-4 py-2 bg-surface border border-outline-variant/60 rounded-xl text-xs font-bold text-primary hover:bg-surface-container transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                      >
                        <RefreshCw size={14} /> Refresh Inbox
                      </button>
                      <span className="text-xs font-bold text-secondary bg-secondary/15 px-3 py-2 rounded-xl">
                        {prayerRequests.length} Total Requests
                      </span>
                    </div>
                  </div>

                  {/* Prayer Requests List */}
                  {prayerRequests.length === 0 ? (
                    <div className="py-16 text-center text-on-surface-variant text-sm">
                      No prayer requests received yet. Submissions from the Prayer Wall will appear here in real-time.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {prayerRequests.map((req, idx) => (
                        <div 
                          key={req.id || idx}
                          className="bg-surface p-6 border border-outline-variant/50 hover:border-secondary/60 rounded-2xl transition-all shadow-sm space-y-4"
                        >
                          <div className="flex items-start justify-between flex-wrap gap-2 border-b border-outline-variant/30 pb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-divine text-white font-bold flex items-center justify-center text-sm shadow-sm">
                                {req.name ? req.name[0].toUpperCase() : 'P'}
                              </div>
                              <div>
                                <h3 className="font-bold text-primary text-base flex items-center gap-2">
                                  {req.name}
                                  <span className="text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
                                    {req.category || 'General Prayer'}
                                  </span>
                                </h3>
                                <p className="text-xs text-on-surface-variant font-mono mt-0.5">
                                  {req.email}
                                </p>
                              </div>
                            </div>

                            <div className="text-right text-xs">
                              <span className="text-[11px] text-primary/80 font-mono font-semibold block">
                                {formatRequestDate(req)}
                              </span>
                              {req.isPrivate ? (
                                <span className="inline-block mt-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full uppercase">
                                  🔒 Private Request
                                </span>
                              ) : (
                                <span className="inline-block mt-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full uppercase">
                                  🌐 Open Prayer
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Prayer Points Content */}
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary block mb-1">
                              Prayer Points & Burdens:
                            </span>
                            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 text-sm text-primary leading-relaxed whitespace-pre-wrap font-sans">
                              {req.prayerPoints}
                            </div>
                          </div>

                          {/* Action Toolbar */}
                          <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20 flex-wrap gap-2">
                            <span className="text-[11px] text-on-surface-variant/70">
                              ID: <code className="font-mono">{req.id}</code>
                            </span>

                            <a
                              href={`mailto:${req.email}?subject=${encodeURIComponent(`We are praying for you - Zionix Prayer Team`)}&body=${encodeURIComponent(`Dear ${req.name},\n\nWe received your prayer request regarding "${req.category}". Our prayer team at Zionix is lifting your needs before the Lord Jesus today.\n\n"The Lord bless you and keep you; the Lord make his face shine on you and be gracious to you." — Numbers 6:24-25\n\nIn Christ,\nZionix Prayer Ministry`)}`}
                              className="px-4 py-2 bg-primary hover:bg-primary-container text-white rounded-xl text-xs font-bold font-label-caps uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                            >
                              <Mail size={13} /> Reply via Email
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: REGISTERED BELIEVERS & SUBSCRIBERS */}
            {activeTab === 'users' && (
              <div className="space-y-6 text-left">
                <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-6 border-b border-outline-variant/30 pb-4 flex-wrap gap-4">
                    <div>
                      <h2 className="font-headline-sm text-xl font-bold text-primary flex items-center gap-2">
                        <Users className="text-secondary" size={22} />
                        Believers & Subscribers Receiving Daily Bread
                      </h2>
                      <p className="text-xs text-on-surface-variant mt-1">
                        Every believer in this directory receives morning reflections individually and privately.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3.5 py-1 bg-secondary/15 text-secondary border border-secondary/30 rounded-full text-xs font-bold uppercase tracking-wider font-label-caps">
                        {registeredUsers.length} Active Believers
                      </span>
                    </div>
                  </div>

                  {registeredUsers.length === 0 ? (
                    <div className="py-16 text-center text-on-surface-variant bg-surface rounded-2xl border border-dashed border-outline-variant/60">
                      <Users size={36} className="mx-auto mb-3 opacity-40 text-secondary" />
                      <p className="font-medium text-base text-primary">No registered believers found yet.</p>
                      <p className="text-xs text-on-surface-variant mt-1">
                        Users who subscribe or submit prayer requests will automatically appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-outline-variant/40 text-xs font-bold text-primary uppercase font-label-caps tracking-wider">
                            <th className="py-3 px-4">Believer</th>
                            <th className="py-3 px-4">Email Address</th>
                            <th className="py-3 px-4">Daily Bread Status</th>
                            <th className="py-3 px-4">Joined / Subscribed</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20">
                          {registeredUsers.map((usr, i) => (
                            <tr key={usr.id || i} className="hover:bg-surface/60 transition-colors">
                              <td className="py-3.5 px-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center shadow-sm">
                                  {usr.name ? usr.name[0].toUpperCase() : 'Z'}
                                </div>
                                <span className="font-bold text-primary">{usr.name || 'Believer'}</span>
                              </td>
                              <td className="py-3.5 px-4 font-mono text-xs text-on-surface-variant font-semibold">
                                {usr.email}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                                  <Check size={12} /> Active Subscriber
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-xs text-on-surface-variant font-mono">
                                {usr.joinedAt ? new Date(usr.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
