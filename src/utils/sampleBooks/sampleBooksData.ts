import { Book } from '../../types';
import { createSvgBookCoverDataUrl } from './svgCoverGenerator';
import { createSvgPageDataUrl } from './svgPageGenerator';

function buildPages(cover: string, title: string, publisher: string, theme: string, accent: string): string[] {
  return [
    cover,
    createSvgPageDataUrl(title, publisher, 1, theme, accent),
    createSvgPageDataUrl(title, publisher, 2, theme, accent),
    createSvgPageDataUrl(title, publisher, 3, theme, accent),
    createSvgPageDataUrl(title, publisher, 4, theme, accent),
    createSvgPageDataUrl(title, publisher, 5, theme, accent),
    createSvgPageDataUrl(title, publisher, 6, theme, accent)
  ];
}

export function createSampleBooks(): Book[] {
  const cover1 = createSvgBookCoverDataUrl({
    title: 'Navigate',
    subtitle: 'B1+ INTERMEDIATE COURSEBOOK',
    publisher: 'Oxford University Press',
    level: 'CEFR B1+',
    author: 'Rachael Roberts • Heather Buchanan',
    badge: 'LẬT SÁCH 3D',
    bgGradStart: '#064E3B',
    bgGradMid: '#059669',
    bgGradEnd: '#047857',
    accentColor: '#34D399',
    themePattern: 'geometric'
  });

  const cover2 = createSvgBookCoverDataUrl({
    title: 'IELTS 18',
    subtitle: 'ACADEMIC WITH ANSWERS & AUDIO',
    publisher: 'Cambridge Assessment English',
    level: 'BAND 6.5 - 9.0',
    author: 'Cambridge University Press & Assessment',
    badge: 'OFFICIAL TEST',
    bgGradStart: '#0C4A6E',
    bgGradMid: '#0284C7',
    bgGradEnd: '#0369A1',
    accentColor: '#38BDF8',
    themePattern: 'cambridge'
  });

  const cover3 = createSvgBookCoverDataUrl({
    title: 'Destination B2',
    subtitle: 'GRAMMAR & VOCABULARY WITH KEY',
    publisher: 'Macmillan Education',
    level: 'LEVEL B2',
    author: 'Malcolm Mann • Steve Taylore-Knowles',
    badge: 'LUYỆN THI',
    bgGradStart: '#4C1D95',
    bgGradMid: '#7C3AED',
    bgGradEnd: '#6D28D9',
    accentColor: '#A78BFA',
    themePattern: 'compass'
  });

  const cover4 = createSvgBookCoverDataUrl({
    title: 'English File',
    subtitle: "UPPER-INTERMEDIATE STUDENT'S BOOK",
    publisher: 'Oxford University Press',
    level: '4TH EDITION',
    author: 'Christina Latham-Koenig • Clive Oxenden',
    badge: 'BESTSELLER',
    bgGradStart: '#881337',
    bgGradMid: '#E11D48',
    bgGradEnd: '#BE123C',
    accentColor: '#FDA4AF',
    themePattern: 'waves'
  });

  const sampleAudio1 = 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg';
  const sampleAudio2 = 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg';
  const createdAt = new Date().toISOString();

  return [
    {
      id: 'sample-book-navigate-b1',
      title: 'Navigate B1+ Intermediate Coursebook',
      category: 'textbook',
      color: 'emerald',
      totalPages: 7,
      coverImage: cover1,
      pages: buildPages(cover1, 'Navigate B1+ Intermediate', 'Oxford University Press', '#059669', '#34D399'),
      audioTracks: [
        { id: 'track-1', name: 'Track 1.01 - Introduction & Unit 1', url: sampleAudio1 },
        { id: 'track-2', name: 'Track 1.02 - Grammar & Listening Drill', url: sampleAudio2 },
        { id: 'track-3', name: 'Track 1.03 - Reading Comprehension Dialogue', url: sampleAudio1 }
      ],
      videoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
      createdAt,
      isSample: true
    },
    {
      id: 'sample-book-cambridge-ielts-18',
      title: 'Cambridge IELTS 18 Academic Test',
      category: 'exercise',
      color: 'sky',
      totalPages: 7,
      coverImage: cover2,
      pages: buildPages(cover2, 'Cambridge IELTS 18 Academic', 'Cambridge Assessment English', '#0284C7', '#38BDF8'),
      audioTracks: [
        { id: 'ielts-1', name: 'Test 1 - Section 1 Listening', url: sampleAudio2 },
        { id: 'ielts-2', name: 'Test 1 - Section 2 Listening', url: sampleAudio1 }
      ],
      videoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
      createdAt,
      isSample: true
    },
    {
      id: 'sample-book-destination-b2',
      title: 'Destination B2 Grammar & Vocabulary',
      category: 'exercise',
      color: 'purple',
      totalPages: 7,
      coverImage: cover3,
      pages: buildPages(cover3, 'Destination B2 Grammar', 'Macmillan Education', '#7C3AED', '#A78BFA'),
      audioTracks: [
        { id: 'dest-1', name: 'Unit 1 - Present Time Audio Practice', url: sampleAudio1 },
        { id: 'dest-2', name: 'Unit 2 - Past Time Vocabulary Drill', url: sampleAudio2 }
      ],
      videoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
      createdAt,
      isSample: true
    },
    {
      id: 'sample-book-english-file',
      title: 'English File 4th Edition Upper-Intermediate',
      category: 'textbook',
      color: 'red',
      totalPages: 7,
      coverImage: cover4,
      pages: buildPages(cover4, 'English File Upper-Int', 'Oxford University Press', '#E11D48', '#FDA4AF'),
      audioTracks: [
        { id: 'ef-1', name: 'File 1 - Colloquial English Listening', url: sampleAudio2 },
        { id: 'ef-2', name: 'File 2 - Pronunciation & Intonation Drill', url: sampleAudio1 }
      ],
      videoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
      createdAt,
      isSample: true
    }
  ];
}
