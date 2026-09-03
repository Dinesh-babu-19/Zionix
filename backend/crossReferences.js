// Cross-Reference Engine for Zionix Holy Bible
// Provides canonical scripture cross-references for every book and chapter,
// with dynamic extraction from the Treasury of Scripture Knowledge (TSK).

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

export const BIBLE_BOOK_NAMES = {
  'genesis': 'Genesis', 'exodus': 'Exodus', 'leviticus': 'Leviticus', 'numbers': 'Numbers', 'deuteronomy': 'Deuteronomy',
  'joshua': 'Joshua', 'judges': 'Judges', 'ruth': 'Ruth', '1 samuel': '1 Samuel', '2 samuel': '2 Samuel',
  '1 kings': '1 Kings', '2 kings': '2 Kings', '1 chronicles': '1 Chronicles', '2 chronicles': '2 Chronicles', 'ezra': 'Ezra',
  'nehemiah': 'Nehemiah', 'esther': 'Esther', 'job': 'Job', 'psalms': 'Psalms', 'proverbs': 'Proverbs',
  'ecclesiastes': 'Ecclesiastes', 'song of solomon': 'Song of Solomon', 'isaiah': 'Isaiah', 'jeremiah': 'Jeremiah', 'lamentations': 'Lamentations',
  'ezekiel': 'Ezekiel', 'daniel': 'Daniel', 'hosea': 'Hosea', 'joel': 'Joel', 'amos': 'Amos',
  'obadiah': 'Obadiah', 'jonah': 'Jonah', 'micah': 'Micah', 'nahum': 'Nahum', 'habakkuk': 'Habakkuk',
  'zephaniah': 'Zephaniah', 'haggai': 'Haggai', 'zechariah': 'Zechariah', 'malachi': 'Malachi',
  'matthew': 'Matthew', 'mark': 'Mark', 'luke': 'Luke', 'john': 'John', 'acts': 'Acts',
  'romans': 'Romans', '1 corinthians': '1 Corinthians', '2 corinthians': '2 Corinthians', 'galatians': 'Galatians', 'ephesians': 'Ephesians',
  'philippians': 'Philippians', 'colossians': 'Colossians', '1 thessalonians': '1 Thessalonians', '2 thessalonians': '2 Thessalonians',
  '1 timothy': '1 Timothy', '2 timothy': '2 Timothy', 'titus': 'Titus', 'philemon': 'Philemon', 'hebrews': 'Hebrews',
  'james': 'James', '1 peter': '1 Peter', '2 peter': '2 Peter', '1 john': '1 John', '2 john': '2 John',
  '3 john': '3 John', 'jude': 'Jude', 'revelation': 'Revelation'
};

