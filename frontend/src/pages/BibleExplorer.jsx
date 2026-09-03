import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Bookmark,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Search,
  Volume2,
  Share2,
  Printer,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Star,
  X,
  VolumeX,
  Languages,
  ArrowLeft,
  Check
} from 'lucide-react';

// Full Protestant Bible Metadata
const BIBLE_BOOKS_MAP = {
  // Old Testament
  genesis: { name: 'Genesis', chapters: 50, testament: 'Old Testament' },
  exodus: { name: 'Exodus', chapters: 40, testament: 'Old Testament' },
  leviticus: { name: 'Leviticus', chapters: 27, testament: 'Old Testament' },
  numbers: { name: 'Numbers', chapters: 36, testament: 'Old Testament' },
  deuteronomy: { name: 'Deuteronomy', chapters: 34, testament: 'Old Testament' },
  joshua: { name: 'Joshua', chapters: 24, testament: 'Old Testament' },
  judges: { name: 'Judges', chapters: 21, testament: 'Old Testament' },
  ruth: { name: 'Ruth', chapters: 4, testament: 'Old Testament' },
  '1 samuel': { name: '1 Samuel', chapters: 31, testament: 'Old Testament' },
  '2 samuel': { name: '2 Samuel', chapters: 24, testament: 'Old Testament' },
  '1 kings': { name: '1 Kings', chapters: 22, testament: 'Old Testament' },
  '2 kings': { name: '2 Kings', chapters: 25, testament: 'Old Testament' },
  '1 chronicles': { name: '1 Chronicles', chapters: 29, testament: 'Old Testament' },
  '2 chronicles': { name: '2 Chronicles', chapters: 36, testament: 'Old Testament' },
  ezra: { name: 'Ezra', chapters: 10, testament: 'Old Testament' },
  nehemiah: { name: 'Nehemiah', chapters: 13, testament: 'Old Testament' },
  esther: { name: 'Esther', chapters: 10, testament: 'Old Testament' },
  job: { name: 'Job', chapters: 42, testament: 'Old Testament' },
  psalms: { name: 'Psalms', chapters: 150, testament: 'Old Testament' },
  proverbs: { name: 'Proverbs', chapters: 31, testament: 'Old Testament' },
  ecclesiastes: { name: 'Ecclesiastes', chapters: 12, testament: 'Old Testament' },
  'song of solomon': { name: 'Song of Solomon', chapters: 8, testament: 'Old Testament' },
  isaiah: { name: 'Isaiah', chapters: 66, testament: 'Old Testament' },
  jeremiah: { name: 'Jeremiah', chapters: 52, testament: 'Old Testament' },
  lamentations: { name: 'Lamentations', chapters: 5, testament: 'Old Testament' },
  ezekiel: { name: 'Ezekiel', chapters: 48, testament: 'Old Testament' },
  daniel: { name: 'Daniel', chapters: 12, testament: 'Old Testament' },
  hosea: { name: 'Hosea', chapters: 14, testament: 'Old Testament' },
  joel: { name: 'Joel', chapters: 3, testament: 'Old Testament' },
  amos: { name: 'Amos', chapters: 9, testament: 'Old Testament' },
  obadiah: { name: 'Obadiah', chapters: 1, testament: 'Old Testament' },
  jonah: { name: 'Jonah', chapters: 4, testament: 'Old Testament' },
  micah: { name: 'Micah', chapters: 7, testament: 'Old Testament' },
  nahum: { name: 'Nahum', chapters: 3, testament: 'Old Testament' },
  habakkuk: { name: 'Habakkuk', chapters: 3, testament: 'Old Testament' },
  zephaniah: { name: 'Zephaniah', chapters: 3, testament: 'Old Testament' },
  haggai: { name: 'Haggai', chapters: 2, testament: 'Old Testament' },
  zechariah: { name: 'Zechariah', chapters: 14, testament: 'Old Testament' },
  malachi: { name: 'Malachi', chapters: 4, testament: 'Old Testament' },
  
  // New Testament
  matthew: { name: 'Matthew', chapters: 28, testament: 'New Testament' },
  mark: { name: 'Mark', chapters: 16, testament: 'New Testament' },
  luke: { name: 'Luke', chapters: 24, testament: 'New Testament' },
  john: { name: 'John', chapters: 21, testament: 'New Testament' },
  acts: { name: 'Acts', chapters: 28, testament: 'New Testament' },
  romans: { name: 'Romans', chapters: 16, testament: 'New Testament' },
  '1 corinthians': { name: '1 Corinthians', chapters: 16, testament: 'New Testament' },
  '2 corinthians': { name: '2 Corinthians', chapters: 13, testament: 'New Testament' },
  galatians: { name: 'Galatians', chapters: 6, testament: 'New Testament' },
  ephesians: { name: 'Ephesians', chapters: 6, testament: 'New Testament' },
  philippians: { name: 'Philippians', chapters: 4, testament: 'New Testament' },
  colossians: { name: 'Colossians', chapters: 4, testament: 'New Testament' },
  '1 thessalonians': { name: '1 Thessalonians', chapters: 5, testament: 'New Testament' },
  '2 thessalonians': { name: '2 Thessalonians', chapters: 3, testament: 'New Testament' },
  '1 timothy': { name: '1 Timothy', chapters: 6, testament: 'New Testament' },
  '2 timothy': { name: '2 Timothy', chapters: 4, testament: 'New Testament' },
  titus: { name: 'Titus', chapters: 3, testament: 'New Testament' },
  philemon: { name: 'Philemon', chapters: 1, testament: 'New Testament' },
  hebrews: { name: 'Hebrews', chapters: 13, testament: 'New Testament' },
  james: { name: 'James', chapters: 5, testament: 'New Testament' },
  '1 peter': { name: '1 Peter', chapters: 5, testament: 'New Testament' },
  '2 peter': { name: '2 Peter', chapters: 3, testament: 'New Testament' },
  '1 john': { name: '1 John', chapters: 5, testament: 'New Testament' },
  '2 john': { name: '2 John', chapters: 1, testament: 'New Testament' },
  '3 john': { name: '3 John', chapters: 1, testament: 'New Testament' },
  jude: { name: 'Jude', chapters: 1, testament: 'New Testament' },
  revelation: { name: 'Revelation', chapters: 22, testament: 'New Testament' }
};

