import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  HeartHandshake, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  Users, 
  Lock, 
  Heart, 
  BookOpen, 
  ChevronRight,
  Sun,
  Flame
} from 'lucide-react';

const PRAYER_CATEGORIES = [
  { id: 'Healing & Health', label: 'Healing & Health', icon: '❤️' },
  { id: 'Family & Marriage', label: 'Family & Marriage', icon: '🏡' },
  { id: 'Peace & Anxiety', label: 'Peace & Anxiety', icon: '🕊️' },
  { id: 'Financial & Career', label: 'Financial & Career', icon: '💼' },
  { id: 'Spiritual Growth', label: 'Spiritual Growth', icon: '🌱' },
  { id: 'Guidance & Direction', label: 'Guidance & Direction', icon: '🧭' },
  { id: 'Thanksgiving', label: 'Praise & Thanksgiving', icon: '🙌' },
  { id: 'General Support', label: 'General Prayer', icon: '🙏' }
];

const PRAYER_PROMISES = [
  {
    verse: "The prayer of a righteous person is powerful and effective.",
    ref: "James 5:16",
    theme: "Power in Prayer"
  },
  {
    verse: "Then you will call on me and come and pray to me, and I will listen to you.",
    ref: "Jeremiah 29:12",
    theme: "God Listens"
  },
  {
    verse: "The righteous cry out, and the Lord hears them; he delivers them from all their troubles.",
    ref: "Psalm 34:17",
    theme: "Deliverance"
  },
  {
    verse: "If two of you on earth agree about anything they ask for, it will be done for them by my Father in heaven.",
    ref: "Matthew 18:19",
    theme: "Agreement in Faith"
  }
];

