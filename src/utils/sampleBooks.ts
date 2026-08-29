import { Book } from '../types';

/**
 * Generates an ultra-realistic, colorful Vector Textbook Cover (SVG Data URL)
 */
export function createSvgBookCoverDataUrl(config: {
  title: string;
  subtitle: string;
  publisher: string;
  level: string;
  author: string;
  badge: string;
  bgGradStart: string;
  bgGradMid: string;
  bgGradEnd: string;
  accentColor: string;
  themePattern: 'geometric' | 'cambridge' | 'waves' | 'compass' | 'prism';
}): string {
  const {
    title,
    subtitle,
    publisher,
    level,
    author,
    badge,
    bgGradStart,
    bgGradMid,
    bgGradEnd,
    accentColor,
    themePattern
  } = config;

  let patternArt = '';

  if (themePattern === 'geometric') {
    patternArt = `
      <!-- 3D Geometric Polygonal Art -->
      <g opacity="0.35" transform="translate(180, 220)">
        <polygon points="120,0 240,70 240,210 120,280 0,210 0,70" fill="none" stroke="#FFFFFF" stroke-width="3"/>
        <polygon points="120,40 200,90 200,190 120,240 40,190 40,90" fill="none" stroke="${accentColor}" stroke-width="2.5"/>
        <line x1="120" y1="0" x2="120" y2="280" stroke="#FFFFFF" stroke-width="2"/>
        <line x1="0" y1="70" x2="240" y2="210" stroke="#FFFFFF" stroke-width="2"/>
        <line x1="0" y1="210" x2="240" y2="70" stroke="#FFFFFF" stroke-width="2"/>
        <circle cx="120" cy="140" r="30" fill="${accentColor}" opacity="0.6"/>
        <circle cx="120" cy="140" r="12" fill="#FFFFFF"/>
      </g>
    `;
  } else if (themePattern === 'cambridge') {
    patternArt = `
      <!-- Cambridge Globe & Academic Crest Artwork -->
      <g opacity="0.3" transform="translate(160, 210)">
        <circle cx="140" cy="140" r="130" fill="none" stroke="#FFFFFF" stroke-width="3"/>
        <circle cx="140" cy="140" r="95" fill="none" stroke="${accentColor}" stroke-width="2"/>
        <ellipse cx="140" cy="140" rx="130" ry="50" fill="none" stroke="#FFFFFF" stroke-width="2"/>
        <ellipse cx="140" cy="140" rx="50" ry="130" fill="none" stroke="#FFFFFF" stroke-width="2"/>
        <line x1="10" y1="140" x2="270" y2="140" stroke="#FFFFFF" stroke-width="2"/>
        <line x1="140" y1="10" x2="140" y2="270" stroke="#FFFFFF" stroke-width="2"/>
        <polygon points="140,50 170,140 140,120 110,140" fill="${accentColor}"/>
      </g>
    `;
  } else if (themePattern === 'compass') {
    patternArt = `
      <!-- Destination Compass & Map Motif -->
      <g opacity="0.35" transform="translate(170, 220)">
        <circle cx="130" cy="130" r="120" fill="none" stroke="#FFFFFF" stroke-width="4"/>
        <circle cx="130" cy="130" r="85" fill="none" stroke="${accentColor}" stroke-width="2" stroke-dasharray="6,6"/>
        <polygon points="130,15 145,115 245,130 145,145 130,245 115,145 15,130 115,115" fill="${accentColor}" opacity="0.8"/>
        <polygon points="130,15 145,115 130,130 115,115" fill="#FFFFFF"/>
        <polygon points="130,245 145,145 130,130 115,145" fill="#FFFFFF" opacity="0.6"/>
        <circle cx="130" cy="130" r="14" fill="#FFFFFF"/>
      </g>
    `;
  } else if (themePattern === 'prism') {
    patternArt = `
      <!-- Solutions Prism & Light Beam -->
      <g opacity="0.4" transform="translate(180, 230)">
        <polygon points="120,20 220,220 20,220" fill="none" stroke="#FFFFFF" stroke-width="4"/>
        <polygon points="120,60 190,200 50,200" fill="none" stroke="${accentColor}" stroke-width="2.5"/>
        <line x1="0" y1="120" x2="90" y2="120" stroke="#FDE047" stroke-width="5" stroke-linecap="round"/>
        <line x1="150" y1="140" x2="260" y2="100" stroke="#EC4899" stroke-width="3"/>
        <line x1="150" y1="140" x2="260" y2="130" stroke="#06B6D4" stroke-width="3"/>
        <line x1="150" y1="140" x2="260" y2="160" stroke="#10B981" stroke-width="3"/>
      </g>
    `;
  } else {
    // English File London art
    patternArt = `
      <!-- English File Dynamic Waves & City Motif -->
      <g opacity="0.35" transform="translate(170, 220)">
        <rect x="30" y="20" width="80" height="180" rx="10" fill="none" stroke="#FFFFFF" stroke-width="3"/>
        <rect x="130" y="70" width="70" height="130" rx="8" fill="none" stroke="${accentColor}" stroke-width="3"/>
        <circle cx="70" cy="65" r="16" fill="none" stroke="#FFFFFF" stroke-width="2"/>
        <path d="M0 240 Q130 180 260 240 T520 240" fill="none" stroke="#FFFFFF" stroke-width="4"/>
      </g>
    `;
  }

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 850" width="100%" height="100%">
    <defs>
      <!-- Background Cover Gradient -->
      <linearGradient id="coverBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGradStart}"/>
        <stop offset="55%" stop-color="${bgGradMid}"/>
        <stop offset="100%" stop-color="${bgGradEnd}"/>
      </linearGradient>

      <!-- Gloss Sheen Overlay -->
      <linearGradient id="coverGlossGrad" x1="0%" y1="0%" x2="70%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.32"/>
        <stop offset="35%" stop-color="#FFFFFF" stop-opacity="0.08"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.25"/>
      </linearGradient>

      <!-- Golden Badge Gradient -->
      <linearGradient id="badgeGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FDE047"/>
        <stop offset="50%" stop-color="#F59E0B"/>
        <stop offset="100%" stop-color="#D97706"/>
      </linearGradient>

      <!-- Spine Shadow Gradient -->
      <linearGradient id="spineShadow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#000000" stop-opacity="0.5"/>
        <stop offset="25%" stop-color="#FFFFFF" stop-opacity="0.2"/>
        <stop offset="45%" stop-color="#000000" stop-opacity="0.1"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.0"/>
      </linearGradient>

      <filter id="textGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.45"/>
      </filter>
    </defs>

    <!-- Main Book Cover Surface -->
    <rect width="600" height="850" fill="url(#coverBgGrad)" rx="16"/>

    <!-- Subtle Background Dot Matrix / Grid -->
    <g opacity="0.08">
      <circle cx="50" cy="100" r="2" fill="#FFFFFF"/>
      <circle cx="90" cy="100" r="2" fill="#FFFFFF"/>
      <circle cx="130" cy="100" r="2" fill="#FFFFFF"/>
      <circle cx="50" cy="140" r="2" fill="#FFFFFF"/>
      <circle cx="90" cy="140" r="2" fill="#FFFFFF"/>
      <circle cx="130" cy="140" r="2" fill="#FFFFFF"/>
      <circle cx="50" cy="180" r="2" fill="#FFFFFF"/>
      <circle cx="90" cy="180" r="2" fill="#FFFFFF"/>
      <circle cx="130" cy="180" r="2" fill="#FFFFFF"/>
    </g>

    <!-- Center Theme Pattern Vector Art -->
    ${patternArt}

    <!-- Gloss Ribbon Sweep -->
    <path d="M0 0 L280 0 L40 850 L0 850 Z" fill="url(#coverGlossGrad)"/>

    <!-- Left Book Spine Crease & Shadow Line -->
    <rect x="0" y="0" width="34" height="850" fill="url(#spineShadow)"/>
    <line x1="32" y1="0" x2="32" y2="850" stroke="#FFFFFF" stroke-opacity="0.25" stroke-width="1.5"/>

    <!-- TOP BAR: Publisher Branding & Crest -->
    <g transform="translate(56, 48)">
      <rect x="0" y="0" width="28" height="28" rx="6" fill="#FFFFFF" opacity="0.9"/>
      <text x="14" y="20" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="16" fill="${bgGradMid}" text-anchor="middle">★</text>
      
      <text x="38" y="16" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="12" fill="#FFFFFF" letter-spacing="1.5" text-transform="uppercase">
        ${publisher}
      </text>
      <text x="38" y="28" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="9" fill="${accentColor}" letter-spacing="1">
        DIGITAL CLASSROOM EDITION • INTERACTIVE 3D
      </text>
    </g>

    <!-- CEFR / ACADEMIC LEVEL FLOATING BADGE (TOP RIGHT) -->
    <g transform="translate(440, 42)">
      <rect x="0" y="0" width="104" height="42" rx="14" fill="${accentColor}" filter="url(#textGlow)"/>
      <rect x="2" y="2" width="100" height="38" rx="12" fill="#FFFFFF" opacity="0.15"/>
      <text x="52" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="16" fill="#FFFFFF" text-anchor="middle">
        ${level}
      </text>
    </g>

    <!-- CENTER HERO: MAIN TITLE & TYPOGRAPHY -->
    <g transform="translate(56, 175)">
      <!-- Series Accent Line -->
      <rect x="0" y="0" width="48" height="6" rx="3" fill="${accentColor}"/>
      
      <!-- Main Title -->
      <text x="0" y="60" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="44" fill="#FFFFFF" filter="url(#textGlow)" letter-spacing="-0.5">
        ${title}
      </text>

      <!-- Subtitle Banner -->
      <g transform="translate(0, 85)">
        <rect x="0" y="0" width="488" height="42" rx="12" fill="#000000" opacity="0.35"/>
        <rect x="0" y="0" width="488" height="42" rx="12" fill="none" stroke="${accentColor}" stroke-width="1.5"/>
        <text x="18" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="15" fill="#FFFFFF" letter-spacing="1">
          ${subtitle}
        </text>
      </g>
    </g>

    <!-- AUTHOR LINE & EXAM BADGE -->
    <g transform="translate(56, 520)">
      <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="14" fill="#FFFFFF" opacity="0.9">
        By ${author}
      </text>
      <line x1="0" y1="12" x2="220" y2="12" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="1"/>
    </g>

    <!-- MULTI-MEDIA BADGES CAPSULE (AUDIO + VIDEO + 3D) -->
    <g transform="translate(56, 560)">
      <!-- Audio Badge -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="145" height="38" rx="12" fill="#FFFFFF" opacity="0.18"/>
        <rect x="0" y="0" width="145" height="38" rx="12" fill="none" stroke="#FFFFFF" stroke-opacity="0.4" stroke-width="1"/>
        <text x="14" y="24" font-family="sans-serif" font-size="16">🎧</text>
        <text x="38" y="23" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="12" fill="#FFFFFF">Audio MP3s</text>
      </g>

      <!-- Video Badge -->
      <g transform="translate(155, 0)">
        <rect x="0" y="0" width="145" height="38" rx="12" fill="#FFFFFF" opacity="0.18"/>
        <rect x="0" y="0" width="145" height="38" rx="12" fill="none" stroke="#FFFFFF" stroke-opacity="0.4" stroke-width="1"/>
        <text x="14" y="24" font-family="sans-serif" font-size="16">🎥</text>
        <text x="38" y="23" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="12" fill="#FFFFFF">Video Bài Giảng</text>
      </g>

      <!-- 3D Flipbook Badge -->
      <g transform="translate(310, 0)">
        <rect x="0" y="0" width="178" height="38" rx="12" fill="url(#badgeGoldGrad)" filter="url(#textGlow)"/>
        <text x="12" y="24" font-family="sans-serif" font-size="16">✨</text>
        <text x="34" y="23" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="12" fill="#78350F">${badge}</text>
      </g>
    </g>

    <!-- BOTTOM BAR: Barcode, Hologram Seal & Interactive Footnote -->
    <g transform="translate(56, 740)">
      <!-- Barcode simulation -->
      <rect x="0" y="0" width="120" height="46" rx="6" fill="#FFFFFF" opacity="0.95"/>
      <g transform="translate(8, 6)" stroke="#0F172A" stroke-width="2">
        <line x1="4" y1="0" x2="4" y2="28"/>
        <line x1="8" y1="0" x2="8" y2="28" stroke-width="3"/>
        <line x1="14" y1="0" x2="14" y2="28"/>
        <line x1="20" y1="0" x2="20" y2="28" stroke-width="4"/>
        <line x1="28" y1="0" x2="28" y2="28"/>
        <line x1="34" y1="0" x2="34" y2="28" stroke-width="2"/>
        <line x1="42" y1="0" x2="42" y2="28" stroke-width="3"/>
        <line x1="50" y1="0" x2="50" y2="28"/>
        <line x1="56" y1="0" x2="56" y2="28" stroke-width="4"/>
        <line x1="64" y1="0" x2="64" y2="28"/>
        <line x1="72" y1="0" x2="72" y2="28" stroke-width="2"/>
        <line x1="80" y1="0" x2="80" y2="28" stroke-width="3"/>
        <line x1="88" y1="0" x2="88" y2="28"/>
        <line x1="94" y1="0" x2="94" y2="28" stroke-width="4"/>
        <line x1="100" y1="0" x2="100" y2="28"/>
      </g>
      <text x="60" y="42" font-family="monospace" font-size="8" fill="#475569" text-anchor="middle">978-0-19-4566</text>

      <!-- 3D Studio Hologram Seal -->
      <g transform="translate(380, -10)">
        <circle cx="35" cy="35" r="32" fill="url(#badgeGoldGrad)" stroke="#FFFFFF" stroke-width="3" filter="url(#textGlow)"/>
        <circle cx="35" cy="35" r="26" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-dasharray="4,3"/>
        <text x="35" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="11" fill="#78350F" text-anchor="middle">BIBLIO</text>
        <text x="35" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="10" fill="#92400E" text-anchor="middle">3D PRO</text>
      </g>
    </g>

    <!-- Outer Page Edge Right Rim -->
    <rect x="590" y="10" width="8" height="830" rx="4" fill="#FFFFFF" opacity="0.4"/>
  </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Generates an inside page for the sample books
 */
export function createSvgPageDataUrl(
  title: string,
  subtitle: string,
  pageNum: number,
  colorTheme: string,
  accentColor: string
): string {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 840" width="100%" height="100%">
    <defs>
      <linearGradient id="pageGrad_${pageNum}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#F8FAFC"/>
      </linearGradient>
      <pattern id="pageGrid_${pageNum}" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#F1F5F9" stroke-width="1"/>
      </pattern>
    </defs>
    
    <rect width="600" height="840" fill="url(#pageGrad_${pageNum})" rx="6"/>
    <rect width="600" height="840" fill="url(#pageGrid_${pageNum})" />
    
    <!-- Top Header Bar -->
    <rect x="0" y="0" width="600" height="76" fill="${colorTheme}" />
    <rect x="0" y="72" width="600" height="4" fill="${accentColor}" />
    
    <!-- Logo Badge in Header -->
    <rect x="36" y="18" width="40" height="40" rx="10" fill="#ffffff" />
    <text x="56" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="18" fill="${colorTheme}" text-anchor="middle">3D</text>
    
    <text x="90" y="40" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="17" fill="#ffffff">${title}</text>
    <text x="90" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="11" fill="rgba(255,255,255,0.9)">${subtitle} • Bài Học Trang ${pageNum}</text>
    
    <!-- Decorative Unit Card -->
    <rect x="36" y="96" width="528" height="150" rx="16" fill="#ffffff" stroke="#E2E8F0" stroke-width="2" />
    
    <rect x="54" y="116" width="6" height="28" rx="3" fill="${colorTheme}" />
    <text x="70" y="136" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="17" fill="#1E293B">Unit ${pageNum}: Interactive Digital Classroom</text>
    
    <text x="54" y="172" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="13" fill="#64748B">
      <tspan x="54" dy="0">Sách lật 3D tương tác kết hợp phát bài nghe Audio, video bài giảng,</tspan>
      <tspan x="54" dy="22">bút vẽ chú thích trực quan cho giáo viên và đồng bộ Google Drive.</tspan>
    </text>

    <!-- Content Feature Modules -->
    <g transform="translate(36, 266)">
      <!-- Listening Box -->
      <rect x="0" y="0" width="254" height="175" rx="14" fill="#ffffff" stroke="#E2E8F0" stroke-width="2"/>
      <rect x="16" y="16" width="38" height="38" rx="10" fill="${colorTheme}18"/>
      <text x="35" y="41" font-family="sans-serif" font-size="18" text-anchor="middle">🎧</text>
      <text x="64" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="14" fill="#1E293B">Audio Listening</text>
      <text x="16" y="78" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#475569" font-weight="500">
        <tspan x="16" dy="0">• Track 0${pageNum}: Vocabulary & Speaking</tspan>
        <tspan x="16" dy="20">• Phím tắt: L (Laser), P (Bút dạ)</tspan>
        <tspan x="16" dy="20">• H (Kéo tay), F (Toàn màn hình)</tspan>
      </text>

      <!-- Teaching Tools Box -->
      <rect x="274" y="0" width="254" height="175" rx="14" fill="#ffffff" stroke="#E2E8F0" stroke-width="2"/>
      <rect x="290" y="16" width="38" height="38" rx="10" fill="#1CB0F618"/>
      <text x="309" y="41" font-family="sans-serif" font-size="18" text-anchor="middle">✨</text>
      <text x="338" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="14" fill="#1E293B">Teacher Studio</text>
      <text x="290" y="78" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#475569" font-weight="500">
        <tspan x="290" dy="0">• Đèn rọi Spotlight thu hút chú ý</tspan>
        <tspan x="290" dy="20">• Bút dạ quang & tẩy xóa nét vẽ</tspan>
        <tspan x="290" dy="20">• Bắn pháo hoa khen thưởng học sinh</tspan>
      </text>
    </g>

    <!-- Reading & Practice Exercise -->
    <g transform="translate(36, 465)">
      <rect x="0" y="0" width="528" height="270" rx="14" fill="#ffffff" stroke="#E2E8F0" stroke-width="2"/>
      <text x="20" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="14" fill="#0F172A">Reading & Grammar Comprehension</text>
      <line x1="20" y1="46" x2="508" y2="46" stroke="#F1F5F9" stroke-width="2"/>
      <text x="20" y="76" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#334155" font-weight="400">
        <tspan x="20" dy="0">1. Education is the passport to the future, for tomorrow belongs to those</tspan>
        <tspan x="20" dy="22">   who prepare for it today. Engage your students with vivid interactive materials.</tspan>
        <tspan x="20" dy="22">2. Real-time flip sound brings natural book-reading feel directly inside any browser.</tspan>
        <tspan x="20" dy="22">3. Continuous zoom up to 400% with intuitive hand pan tool for large smartboards.</tspan>
        <tspan x="20" dy="22">4. Seamless cloud synchronization ensures zero data loss across sessions.</tspan>
      </text>
      
      <rect x="20" y="205" width="130" height="38" rx="10" fill="${colorTheme}" />
      <text x="85" y="229" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="12" fill="#ffffff" text-anchor="middle">Exercise ${pageNum}.A Practice</text>
    </g>

    <!-- Footer Page Number -->
    <rect x="0" y="785" width="600" height="55" fill="#F8FAFC" />
    <line x1="0" y1="785" x2="600" y2="785" stroke="#E2E8F0" stroke-width="1" />
    <text x="300" y="817" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="12" fill="#94A3B8" text-anchor="middle">— Trang ${pageNum} / 6 —</text>
  </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function createSampleBooks(): Book[] {
  // Sample Book 1: Navigate B1+ Intermediate (Oxford University Press)
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

  const book1Pages = [
    cover1,
    createSvgPageDataUrl('Navigate B1+ Intermediate', 'Oxford University Press', 1, '#059669', '#34D399'),
    createSvgPageDataUrl('Navigate B1+ Intermediate', 'Oxford University Press', 2, '#059669', '#34D399'),
    createSvgPageDataUrl('Navigate B1+ Intermediate', 'Oxford University Press', 3, '#059669', '#34D399'),
    createSvgPageDataUrl('Navigate B1+ Intermediate', 'Oxford University Press', 4, '#059669', '#34D399'),
    createSvgPageDataUrl('Navigate B1+ Intermediate', 'Oxford University Press', 5, '#059669', '#34D399'),
    createSvgPageDataUrl('Navigate B1+ Intermediate', 'Oxford University Press', 6, '#059669', '#34D399')
  ];

  // Sample Book 2: Cambridge IELTS 18 Academic (Cambridge)
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

  const book2Pages = [
    cover2,
    createSvgPageDataUrl('Cambridge IELTS 18 Academic', 'Cambridge Assessment English', 1, '#0284C7', '#38BDF8'),
    createSvgPageDataUrl('Cambridge IELTS 18 Academic', 'Cambridge Assessment English', 2, '#0284C7', '#38BDF8'),
    createSvgPageDataUrl('Cambridge IELTS 18 Academic', 'Cambridge Assessment English', 3, '#0284C7', '#38BDF8'),
    createSvgPageDataUrl('Cambridge IELTS 18 Academic', 'Cambridge Assessment English', 4, '#0284C7', '#38BDF8'),
    createSvgPageDataUrl('Cambridge IELTS 18 Academic', 'Cambridge Assessment English', 5, '#0284C7', '#38BDF8'),
    createSvgPageDataUrl('Cambridge IELTS 18 Academic', 'Cambridge Assessment English', 6, '#0284C7', '#38BDF8')
  ];

  // Sample Book 3: Destination B2 Grammar & Vocabulary (Macmillan)
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

  const book3Pages = [
    cover3,
    createSvgPageDataUrl('Destination B2 Grammar', 'Macmillan Education', 1, '#7C3AED', '#A78BFA'),
    createSvgPageDataUrl('Destination B2 Grammar', 'Macmillan Education', 2, '#7C3AED', '#A78BFA'),
    createSvgPageDataUrl('Destination B2 Grammar', 'Macmillan Education', 3, '#7C3AED', '#A78BFA'),
    createSvgPageDataUrl('Destination B2 Grammar', 'Macmillan Education', 4, '#7C3AED', '#A78BFA'),
    createSvgPageDataUrl('Destination B2 Grammar', 'Macmillan Education', 5, '#7C3AED', '#A78BFA'),
    createSvgPageDataUrl('Destination B2 Grammar', 'Macmillan Education', 6, '#7C3AED', '#A78BFA')
  ];

  // Sample Book 4: English File 4th Edition Upper-Intermediate (Oxford)
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

  const book4Pages = [
    cover4,
    createSvgPageDataUrl('English File Upper-Int', 'Oxford University Press', 1, '#E11D48', '#FDA4AF'),
    createSvgPageDataUrl('English File Upper-Int', 'Oxford University Press', 2, '#E11D48', '#FDA4AF'),
    createSvgPageDataUrl('English File Upper-Int', 'Oxford University Press', 3, '#E11D48', '#FDA4AF'),
    createSvgPageDataUrl('English File Upper-Int', 'Oxford University Press', 4, '#E11D48', '#FDA4AF'),
    createSvgPageDataUrl('English File Upper-Int', 'Oxford University Press', 5, '#E11D48', '#FDA4AF'),
    createSvgPageDataUrl('English File Upper-Int', 'Oxford University Press', 6, '#E11D48', '#FDA4AF')
  ];

  const sampleAudio1 = 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg';
  const sampleAudio2 = 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg';

  return [
    {
      id: 'sample-book-navigate-b1',
      title: 'Navigate B1+ Intermediate Coursebook',
      category: 'textbook',
      color: 'emerald',
      totalPages: 7,
      coverImage: cover1,
      pages: book1Pages,
      audioTracks: [
        { id: 'track-1', name: 'Track 1.01 - Introduction & Unit 1', url: sampleAudio1 },
        { id: 'track-2', name: 'Track 1.02 - Grammar & Listening Drill', url: sampleAudio2 },
        { id: 'track-3', name: 'Track 1.03 - Reading Comprehension Dialogue', url: sampleAudio1 }
      ],
      videoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
      createdAt: new Date().toISOString(),
      isSample: true
    },
    {
      id: 'sample-book-cambridge-ielts-18',
      title: 'Cambridge IELTS 18 Academic Test',
      category: 'exercise',
      color: 'sky',
      totalPages: 7,
      coverImage: cover2,
      pages: book2Pages,
      audioTracks: [
        { id: 'ielts-1', name: 'Test 1 - Section 1 Listening', url: sampleAudio2 },
        { id: 'ielts-2', name: 'Test 1 - Section 2 Listening', url: sampleAudio1 }
      ],
      videoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
      createdAt: new Date().toISOString(),
      isSample: true
    },
    {
      id: 'sample-book-destination-b2',
      title: 'Destination B2 Grammar & Vocabulary',
      category: 'exercise',
      color: 'purple',
      totalPages: 7,
      coverImage: cover3,
      pages: book3Pages,
      audioTracks: [
        { id: 'dest-1', name: 'Unit 1 - Present Time Audio Practice', url: sampleAudio1 },
        { id: 'dest-2', name: 'Unit 2 - Past Time Vocabulary Drill', url: sampleAudio2 }
      ],
      videoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
      createdAt: new Date().toISOString(),
      isSample: true
    },
    {
      id: 'sample-book-english-file',
      title: 'English File 4th Edition Upper-Intermediate',
      category: 'textbook',
      color: 'red',
      totalPages: 7,
      coverImage: cover4,
      pages: book4Pages,
      audioTracks: [
        { id: 'ef-1', name: 'File 1 - Colloquial English Listening', url: sampleAudio2 },
        { id: 'ef-2', name: 'File 2 - Pronunciation & Intonation Drill', url: sampleAudio1 }
      ],
      videoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
      createdAt: new Date().toISOString(),
      isSample: true
    }
  ];
}
