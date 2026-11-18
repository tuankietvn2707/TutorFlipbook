export type CoverThemePattern = 'geometric' | 'cambridge' | 'waves' | 'compass' | 'prism';

export function getCoverPatternArt(themePattern: CoverThemePattern, accentColor: string): string {
  if (themePattern === 'geometric') {
    return `
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
  }
  if (themePattern === 'cambridge') {
    return `
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
  }
  if (themePattern === 'compass') {
    return `
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
  }
  if (themePattern === 'prism') {
    return `
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
  }
  return `
    <!-- English File Dynamic Waves & City Motif -->
    <g opacity="0.35" transform="translate(170, 220)">
      <rect x="30" y="20" width="80" height="180" rx="10" fill="none" stroke="#FFFFFF" stroke-width="3"/>
      <rect x="130" y="70" width="70" height="130" rx="8" fill="none" stroke="${accentColor}" stroke-width="3"/>
      <circle cx="70" cy="65" r="16" fill="none" stroke="#FFFFFF" stroke-width="2"/>
      <path d="M0 240 Q130 180 260 240 T520 240" fill="none" stroke="#FFFFFF" stroke-width="4"/>
    </g>
  `;
}