export default function PrayerWall() {
  const { user, requireAuth } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [category, setCategory] = useState('Healing & Health');
  const [prayerPoints, setPrayerPoints] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      if (!name) setName(user.name || '');
      if (!email) setEmail(user.email || '');
    }
  }, [user]);

  const submitPrayer = async () => {
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please provide a valid email / Gmail address.');
      return;
    }

    if (!prayerPoints.trim()) {
      setErrorMessage('Please write your prayer points or burden.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/prayer-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          category,
          prayerPoints: prayerPoints.trim(),
          isPrivate
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send prayer request. Please try again.');
      }

      setSubmittedSuccess(true);
      // Reset form fields
      setPrayerPoints('');
      setIsPrivate(false);
    } catch (err) {
      setErrorMessage(err.message || 'Unable to submit prayer request. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    requireAuth(() => submitPrayer());
  };

  return (
    <main className="pt-20 pb-24 bg-background min-h-screen text-on-surface">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-heaven border-b border-outline-variant/30 text-center px-margin-mobile overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary/15 text-secondary text-xs font-bold font-label-caps uppercase tracking-widest mb-4">
            <HeartHandshake size={14} />
            Sacred Prayer Wall
          </div>
          <h1 className="font-display-lg text-3xl sm:text-5xl md:text-6xl text-primary font-bold mb-4 leading-tight">
            Share Your Prayer Request
          </h1>
          <p className="font-verse-quote text-base sm:text-xl text-on-surface-variant max-w-2xl mx-auto italic leading-relaxed mb-6">
            "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God."
          </p>
          <p className="font-label-caps text-xs text-primary font-bold uppercase tracking-widest">
            — Philippians 4:6
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="max-w-container-max mx-auto px-margin-mobile py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-stack-lg">
          
          {/* Left Column: Prayer Submission Form */}
          <div className="lg:col-span-7 text-left">
            <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl p-6 sm:p-10 shadow-sm">
              <div className="mb-6 border-b border-outline-variant/30 pb-4">
                <h2 className="font-headline-sm text-2xl font-bold text-primary flex items-center gap-2.5">
                  <Flame className="text-secondary" size={24} />
                  Leave Your Prayer Points
                </h2>
                <p className="text-sm text-on-surface-variant mt-1">
                  Our dedicated prayer team intercedes over every request. You are not walking this path alone.
                </p>
              </div>

              {submittedSuccess ? (
                <div className="p-8 bg-green-50/80 border border-green-200 rounded-2xl text-center space-y-4 animate-fade-in">
                  <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="font-headline-sm text-2xl font-bold text-green-900">
                    Prayer Request Received
                  </h3>
                  <p className="text-sm text-green-800 max-w-md mx-auto leading-relaxed">
                    Thank you for sharing your heart. Your prayer points have been delivered directly to our prayer ministers. We are standing in faith with you before the Throne of Grace.
                  </p>
                  <blockquote className="font-verse-quote italic text-sm text-green-900/80 pt-2 border-t border-green-200/60 max-w-sm mx-auto">
                    "The Lord is near to all who call on him, to all who call on him in truth." — Psalm 145:18
                  </blockquote>
                  <button
                    onClick={() => setSubmittedSuccess(false)}
                    className="mt-4 px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold font-label-caps uppercase tracking-wider hover:bg-primary-container transition-all active:scale-95 cursor-pointer shadow-md"
                  >
                    Submit Another Prayer Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {errorMessage && (
                    <div className="p-4 rounded-xl bg-error/10 border border-error/30 text-error flex items-center gap-3 text-sm">
                      <AlertCircle size={18} className="shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block font-label-caps text-xs uppercase tracking-wider text-primary font-bold mb-2">
                        Your Name <span className="text-error">*</span>
                      </label>
                      <input 
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. John David"
                        required
                        className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-label-caps text-xs uppercase tracking-wider text-primary font-bold mb-2">
                        Gmail / Email Address <span className="text-error">*</span>
                      </label>
                      <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. yourname@gmail.com"
                        required
                        className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Prayer Category */}
                  <div>
                    <label className="block font-label-caps text-xs uppercase tracking-wider text-primary font-bold mb-2.5">
                      Prayer Category
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                      {PRAYER_CATEGORIES.map((cat) => {
                        const isSelected = category === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setCategory(cat.id)}
                            className={`p-2.5 sm:p-3 min-h-[58px] rounded-xl border-2 flex items-center gap-2 transition-all cursor-pointer text-left overflow-hidden ${
                              isSelected
                                ? 'bg-primary border-primary text-white shadow-md font-bold ring-2 ring-primary/20'
                                : 'bg-white dark:bg-zinc-800 border-outline-variant hover:border-primary/50 text-primary dark:text-zinc-100 font-bold hover:bg-surface-container-low'
                            }`}
                          >
                            <span className="text-base sm:text-lg shrink-0">{cat.icon}</span>
                            <span className={`text-[11px] sm:text-xs font-bold leading-snug flex-1 break-words ${
                              isSelected ? 'text-white' : 'text-primary dark:text-zinc-100'
                            }`}>
                              {cat.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Prayer Points Textarea */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block font-label-caps text-xs uppercase tracking-wider text-primary font-bold">
                        Prayer Points & Burdens <span className="text-error">*</span>
                      </label>
                      <span className="text-[11px] text-on-surface-variant/70 font-mono">
                        {prayerPoints.length} characters
                      </span>
                    </div>
                    <textarea 
                      rows={6}
                      value={prayerPoints}
                      onChange={(e) => setPrayerPoints(e.target.value)}
                      placeholder="Share what is on your heart... Explain your situation, the family members or friends needing prayer, your spiritual desires, or health burdens. We will bring this before the Lord."
                      required
                      className="w-full p-4 bg-surface border border-outline-variant rounded-xl text-sm leading-relaxed focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>

                  {/* Confidentiality Option */}
                  <label className="flex items-start gap-3 p-3.5 rounded-xl bg-surface border border-outline-variant/40 cursor-pointer group">
                    <input 
                      type="checkbox"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-primary rounded border-outline-variant focus:ring-primary"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-primary group-hover:text-secondary transition-colors">
                        Keep this prayer confidential
                      </span>
                      <p className="text-on-surface-variant text-[11px] mt-0.5">
                        Only our senior pastoral prayer team will pray over this request.
                      </p>
                    </div>
                  </label>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 bg-primary hover:bg-primary-container text-white rounded-xl font-label-caps text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 font-bold"
                  >
                    {isSubmitting ? (
                      <span>Sending to Prayer Team...</span>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Send Prayer Request</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-center text-on-surface-variant/80">
                    🔒 All details are securely delivered to our prayer intercessors.
                  </p>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Hope, Support & Assurance */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl p-6 sm:p-8 shadow-sm">
              <span className="text-xs font-bold font-label-caps uppercase tracking-widest text-secondary block mb-2">
                Our Solemn Promise
              </span>
              <h3 className="font-headline-sm text-xl font-bold text-primary mb-4">
                We Are Praying For You
              </h3>
              
              <div className="space-y-4">
                <div className="flex gap-3.5 items-start">
                  <div className="w-9 h-9 rounded-xl bg-gradient-divine text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Heart size={18} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-primary">Every Name is Lifted in Prayer</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed mt-0.5">
                      Your prayer points are not just received; they are prayed over with faith and compassion.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <div className="w-9 h-9 rounded-xl bg-gradient-divine text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Users size={18} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-primary">The Power of Agreement</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed mt-0.5">
                      When we join together in agreement across cities and nations, miracles and peace follow.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <div className="w-9 h-9 rounded-xl bg-gradient-divine text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Lock size={18} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-primary">Sacred & Confidential</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed mt-0.5">
                      Your struggles and contact information are treated with the highest biblical integrity and privacy.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <div className="w-9 h-9 rounded-xl bg-gradient-divine text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Sun size={18} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-primary">Hope in Every Season</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed mt-0.5">
                      No matter how heavy the burden, God's grace is sufficient and His love never fails.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Prayer Quote Card */}
            <div className="bg-gradient-to-br from-[#041534] to-[#1b2a4a] text-white p-6 sm:p-8 rounded-3xl shadow-md space-y-3">
              <Sparkles className="text-secondary-fixed" size={24} />
              <blockquote className="font-verse-quote italic text-lg leading-relaxed text-white/95">
                "Cast your cares on the Lord and He will sustain you; He will never let the righteous be shaken."
              </blockquote>
              <p className="font-label-caps text-xs text-secondary-fixed tracking-widest uppercase font-bold">
                — Psalm 55:22
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Scripture Promises on Prayer Grid */}
      <section className="bg-surface-container-low py-16 text-left">
        <div className="max-w-container-max mx-auto px-margin-mobile">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="font-label-caps text-xs uppercase tracking-[0.2em] text-secondary font-bold mb-2 block">
              Biblical Foundation
            </span>
            <h2 className="font-headline-md text-3xl font-bold text-primary">
              Promises from the Word on Prayer
            </h2>
            <p className="text-sm text-on-surface-variant mt-2">
              Anchor your faith in these timeless promises as we pray together.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRAYER_PROMISES.map((item, idx) => (
              <div 
                key={idx}
                className="bg-white p-6 rounded-2xl border border-outline-variant/60 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest bg-secondary/10 px-2.5 py-1 rounded-full inline-block mb-3">
                    {item.theme}
                  </span>
                  <p className="font-verse-quote italic text-sm text-primary leading-relaxed mb-4">
                    "{item.verse}"
                  </p>
                </div>
                <p className="font-label-caps text-xs font-bold text-on-surface-variant pt-3 border-t border-outline-variant/30">
                  {item.ref}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