const BIBLE_BOOKS_ORDER = [
  'genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy', 'joshua', 'judges', 'ruth',
  '1 samuel', '2 samuel', '1 kings', '2 kings', '1 chronicles', '2 chronicles', 'ezra',
  'nehemiah', 'esther', 'job', 'psalms', 'proverbs', 'ecclesiastes', 'song of solomon',
  'isaiah', 'jeremiah', 'lamentations', 'ezekiel', 'daniel', 'hosea', 'joel', 'amos',
  'obadiah', 'jonah', 'micah', 'nahum', 'habakkuk', 'zephaniah', 'haggai', 'zechariah', 'malachi',
  'matthew', 'mark', 'luke', 'john', 'acts', 'romans', '1 corinthians', '2 corinthians',
  'galatians', 'ephesians', 'philippians', 'colossians', '1 thessalonians', '2 thessalonians',
  '1 timothy', '2 timothy', 'titus', 'philemon', 'hebrews', 'james', '1 peter', '2 peter',
  '1 john', '2 john', '3 john', 'jude', 'revelation'
];

export default function BibleExplorer() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState('read'); // 'read', 'favorites', 'history', 'settings'
  const [selectedBook, setSelectedBook] = useState('john');
  const [selectedChapter, setSelectedChapter] = useState(3);
  const [otExpanded, setOtExpanded] = useState(false);
  const [ntExpanded, setNtExpanded] = useState(true);
  const [viewingChaptersForBook, setViewingChaptersForBook] = useState(null); // Book key string when viewing chapter grid
  
  // API Data State
  const [bibleData, setBibleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Interactive States
  const [bookmarkedVerses, setBookmarkedVerses] = useState(() => {
    const saved = localStorage.getItem('saved_verses');
    return saved ? JSON.parse(saved) : [];
  });
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('bible_history');
    return saved ? JSON.parse(saved) : [
      { book: 'John', chapter: 3, timestamp: new Date().toISOString() }
    ];
  });
  const [activeTranslation, setActiveTranslation] = useState(() => {
    return localStorage.getItem('bible_translation') || 'KJV';
  });
  const [translationDropdownOpen, setTranslationDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);
  
  // Audio State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef(window.speechSynthesis);
  const translationCacheRef = useRef(new Map());
  
  // UI Settings State (Always Light Mode by default for every new user)
  const [textSize, setTextSize] = useState(() => localStorage.getItem('bible_text_size') || 'medium');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Mobile UI States
  const [mobileBooksDrawerOpen, setMobileBooksDrawerOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  
  const searchInputRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Scroll to top of the panel when book, chapter or tab changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo(0, 0);
    }
  }, [selectedBook, selectedChapter, activeTab]);

  // Persist translation
  useEffect(() => {
    localStorage.setItem('bible_translation', activeTranslation);
  }, [activeTranslation]);

  // Navigate to cross reference
  const handleNavigateToReference = (refItem) => {
    if (!refItem) return;
    
    if (refItem.book && refItem.chapter) {
      setSelectedBook(refItem.book);
      setSelectedChapter(parseInt(refItem.chapter, 10));
      setActiveTab('read');
      showToast(`Navigated to ${refItem.reference}`);
      return;
    }
    
    const refStr = typeof refItem === 'string' ? refItem : refItem.reference;
    if (!refStr) return;
    
    const match = refStr.match(/^([1-3]?\s?[A-Za-z.]+)\s+(\d+)/);
    if (match) {
      const rawBook = match[1].replace(/\./g, '').trim().toLowerCase();
      const chapterNum = parseInt(match[2], 10);
      
      const matchedKey = BIBLE_BOOKS_ORDER.find(k => {
        const bName = BIBLE_BOOKS_MAP[k]?.name.toLowerCase().replace(/\./g, '');
        return bName === rawBook || bName.startsWith(rawBook) || rawBook.startsWith(bName) || k === rawBook;
      });
      
      if (matchedKey && BIBLE_BOOKS_MAP[matchedKey]) {
        const maxCh = BIBLE_BOOKS_MAP[matchedKey].chapters;
        const validCh = Math.min(Math.max(1, chapterNum), maxCh);
        setSelectedBook(matchedKey);
        setSelectedChapter(validCh);
        setActiveTab('read');
        showToast(`Navigated to ${BIBLE_BOOKS_MAP[matchedKey].name} Chapter ${validCh}`);
      }
    }
  };

  // Fetch bible data on book/chapter/translation change with instant cache
  useEffect(() => {
    const apiBook = selectedBook.toLowerCase();
    const cacheKey = `${activeTranslation}-${apiBook}-${selectedChapter}`;

    // Instant local memory cache lookup
    if (translationCacheRef.current.has(cacheKey)) {
      setBibleData(translationCacheRef.current.get(cacheKey));
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    fetch(`/api/bible/${apiBook}/${selectedChapter}?translation=${activeTranslation}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Chapter not available');
        }
        return res.json();
      })
      .then((data) => {
        translationCacheRef.current.set(cacheKey, data);
        setBibleData(data);
        setLoading(false);
        // Add to history
        const historyItem = {
          book: data.book,
          chapter: data.chapter,
          timestamp: new Date().toISOString()
        };
        const updatedHistory = [
          historyItem,
          ...history.filter(h => !(h.book === data.book && h.chapter === data.chapter))
        ].slice(0, 15);
        setHistory(updatedHistory);
        localStorage.setItem('bible_history', JSON.stringify(updatedHistory));
      })
      .catch((err) => {
        console.error('Error fetching bible chapter:', err);
        setError(`The selected chapter (${BIBLE_BOOKS_MAP[selectedBook]?.name || selectedBook} ${selectedChapter}) could not be loaded.`);
        setLoading(false);
      });
  }, [selectedBook, selectedChapter, activeTranslation]);

  // Handle local storage sync for bookmarks
  useEffect(() => {
    localStorage.setItem('saved_verses', JSON.stringify(bookmarkedVerses));
  }, [bookmarkedVerses]);

  // Handle local storage sync for display theme & text size
  useEffect(() => {
    localStorage.setItem('bible_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('bible_text_size', textSize);
  }, [textSize]);

  // Handle Speech Synthesis cleanup
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  // Toggle Bookmark
  const toggleBookmark = (verseNum, verseText) => {
    const verseKey = `${selectedBook}-${selectedChapter}-${verseNum}`;
    const exists = bookmarkedVerses.some((v) => v.key === verseKey);
    
    if (exists) {
      setBookmarkedVerses(bookmarkedVerses.filter((v) => v.key !== verseKey));
      showToast(`Verse ${verseNum} removed from Saved.`);
    } else {
      const newBookmark = {
        key: verseKey,
        book: bibleData ? bibleData.book : selectedBook,
        chapter: selectedChapter,
        number: verseNum,
        text: verseText,
        timestamp: new Date().toISOString()
      };
      setBookmarkedVerses([...bookmarkedVerses, newBookmark]);
      showToast(`Verse ${verseNum} saved to Favorites!`);
    }
  };

  // Audio Narration
  const handleReadAloud = () => {
    if (!bibleData) return;
    
    if (isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      return;
    }

    const versesText = bibleData.verses.map(v => `${v.number}. ${v.text}`).join(' ');
    const textToSpeak = `${bibleData.book} Chapter ${bibleData.chapter}. ${versesText}`;
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onmark = () => {};
    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    synthRef.current.speak(utterance);
  };

  // Share Link / Copy Verse
  const handleShare = () => {
    if (!bibleData) return;
    const shareText = `${bibleData.book} ${bibleData.chapter} (${activeTranslation}) — Read online at Zionix.`;
    navigator.clipboard.writeText(window.location.href);
    showToast('Page link copied to clipboard!');
  };

  // Print Page
  const handlePrint = () => {
    window.print();
  };

  // Search Functionality calling backend API
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    // Server-side global search across entire Bible
    fetch(`/api/bible/search?q=${encodeURIComponent(query)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Search failed');
        return res.json();
      })
      .then((data) => {
        setSearchResults(data);
      })
      .catch((err) => {
        console.error('Error searching Bible:', err);
      });
  };

  const executeQuickSearch = () => {
    setActiveTab('read');
    if (window.innerWidth < 768) {
      setMobileSearchOpen(true);
    } else {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
        setSearchFocused(true);
      }
    }
  };

  // Boundary-aware Navigation
  const handlePrevChapter = () => {
    const currentIdx = BIBLE_BOOKS_ORDER.indexOf(selectedBook);
    if (selectedChapter > 1) {
      setSelectedChapter(selectedChapter - 1);
    } else if (currentIdx > 0) {
      const prevBook = BIBLE_BOOKS_ORDER[currentIdx - 1];
      const prevBookChapters = BIBLE_BOOKS_MAP[prevBook].chapters;
      setSelectedBook(prevBook);
      setSelectedChapter(prevBookChapters);
      showToast(`Switched to ${BIBLE_BOOKS_MAP[prevBook].name}`);
    } else {
      showToast('You are at the very beginning of the Holy Bible');
    }
  };

  const handleNextChapter = () => {
    const currentIdx = BIBLE_BOOKS_ORDER.indexOf(selectedBook);
    const currentBookChapters = BIBLE_BOOKS_MAP[selectedBook].chapters;
    if (selectedChapter < currentBookChapters) {
      setSelectedChapter(selectedChapter + 1);
    } else if (currentIdx < BIBLE_BOOKS_ORDER.length - 1) {
      const nextBook = BIBLE_BOOKS_ORDER[currentIdx + 1];
      setSelectedBook(nextBook);
      setSelectedChapter(1);
      showToast(`Switched to ${BIBLE_BOOKS_MAP[nextBook].name}`);
    } else {
      showToast('You are at the very end of the Holy Bible');
    }
  };

  // Font size classes helper
  const getTextSizeClass = () => {
    switch (textSize) {
      case 'small': return 'text-sm md:text-base leading-relaxed';
      case 'large': return 'text-xl md:text-2xl leading-loose';
      case 'medium':
      default:
        return 'text-body-lg text-body-lg-mobile md:text-body-lg leading-relaxed';
    }
  };

  // Separate OT and NT book keys
  const oldTestamentKeys = BIBLE_BOOKS_ORDER.filter(key => BIBLE_BOOKS_MAP[key].testament === 'Old Testament');
  const newTestamentKeys = BIBLE_BOOKS_ORDER.filter(key => BIBLE_BOOKS_MAP[key].testament === 'New Testament');

  return (
    <div className={`flex min-h-screen ${isDarkMode ? 'dark bg-[#121212] text-[#e2e2e0]' : 'bg-background text-on-surface'}`}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-primary text-on-primary px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-fade-in text-sm font-semibold tracking-wider font-label-caps">
          <Check size={16} className="text-secondary-fixed" />
          {toastMessage}
        </div>
      )}



      {/* SideNavBar (Desktop) */}
      <aside className="hidden md:flex flex-col p-stack-sm h-screen sticky top-0 w-72 border-r border-outline-variant bg-surface-container-lowest dark:bg-[#181816] transition-all duration-300 ease-in-out">
        <Link to="/" className="mb-stack-md px-2 block group">
          <div className="flex items-center gap-2 text-on-surface-variant group-hover:text-secondary transition-colors mb-2">
            <ArrowLeft size={12} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] font-label-caps">Zionix Home</span>
          </div>
          <div className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="Zionix Logo" 
              className="h-7 w-auto mix-blend-multiply dark:invert dark:mix-blend-screen" 
            />
            <h2 className="font-headline-sm text-headline-sm text-primary">Holy Bible</h2>
          </div>
          <p className="font-body-md text-xs text-on-surface-variant opacity-70 mt-1">Navigate the Word</p>
        </Link>
        
        <nav className="flex-1 space-y-1 overflow-y-auto pr-2">
          {viewingChaptersForBook ? (
            <div className="p-2 animate-fade-in text-left">
              <button 
                onClick={() => setViewingChaptersForBook(null)} 
                className="flex items-center gap-2 text-xs font-semibold text-secondary hover:underline mb-4"
              >
                <ChevronLeft size={16} /> Back to Books
              </button>
              <h3 className="font-headline-sm text-sm text-primary mb-3 font-semibold">
                {BIBLE_BOOKS_MAP[viewingChaptersForBook].name} Chapters
              </h3>
              <div className="grid grid-cols-4 gap-1.5 max-h-[50vh] overflow-y-auto pr-1">
                {Array.from({ length: BIBLE_BOOKS_MAP[viewingChaptersForBook].chapters }, (_, i) => i + 1).map((ch) => (
                  <button
                    key={ch}
                    onClick={() => {
                      setSelectedBook(viewingChaptersForBook);
                      setSelectedChapter(ch);
                      setViewingChaptersForBook(null);
                      setActiveTab('read');
                    }}
                    className={`py-2 text-center rounded text-xs transition-all border ${
                      selectedBook === viewingChaptersForBook && selectedChapter === ch
                        ? 'bg-secondary text-white border-secondary font-bold'
                        : 'bg-surface-container-low dark:bg-zinc-800 border-outline-variant hover:bg-secondary-container/20 hover:border-secondary'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Old Testament Header */}
              <button 
                onClick={() => setOtExpanded(!otExpanded)}
                className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-variant/50 rounded-lg transition-all duration-200 group"
              >
                <BookOpen size={18} className="text-primary" />
                <span className="font-body-md text-sm font-medium">Old Testament</span>
                {otExpanded ? <ChevronUp size={16} className="ml-auto opacity-50" /> : <ChevronDown size={16} className="ml-auto opacity-50" />}
              </button>
              
              {otExpanded && (
                <div className="ml-6 space-y-1 mb-2 max-h-48 overflow-y-auto pr-1 border-l border-outline-variant/30 pl-2 animate-fade-in text-left">
                  {oldTestamentKeys.map((key) => {
                    const bookName = BIBLE_BOOKS_MAP[key].name;
                    return (
                      <button
                        key={key}
                        onClick={() => setViewingChaptersForBook(key)}
                        className={`w-full text-left block px-3 py-1.5 text-xs rounded transition-colors ${
                          selectedBook === key
                            ? 'text-secondary font-bold bg-secondary-container/20 border-l-2 border-secondary pl-2'
                            : 'text-on-surface-variant hover:text-primary hover:bg-surface-variant/20'
                        }`}
                      >
                        {bookName}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* New Testament Header */}
              <button 
                onClick={() => setNtExpanded(!ntExpanded)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  ntExpanded ? 'bg-secondary-container/10 text-primary font-medium' : 'text-on-surface-variant hover:bg-surface-variant/50'
                }`}
              >
                <BookOpen size={18} className={ntExpanded ? 'text-secondary' : 'text-primary'} />
                <span className="font-body-md text-sm font-medium">New Testament</span>
                {ntExpanded ? <ChevronUp size={16} className="ml-auto" /> : <ChevronDown size={16} className="ml-auto" />}
              </button>

              {ntExpanded && (
                <div className="ml-6 space-y-1 mb-2 max-h-48 overflow-y-auto pr-1 border-l border-outline-variant/30 pl-2 animate-fade-in text-left">
                  {newTestamentKeys.map((key) => {
                    const bookName = BIBLE_BOOKS_MAP[key].name;
                    return (
                      <button
                        key={key}
                        onClick={() => setViewingChaptersForBook(key)}
                        className={`w-full text-left block px-3 py-1.5 text-xs rounded transition-colors ${
                          selectedBook === key
                            ? 'text-secondary font-bold bg-secondary-container/20 border-l-2 border-secondary pl-2'
                            : 'text-on-surface-variant hover:text-primary hover:bg-surface-variant/20'
                        }`}
                      >
                        {bookName}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Favorites Tab */}
              <button 
                onClick={() => {
                  setActiveTab('favorites');
                  setViewingChaptersForBook(null);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === 'favorites' ? 'bg-secondary-container/10 text-secondary font-medium' : 'text-on-surface-variant hover:bg-surface-variant/50'
                }`}
              >
                <Bookmark size={18} />
                <span className="font-body-md text-sm">Favorites ({bookmarkedVerses.length})</span>
              </button>

              {/* History Tab */}
              <button 
                onClick={() => {
                  setActiveTab('history');
                  setViewingChaptersForBook(null);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === 'history' ? 'bg-secondary-container/10 text-secondary font-medium' : 'text-on-surface-variant hover:bg-surface-variant/50'
                }`}
              >
                <HistoryIcon size={18} />
                <span className="font-body-md text-sm">History</span>
              </button>

              {/* Settings Tab */}
              <button 
                onClick={() => {
                  setActiveTab('settings');
                  setViewingChaptersForBook(null);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 mt-auto ${
                  activeTab === 'settings' ? 'bg-secondary-container/10 text-secondary font-medium' : 'text-on-surface-variant hover:bg-surface-variant/50'
                }`}
              >
                <SettingsIcon size={18} />
                <span className="font-body-md text-sm">Settings</span>
              </button>
            </>
          )}
        </nav>

        <div className="mt-stack-md pt-stack-sm border-t border-outline-variant/30">
          <button 
            onClick={executeQuickSearch}
            className="w-full py-3 px-4 bg-primary text-on-primary rounded flex items-center justify-center gap-2 font-label-caps text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-transform"
          >
            <Search size={14} />
            Quick Search
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-950 transition-colors duration-300">
        
        {/* TopAppBar Container */}
        <header className="sticky top-0 z-40 bg-surface/85 dark:bg-zinc-950/85 backdrop-blur-md border-b border-outline-variant/30 h-16 flex items-center justify-between px-4 md:px-6">
          {mobileSearchOpen ? (
            /* Expandable Full-Width Mobile Search Bar */
            <div className="flex items-center gap-2 w-full animate-fade-in">
              <button 
                onClick={() => {
                  setMobileSearchOpen(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="p-2 text-on-surface-variant hover:text-primary mr-1"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                <input 
                  autoFocus
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-8 py-2 bg-background dark:bg-zinc-900 border border-outline-variant rounded focus:outline-none focus:border-secondary transition-colors text-sm" 
                  placeholder="Search entire Bible..." 
                  type="text"
                />
                {searchQuery && (
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                    }} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                  >
                    <X size={16} />
                  </button>
                )}

                {/* Mobile Search Results Overlay */}
                {searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-outline-variant rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto p-2">
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest px-3 py-1 mb-1 border-b border-outline-variant/30">Matches in KJV Bible</p>
                    {searchResults.map((match, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSelectedBook(match.book.toLowerCase());
                          setSelectedChapter(match.chapter);
                          setActiveTab('read');
                          setSearchQuery('');
                          setSearchResults([]);
                          setMobileSearchOpen(false);
                          showToast(`Loaded ${match.book} ${match.chapter}`);
                          setTimeout(() => {
                            const el = document.getElementById(`verse-${match.number}`);
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }, 300);
                        }}
                        className="w-full text-left px-3 py-2.5 text-xs rounded hover:bg-surface-container-low dark:hover:bg-zinc-800 transition-colors flex flex-col gap-1 border-b border-outline-variant/10 last:border-0"
                      >
                        <span className="font-semibold text-primary">{match.book} {match.chapter}:{match.number}</span>
                        <p className="text-on-surface-variant italic line-clamp-2">{match.text}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Normal Header Content */
            <>
              <div className="flex items-center gap-2">
                <Link to="/" className="text-on-surface-variant hover:text-primary mr-1 flex items-center justify-center p-2 rounded-full hover:bg-surface-container-high transition-colors" title="Back to Home">
                  <ArrowLeft size={20} />
                </Link>
                <img 
                  src="/logo.png" 
                  alt="Zionix Logo" 
                  className="h-6 w-auto mix-blend-multiply dark:invert dark:mix-blend-screen" 
                />
                <span className="font-headline-sm text-sm md:text-base font-semibold text-primary dark:text-primary-fixed tracking-wide whitespace-nowrap">
                  Zionix Bible
                </span>
              </div>
              
              {/* Desktop-only Search input */}
              <div className="hidden md:block relative flex-1 max-w-xs mx-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
                <input 
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 250)}
                  className="w-full pl-9 pr-8 py-1.5 bg-background dark:bg-zinc-900 border border-outline-variant rounded focus:outline-none focus:border-secondary transition-colors text-xs" 
                  placeholder="Search entire Bible..." 
                  type="text"
                />
                {searchQuery && (
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                    }} 
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary"
                  >
                    <X size={14} />
                  </button>
                )}

                {/* Search Suggestions Panel (Desktop) */}
                {searchFocused && searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-outline-variant rounded-xl shadow-2xl z-50 max-h-72 overflow-y-auto p-2">
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest px-3 py-1 mb-1 border-b border-outline-variant/30">Matches in KJV Bible</p>
                    {searchResults.map((match, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSelectedBook(match.book.toLowerCase());
                          setSelectedChapter(match.chapter);
                          setActiveTab('read');
                          setSearchQuery('');
                          setSearchResults([]);
                          showToast(`Loaded ${match.book} ${match.chapter}`);
                          setTimeout(() => {
                            const el = document.getElementById(`verse-${match.number}`);
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }, 300);
                        }}
                        className="w-full text-left px-3 py-2 text-[11px] rounded hover:bg-surface-container-low dark:hover:bg-zinc-800 transition-colors flex flex-col gap-0.5 border-b border-outline-variant/10 last:border-0"
                      >
                        <span className="font-semibold text-primary">{match.book} {match.chapter}:{match.number}</span>
                        <p className="text-on-surface-variant italic line-clamp-1">{match.text}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 md:gap-3">
                {/* Mobile Search Toggle */}
                <button 
                  onClick={() => setMobileSearchOpen(true)}
                  className="md:hidden p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container-high transition-colors"
                  title="Search Bible"
                >
                  <Search size={18} />
                </button>

                {/* Translation Switcher */}
                <div className="relative">
                  <button 
                    onClick={() => setTranslationDropdownOpen(!translationDropdownOpen)}
                    className="flex items-center gap-1 px-2.5 py-1.5 border border-outline-variant rounded text-xs font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors"
                  >
                    <Languages size={13} />
                    <span className="hidden sm:inline">{activeTranslation}</span>
                    <ChevronDown size={11} />
                  </button>
                  {translationDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-28 bg-white dark:bg-zinc-900 border border-outline-variant rounded-lg shadow-lg p-1 z-50 animate-fade-in">
                      {['KJV', 'ESV', 'NIV'].map((t) => (
                        <button
                          key={t}
                          onClick={() => {
                            setActiveTranslation(t);
                            setTranslationDropdownOpen(false);
                            showToast(`Switched to ${t} Bible`);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs rounded transition-colors ${
                            activeTranslation === t 
                              ? 'bg-secondary-container/20 text-secondary font-bold' 
                              : 'hover:bg-surface-container-low dark:hover:bg-zinc-800'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Read Aloud Button */}
                <button 
                  onClick={handleReadAloud}
                  className={`p-2 rounded-full transition-colors active:scale-95 ${
                    isSpeaking ? 'bg-secondary-container text-secondary' : 'text-primary hover:bg-surface-container-high'
                  }`}
                  title={isSpeaking ? "Mute audio" : "Listen to scripture"}
                >
                  {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              </div>
            </>
          )}
        </header>

        {/* Scrollable Bible Panel */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-margin-mobile md:px-stack-lg py-stack-md">
          <div className="max-w-2xl mx-auto">
            
            {/* 1. READ VIEW */}
            {activeTab === 'read' && (
              <>
                {loading && (
                  <div className="pt-24 text-center text-on-surface-variant font-body-lg">
                    Loading scriptures...
                  </div>
                )}

                {error && !loading && (
                  <div className="pt-24 text-center">
                    <p className="text-on-surface-variant font-body-lg mb-4">{error}</p>
                    <button 
                      onClick={() => {
                        setSelectedBook('john');
                        setSelectedChapter(3);
                      }}
                      className="bg-primary text-on-primary px-6 py-2 rounded font-label-caps text-xs uppercase tracking-widest hover:bg-primary-container active:scale-95 transition-all"
                    >
                      Load John Chapter 3
                    </button>
                  </div>
                )}

                {bibleData && !loading && !error && (
                  <>
                    {/* Header Section */}
                    <div className="mb-stack-lg border-b border-outline-variant pb-stack-sm flex items-end justify-between">
                      <div className="text-left">
                        <p className="font-label-caps text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-2">{bibleData.testament}</p>
                        <h1 className="font-display-lg text-[28px] md:text-[36px] text-primary flex items-center flex-wrap gap-x-2">
                          <span>{bibleData.book}</span>
                          <span className="font-normal text-on-surface-variant/80">Chapter {bibleData.chapter}</span>
                        </h1>
                      </div>
                      <div className="flex gap-2 mb-2">
                        <button 
                          onClick={handleShare}
                          className="p-2 border border-outline-variant rounded-full hover:border-secondary transition-colors group"
                          title="Share page"
                        >
                          <Share2 size={16} className="text-on-surface-variant group-hover:text-secondary" />
                        </button>
                        <button 
                          onClick={handlePrint}
                          className="p-2 border border-outline-variant rounded-full hover:border-secondary transition-colors group"
                          title="Print chapter"
                        >
                          <Printer size={16} className="text-on-surface-variant group-hover:text-secondary" />
                        </button>
                      </div>
                    </div>

                    {/* Verse Content */}
                    <article className="space-y-6 pb-12 text-left">
                      {bibleData.verses.map((verse) => {
                        const verseKey = `${selectedBook}-${selectedChapter}-${verse.number}`;
                        const isBookmarked = bookmarkedVerses.some((v) => v.key === verseKey);

                        if (verse.highlight) {
                          return (
                            <div 
                              key={verse.number} 
                              id={`verse-${verse.number}`}
                              className="my-stack-lg p-stack-md border-l-2 border-secondary bg-surface-container-low dark:bg-zinc-900 rounded-r-xl group relative"
                            >
                              <div className="flex justify-between items-start mb-4">
                                <span className="font-label-caps text-[10px] font-bold text-secondary uppercase tracking-widest">Key Passage</span>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => toggleBookmark(verse.number, verse.text)}
                                    className="text-secondary hover:scale-110 transition-transform"
                                  >
                                    <Star size={16} fill={isBookmarked ? "currentColor" : "none"} />
                                  </button>
                                </div>
                              </div>
                              <p className="font-verse-quote text-verse-quote text-primary dark:text-secondary-fixed italic mb-4">
                                “{verse.text}”
                              </p>
                              <span className="font-label-caps text-xs text-on-surface-variant font-semibold">— {bibleData.book} {bibleData.chapter}:{verse.number}</span>
                            </div>
                          );
                        }

                        return (
                          <div 
                            key={verse.number} 
                            id={`verse-${verse.number}`}
                            className={`group relative flex gap-4 items-start hover:bg-surface-container-lowest dark:hover:bg-zinc-900 transition-all p-3 -mx-3 rounded-xl`}
                          >
                            <div className="flex flex-col items-center gap-2 mt-1 min-w-[20px]">
                              <span className="font-label-caps text-xs text-secondary font-bold">{verse.number}</span>
                              <button 
                                onClick={() => toggleBookmark(verse.number, verse.text)}
                                className={`opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 ${isBookmarked ? 'opacity-100 text-secondary' : 'text-outline hover:text-secondary'}`}
                              >
                                <Bookmark size={14} fill={isBookmarked ? "currentColor" : "none"} />
                              </button>
                            </div>
                            <p className={`${getTextSizeClass()} text-on-surface`}>
                              {verse.text}
                            </p>
                          </div>
                        );
                      })}

                      {/* Chapter Navigation */}
                      <div className="pt-stack-lg border-t border-outline-variant flex justify-between gap-4">
                        <button 
                          onClick={handlePrevChapter}
                          className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors text-xs font-semibold uppercase tracking-widest font-label-caps"
                        >
                          <ChevronLeft size={16} />
                          <span className="hidden sm:inline">Prev Chapter</span>
                          <span className="sm:hidden">Prev</span>
                        </button>
                        
                        {/* Book/Chapter Quick Display indicator */}
                        <div className="text-xs font-bold text-secondary uppercase tracking-[0.15em] font-label-caps self-center">
                          {bibleData.book} {bibleData.chapter}
                        </div>

                        <button 
                          onClick={handleNextChapter}
                          className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors text-xs font-semibold uppercase tracking-widest font-label-caps"
                        >
                          <span className="hidden sm:inline">Next Chapter</span>
                          <span className="sm:hidden">Next</span>
                          <ChevronRight size={16} />
                        </button>
                      </div>

                      {/* Mobile/Tablet Study Insights & Cross References */}
                      <div className="mt-8 lg:hidden space-y-6">
                        <div className="border-t border-outline-variant/30 pt-6"></div>
                        
                        {/* Insight Card */}
                        <div className="bg-surface-container-low dark:bg-zinc-900 border border-outline-variant rounded-xl p-5">
                          <h4 className="font-label-caps text-[10px] font-bold text-secondary uppercase tracking-[0.15em] mb-2.5">Study Insights</h4>
                          <p className="text-xs text-on-surface-variant leading-relaxed">
                            {bibleData.insights}
                          </p>
                        </div>

                        {/* Cross Reference Card */}
                        {bibleData.references && bibleData.references.length > 0 && (
                          <div className="bg-surface-container-low dark:bg-zinc-900 border border-outline-variant rounded-xl p-5">
                            <h4 className="font-label-caps text-[10px] font-bold text-secondary uppercase tracking-[0.15em] mb-2.5">Cross References</h4>
                            <ul className="space-y-2.5">
                              {bibleData.references.map((ref, idx) => (
                                <li 
                                  key={idx} 
                                  onClick={() => handleNavigateToReference(ref)}
                                  className="group p-2.5 rounded-lg bg-surface hover:bg-secondary-container/20 border border-outline-variant/30 hover:border-secondary transition-all cursor-pointer"
                                  title={`Tap to read ${ref.reference}`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="block text-xs font-bold text-primary group-hover:text-secondary transition-colors">{ref.reference}</span>
                                    <ChevronRight size={13} className="text-on-surface-variant group-hover:text-secondary transition-transform group-hover:translate-x-0.5" />
                                  </div>
                                  <p className="text-xs text-on-surface-variant leading-normal mt-1">
                                    {ref.snippet}
                                  </p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </article>
                  </>
                )}
              </>
            )}

            {/* 2. FAVORITES VIEW */}
            {activeTab === 'favorites' && (
              <div className="pb-24 text-left">
                <div className="mb-stack-lg border-b border-outline-variant pb-stack-sm">
                  <p className="font-label-caps text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-2">My Studies</p>
                  <h1 className="font-display-lg text-display-lg text-primary">Saved Passages</h1>
                </div>

                {bookmarkedVerses.length === 0 ? (
                  <div className="text-center py-16 text-on-surface-variant">
                    <Bookmark size={48} className="mx-auto text-outline-variant mb-4" />
                    <p className="font-body-lg">No bookmarked verses yet.</p>
                    <p className="text-sm mt-1">Bookmark verses while reading to see them listed here.</p>
                    <button 
                      onClick={() => setActiveTab('read')} 
                      className="mt-6 bg-primary text-on-primary px-6 py-3 rounded font-label-caps text-xs uppercase tracking-widest hover:bg-primary-container active:scale-95 transition-all"
                    >
                      Start Reading
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {bookmarkedVerses.map((fav, index) => (
                      <div key={index} className="bg-surface-container-low dark:bg-zinc-900 border border-outline-variant/30 p-6 rounded-xl flex gap-4 items-start relative group">
                        <div className="flex-1">
                          <span className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2 block">
                            {fav.book} {fav.chapter}:{fav.number}
                          </span>
                          <p className="font-verse-quote italic text-primary dark:text-secondary-fixed text-base leading-relaxed">
                            "{fav.text}"
                          </p>
                        </div>
                        <button 
                          onClick={() => toggleBookmark(fav.number, fav.text)}
                          className="text-on-surface-variant hover:text-red-600 transition-colors"
                          title="Remove bookmark"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. HISTORY VIEW */}
            {activeTab === 'history' && (
              <div className="pb-24 text-left">
                <div className="mb-stack-lg border-b border-outline-variant pb-stack-sm">
                  <p className="font-label-caps text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-2">Recent Activities</p>
                  <h1 className="font-display-lg text-display-lg text-primary">Reading History</h1>
                </div>

                <div className="space-y-4">
                  {history.map((hist, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedBook(hist.book.toLowerCase());
                        setSelectedChapter(hist.chapter);
                        setActiveTab('read');
                      }}
                      className="w-full bg-surface-container-lowest dark:bg-zinc-900 border border-outline-variant/30 p-4 rounded-lg flex items-center justify-between hover:border-secondary transition-colors text-left"
                    >
                      <div>
                        <p className="text-sm font-semibold text-primary">{hist.book} Chapter {hist.chapter}</p>
                        <p className="text-[10px] text-on-surface-variant opacity-70">
                          {new Date(hist.timestamp).toLocaleDateString()} {new Date(hist.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-outline" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 4. SETTINGS VIEW */}
            {activeTab === 'settings' && (
              <div className="pb-24 text-left">
                <div className="mb-stack-lg border-b border-outline-variant pb-stack-sm">
                  <p className="font-label-caps text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-2">Personalization</p>
                  <h1 className="font-display-lg text-display-lg text-primary">Reading Settings</h1>
                </div>

                <div className="bg-surface-container-low dark:bg-zinc-900 border border-outline-variant/30 rounded-xl p-6 md:p-8 space-y-8">
                  {/* Font Size Option */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-3">Scripture Text Size</h3>
                    <div className="flex gap-4">
                      {['small', 'medium', 'large'].map((size) => (
                        <button
                          key={size}
                          onClick={() => {
                            setTextSize(size);
                            showToast(`Text size set to ${size}`);
                          }}
                          className={`flex-1 py-3 px-4 border rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                            textSize === size 
                              ? 'bg-primary text-on-primary border-primary' 
                              : 'bg-white dark:bg-zinc-800 border-outline-variant hover:bg-surface-container-high'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer Section */}
        <footer className="w-full py-stack-lg border-t border-outline-variant bg-surface-container-low dark:bg-zinc-900 transition-colors">
          <div className="max-w-container-max mx-auto px-margin-mobile flex flex-col md:flex-row justify-between items-start gap-stack-md text-left">
            <div>
              <h3 className="font-headline-md text-headline-md font-bold text-primary mb-2">Zionix</h3>
              <p className="font-body-md text-sm text-on-tertiary-fixed-variant opacity-70">Spreading the Gospel through clarity and reverence.</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-4 text-xs font-semibold font-label-caps uppercase tracking-wider">
                <a className="text-on-tertiary-fixed-variant hover:text-primary hover:underline transition-all" href="#">Privacy Policy</a>
                <a className="text-on-tertiary-fixed-variant hover:text-primary hover:underline transition-all" href="#">Terms of Service</a>
                <a className="text-on-tertiary-fixed-variant hover:text-primary hover:underline transition-all" href="#">Contact</a>
              </div>
              <p className="text-on-tertiary-fixed-variant opacity-50 text-xs">© 2026 Zionix Ministry. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>

      {/* Right Tool Panel (Desktop Study Insights) */}
      <aside className="hidden lg:flex w-80 border-l border-outline-variant flex-col p-stack-sm bg-surface-container-lowest dark:bg-[#181816] transition-colors overflow-y-auto">
        <div className="flex flex-col gap-6 text-left">
          
          {/* Insight Card */}
          <div className="bg-surface dark:bg-zinc-900 border border-outline-variant rounded-xl p-6">
            <h4 className="font-label-caps text-[10px] font-bold text-secondary uppercase tracking-[0.15em] mb-3">Study Insights</h4>
            {bibleData ? (
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {bibleData.insights}
              </p>
            ) : (
              <p className="text-xs text-on-surface-variant leading-relaxed italic">
                Select a book and chapter to load commentary.
              </p>
            )}
          </div>

          {/* Cross Reference Card */}
          <div className="bg-surface dark:bg-zinc-900 border border-outline-variant rounded-xl p-6">
            <h4 className="font-label-caps text-[10px] font-bold text-secondary uppercase tracking-[0.15em] mb-3">Cross References</h4>
            {bibleData && bibleData.references && bibleData.references.length > 0 ? (
              <ul className="space-y-3">
                {bibleData.references.map((ref, idx) => (
                  <li 
                    key={idx} 
                    onClick={() => handleNavigateToReference(ref)}
                    className="group cursor-pointer hover:bg-surface-container-low dark:hover:bg-zinc-800 p-2.5 rounded-lg border border-transparent hover:border-outline-variant/30 transition-all"
                    title={`Click to read ${ref.reference}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="block text-xs font-semibold text-primary group-hover:text-secondary transition-colors">{ref.reference}</span>
                      <ChevronRight size={12} className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-xs text-on-surface-variant line-clamp-1 group-hover:line-clamp-none transition-all duration-300">
                      {ref.snippet}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-on-surface-variant leading-relaxed italic">
                Loading cross references for this chapter...
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Drawer for Books List */}
      {mobileBooksDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileBooksDrawerOpen(false)} />
          <div className="relative bg-white dark:bg-zinc-900 w-72 h-full flex flex-col p-6 shadow-2xl animate-slide-in overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-sm text-lg text-primary">Books of the Bible</h3>
              <button 
                onClick={() => {
                  setMobileBooksDrawerOpen(false);
                  setViewingChaptersForBook(null);
                }} 
                className="text-on-surface-variant"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Book Lists or Chapter Grid in mobile drawer */}
            <div className="space-y-6 text-left flex-1">
              {viewingChaptersForBook ? (
                <div className="animate-slide-in">
                  <button 
                    onClick={() => setViewingChaptersForBook(null)} 
                    className="flex items-center gap-2 text-xs font-semibold text-secondary hover:underline mb-4"
                  >
                    <ChevronLeft size={16} /> Back to Books
                  </button>
                  <h4 className="text-sm font-bold text-primary mb-3">
                    {BIBLE_BOOKS_MAP[viewingChaptersForBook].name} Chapters
                  </h4>
                  <div className="grid grid-cols-5 gap-2 max-h-[70vh] overflow-y-auto pb-12 pr-1">
                    {Array.from({ length: BIBLE_BOOKS_MAP[viewingChaptersForBook].chapters }, (_, i) => i + 1).map((ch) => (
                      <button
                        key={ch}
                        onClick={() => {
                          setSelectedBook(viewingChaptersForBook);
                          setSelectedChapter(ch);
                          setViewingChaptersForBook(null);
                          setMobileBooksDrawerOpen(false);
                          setActiveTab('read');
                        }}
                        className={`py-2.5 text-center rounded text-xs transition-colors border ${
                          selectedBook === viewingChaptersForBook && selectedChapter === ch
                            ? 'bg-secondary text-white border-secondary font-bold'
                            : 'bg-surface-container-low dark:bg-zinc-800 border-outline-variant hover:bg-secondary-container/20 hover:border-secondary'
                        }`}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-3">Old Testament</h4>
                    <div className="grid grid-cols-2 gap-2 max-h-[30vh] overflow-y-auto pr-1">
                      {oldTestamentKeys.map((key) => {
                        const bookName = BIBLE_BOOKS_MAP[key].name;
                        return (
                          <button
                            key={key}
                            onClick={() => setViewingChaptersForBook(key)}
                            className={`text-left text-xs py-2 px-3 rounded transition-colors ${
                              selectedBook === key ? 'bg-secondary-container/20 text-secondary font-bold' : 'hover:bg-surface-container-low dark:hover:bg-zinc-800'
                            }`}
                          >
                            {bookName}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-3">New Testament</h4>
                    <div className="grid grid-cols-2 gap-2 max-h-[30vh] overflow-y-auto pr-1">
                      {newTestamentKeys.map((key) => {
                        const bookName = BIBLE_BOOKS_MAP[key].name;
                        return (
                          <button
                            key={key}
                            onClick={() => setViewingChaptersForBook(key)}
                            className={`text-left text-xs py-2 px-3 rounded transition-colors ${
                              selectedBook === key ? 'bg-secondary-container/20 text-secondary font-bold' : 'hover:bg-surface-container-low dark:hover:bg-zinc-800'
                            }`}
                          >
                            {bookName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Navigation Bar (Bottom) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-outline-variant/30 flex items-center justify-around px-margin-mobile z-40">
        <button 
          onClick={() => {
            setMobileBooksDrawerOpen(true);
            setViewingChaptersForBook(null);
          }}
          className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-secondary"
        >
          <BookOpen size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest font-label-caps">Books</span>
        </button>
        <button 
          onClick={() => {
            setActiveTab('read');
            setViewingChaptersForBook(null);
          }}
          className={`flex flex-col items-center gap-1 ${activeTab === 'read' ? 'text-secondary' : 'text-on-surface-variant'}`}
        >
          <BookOpen size={20} className={activeTab === 'read' ? 'stroke-secondary' : ''} />
          <span className="text-[9px] font-bold uppercase tracking-widest font-label-caps">Read</span>
        </button>
        <button 
          onClick={() => {
            setActiveTab('favorites');
            setViewingChaptersForBook(null);
          }}
          className={`flex flex-col items-center gap-1 ${activeTab === 'favorites' ? 'text-secondary' : 'text-on-surface-variant'}`}
        >
          <Bookmark size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest font-label-caps">Saved</span>
        </button>
        <button 
          onClick={() => {
            setActiveTab('settings');
            setViewingChaptersForBook(null);
          }}
          className={`flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-secondary' : 'text-on-surface-variant'}`}
        >
          <SettingsIcon size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest font-label-caps">Settings</span>
        </button>
      </nav>
    </div>
  );
}
