import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Loader2, Key } from 'lucide-react';
import SEO from '../components/SEO';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Read Client ID from environment
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isClientIdConfigured = googleClientId && googleClientId !== 'YOUR_GOOGLE_CLIENT_ID' && googleClientId.trim() !== '';

  // State for simulated login (fallback when Client ID is missing)
  const [simName, setSimName] = useState('');
  const [simEmail, setSimEmail] = useState('');
  const [showSimForm, setShowSimForm] = useState(false);

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
        // Save user session with loginTimestamp (3 days expiration check)
        localStorage.setItem('zionix_user', JSON.stringify({
          name: data.user.name,
          email: data.user.email,
          avatar: data.user.avatar,
          loginTimestamp: Date.now()
        }));

        // Dispatch a custom auth event so NavBar refreshes immediately
        window.dispatchEvent(new Event('auth-change'));

        setTimeout(() => {
          setLoading(false);
          navigate('/');
        }, 1500);
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
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-btn-container'),
          { 
            theme: 'outline', 
            size: 'large', 
            width: '100%',
            text: 'signin_with',
            shape: 'rectangular'
          }
        );
      }
    };

    // Try immediately or register interval poll
    if (window.google) {
      initializeGoogleSignIn();
    } else {
      const checkInterval = setInterval(() => {
        if (window.google) {
          initializeGoogleSignIn();
          clearInterval(checkInterval);
        }
      }, 250);
      return () => clearInterval(checkInterval);
    }
  }, [isClientIdConfigured, googleClientId]);

  const handleSimulatedSubmit = (e) => {
    e.preventDefault();
    if (!simName.trim() || !simEmail.trim()) {
      setError('Please fill in both fields.');
      return;
    }
    if (!simEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    const avatarInitials = simName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    handleLoginSuccess(simName, simEmail, avatarInitials);
  };

  return (
    <main className="pt-24 pb-20 bg-background min-h-[calc(100vh-64px)] flex items-center justify-center text-on-surface">
      <SEO
        title="Sign In | Zionix Ministry"
        description="Sign in to your Zionix account to save prayer burdens, customize your devotional journey, and stay connected with the Christian community."
        keywords="Zionix login, Christian account, sign in, prayer account"
        path="/login"
      />
      <div className="max-w-[460px] w-full mx-margin-mobile">
        {/* Main login card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 18 }}
          className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-8 md:p-10 shadow-divine relative overflow-hidden"
        >
          {/* Top subtle visual effect */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-divine" />

          {/* Logo / Title Area */}
          <div className="flex flex-col items-center gap-3 mb-8 text-center">
            <div className="w-14 h-14 rounded-full bg-primary-container/10 flex items-center justify-center text-primary shadow-inner">
              <ShieldCheck size={28} />
            </div>
            <h1 className="font-display-lg text-2xl font-bold text-primary mt-2">
              Sign in to Zionix
            </h1>
            <p className="font-body-md text-sm text-on-surface-variant max-w-[300px]">
              Access scriptures, explore the Gospel, and save your daily bread.
            </p>
          </div>

          {/* Status Message */}
          <AnimatePresence>
            {loading && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-surface-container-low border border-outline-variant/40 rounded-xl flex flex-col items-center gap-2.5 text-center"
              >
                {success ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold shadow-sm">
                      ✓
                    </div>
                    <p className="text-sm font-bold text-primary">Login Successful!</p>
                    <p className="text-xs text-on-surface-variant">Redirecting to fellowship...</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-left">
                    <Loader2 size={20} className="text-primary animate-spin" />
                    <div>
                      <p className="text-xs font-bold text-primary">Google Sign-In Active</p>
                      <p className="text-[10px] text-on-surface-variant">Authenticating secure Google profile...</p>
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
                className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg text-left"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Conditional Rendering of Login Buttons */}
          <div className="flex flex-col gap-4">
            {isClientIdConfigured ? (
              <div className="flex flex-col gap-4">
                <p className="text-xs font-semibold text-on-surface-variant mb-2 text-center">
                  Authenticate securely using your Google Account:
                </p>
                {/* Official Google Button Container */}
                <div id="google-signin-btn-container" className="w-full min-h-[40px] flex justify-center" />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {!showSimForm ? (
                  <div className="flex flex-col gap-4 text-center">
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-left">
                      <h3 className="text-xs font-bold text-amber-800 mb-1 flex items-center gap-1.5">
                        <Key size={14} /> Developer Notice
                      </h3>
                      <p className="text-[11px] text-amber-900 leading-relaxed">
                        To use the official Google Sign-In SDK, please specify your Client ID in `frontend/.env` as:
                        <code className="block mt-1 bg-white/60 p-1.5 rounded text-[10px] select-all font-mono">
                          VITE_GOOGLE_CLIENT_ID=your_id.apps.googleusercontent.com
                        </code>
                      </p>
                    </div>

                    <button 
                      onClick={() => setShowSimForm(true)}
                      className="flex items-center justify-center gap-2.5 w-full bg-primary text-white hover:bg-primary-container py-3.5 px-5 rounded-lg font-label-caps text-xs uppercase tracking-wider font-bold transition-all active:scale-[0.98] shadow-md cursor-pointer"
                    >
                      Authenticate Google Profile
                    </button>
                  </div>
                ) : (
                  <motion.form 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSimulatedSubmit} 
                    className="flex flex-col gap-4 border-t border-outline-variant/30 pt-4"
                  >
                    <p className="text-xs font-bold text-primary mb-1">
                      Developer Google Sign-In Simulator:
                    </p>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-on-surface-variant text-left">Google Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Dinesh Babu"
                        value={simName}
                        onChange={(e) => setSimName(e.target.value)}
                        required
                        className="border border-outline-variant rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-background w-full"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-on-surface-variant text-left">Google Email Address</label>
                      <input 
                        type="email" 
                        placeholder="e.g. babud4395@gmail.com"
                        value={simEmail}
                        onChange={(e) => setSimEmail(e.target.value)}
                        required
                        className="border border-outline-variant rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-background w-full"
                      />
                    </div>

                    <div className="flex justify-end gap-2.5 mt-2 border-t border-outline-variant/30 pt-3">
                      <button
                        type="button"
                        onClick={() => { setShowSimForm(false); setError(''); }}
                        className="px-4 py-2 hover:bg-surface-container text-on-surface-variant font-medium text-xs font-label-caps rounded transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="bg-primary hover:bg-primary-container text-white px-5 py-2 font-medium text-xs font-label-caps rounded shadow-sm transition-all"
                      >
                        Authenticate
                      </button>
                    </div>
                  </motion.form>
                )}
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="mt-8 border-t border-outline-variant/30 pt-6 text-xs text-on-surface-variant/70 font-body-md flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Google Identity Services Secure Auth
          </div>
        </motion.div>
      </div>
    </main>
  );
}
