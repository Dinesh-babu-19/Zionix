import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
  Check,
  AlertCircle
} from 'lucide-react';
import SEO from '../components/SEO';
import {
  BIBLE_BOOKS_MAP,
  BIBLE_BOOKS_ORDER,
  parseBibleReference,
  getBookSuggestions,
  resolveBookKey
} from '../lib/bibleSearchEngine';

// Helper to parse verse parameter like "2" or "1-5" into array of verse numbers
function parseVerseParam(verseStr) {
  if (!verseStr || typeof verseStr !== 'string') return [];
  const parts = verseStr.split(/[-–—]/);
  const start = parseInt(parts[0], 10);
  if (isNaN(start) || start <= 0) return [];
  if (parts.length > 1) {
    const end = parseInt(parts[1], 10);
    if (!isNaN(end) && end >= start) {
      const verses = [];
      const safeEnd = Math.min(end, start + 100);
      for (let i = start; i <= safeEnd; i++) {
        verses.push(i);
      }
      return verses;
    }
  }
  return [start];
}

export default function BibleExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlBook = searchParams.get('book')?.toLowerCase();
  const urlChapter = parseInt(searchParams.get('chapter'), 10);
  const urlVerse = searchParams.get('verse');

  // Restore previous chapter and book user read, or fallback to John 3
  const initialBook = (urlBook && BIBLE_BOOKS_MAP[urlBook]) 
    ? urlBook 
    : (localStorage.getItem('bible_last_book') || 'john');

  const initialChapter = (!isNaN(urlChapter) && urlChapter > 0)
    ? urlChapter
    : (parseInt(localStorage.getItem('bible_last_chapter'), 10) || 3);

  // Navigation & View State
  const [activeTab, setActiveTab] = useState('read'); // 'read', 'favorites', 'history', 'settings'
  const [selectedBook, setSelectedBook] = useState(initialBook);
  const [selectedChapter, setSelectedChapter] = useState(initialChapter);
  const [highlightedVerses, setHighlightedVerses] = useState(() => parseVerseParam(urlVerse));
  const [otExpanded, setOtExpanded] = useState(() => {
    return BIBLE_BOOKS_MAP[initialBook]?.testament === 'Old Testament';
  });
  const [ntExpanded, setNtExpanded] = useState(() => {
    return BIBLE_BOOKS_MAP[initialBook]?.testament !== 'Old Testament';
  });
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

  // Synchronize state from URL search parameters on route change and browser Back/Forward (popstate)
  useEffect(() => {
    const pBook = searchParams.get('book')?.toLowerCase();
    const pChapter = parseInt(searchParams.get('chapter'), 10);
    const pVerse = searchParams.get('verse');

    if (pBook && BIBLE_BOOKS_MAP[pBook]) {
      const maxCh = BIBLE_BOOKS_MAP[pBook].chapters;
      const validCh = (!isNaN(pChapter) && pChapter >= 1 && pChapter <= maxCh) ? pChapter : 1;
      
      setSelectedBook(pBook);
      setSelectedChapter(validCh);
      setOtExpanded(BIBLE_BOOKS_MAP[pBook]?.testament === 'Old Testament');
      setNtExpanded(BIBLE_BOOKS_MAP[pBook]?.testament !== 'Old Testament');

      const bookName = BIBLE_BOOKS_MAP[pBook].name;
      if (pVerse) {
        const parsedRange = parseVerseParam(pVerse);
        setHighlightedVerses(parsedRange);
        setSearchQuery(`${bookName} ${validCh}:${pVerse}`);
      } else {
        setHighlightedVerses([]);
        setSearchQuery(`${bookName} ${validCh}`);
      }
    } else if (!pBook) {
      // If accessed without searchParams, check localStorage or default to John 3 with replace: true
      const savedBook = localStorage.getItem('bible_last_book') || 'john';
      const savedCh = parseInt(localStorage.getItem('bible_last_chapter'), 10) || 3;
      const validBook = BIBLE_BOOKS_MAP[savedBook] ? savedBook : 'john';
      const validCh = Math.min(Math.max(1, savedCh), BIBLE_BOOKS_MAP[validBook].chapters);

      setSearchParams({ book: validBook, chapter: validCh.toString() }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Navigate to passage using browser history API
  const navigateToPassage = useCallback(({ book, chapter = 1, verse = null, verseEnd = null, replace = false }) => {
    const resolvedKey = resolveBookKey(book) || (typeof book === 'string' ? book.toLowerCase() : null);
    if (!resolvedKey || !BIBLE_BOOKS_MAP[resolvedKey]) {
      showToast(`Book '${book}' not recognized.`);
      return false;
    }

    const bookMeta = BIBLE_BOOKS_MAP[resolvedKey];
    const maxCh = bookMeta.chapters;
    const numChapter = parseInt(chapter, 10);
    if (isNaN(numChapter) || numChapter < 1 || numChapter > maxCh) {
      showToast(`${bookMeta.name} only has ${maxCh} chapters.`);
      return false;
    }

    const params = {
      book: resolvedKey,
      chapter: numChapter.toString()
    };

    let verseDisplay = '';
    if (verse) {
      const vStart = parseInt(verse, 10);
      const vEnd = verseEnd ? parseInt(verseEnd, 10) : null;
      if (!isNaN(vStart) && vStart > 0) {
        if (vEnd && vEnd !== vStart) {
          params.verse = `${vStart}-${vEnd}`;
          verseDisplay = `:${vStart}–${vEnd}`;
        } else {
          params.verse = `${vStart}`;
          verseDisplay = `:${vStart}`;
        }
      }
    }

    // Push new history entry so browser Back and Forward work seamlessly
    setSearchParams(params, { replace });
    setActiveTab('read');
    setMobileBooksDrawerOpen(false);
    setViewingChaptersForBook(null);
    setMobileSearchOpen(false);
    setSearchFocused(false);

    const fullDisplay = `${bookMeta.name} ${numChapter}${verseDisplay}`;
    setSearchQuery(fullDisplay);
    showToast(`Loaded ${fullDisplay}`);
    return true;
  }, [setSearchParams]);

  // Scroll to highlighted verse or top of container
  useEffect(() => {
    if (!loading && bibleData) {
      if (highlightedVerses.length > 0) {
        const firstVerse = highlightedVerses[0];
        const timer = setTimeout(() => {
          const el = document.getElementById(`verse-${firstVerse}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 220);
        return () => clearTimeout(timer);
      } else {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }
  }, [loading, bibleData, highlightedVerses]);

  // Validate verse against actual loaded Bible chapter
  useEffect(() => {
    if (bibleData && !loading && highlightedVerses.length > 0 && Array.isArray(bibleData.verses)) {
      const totalVerses = bibleData.verses.length;
      const invalid = highlightedVerses.filter(v => v > totalVerses);
      if (invalid.length > 0) {
        showToast(`Note: Verse ${invalid.join(', ')} does not exist in ${bibleData.book} ${bibleData.chapter} (has ${totalVerses} verses).`);
      }
    }
  }, [bibleData, loading, highlightedVerses]);

  // Persist translation
  useEffect(() => {
    localStorage.setItem('bible_translation', activeTranslation);
  }, [activeTranslation]);

  // Persist last read book and chapter for the user
  useEffect(() => {
    if (selectedBook) {
      localStorage.setItem('bible_last_book', selectedBook);
    }
    if (selectedChapter) {
      localStorage.setItem('bible_last_chapter', selectedChapter.toString());
    }
  }, [selectedBook, selectedChapter]);

  // Navigate to cross reference
  const handleNavigateToReference = (refItem) => {
    if (!refItem) return;
    
    if (refItem.book && refItem.chapter) {
      navigateToPassage({
        book: refItem.book,
        chapter: parseInt(refItem.chapter, 10),
        verse: refItem.verse || null
      });
      return;
    }
    
    const refStr = typeof refItem === 'string' ? refItem : refItem.reference;
    if (!refStr) return;
    
    const parsed = parseBibleReference(refStr);
    if (parsed && parsed.isValid) {
      navigateToPassage({
        book: parsed.bookKey,
        chapter: parsed.chapter,
        verse: parsed.verseStart,
        verseEnd: parsed.verseEnd
      });
      return;
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
    const shareText = `${bibleData.book} ${bibleData.chapter} (${activeTranslation}) — Read online at Zionaviel.`;
    navigator.clipboard.writeText(window.location.href);
    showToast('Page link copied to clipboard!');
  };

  // Print Page
  const handlePrint = () => {
    window.print();
  };

  // Live passage reference detection (zero-latency client-side resolution)
  const liveReference = useMemo(() => {
    return parseBibleReference(searchQuery);
  }, [searchQuery]);

  // Book auto-suggestions when typing partial names
  const bookSuggestions = useMemo(() => {
    if (liveReference || !searchQuery || searchQuery.trim().length < 2) return [];
    return getBookSuggestions(searchQuery);
  }, [searchQuery, liveReference]);

  // Search Functionality
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Check if query is already a valid reference
    const parsed = parseBibleReference(query);
    if (parsed && parsed.isValid) {
      setSearchResults([]);
      return;
    }

    if (query.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    // Server-side global full-text search across entire Bible
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

  // Submit search query (e.g. Enter key or submit button)
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    if (liveReference) {
      if (liveReference.isValid) {
        navigateToPassage({
          book: liveReference.bookKey,
          chapter: liveReference.chapter,
          verse: liveReference.verseStart,
          verseEnd: liveReference.verseEnd
        });
        setSearchResults([]);
        setSearchFocused(false);
        setMobileSearchOpen(false);
        return;
      } else {
        showToast(liveReference.error);
        return;
      }
    }

    // If there are keyword search results, navigate to first result
    if (searchResults.length > 0) {
      const match = searchResults[0];
      navigateToPassage({
        book: match.book,
        chapter: match.chapter,
        verse: match.number
      });
      setSearchResults([]);
      setSearchFocused(false);
      setMobileSearchOpen(false);
    } else {
      showToast(`No scripture reference or matches found for "${searchQuery}"`);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e);
    }
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

  // Unified Intelligent Chapter Targets Calculation
  const currentBookMeta = BIBLE_BOOKS_MAP[selectedBook] || { name: selectedBook, chapters: 1, testament: 'Old Testament' };
  const currentBookChapters = currentBookMeta.chapters;
  const currentIdx = BIBLE_BOOKS_ORDER.indexOf(selectedBook);

  // Compute Previous Chapter Target across books
  const prevTarget = useMemo(() => {
    if (selectedChapter > 1) {
      return {
        book: selectedBook,
        chapter: selectedChapter - 1,
        label: `${currentBookMeta.name} Chapter ${selectedChapter - 1}`,
        shortLabel: `${currentBookMeta.name} ${selectedChapter - 1}`
      };
    } else if (currentIdx > 0) {
      const prevBookKey = BIBLE_BOOKS_ORDER[currentIdx - 1];
      const prevMeta = BIBLE_BOOKS_MAP[prevBookKey];
      return {
        book: prevBookKey,
        chapter: prevMeta.chapters,
        label: `${prevMeta.name} Chapter ${prevMeta.chapters}`,
        shortLabel: `${prevMeta.name} ${prevMeta.chapters}`
      };
    }
    return null; // At beginning of Genesis
  }, [selectedBook, selectedChapter, currentBookMeta, currentIdx]);

  // Compute Next Chapter Target across books & testament boundaries
  const nextTarget = useMemo(() => {
    if (selectedChapter < currentBookChapters) {
      return {
        book: selectedBook,
        chapter: selectedChapter + 1,
        label: `${currentBookMeta.name} Chapter ${selectedChapter + 1}`,
        shortLabel: `${currentBookMeta.name} ${selectedChapter + 1}`,
        actionLabel: `Continue to ${currentBookMeta.name} ${selectedChapter + 1}`
      };
    } else if (currentIdx < BIBLE_BOOKS_ORDER.length - 1) {
      const nextBookKey = BIBLE_BOOKS_ORDER[currentIdx + 1];
      const nextMeta = BIBLE_BOOKS_MAP[nextBookKey];
      const isCrossingTestament = currentBookMeta.testament === 'Old Testament' && nextMeta.testament === 'New Testament';
      return {
        book: nextBookKey,
        chapter: 1,
        label: `${nextMeta.name} Chapter 1`,
        shortLabel: `${nextMeta.name} 1`,
        actionLabel: isCrossingTestament
          ? `Next: ${nextMeta.name} 1 (New Testament)`
          : `Next Book: ${nextMeta.name} 1`
      };
    }
    return null; // At end of Revelation
  }, [selectedBook, selectedChapter, currentBookMeta, currentBookChapters, currentIdx]);

  // Boundary-aware Navigation handlers that push to browser history
  const handlePrevChapter = () => {
    if (prevTarget) {
      navigateToPassage({ book: prevTarget.book, chapter: prevTarget.chapter });
    } else {
      showToast('You are at the very beginning of the Holy Bible');
    }
  };

  const handleNextChapter = () => {
    if (nextTarget) {
      navigateToPassage({ book: nextTarget.book, chapter: nextTarget.chapter });
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
      <SEO
        title={selectedBook && selectedChapter ? `${BIBLE_BOOKS_MAP[selectedBook]?.name || 'Bible'} Chapter ${selectedChapter} (${activeTranslation}) | Read Bible Online | Zionaviel` : "Online Bible | Read Scripture in KJV, ESV & NIV | Zionaviel"}
        description={selectedBook && selectedChapter ? `Read and study ${BIBLE_BOOKS_MAP[selectedBook]?.name || 'the Bible'} Chapter ${selectedChapter} in ${activeTranslation} with cross-references, search, audio reader, and bookmarking tools on Zionaviel.` : "Read and explore the Bible online with Zionaviel. Search Scripture across all 66 books and explore KJV, ESV, and NIV translations."}
        keywords="read Bible online, KJV Bible online, ESV Bible, NIV Bible, Bible search, Bible verses, Scripture search, 66 books Bible, Zionaviel"
        path="/bible"
      />
      
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
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] font-label-caps">Zionaviel Home</span>
          </div>
          <div className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="Zionaviel Logo" 
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
                      navigateToPassage({ book: viewingChaptersForBook, chapter: ch });
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
                aria-label="Back"
              >
                <ArrowLeft size={20} />
              </button>
              <form onSubmit={handleSearchSubmit} className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                <input 
                  autoFocus
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full pl-10 pr-8 py-2 bg-background dark:bg-zinc-900 border border-outline-variant rounded-xl focus:outline-none focus:border-secondary transition-colors text-sm" 
                  placeholder="e.g. John 19, Esther 9:2, Genesis 1:1-5..." 
                  type="text"
                />
                {searchQuery && (
                  <button 
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                    }} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                  >
                    <X size={16} />
                  </button>
                )}

                {/* Mobile Smart Search Suggestions Overlay */}
                {(liveReference || bookSuggestions.length > 0 || searchResults.length > 0) && (
                  <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-outline-variant rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto p-2.5 animate-fade-in text-left">
                    {/* Direct Passage Match */}
                    {liveReference && liveReference.isValid && (
                      <div className="mb-2 p-1.5 bg-secondary/10 dark:bg-secondary/15 rounded-xl border border-secondary/30">
                        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest px-2 py-0.5 mb-1 font-label-caps">
                          Direct Scripture Passage
                        </p>
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            navigateToPassage({
                              book: liveReference.bookKey,
                              chapter: liveReference.chapter,
                              verse: liveReference.verseStart,
                              verseEnd: liveReference.verseEnd
                            });
                          }}
                          className="w-full text-left p-2.5 rounded-lg bg-white dark:bg-zinc-800 hover:bg-secondary/20 border border-secondary/40 transition-all flex items-center justify-between group cursor-pointer shadow-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
                              <BookOpen size={16} />
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-bold text-primary group-hover:text-secondary transition-colors truncate">
                                Go to {liveReference.displayText}
                              </p>
                              <p className="text-[10px] text-on-surface-variant truncate">
                                {liveReference.verseStart 
                                  ? `Jump to ${liveReference.verseEnd ? `verses ${liveReference.verseStart}–${liveReference.verseEnd}` : `verse ${liveReference.verseStart}`}` 
                                  : 'Open complete chapter'} • {liveReference.testament}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-secondary uppercase tracking-wider shrink-0 flex items-center gap-1 group-hover:translate-x-1 transition-transform ml-2">
                            Open →
                          </span>
                        </button>
                      </div>
                    )}

                    {/* Invalid Reference warning */}
                    {liveReference && !liveReference.isValid && (
                      <div className="mb-2 p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 rounded-xl text-xs flex items-center gap-2">
                        <AlertCircle size={15} className="shrink-0 text-amber-600" />
                        <span>{liveReference.error}</span>
                      </div>
                    )}

                    {/* Book suggestions */}
                    {bookSuggestions.length > 0 && !liveReference && (
                      <div className="mb-2">
                        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest px-2 py-0.5 mb-1 font-label-caps border-b border-outline-variant/30">
                          Matching Books
                        </p>
                        {bookSuggestions.map((b) => (
                          <button
                            key={b.bookKey}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              navigateToPassage({ book: b.bookKey, chapter: 1 });
                            }}
                            className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-surface-container-low dark:hover:bg-zinc-800 transition-colors flex items-center justify-between cursor-pointer"
                          >
                            <span className="font-semibold text-primary">{b.bookName}</span>
                            <span className="text-[10px] text-on-surface-variant font-medium">Chapter 1 ({b.chapters} chs)</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Full-text search results */}
                    {searchResults.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest px-2 py-0.5 mb-1 font-label-caps border-b border-outline-variant/30">
                          Keyword Matches ({activeTranslation})
                        </p>
                        {searchResults.map((match, i) => (
                          <button
                            key={i}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              navigateToPassage({
                                book: match.book,
                                chapter: match.chapter,
                                verse: match.number
                              });
                            }}
                            className="w-full text-left px-3 py-2 text-[11px] rounded-lg hover:bg-surface-container-low dark:hover:bg-zinc-800 transition-colors flex flex-col gap-0.5 border-b border-outline-variant/10 last:border-0 cursor-pointer"
                          >
                            <span className="font-semibold text-primary">{match.book} {match.chapter}:{match.number}</span>
                            <p className="text-on-surface-variant italic line-clamp-1">{match.text}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </form>
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
                  alt="Zionaviel Logo" 
                  className="h-6 w-auto mix-blend-multiply dark:invert dark:mix-blend-screen shrink-0" 
                />
                <span className="hidden sm:inline font-headline-sm text-sm md:text-base font-semibold text-primary dark:text-primary-fixed tracking-wide whitespace-nowrap">
                  Zionaviel Bible
                </span>

                {/* Mobile / Tablet Book & Chapter Quick Selector */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileBooksDrawerOpen(true);
                    setViewingChaptersForBook(null);
                  }}
                  className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 bg-surface-container-low dark:bg-zinc-800 hover:bg-surface-container border border-outline-variant/60 rounded-full text-xs font-bold text-primary transition-all active:scale-95 shadow-sm"
                  title="Choose Bible Book and Chapter"
                >
                  <BookOpen size={13} className="text-secondary shrink-0" />
                  <span className="truncate max-w-[110px] sm:max-w-[150px]">
                    {BIBLE_BOOKS_MAP[selectedBook]?.name || selectedBook} {selectedChapter}
                  </span>
                  <ChevronDown size={11} className="opacity-60 shrink-0" />
                </button>
              </div>
              
              {/* Desktop-only Search input */}
              <div className="hidden md:block relative flex-1 max-w-sm mx-4">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
                  <input 
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={handleSearchKeyDown}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 250)}
                    className="w-full pl-9 pr-8 py-2 bg-background dark:bg-zinc-900 border border-outline-variant rounded-xl focus:outline-none focus:border-secondary transition-colors text-xs" 
                    placeholder="Search passage (e.g. John 19, Esther 9:2, Gen 1:1-5) or keywords..." 
                    type="text"
                  />
                  {searchQuery && (
                    <button 
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                      }} 
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary"
                    >
                      <X size={14} />
                    </button>
                  )}
                </form>

                {/* Search Suggestions Panel (Desktop) */}
                {searchFocused && (liveReference || bookSuggestions.length > 0 || searchResults.length > 0) && (
                  <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-outline-variant rounded-2xl shadow-2xl z-50 max-h-72 overflow-y-auto p-2.5 animate-fade-in text-left">
                    {/* Direct Passage Match */}
                    {liveReference && liveReference.isValid && (
                      <div className="mb-2 p-1.5 bg-secondary/10 dark:bg-secondary/15 rounded-xl border border-secondary/30">
                        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest px-2 py-0.5 mb-1 font-label-caps">
                          Direct Scripture Passage
                        </p>
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            navigateToPassage({
                              book: liveReference.bookKey,
                              chapter: liveReference.chapter,
                              verse: liveReference.verseStart,
                              verseEnd: liveReference.verseEnd
                            });
                          }}
                          className="w-full text-left p-2.5 rounded-lg bg-white dark:bg-zinc-800 hover:bg-secondary/20 border border-secondary/40 transition-all flex items-center justify-between group cursor-pointer shadow-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
                              <BookOpen size={16} />
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-bold text-primary group-hover:text-secondary transition-colors truncate">
                                Go to {liveReference.displayText}
                              </p>
                              <p className="text-[10px] text-on-surface-variant truncate">
                                {liveReference.verseStart 
                                  ? `Jump to ${liveReference.verseEnd ? `verses ${liveReference.verseStart}–${liveReference.verseEnd}` : `verse ${liveReference.verseStart}`}` 
                                  : 'Open complete chapter'} • {liveReference.testament}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-secondary uppercase tracking-wider shrink-0 flex items-center gap-1 group-hover:translate-x-1 transition-transform ml-2">
                            Open →
                          </span>
                        </button>
                      </div>
                    )}

                    {/* Invalid Reference warning */}
                    {liveReference && !liveReference.isValid && (
                      <div className="mb-2 p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 rounded-xl text-xs flex items-center gap-2">
                        <AlertCircle size={15} className="shrink-0 text-amber-600" />
                        <span>{liveReference.error}</span>
                      </div>
                    )}

                    {/* Book suggestions */}
                    {bookSuggestions.length > 0 && !liveReference && (
                      <div className="mb-2">
                        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest px-2 py-0.5 mb-1 font-label-caps border-b border-outline-variant/30">
                          Matching Books
                        </p>
                        {bookSuggestions.map((b) => (
                          <button
                            key={b.bookKey}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              navigateToPassage({ book: b.bookKey, chapter: 1 });
                            }}
                            className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-surface-container-low dark:hover:bg-zinc-800 transition-colors flex items-center justify-between cursor-pointer"
                          >
                            <span className="font-semibold text-primary">{b.bookName}</span>
                            <span className="text-[10px] text-on-surface-variant font-medium">Chapter 1 ({b.chapters} chs)</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Full-text keyword search results */}
                    {searchResults.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest px-2 py-0.5 mb-1 font-label-caps border-b border-outline-variant/30">
                          Keyword Matches ({activeTranslation})
                        </p>
                        {searchResults.map((match, i) => (
                          <button
                            key={i}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              navigateToPassage({
                                book: match.book,
                                chapter: match.chapter,
                                verse: match.number
                              });
                            }}
                            className="w-full text-left px-3 py-2 text-[11px] rounded-lg hover:bg-surface-container-low dark:hover:bg-zinc-800 transition-colors flex flex-col gap-0.5 border-b border-outline-variant/10 last:border-0 cursor-pointer"
                          >
                            <span className="font-semibold text-primary">{match.book} {match.chapter}:{match.number}</span>
                            <p className="text-on-surface-variant italic line-clamp-1">{match.text}</p>
                          </button>
                        ))}
                      </div>
                    )}
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
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-margin-mobile md:px-stack-lg py-stack-md pb-28 md:pb-12">
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
                    <div className="mb-stack-lg border-b border-outline-variant pb-stack-sm flex items-end justify-between flex-wrap gap-4">
                      <div className="text-left">
                        <p className="font-label-caps text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-2">{bibleData.testament}</p>
                        <h1 className="font-display-lg text-[28px] md:text-[36px] text-primary flex items-center flex-wrap gap-x-2">
                          <span>{bibleData.book}</span>
                          <span className="font-normal text-on-surface-variant/80">Chapter {bibleData.chapter}</span>
                        </h1>
                        {highlightedVerses.length > 0 && (
                          <div className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 bg-amber-500/15 border border-amber-500/40 text-amber-800 dark:text-amber-300 rounded-full text-xs font-semibold font-label-caps animate-fade-in">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                            <span>
                              {highlightedVerses.length === 1 
                                ? `Verse ${highlightedVerses[0]} Focused` 
                                : `Verses ${highlightedVerses[0]}–${highlightedVerses[highlightedVerses.length - 1]} Focused`}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mb-2">
                        <button 
                          onClick={handleShare}
                          className="p-2 border border-outline-variant rounded-full hover:border-secondary transition-colors group cursor-pointer"
                          title="Share page"
                        >
                          <Share2 size={16} className="text-on-surface-variant group-hover:text-secondary" />
                        </button>
                        <button 
                          onClick={handlePrint}
                          className="p-2 border border-outline-variant rounded-full hover:border-secondary transition-colors group cursor-pointer"
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
                        const isHighlighted = highlightedVerses.includes(verse.number);

                        if (verse.highlight) {
                          return (
                            <div 
                              key={verse.number} 
                              id={`verse-${verse.number}`}
                              className={`my-stack-lg p-stack-md rounded-r-xl group relative transition-all ${
                                isHighlighted
                                  ? 'border-l-4 border-amber-500 bg-amber-500/10 dark:bg-amber-500/15 ring-1 ring-amber-500/30'
                                  : 'border-l-2 border-secondary bg-surface-container-low dark:bg-zinc-900'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-label-caps text-[10px] font-bold text-secondary uppercase tracking-widest">Key Passage</span>
                                  {isHighlighted && (
                                    <span className="font-label-caps text-[9px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider bg-amber-500/25 px-1.5 py-0.5 rounded">
                                      Verse {verse.number}
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => toggleBookmark(verse.number, verse.text)}
                                    className="text-secondary hover:scale-110 transition-transform cursor-pointer"
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
                            className={`group relative flex gap-4 items-start transition-all p-3 -mx-3 rounded-xl ${
                              isHighlighted 
                                ? 'bg-amber-500/10 dark:bg-amber-500/15 border-l-4 border-amber-500 ring-1 ring-amber-500/30 shadow-xs' 
                                : 'hover:bg-surface-container-lowest dark:hover:bg-zinc-900'
                            }`}
                          >
                            <div className="flex flex-col items-center gap-2 mt-1 min-w-[20px]">
                              <span className={`font-label-caps text-xs font-bold ${isHighlighted ? 'text-amber-700 dark:text-amber-400 font-extrabold' : 'text-secondary'}`}>
                                {verse.number}
                              </span>
                              <button 
                                onClick={() => toggleBookmark(verse.number, verse.text)}
                                className={`opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 cursor-pointer ${isBookmarked ? 'opacity-100 text-secondary' : 'text-outline hover:text-secondary'}`}
                              >
                                <Bookmark size={14} fill={isBookmarked ? "currentColor" : "none"} />
                              </button>
                            </div>
                            <div className="flex-1">
                              {isHighlighted && (
                                <div className="mb-1">
                                  <span className="font-label-caps text-[9px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-widest bg-amber-500/20 px-1.5 py-0.5 rounded">
                                    Verse {verse.number}
                                  </span>
                                </div>
                              )}
                              <p className={`${getTextSizeClass()} ${isHighlighted ? 'text-primary font-medium' : 'text-on-surface'}`}>
                                {verse.text}
                              </p>
                            </div>
                          </div>
                        );
                      })}

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

                      {/* Unified Intelligent Chapter Navigation */}
                      <div className="mt-12 pt-6 border-t border-outline-variant/40">
                        <div className="bg-surface-container-low/70 dark:bg-zinc-900/70 border border-outline-variant/60 rounded-2xl p-3.5 sm:p-5 shadow-xs">
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                            
                            {/* Previous Chapter / Backward Navigation */}
                            <button
                              type="button"
                              onClick={handlePrevChapter}
                              disabled={!prevTarget}
                              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-label-caps uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                                prevTarget
                                  ? 'bg-surface dark:bg-zinc-800 border border-outline-variant/70 text-on-surface hover:text-primary hover:border-secondary active:scale-95 shadow-2xs'
                                  : 'opacity-40 cursor-not-allowed bg-transparent text-on-surface-variant border border-outline-variant/30'
                              }`}
                              title={prevTarget ? `Return to ${prevTarget.label}` : 'Beginning of Scripture (Genesis 1)'}
                            >
                              <ChevronLeft size={16} className="shrink-0" />
                              <span className="truncate">
                                {prevTarget ? `Prev: ${prevTarget.shortLabel}` : 'Beginning'}
                              </span>
                            </button>

                            {/* Position & Chapter Quick Jump */}
                            <button
                              type="button"
                              onClick={() => {
                                setMobileBooksDrawerOpen(true);
                                setViewingChaptersForBook(selectedBook);
                              }}
                              className="px-3.5 py-2.5 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-xl text-xs font-bold font-label-caps uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                              title="Click to view all chapters"
                            >
                              <span>{bibleData.book} {bibleData.chapter}</span>
                              <span className="text-secondary/50 font-normal">/</span>
                              <span className="text-[11px] font-medium opacity-80">{currentBookChapters} chs</span>
                            </button>

                            {/* Unified Intelligent Action Button */}
                            {nextTarget ? (
                              <button
                                type="button"
                                onClick={handleNextChapter}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-container text-on-primary rounded-xl text-xs font-bold font-label-caps uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-sm group shrink-0"
                                title={`Navigate forward to ${nextTarget.label}`}
                              >
                                <span className="truncate">{nextTarget.actionLabel}</span>
                                <ChevronRight size={16} className="shrink-0 group-hover:translate-x-0.5 transition-transform" />
                              </button>
                            ) : (
                              /* Intelligently switches direction at end of Revelation (Rev 22) */
                              <button
                                type="button"
                                onClick={handlePrevChapter}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-container text-on-primary rounded-xl text-xs font-bold font-label-caps uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-sm shrink-0"
                                title="Return to Revelation 21"
                              >
                                <ChevronLeft size={16} className="shrink-0" />
                                <span>Return to Revelation 21</span>
                              </button>
                            )}

                          </div>
                        </div>
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
                      <div 
                        key={index} 
                        className="bg-surface-container-low dark:bg-zinc-900 border border-outline-variant/30 hover:border-secondary/60 p-6 rounded-xl flex gap-4 items-start relative group transition-all"
                      >
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => navigateToPassage({ book: fav.book.toLowerCase(), chapter: fav.chapter, verse: fav.number })}
                          title={`Read ${fav.book} ${fav.chapter}:${fav.number}`}
                        >
                          <span className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2 flex items-center gap-1 group-hover:text-primary transition-colors">
                            {fav.book} {fav.chapter}:{fav.number} →
                          </span>
                          <p className="font-verse-quote italic text-primary dark:text-secondary-fixed text-base leading-relaxed">
                            "{fav.text}"
                          </p>
                        </div>
                        <button 
                          onClick={() => toggleBookmark(fav.number, fav.text)}
                          className="text-on-surface-variant hover:text-red-600 transition-colors cursor-pointer p-1"
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
                        navigateToPassage({ book: hist.book.toLowerCase(), chapter: hist.chapter });
                      }}
                      className="w-full bg-surface-container-lowest dark:bg-zinc-900 border border-outline-variant/30 p-4 rounded-lg flex items-center justify-between hover:border-secondary transition-colors text-left cursor-pointer"
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
              <h3 className="font-headline-md text-headline-md font-bold text-primary mb-2">Zionaviel</h3>
              <p className="font-body-md text-sm text-on-tertiary-fixed-variant opacity-70">Spreading the Gospel through clarity and reverence.</p>
            </div>
            <div className="flex flex-col gap-4">
              <p className="text-on-tertiary-fixed-variant opacity-50 text-xs">© 2026 Zionaviel Ministry. All rights reserved.</p>
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileBooksDrawerOpen(false)} />
          <div className="relative bg-white dark:bg-zinc-900 w-[85vw] max-w-sm h-full flex flex-col p-5 sm:p-6 shadow-2xl animate-slide-in overflow-y-auto">
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
                          navigateToPassage({ book: viewingChaptersForBook, chapter: ch });
                        }}
                        className={`py-2.5 text-center rounded text-xs transition-colors border cursor-pointer ${
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
