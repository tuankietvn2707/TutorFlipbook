import { CoverThemePattern, getCoverPatternArt } from './svgCoverPatterns';

export interface SvgCoverConfig {
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
  themePattern: CoverThemePattern;
}

export function createSvgBookCoverDataUrl(config: SvgCoverConfig): string {
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

  const patternArt = getCoverPatternArt(themePattern, accentColor);

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 850" width="100%" height="100%">
    <defs>
      <linearGradient id="coverBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGradStart}"/>
        <stop offset="55%" stop-color="${bgGradMid}"/>
        <stop offset="100%" stop-color="${bgGradEnd}"/>
      </linearGradient>
      <linearGradient id="coverGlossGrad" x1="0%" y1="0%" x2="70%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.32"/>
        <stop offset="35%" stop-color="#FFFFFF" stop-opacity="0.08"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.25"/>
      </linearGradient>
      <linearGradient id="badgeGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FDE047"/>
        <stop offset="50%" stop-color="#F59E0B"/>
        <stop offset="100%" stop-color="#D97706"/>
      </linearGradient>
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

    <rect width="600" height="850" fill="url(#coverBgGrad)" rx="16"/>
    <g opacity="0.08">
      <circle cx="50" cy="100" r="2" fill="#FFFFFF"/><circle cx="90" cy="100" r="2" fill="#FFFFFF"/><circle cx="130" cy="100" r="2" fill="#FFFFFF"/>
      <circle cx="50" cy="140" r="2" fill="#FFFFFF"/><circle cx="90" cy="140" r="2" fill="#FFFFFF"/><circle cx="130" cy="140" r="2" fill="#FFFFFF"/>
      <circle cx="50" cy="180" r="2" fill="#FFFFFF"/><circle cx="90" cy="180" r="2" fill="#FFFFFF"/><circle cx="130" cy="180" r="2" fill="#FFFFFF"/>
    </g>

    ${patternArt}

    <path d="M0 0 L280 0 L40 850 L0 850 Z" fill="url(#coverGlossGrad)"/>
    <rect x="0" y="0" width="34" height="850" fill="url(#spineShadow)"/>
    <line x1="32" y1="0" x2="32" y2="850" stroke="#FFFFFF" stroke-opacity="0.25" stroke-width="1.5"/>

    <g transform="translate(56, 48)">
      <rect x="0" y="0" width="28" height="28" rx="6" fill="#FFFFFF" opacity="0.9"/>
      <text x="14" y="20" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="16" fill="${bgGradMid}" text-anchor="middle">★</text>
      <text x="38" y="16" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="12" fill="#FFFFFF" letter-spacing="1.5" text-transform="uppercase">${publisher}</text>
      <text x="38" y="28" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="9" fill="${accentColor}" letter-spacing="1">DIGITAL CLASSROOM EDITION • INTERACTIVE 3D</text>
    </g>

    <g transform="translate(440, 42)">
      <rect x="0" y="0" width="104" height="42" rx="14" fill="${accentColor}" filter="url(#textGlow)"/>
      <rect x="2" y="2" width="100" height="38" rx="12" fill="#FFFFFF" opacity="0.15"/>
      <text x="52" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="16" fill="#FFFFFF" text-anchor="middle">${level}</text>
    </g>

    <g transform="translate(56, 175)">
      <rect x="0" y="0" width="48" height="6" rx="3" fill="${accentColor}"/>
      <text x="0" y="60" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="44" fill="#FFFFFF" filter="url(#textGlow)" letter-spacing="-0.5">${title}</text>
      <g transform="translate(0, 85)">
        <rect x="0" y="0" width="488" height="42" rx="12" fill="#000000" opacity="0.35"/>
        <rect x="0" y="0" width="488" height="42" rx="12" fill="none" stroke="${accentColor}" stroke-width="1.5"/>
        <text x="18" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="15" fill="#FFFFFF" letter-spacing="1">${subtitle}</text>
      </g>
    </g>

    <g transform="translate(56, 520)">
      <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="14" fill="#FFFFFF" opacity="0.9">By ${author}</text>
      <line x1="0" y1="12" x2="220" y2="12" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="1"/>
    </g>

    <g transform="translate(56, 560)">
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="145" height="38" rx="12" fill="#FFFFFF" opacity="0.18"/>
        <rect x="0" y="0" width="145" height="38" rx="12" fill="none" stroke="#FFFFFF" stroke-opacity="0.4" stroke-width="1"/>
        <text x="14" y="24" font-family="sans-serif" font-size="16">🎧</text>
        <text x="38" y="23" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="12" fill="#FFFFFF">Audio MP3s</text>
      </g>
      <g transform="translate(155, 0)">
        <rect x="0" y="0" width="145" height="38" rx="12" fill="#FFFFFF" opacity="0.18"/>
        <rect x="0" y="0" width="145" height="38" rx="12" fill="none" stroke="#FFFFFF" stroke-opacity="0.4" stroke-width="1"/>
        <text x="14" y="24" font-family="sans-serif" font-size="16">🎥</text>
        <text x="38" y="23" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="12" fill="#FFFFFF">Video Bài Giảng</text>
      </g>
      <g transform="translate(310, 0)">
        <rect x="0" y="0" width="178" height="38" rx="12" fill="url(#badgeGoldGrad)" filter="url(#textGlow)"/>
        <text x="12" y="24" font-family="sans-serif" font-size="16">✨</text>
        <text x="34" y="23" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="12" fill="#78350F">${badge}</text>
      </g>
    </g>

    <g transform="translate(56, 740)">
      <rect x="0" y="0" width="120" height="46" rx="6" fill="#FFFFFF" opacity="0.95"/>
      <g transform="translate(8, 6)" stroke="#0F172A" stroke-width="2">
        <line x1="4" y1="0" x2="4" y2="28"/><line x1="8" y1="0" x2="8" y2="28" stroke-width="3"/><line x1="14" y1="0" x2="14" y2="28"/>
        <line x1="20" y1="0" x2="20" y2="28" stroke-width="4"/><line x1="28" y1="0" x2="28" y2="28"/><line x1="34" y1="0" x2="34" y2="28" stroke-width="2"/>
        <line x1="42" y1="0" x2="42" y2="28" stroke-width="3"/><line x1="50" y1="0" x2="50" y2="28"/><line x1="56" y1="0" x2="56" y2="28" stroke-width="4"/>
        <line x1="64" y1="0" x2="64" y2="28"/><line x1="72" y1="0" x2="72" y2="28" stroke-width="2"/><line x1="80" y1="0" x2="80" y2="28" stroke-width="3"/>
        <line x1="88" y1="0" x2="88" y2="28"/><line x1="94" y1="0" x2="94" y2="28" stroke-width="4"/><line x1="100" y1="0" x2="100" y2="28"/>
      </g>
      <text x="60" y="42" font-family="monospace" font-size="8" fill="#475569" text-anchor="middle">978-0-19-4566</text>
      <g transform="translate(380, -10)">
        <circle cx="35" cy="35" r="32" fill="url(#badgeGoldGrad)" stroke="#FFFFFF" stroke-width="3" filter="url(#textGlow)"/>
        <circle cx="35" cy="35" r="26" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-dasharray="4,3"/>
        <text x="35" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="11" fill="#78350F" text-anchor="middle">BIBLIO</text>
        <text x="35" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="10" fill="#92400E" text-anchor="middle">3D PRO</text>
      </g>
    </g>
    <rect x="590" y="10" width="8" height="830" rx="4" fill="#FFFFFF" opacity="0.4"/>
  </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