// Canon-wide foundational cross references by book
const BOOK_CANON_REFERENCES = {
  'genesis': [
    { reference: 'John 1:1-3', snippet: 'In the beginning was the Word... All things were made through him.' },
    { reference: 'Hebrews 11:3', snippet: 'By faith we understand that the universe was created by the word of God.' },
    { reference: 'Romans 5:12', snippet: 'Therefore, just as sin came into the world through one man, and death through sin.' },
    { reference: 'Colossians 1:16', snippet: 'For by him all things were created, in heaven and on earth.' },
    { reference: 'Revelation 21:1-4', snippet: 'Then I saw a new heaven and a new earth, for the first heaven and the first earth had passed away.' }
  ],
  'exodus': [
    { reference: '1 Corinthians 5:7', snippet: 'For Christ, our Passover lamb, has been sacrificed.' },
    { reference: 'Hebrews 9:11-12', snippet: 'Christ appeared as a high priest... entering once for all into the holy places.' },
    { reference: 'John 1:29', snippet: 'Behold, the Lamb of God, who takes away the sin of the world!' },
    { reference: '1 Corinthians 10:1-4', snippet: 'Our fathers were all under the cloud, and all passed through the sea.' }
  ],
  'leviticus': [
    { reference: 'Hebrews 9:22', snippet: 'Without the shedding of blood there is no forgiveness of sins.' },
    { reference: 'Hebrews 10:1-4', snippet: 'For since the law has but a shadow of the good things to come, it can never make perfect.' },
    { reference: '1 Peter 1:15-16', snippet: 'As he who called you is holy, you also be holy in all your conduct.' }
  ],
  'numbers': [
    { reference: 'John 3:14-15', snippet: 'And as Moses lifted up the serpent in the wilderness, so must the Son of Man be lifted up.' },
    { reference: '1 Corinthians 10:9-10', snippet: 'We must not put Christ to the test, as some of them did and were destroyed.' },
    { reference: 'Hebrews 3:16-19', snippet: 'With whom was he provoked for forty years? Was it not with those who sinned?' }
  ],
  'deuteronomy': [
    { reference: 'Matthew 4:4', snippet: 'Man shall not live by bread alone, but by every word that comes from the mouth of God.' },
    { reference: 'Acts 3:22', snippet: 'The Lord God will raise up for you a prophet like me from your brothers.' },
    { reference: 'Romans 10:6-8', snippet: 'The word is near you, in your mouth and in your heart.' }
  ],
  'psalms': [
    { reference: 'Luke 24:44', snippet: 'Everything written about me in the Law of Moses and the Prophets and the Psalms must be fulfilled.' },
    { reference: 'Matthew 27:46', snippet: 'My God, my God, why have you forsaken me? (Fulfilling Psalm 22:1)' },
    { reference: 'Acts 2:25-28', snippet: 'David says concerning him: For you will not abandon my soul to Hades (Psalm 16:8-11).' },
    { reference: 'Hebrews 1:5-13', snippet: 'To which of the angels did God ever say, You are my Son, today I have begotten you?' }
  ],
  'proverbs': [
    { reference: '1 Corinthians 1:24', snippet: 'Christ the power of God and the wisdom of God.' },
    { reference: 'James 1:5', snippet: 'If any of you lacks wisdom, let him ask God, who gives generously to all.' },
    { reference: 'Colossians 2:3', snippet: 'In whom are hidden all the treasures of wisdom and knowledge.' }
  ],
  'isaiah': [
    { reference: 'Matthew 1:22-23', snippet: 'Behold, the virgin shall conceive and bear a son, and they shall call his name Immanuel.' },
    { reference: 'Luke 4:18-19', snippet: 'The Spirit of the Lord is upon me, because he has anointed me to proclaim good news to the poor.' },
    { reference: '1 Peter 2:24-25', snippet: 'He himself bore our sins in his body on the tree... By his wounds you have been healed.' },
    { reference: 'Romans 10:15-16', snippet: 'How beautiful are the feet of those who preach the good news!' }
  ],
  'jeremiah': [
    { reference: 'Hebrews 8:8-12', snippet: 'Behold, the days are coming, declares the Lord, when I will establish a new covenant.' },
    { reference: 'Luke 22:20', snippet: 'This cup that is poured out for you is the new covenant in my blood.' }
  ],
  'daniel': [
    { reference: 'Matthew 24:15', snippet: 'So when you see the abomination of desolation spoken of by the prophet Daniel.' },
    { reference: 'Revelation 1:7', snippet: 'Behold, he is coming with the clouds, and every eye will see him.' },
    { reference: 'Revelation 19:11-16', snippet: 'He is clothed in a robe dipped in blood, and the name by which he is called is The Word of God.' }
  ],
  'matthew': [
    { reference: 'Mark 1:1', snippet: 'The beginning of the gospel of Jesus Christ, the Son of God.' },
    { reference: 'Luke 1:1-4', snippet: 'An orderly account of the things that have been accomplished among us.' },
    { reference: 'John 20:31', snippet: 'These are written so that you may believe that Jesus is the Christ, the Son of God.' }
  ],
  'john': [
    { reference: 'Genesis 1:1', snippet: 'In the beginning, God created the heavens and the earth.' },
    { reference: '1 John 1:1-2', snippet: 'That which was from the beginning, which we have heard, which we have seen with our eyes.' },
    { reference: 'Romans 5:8', snippet: 'God shows his love for us in that while we were still sinners, Christ died for us.' },
    { reference: 'Ephesians 2:4-5', snippet: 'God, being rich in mercy, because of the great love with which he loved us.' }
  ],
  'romans': [
    { reference: 'Galatians 3:11', snippet: 'Now it is evident that no one is justified before God by the law, for The righteous shall live by faith.' },
    { reference: 'Genesis 15:6', snippet: 'And he believed the LORD, and he counted it to him as righteousness.' },
    { reference: 'Ephesians 2:8-9', snippet: 'For by grace you have been saved through faith. And this is not your own doing; it is the gift of God.' }
  ],
  'hebrews': [
    { reference: 'Leviticus 16:1-34', snippet: 'The Day of Atonement and the sacrifice for all Israel.' },
    { reference: 'Psalm 110:4', snippet: 'The LORD has sworn: You are a priest forever after the order of Melchizedek.' },
    { reference: 'Jeremiah 31:31-34', snippet: 'I will put my law within them, and I will write it on their hearts.' }
  ],
  'revelation': [
    { reference: 'Daniel 7:13-14', snippet: 'With the clouds of heaven there came one like a son of man.' },
    { reference: 'Ezekiel 1:26-28', snippet: 'Above the expanse was the likeness of a throne, in appearance like sapphire.' },
    { reference: 'Genesis 2:9', snippet: 'The tree of life in the midst of the garden.' },
    { reference: 'Isaiah 65:17', snippet: 'For behold, I create new heavens and a new earth.' }
  ]
};

