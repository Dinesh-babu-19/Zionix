import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  X, 
  Loader2, 
  AlertCircle, 
  Lock, 
  User, 
  Mail,
  Sparkles
} from 'lucide-react';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthModalOpen) return null;

  const handleQuickSignIn = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim()) {
      setError('Please provide your name and email address.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid Gmail / Email address.');
      return;
    }

    setLoading(true);

    try {
      const avatarInitials = name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      
      const res = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          avatar: avatarInitials
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Login in context and trigger pending action
      login(data.user);
      setName('');
      setEmail('');
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-surface border border-outline-variant/80 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-left overflow-hidden">
        {/* Top divine border */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-divine" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-primary p-2 rounded-full hover:bg-surface-container transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center mb-3 shadow-md">
            <ShieldCheck size={28} />
          </div>
          <h2 className="font-headline-sm text-2xl font-bold text-primary">
            Sign In to Zionix
          </h2>
          <p className="text-xs text-on-surface-variant max-w-xs mt-1 leading-relaxed">
            Please sign in to share scripture, post on the Prayer Wall, and receive daily spiritual nourishment.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-error/10 border border-error/30 text-error flex items-center gap-2 text-xs">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleQuickSignIn} className="space-y-4">
          <div>
            <label className="block font-label-caps text-xs uppercase tracking-wider text-primary font-bold mb-1.5">
              Your Full Name
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John David"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-label-caps text-xs uppercase tracking-wider text-primary font-bold mb-1.5">
              Gmail / Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. yourname@gmail.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-primary hover:bg-primary-container text-white rounded-xl font-label-caps text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 font-bold"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Continue & Complete Action</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-outline-variant/30 text-center text-[11px] text-on-surface-variant/70">
          🔒 Secure fellowship login • Daily verse updates delivered to your mail
        </div>
      </div>
    </div>
  );
}
