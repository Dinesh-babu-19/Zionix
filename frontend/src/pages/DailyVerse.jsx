import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { toPng } from 'html-to-image';
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
  Check,
  Download,
  Loader2,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import SEO from '../components/SEO';

export default function DailyVerse() {
  const { requireAuth } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedBtn, setCopiedBtn] = useState(null);
  const [selectedPastReflection, setSelectedPastReflection] = useState(null);
  const [instagramModalOpen, setInstagramModalOpen] = useState(false);
  const [cardFlash, setCardFlash] = useState(false);
  const [shareToast, setShareToast] = useState(null);

  // Automatic screenshot state
  const storyCardRef = useRef(null);
  const [isGeneratingScreenshot, setIsGeneratingScreenshot] = useState(false);
  const [screenshotImage, setScreenshotImage] = useState(null);
  const [screenshotError, setScreenshotError] = useState(null);
  const [storyFormat, setStoryFormat] = useState('story'); // 'story' (9:16) or 'square' (1:1)

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
      await navigator.clipboard.writeText(`${verseQuote}\n\nRead more on Zionaviel: ${pageUrl}`);
    } catch {
      // ignore clipboard error
    }

    if (platform === 'whatsapp') {
      const devotionSnippet = data.devotion ? `\n\n✨ *Morning Reflection:*\n${data.devotion.slice(0, 180)}...` : '';
      const message = `📖 *Daily Bread — Zionaviel*\n\n"${data.verse}"\n— *${data.reference}* (${data.translation || 'ESV'})${devotionSnippet}\n\n🔗 *Read the full devotion on Zionaviel:*\n${pageUrl}`;
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      setCopiedBtn('whatsapp');
      showShareToast('Opening WhatsApp with your reflection!');
      setTimeout(() => setCopiedBtn(null), 3000);
    } else if (platform === 'x') {
      const truncatedVerse = data.verse.length > 170 ? data.verse.slice(0, 165) + '...' : data.verse;
      const tweetText = `"${truncatedVerse}"\n— ${data.reference}`;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(pageUrl)}&hashtags=${encodeURIComponent('DailyBread,BibleVerse,Zionaviel,Faith')}`;
      window.open(twitterUrl, '_blank', 'noopener,noreferrer');
      setCopiedBtn('x');
      showShareToast('Opening X (Twitter) with your Daily Bread post!');
      setTimeout(() => setCopiedBtn(null), 3000);
    } else if (platform === 'instagram') {
      setInstagramModalOpen(true);
      setScreenshotImage(null);
      setScreenshotError(null);
      setCopiedBtn('instagram');
      showShareToast('Caption copied! Ready to capture your Story card.');
      setTimeout(() => setCopiedBtn(null), 3000);
    } else if (platform === 'copy') {
      setCopiedBtn('copy');
      showShareToast('Scripture and link copied to clipboard!');
      setTimeout(() => setCopiedBtn(null), 3000);
    }
  };

  const handleTakeScreenshot = async () => {
    if (!storyCardRef.current) return;
    setIsGeneratingScreenshot(true);
    setScreenshotError(null);
    try {
      // Small pause to guarantee font and DOM rendering is complete
      await new Promise(r => setTimeout(r, 100));
      const dataUrl = await toPng(storyCardRef.current, {
        cacheBust: true,
        pixelRatio: 2.5,
        quality: 0.98,
        skipFonts: false
      });
      setScreenshotImage(dataUrl);
      showShareToast('Screenshot generated! Preview ready.');
    } catch (err) {
      console.error('Failed to capture verse card screenshot:', err);
      setScreenshotError('Unable to automatically generate the screenshot. Please try again.');
    } finally {
      setIsGeneratingScreenshot(false);
    }
  };

  const downloadScreenshot = () => {
    if (!screenshotImage) return;
    const link = document.createElement('a');
    const safeRef = (data?.reference || 'Daily_Bread').replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `Zionaviel_${safeRef}.png`;
    link.href = screenshotImage;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showShareToast('Image saved! Ready to post to Instagram.');
  };

  const shareScreenshot = async () => {
    if (!screenshotImage) return;
    try {
      const response = await fetch(screenshotImage);
      const blob = await response.blob();
      const safeRef = (data?.reference || 'Daily_Bread').replace(/[^a-zA-Z0-9]/g, '_');
      const file = new File([blob], `Zionaviel_${safeRef}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Daily Bread: ${data?.reference}`,
          text: `"${data?.verse}" — ${data?.reference}\n\nRead more on Zionaviel: ${window.location.origin}/verse`
        });
        showShareToast('Shared successfully!');
        return;
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Direct share failed:', err);
      }
    }
    // Fallback to direct download
    downloadScreenshot();
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
      <SEO
        title={data?.reference ? `Daily Bible Verse: ${data.reference} | Zionaviel` : "Daily Bible Verse & Morning Devotional | Zionaviel"}
        description={data?.devotion ? `${data.reference} — "${data.verse.slice(0, 110)}..." Read today's Scripture reflection and daily living applications on Zionaviel.` : "Start your day with Scripture, biblical context, a thoughtful devotional reflection, and practical ways to live out God's Word."}
        keywords="daily Bible verse, daily devotional, verse of the day, morning Bible devotional, Scripture reflection, Daily Bread, living it out today, Zionaviel"
        path="/verse"
      />
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
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-surface border border-outline-variant rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl relative text-left my-auto max-h-[92vh] flex flex-col">
            <button 
              onClick={() => {
                setInstagramModalOpen(false);
                setScreenshotImage(null);
                setScreenshotError(null);
              }}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary p-1.5 rounded-full hover:bg-surface-container transition-colors cursor-pointer z-10"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#fd1d1d] via-[#e1306c] to-[#833ab4] text-white flex items-center justify-center shadow-sm shrink-0">
                <Camera size={18} />
              </div>
              <div>
                <h3 className="font-headline-sm text-base sm:text-lg font-bold text-primary">
                  {screenshotImage ? 'Story Screenshot Ready!' : 'Share to Instagram Story'}
                </h3>
                <p className="text-xs text-on-surface-variant">
                  {screenshotImage ? 'Download or share your high-res verse card' : 'Automatically captures a 9:16 verse card for your Story'}
                </p>
              </div>
            </div>

            {/* Format Selector */}
            {!screenshotImage && (
              <div className="flex items-center gap-2 mb-3 bg-surface-container-low p-1 rounded-xl border border-outline-variant/40 w-fit">
                <button
                  type="button"
                  onClick={() => setStoryFormat('story')}
                  className={`px-3 py-1 text-xs font-bold font-label-caps uppercase tracking-wider rounded-lg transition-all ${
                    storyFormat === 'story'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  Story (9:16)
                </button>
                <button
                  type="button"
                  onClick={() => setStoryFormat('square')}
                  className={`px-3 py-1 text-xs font-bold font-label-caps uppercase tracking-wider rounded-lg transition-all ${
                    storyFormat === 'square'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  Square (1:1)
                </button>
              </div>
            )}

            {/* Modal Body / Scrollable Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar py-1">
              {screenshotError && (
                <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">Screenshot Error</p>
                    <p className="mt-0.5">{screenshotError}</p>
                    <button
                      type="button"
                      onClick={handleTakeScreenshot}
                      className="mt-2 font-bold underline hover:no-underline cursor-pointer"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}

              {/* View 1: Generated Image Preview */}
              {screenshotImage ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/50 max-h-[420px] bg-black">
                    <img 
                      src={screenshotImage} 
                      alt="Generated Instagram Story" 
                      className="max-h-[420px] w-auto object-contain mx-auto"
                    />
                  </div>
                  <p className="text-[11px] text-on-surface-variant text-center font-medium">
                    ✨ High-resolution {storyFormat === 'story' ? '9:16 Story canvas' : '1:1 Post canvas'} ready for Instagram.
                  </p>
                </div>
              ) : (
                /* View 2: High-Resolution Verse Card Target (Captured by html-to-image) */
                <div className="flex justify-center my-1">
                  <div 
                    ref={storyCardRef}
                    className={`w-full max-w-[340px] ${
                      storyFormat === 'story' ? 'aspect-[9/16]' : 'aspect-square'
                    } rounded-2xl p-6 sm:p-7 flex flex-col justify-between text-white text-center relative overflow-hidden shadow-2xl select-none transition-all`}
                    style={{
                      background: 'radial-gradient(circle at 50% 20%, #0d2857 0%, #041534 50%, #020917 100%)',
                      boxShadow: '0 20px 40px -15px rgba(4, 21, 52, 0.7)'
                    }}
                  >
                    {/* Decorative Ambient Glow Elements */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-[#fd1d1d]/10 rounded-full blur-2xl pointer-events-none" />

                    {/* Top Branding Section */}
                    <div className="relative z-10 pt-1 flex flex-col items-center">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-[#fed977]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M11 2h2v7h7v2h-7v11h-2v-11h-7v-2h7v-7z" />
                        </svg>
                        <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-white/90 font-label-caps">
                          Zionaviel
                        </span>
                      </div>
                      <span className="inline-block px-3 py-1 rounded-full bg-[#fed977]/15 border border-[#fed977]/30 text-[#fed977] text-[10px] font-bold tracking-[0.2em] uppercase font-label-caps shadow-sm">
                        Verse of the Day
                      </span>
                    </div>

                    {/* Middle Verse Text */}
                    <div className="relative z-10 my-auto px-1 py-4 flex flex-col justify-center">
                      <blockquote className={`font-verse-quote italic ${
                        storyFormat === 'story' ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
                      } leading-relaxed text-white drop-shadow-md`}>
                        "{data.verse}"
                      </blockquote>
                      <div className="mt-4 pt-3 border-t border-white/15 flex flex-col items-center">
                        <p className="font-headline-sm text-sm sm:text-base font-bold text-[#fed977] tracking-wider">
                          {data.reference}
                        </p>
                        <span className="text-[10px] font-semibold tracking-widest uppercase text-white/60 mt-0.5">
                          {data.translation || 'English Standard Version'}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Footer Section */}
                    <div className="relative z-10 pb-1 flex flex-col items-center gap-1 border-t border-white/10 pt-3">
                      <p className="text-[10px] font-medium text-white/70 italic">
                        "Thy word is a lamp unto my feet"
                      </p>
                      <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#fed977]/90 font-label-caps">
                        zionaviel.me/verse
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Action Controls */}
            <div className="pt-3 border-t border-outline-variant/40 mt-3 space-y-2.5">
              {screenshotImage ? (
                /* Generated Preview Controls */
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={downloadScreenshot}
                    className="py-3 px-3 bg-primary hover:bg-primary-container text-white rounded-xl text-xs font-bold font-label-caps uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98"
                  >
                    <Download size={15} /> Save / Download
                  </button>

                  <button
                    type="button"
                    onClick={shareScreenshot}
                    className="py-3 px-3 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-95 text-white rounded-xl text-xs font-bold font-label-caps uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-98"
                  >
                    <Share2 size={15} /> Share to Story
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`"${data.verse}" — ${data.reference}\n\nRead daily bread on: ${window.location.origin}/verse`);
                      showShareToast('Caption copied to clipboard!');
                    }}
                    className="py-2.5 px-3 bg-surface-container hover:bg-surface-container-high text-primary rounded-xl text-xs font-bold font-label-caps uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer col-span-1"
                  >
                    <Copy size={13} /> Copy Caption
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setScreenshotImage(null);
                      setScreenshotError(null);
                    }}
                    className="py-2.5 px-3 border border-outline-variant hover:bg-surface-container text-on-surface-variant hover:text-primary rounded-xl text-xs font-bold font-label-caps uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer col-span-1"
                  >
                    <RotateCcw size={13} /> Retake
                  </button>
                </div>
              ) : (
                /* Pre-generation Capture Controls */
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`"${data.verse}" — ${data.reference}\n\nRead daily bread on: ${window.location.origin}/verse`);
                      showShareToast('Caption copied!');
                    }}
                    className="sm:w-1/3 py-3 px-3 bg-surface-container hover:bg-surface-container-high text-primary rounded-xl text-xs font-bold font-label-caps uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Copy size={14} /> Copy Caption
                  </button>

                  <button
                    type="button"
                    disabled={isGeneratingScreenshot}
                    onClick={handleTakeScreenshot}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-95 text-white rounded-xl text-xs font-bold font-label-caps uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 shadow-md cursor-pointer text-center active:scale-98 disabled:opacity-60"
                  >
                    {isGeneratingScreenshot ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Generating Screenshot...</span>
                      </>
                    ) : (
                      <>
                        <Camera size={16} />
                        <span>Take Screenshot</span>
                      </>
                    )}
                  </button>
                </div>
              )}
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