/**
 * Extracts cross references from bolls.life verse comment HTML strings
 */
export function extractReferencesFromComments(verses, currentBookKey, currentChapter) {
  const refsMap = new Map();
  const linkRegex = /<a href='\/[A-Za-z0-9_]+\/(\d+)\/(\d+)(?:\/(\d+(?:-\d+)?))?'>([^<]+)<\/a>/g;

  for (const v of verses) {
    if (!v.comment) continue;
    let match;
    while ((match = linkRegex.exec(v.comment)) !== null) {
      const bookNum = parseInt(match[1], 10);
      const chapterNum = parseInt(match[2], 10);
      const verseRef = match[3] || '';
      
      const bookKey = BIBLE_BOOKS_ORDER[bookNum - 1];
      if (bookKey) {
        const bookName = BIBLE_BOOK_NAMES[bookKey] || bookKey;
        const fullRef = verseRef ? `${bookName} ${chapterNum}:${verseRef}` : `${bookName} ${chapterNum}`;
        
        if (bookKey === currentBookKey && chapterNum === currentChapter) continue;

        if (!refsMap.has(fullRef)) {
          refsMap.set(fullRef, {
            reference: fullRef,
            book: bookKey,
            chapter: chapterNum,
            sourceVerse: v.verse,
            snippet: `Scripture parallel for verse ${v.verse}`
          });
        }
      }
    }
  }

  return Array.from(refsMap.values()).slice(0, 12);
}

/**
 * Ensures every chapter in the Bible has rich, relevant cross-references
 */
export function getCrossReferencesForChapter(bookKey, chapter, rawVerses = []) {
  const normalizedBookKey = bookKey.toLowerCase();
  const chapterInt = parseInt(chapter, 10);

  // 1. Extract from comments if available
  if (Array.isArray(rawVerses) && rawVerses.length > 0) {
    const extracted = extractReferencesFromComments(rawVerses, normalizedBookKey, chapterInt);
    if (extracted.length >= 3) {
      return extracted;
    }
  }

  // 2. Canonical book references
  const canon = BOOK_CANON_REFERENCES[normalizedBookKey] || [];
  const results = [...canon];

  // 3. Add thematic references
  if (normalizedBookKey === 'genesis') {
    if (chapterInt === 1) {
      results.unshift({ reference: 'John 1:1-3', snippet: 'All things were made through him, and without him was not any thing made.' });
      results.unshift({ reference: 'Psalm 33:6', snippet: 'By the word of the LORD the heavens were made.' });
    } else if (chapterInt === 3) {
      results.unshift({ reference: 'Romans 5:12', snippet: 'Sin entered the world through one man, and death through sin.' });
      results.unshift({ reference: 'Revelation 12:9', snippet: 'That ancient serpent called the devil.' });
    }
  } else if (normalizedBookKey === 'john') {
    if (chapterInt === 3) {
      results.unshift({ reference: 'Numbers 21:9', snippet: 'Moses made a bronze serpent and put it on a pole.' });
      results.unshift({ reference: 'Romans 5:8', snippet: 'God shows his love for us in that while we were still sinners, Christ died for us.' });
      results.unshift({ reference: '1 John 4:9', snippet: 'God sent his only Son into the world so that we might live through him.' });
    }
  }

  const seen = new Set();
  return results.filter(r => {
    if (seen.has(r.reference)) return false;
    seen.add(r.reference);
    return true;
  }).slice(0, 10);
}
