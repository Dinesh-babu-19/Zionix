import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Send, 
  Share2, 
  Camera, 
  Calendar, 
  History, 
  Sparkles, 
  CheckCircle2, 
  Volume2, 
  ChevronRight, 
  X, 
  Copy, 
  ExternalLink,
  Check
} from 'lucide-react';

export default function DailyVerse() {
  const { requireAuth } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedBtn, setCopiedBtn] = useState(null);
  const [selectedPastReflection, setSelectedPastReflection] = useState(null);
  const [instagramModalOpen, setInstagramModalOpen] = useState(false);
  const [cardFlash, setCardFlash] = useState(false);
  const [shareToast, setShareToast] = useState(null);

  // Email Subscription State
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState('');
  const [subscribeError, setSubscribeError] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!subscribeEmail || !subscribeEmail.includes('@')) {
      setSubscribeError('Please enter a valid email address.');
      return;
    }
    setIsSubscribing(true);
    setSubscribeError('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subscribeEmail.trim() })
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to subscribe');
      }
      setSubscribeSuccess('Subscribed! Welcome email sent to your inbox.');
      setSubscribeEmail('');
    } catch (err) {
      setSubscribeError(err.message || 'Subscription failed. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  useEffect(() => {
    fetch('/api/daily-verse')
      .then(res => res.json())
      .then(verseData => {
        // If localStorage has an admin-published update with a newer updatedAt, preserve it
        const localSaved = localStorage.getItem('zionix_custom_daily_verse');
        if (localSaved) {
          try {
            const parsed = JSON.parse(localSaved);
            if (parsed && parsed.updatedAt && verseData && verseData.updatedAt) {
              if (new Date(parsed.updatedAt).getTime() > new Date(verseData.updatedAt).getTime()) {
                setData({
                  ...parsed,
                  recentReflections: verseData.recentReflections || parsed.recentReflections || []
                });
                setLoading(false);
                return;
              }
            }
          } catch (e) {
            // ignore
          }
        }
        setData(verseData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching daily verse:', err);
        const localSaved = localStorage.getItem('zionix_custom_daily_verse');
        if (localSaved) {
          try {
            setData(JSON.parse(localSaved));
          } catch (e) {}
        }
        setLoading(false);
      });
  }, []);

  const showShareToast = (msg) => {
    setShareToast(msg);
    setTimeout(() => {
      setShareToast(null);
    }, 3500);
  };

  const handleShare = (platform) => {
    requireAuth(() => executeShare(platform));
  };

  const executeShare = async (platform) => {
    if (!data) return;
    const pageUrl = window.location.origin + '/verse';
    const verseQuote = `"${data.verse}" — ${data.reference} (${data.translation || 'ESV'})`;

    // Copy to clipboard for easy pasting
    try {
      await navigator.clipboard.writeText(`${verseQuote}\n\nRead more on Zionix: ${pageUrl}`);
    } catch {
      // ignore clipboard error
    }

    if (platform === 'whatsapp') {
      const devotionSnippet = data.devotion ? `\n\n✨ *Morning Reflection:*\n${data.devotion.slice(0, 180)}...` : '';
      const message = `📖 *Daily Bread — Zionix*\n\n"${data.verse}"\n— *${data.reference}* (${data.translation || 'ESV'})${devotionSnippet}\n\n🔗 *Read the full devotion on Zionix:*\n${pageUrl}`;
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      setCopiedBtn('whatsapp');
      showShareToast('Opening WhatsApp with your reflection!');
      setTimeout(() => setCopiedBtn(null), 3000);
    } else if (platform === 'x') {
      const truncatedVerse = data.verse.length > 170 ? data.verse.slice(0, 165) + '...' : data.verse;
      const tweetText = `"${truncatedVerse}"\n— ${data.reference}`;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(pageUrl)}&hashtags=${encodeURIComponent('DailyBread,BibleVerse,Zionix,Faith')}`;
      window.open(twitterUrl, '_blank', 'noopener,noreferrer');
      setCopiedBtn('x');
      showShareToast('Opening X (Twitter) with your Daily Bread post!');
      setTimeout(() => setCopiedBtn(null), 3000);
    } else if (platform === 'instagram') {
      setInstagramModalOpen(true);
      setCopiedBtn('instagram');
      showShareToast('Scripture copied! Screenshot the card for your Story.');
      setTimeout(() => setCopiedBtn(null), 3000);
    } else if (platform === 'copy') {
      setCopiedBtn('copy');
      showShareToast('Scripture and link copied to clipboard!');
      setTimeout(() => setCopiedBtn(null), 3000);
    }
  };

  const handleReadAloud = (customText, customRef) => {
    const textToSpeak = customText || data?.verse;
    const refToSpeak = customRef || data?.reference;
    if (!textToSpeak) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak + "..." + (refToSpeak || ''));
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } else {
      alert(`Narration: "${textToSpeak}" — ${refToSpeak}`);
    }
  };

  if (loading) {
    return (
      <div className="pt-48 pb-32 text-center text-on-surface-variant font-body-lg">
        Loading Daily Verse...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="pt-48 pb-32 text-center text-on-surface-variant font-body-lg">
        Failed to load today's reflection.
      </div>
    );
  }

  const recentReflections = data.recentReflections || [];

  return (
    <main className="pt-16">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] md:min-h-[60vh] py-16 md:py-24 flex flex-col items-center justify-center text-center px-margin-mobile overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <img 
            className="w-full h-full object-cover" 
            alt="Serene morning mist lake landscape"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhlh4ZpKdxFLQswNeba1aV7t1QlvF1MhpXQm4K31gOrb_qrHi4L-71XvZO2AS5DSmO5G6-tcCAfCcikZyoPZE73B9fyBw2h_dnl1vHhPfRWLVB5SzefXBnyOz1oC_Iqw_Lqok11xXQ_H94xqHx3O4J0NiIH3kyNo6KrixAM-VMMLqs7K0yqmExWKQkQ7YQXZNVuRrNyvVK-UXErWkxqY2sPDLLh51hFpsWsd_OWJlDXsgKvF9G2JE-JyZrMlrVwIE1uFQl0nwbqFk"
          />
        </div>
        <div className="relative z-10 max-w-[800px] mx-auto">
          <span className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-secondary mb-stack-sm block text-xs font-semibold">
            Verse of the Day
          </span>
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg italic text-primary leading-tight mb-stack-md font-semibold">
            "{data.verse}"
          </h1>
          <div className="flex flex-col items-center gap-2">
            <p className="font-headline-sm text-headline-sm text-on-surface-variant font-medium">{data.reference}</p>
            <span className="inline-block px-3 py-1 border border-outline-variant text-[10px] font-bold tracking-widest uppercase text-on-surface-variant rounded-full">
              {data.translation}
            </span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* Content Grid */}
      <section className="max-w-container-max mx-auto px-margin-mobile py-12 md:py-16 bg-background">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-stack-lg">
          {/* Main Study Content */}
          <div className="lg:col-span-8 space-y-stack-lg text-left">
            {/* 1. Explanation */}
            <div className="space-y-stack-sm">
              <h2 className="font-headline-md text-headline-md text-primary flex items-center gap-2 font-semibold">
                <History className="text-secondary" size={24} />
                The Context
              </h2>
              <div className="prose prose-slate max-w-none">
                <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                  {data.context}
                </p>
              </div>
            </div>

            {/* 2. Short Devotion */}
            <div className="bg-surface-container-lowest border border-outline-variant p-stack-md rounded-xl space-y-stack-sm">
              <h2 className="font-headline-md text-headline-md text-primary flex items-center gap-2 font-semibold">
                <Sparkles className="text-secondary" size={24} />
                Morning Reflection
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed italic">
                {data.devotion}
              </p>
            </div>

            {/* 3. Practical Application */}
            <div className="space-y-stack-sm border-l-2 border-secondary pl-stack-md">
              <h2 className="font-headline-md text-headline-md text-primary flex items-center gap-2 font-semibold">
                <span className="material-symbols-outlined text-secondary">handyman</span>
                Living It Out
              </h2>
              <ul className="space-y-4 font-body-lg text-body-lg text-on-surface-variant">
                {Array.isArray(data.application) && data.application.map((point, index) => (
                  <li key={index} className="flex gap-4 items-start">
                    <span className="text-secondary font-bold">0{index + 1}.</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar / Interaction */}
          <div className="lg:col-span-4 space-y-stack-md text-left">
            {/* Share Card */}
            <div className="sticky top-24 border border-outline-variant/60 p-stack-md bg-white rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-stack-sm">
                <h3 className="font-label-caps text-label-caps uppercase tracking-widest text-primary text-xs font-bold">
                  Share the Word
                </h3>
                <span className="text-[10px] uppercase font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                  Spreading Faith
                </span>
              </div>
              
              <div className="flex flex-col gap-2.5">
                {/* 1. WhatsApp Button */}
                <button 
                  onClick={() => handleShare('whatsapp')}
                  className="flex items-center justify-between w-full p-3.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 transition-all rounded-xl group text-sm font-medium cursor-pointer active:scale-98"
                >
                  <span className="flex items-center gap-3 font-semibold text-[#128C7E]">
                    <Send size={18} className="text-[#25D366]" />
                    {copiedBtn === 'whatsapp' ? 'Opening WhatsApp...' : 'WhatsApp'}
                  </span>
                  {copiedBtn === 'whatsapp' ? (
                    <CheckCircle2 size={16} className="text-[#25D366] animate-bounce" />
                  ) : (
                    <ExternalLink size={14} className="text-[#128C7E]/60 group-hover:text-[#128C7E] transition-colors" />
                  )}
                </button>

                {/* 2. X (Twitter) Button */}
                <button 
                  onClick={() => handleShare('x')}
                  className="flex items-center justify-between w-full p-3.5 bg-surface hover:bg-surface-container-high border border-outline-variant/40 transition-all rounded-xl group text-sm font-medium cursor-pointer active:scale-98"
                >
                  <span className="flex items-center gap-3 font-semibold text-primary">
                    <Share2 className="text-primary" size={18} />
                    {copiedBtn === 'x' ? 'Opening X...' : 'X (Twitter)'}
                  </span>
                  {copiedBtn === 'x' ? (
                    <CheckCircle2 size={16} className="text-primary animate-bounce" />
                  ) : (
                    <ExternalLink size={14} className="text-on-surface-variant/60 group-hover:text-primary transition-colors" />
                  )}
                </button>

                {/* 3. Instagram Story Button */}
                <button 
                  onClick={() => handleShare('instagram')}
                  className="flex items-center justify-between w-full p-3.5 bg-gradient-to-r from-[#833ab4]/10 via-[#fd1d1d]/10 to-[#fcb045]/10 hover:from-[#833ab4]/20 hover:via-[#fd1d1d]/20 hover:to-[#fcb045]/20 border border-[#fd1d1d]/30 transition-all rounded-xl group text-sm font-medium cursor-pointer active:scale-98"
                >
                  <span className="flex items-center gap-3 font-semibold text-[#c13584]">
                    <Camera size={18} className="text-[#e1306c]" />
                    {copiedBtn === 'instagram' ? 'Ready for Story!' : 'Instagram Story'}
                  </span>
                  {copiedBtn === 'instagram' ? (
                    <CheckCircle2 size={16} className="text-[#c13584] animate-bounce" />
                  ) : (
                    <Sparkles size={14} className="text-[#c13584]/70 group-hover:text-[#c13584] transition-colors" />
                  )}
                </button>

                {/* 4. Copy Direct Link */}
                <button 
                  onClick={() => handleShare('copy')}
                  className="flex items-center justify-between w-full p-3 bg-surface hover:bg-surface-container border border-dashed border-outline-variant transition-all rounded-xl group text-xs font-semibold text-on-surface-variant hover:text-primary cursor-pointer active:scale-98"
                >
                  <span className="flex items-center gap-2.5">
                    <Copy size={15} />
                    {copiedBtn === 'copy' ? 'Verse Link Copied!' : 'Copy Verse & Link'}
                  </span>
                  {copiedBtn === 'copy' ? (
                    <Check size={14} className="text-green-600" />
                  ) : (
                    <ChevronRight size={14} className="opacity-60 group-hover:opacity-100" />
                  )}
                </button>
              </div>

              <div className="mt-stack-md pt-stack-md border-t border-outline-variant/40 flex flex-col gap-3.5">
                <button onClick={() => handleReadAloud()} className="flex items-center gap-2 text-secondary hover:underline font-body-md font-medium text-sm text-left cursor-pointer">
                  <Volume2 size={18} />
                  Listen to scripture
                </button>
                <a className="flex items-center gap-2 text-secondary hover:underline font-body-md font-medium text-sm" href="#recent-reflections">
                  <Calendar size={18} />
                  Past 5 days reflections
                </a>
              </div>
            </div>

            {/* Daily Bread Inbox Subscription Card */}
            <div className="border border-outline-variant/60 p-6 bg-surface-container-lowest rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-secondary text-xl">mark_email_unread</span>
                <h3 className="font-headline-sm text-base font-bold text-primary">Daily Bread in Your Inbox</h3>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                Join our community of believers. Receive every new Scripture reflection directly in your private email.
              </p>
              {subscribeSuccess ? (
                <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-xl text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                  <span>{subscribeSuccess}</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2.5">
                  <input
                    type="email"
                    value={subscribeEmail}
                    onChange={(e) => setSubscribeEmail(e.target.value)}
                    placeholder="Enter your Gmail / Email address"
                    required
                    className="w-full px-3.5 py-2.5 bg-surface border border-outline-variant rounded-xl text-xs focus:outline-none focus:border-primary text-on-surface"
                  />
                  {subscribeError && (
                    <p className="text-xs text-error font-medium">{subscribeError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={isSubscribing}
                    className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold font-label-caps uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-sm active:scale-98"
                  >
                    {isSubscribing ? 'Subscribing...' : 'Subscribe to Daily Bread'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Previous Verses Teaser (Past 5 Days History) */}
      <section id="recent-reflections" className="bg-surface-container-low py-12 md:py-16 overflow-hidden text-left">
        <div className="max-w-container-max mx-auto px-margin-mobile mb-stack-md flex justify-between items-end">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary font-semibold">Recent Reflections</h2>
            <p className="text-on-surface-variant text-sm mt-1">Stay grounded in the Word with the past 5 days of reflections.</p>
          </div>
          <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary text-xs font-bold">
            Past 5 Days
          </span>
        </div>
        
        <div className="flex gap-gutter px-margin-mobile overflow-x-auto no-scrollbar pb-8 max-w-container-max mx-auto">
          {recentReflections.length === 0 ? (
            <div className="w-full text-center py-8 text-on-surface-variant text-sm bg-white rounded-xl border border-outline-variant">
              No recent reflections archived yet. Daily bread reflections will appear here as new verses are published.
            </div>
          ) : (
            recentReflections.map((refItem, idx) => (
              <div 
                key={refItem.id || idx}
                onClick={() => setSelectedPastReflection(refItem)}
                className="min-w-[300px] max-w-[320px] bg-white p-stack-sm border border-outline-variant hover:border-secondary transition-all rounded-lg flex flex-col justify-between h-44 cursor-pointer group shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                      {refItem.label || `${idx + 1} Day(s) Ago`}
                    </p>
                    {refItem.date && (
                      <span className="text-[10px] text-on-surface-variant/70 font-mono">
                        {refItem.date}
                      </span>
                    )}
                  </div>
                  <p className="font-verse-quote italic text-primary text-sm line-clamp-3 leading-relaxed group-hover:text-primary transition-colors">
                    "{refItem.verse}"
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30">
                  <p className="font-label-caps text-label-caps text-on-surface-variant text-xs font-semibold">
                    {refItem.reference}
                  </p>
                  <span className="text-[10px] text-secondary font-bold uppercase tracking-wider group-hover:underline flex items-center gap-1">
                    Read <ChevronRight size={12} />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Instagram Story Sharing Modal */}
      {instagramModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface border border-outline-variant rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-left">
            <button 
              onClick={() => setInstagramModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary p-1.5 rounded-full hover:bg-surface-container transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#fd1d1d] to-[#833ab4] text-white flex items-center justify-center shadow-sm">
                <Camera size={16} />
              </div>
              <div>
                <h3 className="font-headline-sm text-lg font-bold text-primary">Share to Instagram Story</h3>
                <p className="text-xs text-on-surface-variant">Caption copied to your clipboard!</p>
              </div>
            </div>

            {/* Story Card Mockup */}
            <div className={`my-5 p-6 rounded-2xl bg-gradient-to-br from-[#041534] to-[#1b2a4a] text-white text-center shadow-lg relative overflow-hidden transition-all duration-300 ${cardFlash ? 'ring-4 ring-white brightness-125 scale-[1.01]' : ''}`}>
              <div className="absolute top-3 right-3 text-[10px] font-bold tracking-widest uppercase text-white/50 font-label-caps">
                Zionix Daily
              </div>
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-secondary-fixed block mb-2 font-label-caps">
                Verse of the Day
              </span>
              <p className="font-verse-quote italic text-lg leading-relaxed text-white mb-3">
                "{data.verse}"
              </p>
              <p className="font-label-caps text-xs font-bold text-secondary-fixed tracking-wider">
                {data.reference} • {data.translation || 'ESV'}
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/40 text-xs text-on-surface-variant space-y-1">
                <p className="font-semibold text-primary">📱 How to Share on Instagram:</p>
                <p>1. The scripture and Zionix link have been copied to your clipboard.</p>
                <p>2. Take a screenshot of the verse card above to post directly to your Story!</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`"${data.verse}" — ${data.reference}\n\nRead daily bread on: ${window.location.origin}/verse`);
                    showShareToast('Caption copied again!');
                  }}
                  className="py-3 px-4 bg-surface-container hover:bg-surface-container-high text-primary rounded-xl text-xs font-bold font-label-caps uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Copy size={14} /> Copy Caption
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCardFlash(true);
                    setTimeout(() => setCardFlash(false), 500);
                    showShareToast('📸 Take a screenshot of the card above!');
                  }}
                  className="py-3 px-4 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-95 text-white rounded-xl text-xs font-bold font-label-caps uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer text-center"
                >
                  <Camera size={14} /> Take Screenshot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Share Toast Notification */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-outline-variant/30 animate-fade-in">
          <CheckCircle2 size={18} className="text-secondary shrink-0" />
          <span className="text-xs font-medium">{shareToast}</span>
        </div>
      )}

      {/* Past Reflection Modal Viewer */}
      {selectedPastReflection && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface border border-outline-variant rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-left">
            <button 
              onClick={() => setSelectedPastReflection(null)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary p-1.5 rounded-full hover:bg-surface-container transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-secondary uppercase tracking-widest bg-secondary/10 px-3 py-1 rounded-full">
                {selectedPastReflection.label || 'Past Reflection'}
              </span>
              {selectedPastReflection.date && (
                <span className="text-xs text-on-surface-variant font-mono">
                  {selectedPastReflection.date}
                </span>
              )}
            </div>

            <blockquote className="font-verse-quote text-xl sm:text-2xl italic text-primary leading-relaxed my-6">
              "{selectedPastReflection.verse}"
            </blockquote>

            <div className="flex items-center justify-between border-t border-outline-variant/40 pt-4">
              <div>
                <p className="font-headline-sm text-base font-bold text-primary">
                  {selectedPastReflection.reference}
                </p>
                <p className="text-[11px] text-on-surface-variant uppercase tracking-wider">
                  {selectedPastReflection.translation || 'English Standard Version'}
                </p>
              </div>

              <button
                onClick={() => handleReadAloud(selectedPastReflection.verse, selectedPastReflection.reference)}
                className="flex items-center gap-1.5 px-3 py-2 bg-secondary/15 hover:bg-secondary/25 text-secondary rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                <Volume2 size={16} />
                Listen
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

