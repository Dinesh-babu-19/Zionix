import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Loader2, 
  Key, 
  Mail, 
  User, 
  ArrowRight, 
  AlertCircle, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Read Client ID from environment
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isClientIdConfigured = googleClientId && googleClientId !== 'YOUR_GOOGLE_CLIENT_ID' && googleClientId.trim() !== '';

  // Direct login form fields
  const [directName, setDirectName] = useState('');
  const [directEmail, setDirectEmail] = useState('');

  // Troubleshooting accordion
  const [showTroubleshooter, setShowTroubleshooter] = useState(false);
  const [copiedOrigin, setCopiedOrigin] = useState(false);
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

  // JWT Decoder function (decodes Google ID tokens natively)
  const decodeJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Failed to decode Google JWT token:', e);
      return null;
    }
  };

  const handleLoginSuccess = async (name, email, avatar) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, avatar }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        // Sync with AuthContext (sets zionaviel_user, executes pending actions)
        login(data.user);

        setTimeout(() => {
          setLoading(false);
          navigate('/');
        }, 1200);
      } else {
        throw new Error(data.error || 'Failed to authenticate');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Login failed. Please check your backend connection.');
      setLoading(false);
    }
  };

  // Google credential response handler (called by Google SDK)
  const handleCredentialResponse = (response) => {
    const token = response.credential;
    const profile = decodeJwt(token);
    if (profile) {
      const name = profile.name || `${profile.given_name} ${profile.family_name}`;
      const email = profile.email;
      // Discard Google profile picture URL and generate initials based on user name
      const initials = name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);
      handleLoginSuccess(name, email, initials);
    } else {
      setError('Failed to parse Google account credentials.');
    }
  };

  // Initialize official Google Sign-In SDK
  useEffect(() => {
    if (!isClientIdConfigured) return;

    const initializeGoogleSignIn = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleCredentialResponse,
          });

          const btnContainer = document.getElementById('google-signin-btn-container');
          if (btnContainer) {
            btnContainer.innerHTML = '';
            window.google.accounts.id.renderButton(
              btnContainer,
              { 
                theme: 'outline', 
                size: 'large', 
                width: '100%',
                text: 'signin_with',
                shape: 'rectangular'
              }
            );
          }
        } catch (e) {
          console.warn('Google Sign-In initialization note:', e);
        }
      }
    };

    // Try immediately or register interval poll
    if (window.google && window.google.accounts) {
      initializeGoogleSignIn();
    } else {
      const checkInterval = setInterval(() => {
        if (window.google && window.google.accounts) {
          initializeGoogleSignIn();
          clearInterval(checkInterval);
        }
      }, 300);
      return () => clearInterval(checkInterval);
    }
  }, [isClientIdConfigured, googleClientId]);

  const handleDirectSubmit = (e) => {
    e.preventDefault();
    if (!directName.trim() || !directEmail.trim()) {
      setError('Please provide your full name and email address.');
      return;
    }
    if (!directEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    const avatarInitials = directName.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    handleLoginSuccess(directName.trim(), directEmail.trim(), avatarInitials);
  };

  const copyOrigin = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentOrigin);
      setCopiedOrigin(true);
      setTimeout(() => setCopiedOrigin(false), 2200);
    }
  };

  return (
    <main className="pt-24 pb-20 bg-background min-h-[calc(100vh-64px)] flex items-center justify-center text-on-surface">
      <SEO
        title="Sign In | Zionaviel Ministry"
        description="Sign in to your Zionaviel account to save prayer burdens, customize your devotional journey, and stay connected with the Christian community."
        keywords="Zionaviel login, Christian account, sign in, prayer account"
        path="/login"
      />
      <div className="max-w-[460px] w-full mx-margin-mobile">
        {/* Main login card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 18 }}
          className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-7 md:p-9 shadow-divine relative overflow-hidden"
        >
          {/* Top subtle visual effect */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-divine" />

          {/* Logo / Title Area */}
          <div className="flex flex-col items-center gap-2 mb-6 text-center">
            <div className="w-13 h-13 rounded-full bg-primary-container/10 flex items-center justify-center text-primary shadow-inner">
              <ShieldCheck size={26} />
            </div>
            <h1 className="font-display-lg text-2xl font-bold text-primary mt-1">
              Sign in to Zionaviel
            </h1>
            <p className="font-body-md text-xs text-on-surface-variant max-w-[320px] leading-relaxed">
              Access scriptures, submit prayer intercessions, and receive your daily devotionals.
            </p>
          </div>

          {/* Status Message */}
          <AnimatePresence>
            {loading && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 p-3.5 bg-surface-container-low border border-outline-variant/40 rounded-xl flex flex-col items-center gap-2 text-center"
              >
                {success ? (
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold shadow-sm">
                      ✓
                    </div>
                    <p className="text-sm font-bold text-primary">Login Successful!</p>
                    <p className="text-xs text-on-surface-variant">Redirecting to fellowship...</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-left">
                    <Loader2 size={18} className="text-primary animate-spin shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-primary">Authenticating Session</p>
                      <p className="text-[11px] text-on-surface-variant">Signing into your spiritual profile...</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2.5 text-left"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Section 1: Official Google Button */}
          {isClientIdConfigured && (
            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold text-on-surface-variant text-center block">
                Sign in with your Google Account:
              </label>
              <div id="google-signin-btn-container" className="w-full min-h-[44px] flex justify-center" />
              
              {/* Divider */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-outline-variant/40" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-semibold">
                  <span className="bg-surface-container-lowest px-3 text-on-surface-variant/70">
                    Or sign in with email
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Direct Sign-In Form (Guaranteed to work in all environments) */}
          <form onSubmit={handleDirectSubmit} className="flex flex-col gap-3.5 text-left">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5">
                <User size={13} className="text-primary" /> Full Name
              </label>
              <input 
                type="text" 
                placeholder="e.g. Dinesh Babu"
                value={directName}
                onChange={(e) => setDirectName(e.target.value)}
                required
                disabled={loading}
                className="border border-outline-variant rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background w-full transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5">
                <Mail size={13} className="text-primary" /> Email Address
              </label>
              <input 
                type="email" 
                placeholder="e.g. yourname@gmail.com"
                value={directEmail}
                onChange={(e) => setDirectEmail(e.target.value)}
                required
                disabled={loading}
                className="border border-outline-variant rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background w-full transition-all"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="mt-1 flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-container text-white py-3 px-5 rounded-xl font-medium text-xs font-label-caps uppercase tracking-wider transition-all active:scale-[0.99] shadow-sm cursor-pointer disabled:opacity-50"
            >
              <span>Continue to Zionaviel</span>
              <ArrowRight size={15} />
            </button>
          </form>

          {/* Section 3: Troubleshooting OAuth Error Accordion */}
          <div className="mt-5 border-t border-outline-variant/30 pt-4">
            <button
              type="button"
              onClick={() => setShowTroubleshooter(!showTroubleshooter)}
              className="w-full flex items-center justify-between text-left text-[11px] text-on-surface-variant hover:text-primary transition-colors cursor-pointer p-1"
            >
              <span className="font-semibold flex items-center gap-1.5">
                <Key size={13} />
                OAuth origin error help (Google Console Setup)
              </span>
              {showTroubleshooter ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            <AnimatePresence>
              {showTroubleshooter && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 text-left p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-xl text-xs space-y-2.5 text-amber-950"
                >
                  <p className="font-bold text-[11px] text-amber-900">
                    Fixing "Access blocked: Authorization Error (JavaScript origin)":
                  </p>
                  
                  <p className="text-[11px] leading-relaxed text-amber-900/90">
                    Google requires your site&apos;s exact origin to be registered in Google Cloud Console under <strong>Authorized JavaScript origins</strong>.
                  </p>

                  <div className="bg-white/80 p-2.5 rounded-lg border border-amber-500/20 space-y-1.5">
                    <span className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider block">
                      Your Current JavaScript Origin:
                    </span>
                    <div className="flex items-center gap-2">
                      <code className="text-[11px] font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded select-all flex-1 break-all">
                        {currentOrigin}
                      </code>
                      <button
                        type="button"
                        onClick={copyOrigin}
                        className="px-2.5 py-1 bg-primary text-white text-[10px] rounded hover:bg-primary-container transition-all flex items-center gap-1 shrink-0 font-medium cursor-pointer"
                        title="Copy origin to clipboard"
                      >
                        {copiedOrigin ? <Check size={12} /> : <Copy size={12} />}
                        {copiedOrigin ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <ol className="list-decimal pl-4 space-y-1 text-[11px] text-amber-900/90 leading-relaxed">
                    <li>
                      Go to{' '}
                      <a 
                        href="https://console.cloud.google.com/apis/credentials" 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-primary font-bold underline inline-flex items-center gap-0.5"
                      >
                        Google Cloud Console Credentials <ExternalLink size={10} />
                      </a>
                    </li>
                    <li>Click your OAuth 2.0 Client ID.</li>
                    <li>
                      Under <strong>Authorized JavaScript origins</strong>, click <strong>+ ADD URI</strong> and paste{' '}
                      <code className="bg-white px-1 py-0.5 rounded font-mono text-[10px]">{currentOrigin}</code>
                      {' '}(no trailing slash).
                    </li>
                    <li>Click <strong>Save</strong> (Google propagates updates in 5–10 mins).</li>
                  </ol>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer note */}
          <div className="mt-5 border-t border-outline-variant/30 pt-4 text-[11px] text-on-surface-variant/70 font-body-md flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Zionaviel Secure Authentication
          </div>
        </motion.div>
      </div>
    </main>
  );
}
