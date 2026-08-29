/**
 * Biblio 3D Vibrant Logo Helper & SVG Icons
 */

export function renderBrandLogoSvg(size: number = 44): string {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}" class="shrink-0 drop-shadow-md select-none">
    <defs>
      <!-- Vibrant Outer Background Gradient -->
      <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#58CC02"/>
        <stop offset="35%" stop-color="#1CB0F6"/>
        <stop offset="70%" stop-color="#8B5CF6"/>
        <stop offset="100%" stop-color="#EC4899"/>
      </linearGradient>

      <!-- Vibrant 3D Book Cover Gradient -->
      <linearGradient id="logoBookCoverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0284C7"/>
        <stop offset="50%" stop-color="#4F46E5"/>
        <stop offset="100%" stop-color="#7C3AED"/>
      </linearGradient>

      <!-- Golden Badge Gradient -->
      <linearGradient id="logoGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FDE047"/>
        <stop offset="50%" stop-color="#F59E0B"/>
        <stop offset="100%" stop-color="#D97706"/>
      </linearGradient>

      <!-- Emerald Glow Gradient -->
      <linearGradient id="logoEmeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#34D399"/>
        <stop offset="100%" stop-color="#059669"/>
      </linearGradient>

      <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#0F172A" flood-opacity="0.3"/>
      </filter>
    </defs>

    <!-- Outer Rounded Base with 3D Lip -->
    <rect x="4" y="4" width="92" height="92" rx="26" fill="url(#logoBgGrad)" filter="url(#logoShadow)"/>
    <rect x="4" y="86" width="92" height="10" rx="5" fill="#4338CA" opacity="0.4"/>

    <!-- Inner Gloss Highlight -->
    <path d="M6 30 C6 16 16 6 30 6 L70 6 C84 6 94 16 94 30 L94 45 C70 40 30 45 6 60 Z" fill="#FFFFFF" opacity="0.22"/>

    <!-- 3D Open Book Base -->
    <g transform="translate(14, 18)">
      <!-- Book Pages Open (White / Silver with page lines) -->
      <path d="M6 50 C24 45 42 45 36 54 C30 45 48 45 66 50 L66 18 C48 14 30 14 36 22 C42 14 24 14 6 18 Z" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5"/>
      <path d="M6 48 C22 43 36 43 36 50 L36 20 C36 14 22 14 6 17 Z" fill="#FFFFFF"/>
      <path d="M66 48 C50 43 36 43 36 50 L36 20 C36 14 50 14 66 17 Z" fill="#EFF6FF"/>
      
      <!-- Text lines on Left Page -->
      <line x1="12" y1="25" x2="28" y2="25" stroke="#94A3B8" stroke-width="2" stroke-linecap="round"/>
      <line x1="12" y1="31" x2="30" y2="31" stroke="#94A3B8" stroke-width="2" stroke-linecap="round"/>
      <line x1="12" y1="37" x2="24" y2="37" stroke="#38BDF8" stroke-width="2" stroke-linecap="round"/>

      <!-- Audio & Equalizer wave on Right Page -->
      <line x1="43" y1="36" x2="43" y2="24" stroke="#8B5CF6" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="48" y1="38" x2="48" y2="20" stroke="#EC4899" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="53" y1="37" x2="53" y2="23" stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="58" y1="35" x2="58" y2="27" stroke="#10B981" stroke-width="2.5" stroke-linecap="round"/>

      <!-- Book Spine Ribbon & Pearl Center -->
      <path d="M36 20 L36 54" stroke="#58CC02" stroke-width="3" stroke-linecap="round"/>
      <path d="M36 20 L36 34 L39 31 L42 34 L42 20 Z" fill="url(#logoGoldGrad)"/>
    </g>

    <!-- Floating 3D Badge (Bottom Right) -->
    <g transform="translate(56, 56)">
      <rect x="0" y="0" width="36" height="22" rx="11" fill="url(#logoGoldGrad)" stroke="#FFFFFF" stroke-width="2.5" filter="url(#logoShadow)"/>
      <text x="18" y="15" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="12" fill="#78350F" text-anchor="middle">3D</text>
    </g>

    <!-- Sparkle Stars (Top Right & Left) -->
    <path d="M80 14 Q80 20 86 20 Q80 20 80 26 Q80 20 74 20 Q80 20 80 14 Z" fill="#FDE047"/>
    <path d="M16 22 Q16 26 20 26 Q16 26 16 30 Q16 26 12 26 Q16 26 16 22 Z" fill="#67E8F9"/>
  </svg>
  `;
}
