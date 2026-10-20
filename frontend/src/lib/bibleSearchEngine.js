// Smart Bible Reference Parser & Search Engine
// Source of truth: Canonical 66 Books of the Holy Bible

export const BIBLE_BOOKS_MAP = {
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

export const BIBLE_BOOKS_ORDER = [
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

// Comprehensive alias dictionary mapping variations, abbreviations, ordinals, and Roman numerals to canonical book keys
const BOOK_ALIASES = {
  // Old Testament
  'genesis': 'genesis', 'gen': 'genesis', 'ge': 'genesis', 'gn': 'genesis',
  'exodus': 'exodus', 'exod': 'exodus', 'exo': 'exodus', 'ex': 'exodus',
  'leviticus': 'leviticus', 'lev': 'leviticus', 'le': 'leviticus', 'lv': 'leviticus',
  'numbers': 'numbers', 'num': 'numbers', 'nu': 'numbers', 'nm': 'numbers', 'nb': 'numbers',
  'deuteronomy': 'deuteronomy', 'deut': 'deuteronomy', 'deu': 'deuteronomy', 'de': 'deuteronomy', 'dt': 'deuteronomy',
  'joshua': 'joshua', 'josh': 'joshua', 'jos': 'joshua', 'jsh': 'joshua',
  'judges': 'judges', 'judg': 'judges', 'jdg': 'judges', 'jg': 'judges', 'jdgs': 'judges',
  'ruth': 'ruth', 'rth': 'ruth', 'ru': 'ruth',
  
  '1 samuel': '1 samuel', '1samuel': '1 samuel', '1 sam': '1 samuel', '1sam': '1 samuel',
  '1 sa': '1 samuel', '1sa': '1 samuel', '1st samuel': '1 samuel', '1st sam': '1 samuel',
  'first samuel': '1 samuel', 'i samuel': '1 samuel', 'i sam': '1 samuel', '1sm': '1 samuel',

  '2 samuel': '2 samuel', '2samuel': '2 samuel', '2 sam': '2 samuel', '2sam': '2 samuel',
  '2 sa': '2 samuel', '2sa': '2 samuel', '2nd samuel': '2 samuel', '2nd sam': '2 samuel',
  'second samuel': '2 samuel', 'ii samuel': '2 samuel', 'ii sam': '2 samuel', '2sm': '2 samuel',

  '1 kings': '1 kings', '1kings': '1 kings', '1 king': '1 kings', '1king': '1 kings',
  '1 ki': '1 kings', '1ki': '1 kings', '1 kin': '1 kings', '1kin': '1 kings',
  '1 kgs': '1 kings', '1kgs': '1 kings', '1st kings': '1 kings', 'first kings': '1 kings', 'i kings': '1 kings',

  '2 kings': '2 kings', '2kings': '2 kings', '2 king': '2 kings', '2king': '2 kings',
  '2 ki': '2 kings', '2ki': '2 kings', '2 kin': '2 kings', '2kin': '2 kings',
  '2 kgs': '2 kings', '2kgs': '2 kings', '2nd kings': '2 kings', 'second kings': '2 kings', 'ii kings': '2 kings',

  '1 chronicles': '1 chronicles', '1chronicles': '1 chronicles', '1 chron': '1 chronicles', '1chron': '1 chronicles',
  '1 chr': '1 chronicles', '1chr': '1 chronicles', '1 ch': '1 chronicles', '1ch': '1 chronicles',
  '1st chronicles': '1 chronicles', 'first chronicles': '1 chronicles', 'i chronicles': '1 chronicles',

  '2 chronicles': '2 chronicles', '2chronicles': '2 chronicles', '2 chron': '2 chronicles', '2chron': '2 chronicles',
  '2 chr': '2 chronicles', '2chr': '2 chronicles', '2 ch': '2 chronicles', '2ch': '2 chronicles',
  '2nd chronicles': '2 chronicles', 'second chronicles': '2 chronicles', 'ii chronicles': '2 chronicles',

  'ezra': 'ezra', 'ezr': 'ezra', 'ez': 'ezra',
  'nehemiah': 'nehemiah', 'neh': 'nehemiah', 'ne': 'nehemiah',
  'esther': 'esther', 'esth': 'esther', 'est': 'esther', 'es': 'esther',
  'job': 'job', 'jb': 'job',

  // Note: support both singular Psalm and plural Psalms
  'psalms': 'psalms', 'psalm': 'psalms', 'psa': 'psalms', 'ps': 'psalms', 'pss': 'psalms', 'psm': 'psalms',
  'proverbs': 'proverbs', 'proverb': 'proverbs', 'prov': 'proverbs', 'pro': 'proverbs', 'prv': 'proverbs', 'pr': 'proverbs',
  'ecclesiastes': 'ecclesiastes', 'ecclesiast': 'ecclesiastes', 'eccl': 'ecclesiastes', 'ecc': 'ecclesiastes', 'ec': 'ecclesiastes', 'qoh': 'ecclesiastes', 'qoheleth': 'ecclesiastes',
  'song of solomon': 'song of solomon', 'song of songs': 'song of solomon', 'song': 'song of solomon', 'songs': 'song of solomon', 'canticles': 'song of solomon', 'sos': 'song of solomon', 'cant': 'song of solomon',
  'isaiah': 'isaiah', 'isa': 'isaiah', 'is': 'isaiah',
  'jeremiah': 'jeremiah', 'jer': 'jeremiah', 'je': 'jeremiah', 'jr': 'jeremiah',
  'lamentations': 'lamentations', 'lamentation': 'lamentations', 'lam': 'lamentations', 'la': 'lamentations',
  'ezekiel': 'ezekiel', 'ezek': 'ezekiel', 'eze': 'ezekiel', 'ezk': 'ezekiel',
  'daniel': 'daniel', 'dan': 'daniel', 'da': 'daniel', 'dn': 'daniel',
  'hosea': 'hosea', 'hos': 'hosea', 'ho': 'hosea',
  'joel': 'joel', 'joe': 'joel', 'jl': 'joel',
  'amos': 'amos', 'am': 'amos', 'amo': 'amos',
  'obadiah': 'obadiah', 'obad': 'obadiah', 'oba': 'obadiah', 'ob': 'obadiah',
  'jonah': 'jonah', 'jon': 'jonah', 'jnh': 'jonah',
  'micah': 'micah', 'mic': 'micah', 'mc': 'micah',
  'nahum': 'nahum', 'nah': 'nahum', 'na': 'nahum',
  'habakkuk': 'habakkuk', 'hab': 'habakkuk', 'hb': 'habakkuk',
  'zephaniah': 'zephaniah', 'zeph': 'zephaniah', 'zep': 'zephaniah', 'zp': 'zephaniah',
  'haggai': 'haggai', 'hag': 'haggai', 'hg': 'haggai',
  'zechariah': 'zechariah', 'zech': 'zechariah', 'zec': 'zechariah', 'zc': 'zechariah',
  'malachi': 'malachi', 'mal': 'malachi', 'ml': 'malachi',

  // New Testament
  'matthew': 'matthew', 'matt': 'matthew', 'mat': 'matthew', 'mt': 'matthew',
  'mark': 'mark', 'mrk': 'mark', 'mar': 'mark', 'mk': 'mark',
  'luke': 'luke', 'luk': 'luke', 'lu': 'luke', 'lk': 'luke',
  'john': 'john', 'jhn': 'john', 'joh': 'john', 'jn': 'john',
  'acts': 'acts', 'act': 'acts', 'ac': 'acts', 'acts of the apostles': 'acts',
  'romans': 'romans', 'roman': 'romans', 'rom': 'romans', 'ro': 'romans', 'rm': 'romans',

  '1 corinthians': '1 corinthians', '1corinthians': '1 corinthians', '1 cor': '1 corinthians', '1cor': '1 corinthians',
  '1 co': '1 corinthians', '1co': '1 corinthians', '1st corinthians': '1 corinthians', 'first corinthians': '1 corinthians', 'i corinthians': '1 corinthians',

  '2 corinthians': '2 corinthians', '2corinthians': '2 corinthians', '2 cor': '2 corinthians', '2cor': '2 corinthians',
  '2 co': '2 corinthians', '2co': '2 corinthians', '2nd corinthians': '2 corinthians', 'second corinthians': '2 corinthians', 'ii corinthians': '2 corinthians',

  'galatians': 'galatians', 'galatian': 'galatians', 'gal': 'galatians', 'ga': 'galatians',
  'ephesians': 'ephesians', 'ephesian': 'ephesians', 'eph': 'ephesians', 'ep': 'ephesians',
  'philippians': 'philippians', 'philippian': 'philippians', 'phil': 'philippians', 'php': 'philippians', 'pp': 'philippians',
  'colossians': 'colossians', 'colossian': 'colossians', 'col': 'colossians', 'co': 'colossians',

  '1 thessalonians': '1 thessalonians', '1thessalonians': '1 thessalonians', '1 thess': '1 thessalonians', '1thess': '1 thessalonians',
  '1 th': '1 thessalonians', '1th': '1 thessalonians', '1st thessalonians': '1 thessalonians', 'first thessalonians': '1 thessalonians', 'i thessalonians': '1 thessalonians',

  '2 thessalonians': '2 thessalonians', '2thessalonians': '2 thessalonians', '2 thess': '2 thessalonians', '2thess': '2 thessalonians',
  '2 th': '2 thessalonians', '2th': '2 thessalonians', '2nd thessalonians': '2 thessalonians', 'second thessalonians': '2 thessalonians', 'ii thessalonians': '2 thessalonians',

  '1 timothy': '1 timothy', '1timothy': '1 timothy', '1 tim': '1 timothy', '1tim': '1 timothy',
  '1 ti': '1 timothy', '1ti': '1 timothy', '1st timothy': '1 timothy', 'first timothy': '1 timothy', 'i timothy': '1 timothy',

  '2 timothy': '2 timothy', '2timothy': '2 timothy', '2 tim': '2 timothy', '2tim': '2 timothy',
  '2 ti': '2 timothy', '2ti': '2 timothy', '2nd timothy': '2 timothy', 'second timothy': '2 timothy', 'ii timothy': '2 timothy',

  'titus': 'titus', 'tit': 'titus', 'ti': 'titus',
  'philemon': 'philemon', 'philem': 'philemon', 'phlm': 'philemon', 'phm': 'philemon', 'pm': 'philemon',
  'hebrews': 'hebrews', 'hebrew': 'hebrews', 'heb': 'hebrews', 'he': 'hebrews',
  'james': 'james', 'jas': 'james', 'jam': 'james', 'jm': 'james',

  '1 peter': '1 peter', '1peter': '1 peter', '1 pet': '1 peter', '1pet': '1 peter',
  '1 pe': '1 peter', '1pe': '1 peter', '1 pt': '1 peter', '1pt': '1 peter',
  '1st peter': '1 peter', 'first peter': '1 peter', 'i peter': '1 peter',

  '2 peter': '2 peter', '2peter': '2 peter', '2 pet': '2 peter', '2pet': '2 peter',
  '2 pe': '2 peter', '2pe': '2 peter', '2 pt': '2 peter', '2pt': '2 peter',
  '2nd peter': '2 peter', 'second peter': '2 peter', 'ii peter': '2 peter',

  '1 john': '1 john', '1john': '1 john', '1 jhn': '1 john', '1jhn': '1 john',
  '1 joh': '1 john', '1joh': '1 john', '1 jn': '1 john', '1jn': '1 john',
  '1st john': '1 john', 'first john': '1 john', 'i john': '1 john',

  '2 john': '2 john', '2john': '2 john', '2 jhn': '2 john', '2jhn': '2 john',
  '2 joh': '2 john', '2joh': '2 john', '2 jn': '2 john', '2jn': '2 john',
  '2nd john': '2 john', 'second john': '2 john', 'ii john': '2 john',

  '3 john': '3 john', '3john': '3 john', '3 jhn': '3 john', '3jhn': '3 john',
  '3 joh': '3 john', '3joh': '3 john', '3 jn': '3 john', '3jn': '3 john',
  '3rd john': '3 john', 'third john': '3 john', 'iii john': '3 john',

  'jude': 'jude', 'jud': 'jude', 'jd': 'jude',
  'revelation': 'revelation', 'revelations': 'revelation', 'rev': 'revelation', 're': 'revelation',
  'apocalypse': 'revelation', 'apoc': 'revelation'
};

/**
 * Normalizes a raw book string into a canonical book key if recognized.
 * Handles numbered prefixes like "1", "2", "3", "1st", "First", Roman numerals, etc.
 */
export function resolveBookKey(rawBook) {
  if (!rawBook) return null;
  let cleaned = rawBook.trim().toLowerCase().replace(/[.,]/g, '');
  
  // Direct match
  if (BOOK_ALIASES[cleaned]) return BOOK_ALIASES[cleaned];
  
  // Collapse whitespace
  cleaned = cleaned.replace(/\s+/g, ' ');
  if (BOOK_ALIASES[cleaned]) return BOOK_ALIASES[cleaned];

  // Try standard numbered book transformations (e.g. "1st john" -> "1 john", "first john" -> "1 john")
  const ordinalMap = {
    '1st': '1', 'first': '1', 'i': '1',
    '2nd': '2', 'second': '2', 'ii': '2',
    '3rd': '3', 'third': '3', 'iii': '3'
  };
  for (const [ord, num] of Object.entries(ordinalMap)) {
    if (cleaned.startsWith(ord + ' ') || cleaned.startsWith(ord)) {
      const remainder = cleaned.slice(ord.length).trim();
      const candidate = `${num} ${remainder}`;
      if (BOOK_ALIASES[candidate]) return BOOK_ALIASES[candidate];
      const candidateCollapsed = `${num}${remainder}`;
      if (BOOK_ALIASES[candidateCollapsed]) return BOOK_ALIASES[candidateCollapsed];
    }
  }

  // Prefix match check across canonical books
  const match = BIBLE_BOOKS_ORDER.find(k => {
    const bName = BIBLE_BOOKS_MAP[k]?.name.toLowerCase();
    return bName === cleaned || k === cleaned;
  });

  return match || null;
}

/**
 * Parses a user search query into structured passage components:
 * Book, Chapter, Verse or Verse Range.
 *
 * Supported formats:
 * - "John 19" -> John ch 19
 * - "Genesis" -> Genesis ch 1
 * - "Esther 9:2" -> Esther ch 9, verse 2
 * - "Psalm 23:1" -> Psalms ch 23, verse 1
 * - "1 John 3:16" -> 1 John ch 3, verse 16
 * - "Genesis 1:1-5" -> Genesis ch 1, verses 1 to 5
 * - Flexible spaces, case, abbreviations (e.g. "1Jn 3:16", "Gen 1:1 - 5", "Song of Solomon 2:4")
 */
export function parseBibleReference(query) {
  if (!query || typeof query !== 'string') return null;
  const trimmed = query.trim();
  if (trimmed.length === 0) return null;

  // Clean reasonable punctuation but preserve book numbers, chapters, verses, colons, hyphens
  // Notice regex components:
  // Group 1: Book name portion (can include digits like 1, 2, 3, words, spaces)
  // Group 2: Chapter number (optional)
  // Group 3: Verse start (optional)
  // Group 4: Verse end (optional)
  
  // Pattern 1: Book with Chapter and optional Verse / Range
  // Matches "John 19", "Esther 9:2", "Genesis 1:1-5", "1 John 3:16", "Psalm 23:1", "1 Kings 18:20-40"
  // Supports colons ':', 'v', 'v.', 'verse', or spaces between chapter and verse
  const refPattern = /^([1-3](?:st|nd|rd)?|[iI]{1,3}|first|second|third)?\s*([a-zA-Z\s]+?)(?:\s+(\d+)(?:\s*(?:[:.,vV]|verse)\s*(\d+)(?:\s*[-–—to]+\s*(\d+))?)?)?$/i;
  
  const match = trimmed.match(refPattern);
  if (!match) return null;

  const prefix = match[1] ? match[1].trim() : '';
  const mainBookPart = match[2] ? match[2].trim() : '';
  const rawChapter = match[3];
  const rawVerseStart = match[4];
  const rawVerseEnd = match[5];

  // Combine prefix and main book part (e.g. "1" + "John" -> "1 John")
  const fullBookQuery = prefix ? `${prefix} ${mainBookPart}` : mainBookPart;
  const bookKey = resolveBookKey(fullBookQuery);

  if (!bookKey || !BIBLE_BOOKS_MAP[bookKey]) {
    // If not matching a recognized Bible book, treat as keyword search
    return null;
  }

  const bookMeta = BIBLE_BOOKS_MAP[bookKey];
  const canonicalBookName = bookMeta.name;

  // 1. Chapter parsing & validation
  let chapter = 1;
  if (rawChapter) {
    chapter = parseInt(rawChapter, 10);
  }

  // Validate chapter
  if (isNaN(chapter) || chapter < 1 || chapter > bookMeta.chapters) {
    return {
      isReference: true,
      isValid: false,
      bookKey,
      bookName: canonicalBookName,
      requestedChapter: chapter,
      maxChapters: bookMeta.chapters,
      error: `${canonicalBookName} only has ${bookMeta.chapters} chapter${bookMeta.chapters === 1 ? '' : 's'}.`
    };
  }

  // 2. Verse / Range parsing
  let verseStart = null;
  let verseEnd = null;
  let highlightedVerses = [];

  if (rawVerseStart) {
    const vStart = parseInt(rawVerseStart, 10);
    if (!isNaN(vStart) && vStart > 0) {
      verseStart = vStart;
      if (rawVerseEnd) {
        const vEnd = parseInt(rawVerseEnd, 10);
        if (!isNaN(vEnd) && vEnd >= vStart) {
          verseEnd = vEnd;
        } else if (!isNaN(vEnd) && vEnd < vStart) {
          verseEnd = vStart;
          verseStart = vEnd;
        }
      }

      const endLimit = verseEnd || verseStart;
      // Cap highlight range to a sensible max of 176 (longest psalm)
      for (let i = verseStart; i <= Math.min(endLimit, 200); i++) {
        highlightedVerses.push(i);
      }
    }
  }

  // Build canonical display text (e.g., "John 19", "Esther 9:2", "Genesis 1:1–5")
  let displayText = `${canonicalBookName} ${chapter}`;
  if (verseStart && verseEnd && verseStart !== verseEnd) {
    displayText += `:${verseStart}–${verseEnd}`;
  } else if (verseStart) {
    displayText += `:${verseStart}`;
  }

  return {
    isReference: true,
    isValid: true,
    bookKey,
    bookName: canonicalBookName,
    testament: bookMeta.testament,
    chapter,
    verseStart,
    verseEnd,
    highlightedVerses,
    displayText,
    canonicalRef: displayText,
    isChapterOnly: !rawVerseStart,
    isBookOnly: !rawChapter
  };
}

/**
 * Fast search helper that finds matching books for dropdown auto-suggest
 */
export function getBookSuggestions(query) {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim().toLowerCase();

  const results = [];
  for (const key of BIBLE_BOOKS_ORDER) {
    const meta = BIBLE_BOOKS_MAP[key];
    const nameLower = meta.name.toLowerCase();
    if (nameLower.startsWith(q) || key.startsWith(q)) {
      results.push({
        bookKey: key,
        bookName: meta.name,
        testament: meta.testament,
        chapters: meta.chapters
      });
    }
  }

  return results.slice(0, 5);
}
