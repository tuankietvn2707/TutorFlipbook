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
    <rect x="0" y="0" width="600" height="76" fill="${colorTheme}" />
    <rect x="0" y="72" width="600" height="4" fill="${accentColor}" />
    
    <rect x="36" y="18" width="40" height="40" rx="10" fill="#ffffff" />
    <text x="56" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="18" fill="${colorTheme}" text-anchor="middle">3D</text>
    <text x="90" y="40" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="17" fill="#ffffff">${title}</text>
    <text x="90" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="11" fill="rgba(255,255,255,0.9)">${subtitle} • Bài Học Trang ${pageNum}</text>
    
    <rect x="36" y="96" width="528" height="150" rx="16" fill="#ffffff" stroke="#E2E8F0" stroke-width="2" />
    <rect x="54" y="116" width="6" height="28" rx="3" fill="${colorTheme}" />
    <text x="70" y="136" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="17" fill="#1E293B">Unit ${pageNum}: Interactive Digital Classroom</text>
    <text x="54" y="172" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="13" fill="#64748B">
      <tspan x="54" dy="0">Sách lật 3D tương tác kết hợp phát bài nghe Audio, video bài giảng,</tspan>
      <tspan x="54" dy="22">bút vẽ chú thích trực quan cho giáo viên và đồng bộ Google Drive.</tspan>
    </text>

    <g transform="translate(36, 266)">
      <rect x="0" y="0" width="254" height="175" rx="14" fill="#ffffff" stroke="#E2E8F0" stroke-width="2"/>
      <rect x="16" y="16" width="38" height="38" rx="10" fill="${colorTheme}18"/>
      <text x="35" y="41" font-family="sans-serif" font-size="18" text-anchor="middle">🎧</text>
      <text x="64" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="14" fill="#1E293B">Audio Listening</text>
      <text x="16" y="78" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#475569" font-weight="500">
        <tspan x="16" dy="0">• Track 0${pageNum}: Vocabulary &amp; Speaking</tspan>
        <tspan x="16" dy="20">• Phím tắt: L (Laser), P (Bút dạ)</tspan>
        <tspan x="16" dy="20">• H (Kéo tay), F (Toàn màn hình)</tspan>
      </text>

      <rect x="274" y="0" width="254" height="175" rx="14" fill="#ffffff" stroke="#E2E8F0" stroke-width="2"/>
      <rect x="290" y="16" width="38" height="38" rx="10" fill="#1CB0F618"/>
      <text x="309" y="41" font-family="sans-serif" font-size="18" text-anchor="middle">✨</text>
      <text x="338" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="14" fill="#1E293B">Teacher Studio</text>
      <text x="290" y="78" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#475569" font-weight="500">
        <tspan x="290" dy="0">• Đèn rọi Spotlight thu hút chú ý</tspan>
        <tspan x="290" dy="20">• Bút dạ quang &amp; tẩy xóa nét vẽ</tspan>
        <tspan x="290" dy="20">• Bắn pháo hoa khen thưởng học sinh</tspan>
      </text>
    </g>

    <g transform="translate(36, 465)">
      <rect x="0" y="0" width="528" height="270" rx="14" fill="#ffffff" stroke="#E2E8F0" stroke-width="2"/>
      <text x="20" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="14" fill="#0F172A">Reading &amp; Grammar Comprehension</text>
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

    <rect x="0" y="785" width="600" height="55" fill="#F8FAFC" />
    <line x1="0" y1="785" x2="600" y2="785" stroke="#E2E8F0" stroke-width="1" />
    <text x="300" y="817" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="12" fill="#94A3B8" text-anchor="middle">— Trang ${pageNum} / 6 —</text>
  </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
