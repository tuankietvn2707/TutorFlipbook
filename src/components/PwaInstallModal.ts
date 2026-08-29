import { renderBrandLogoSvg } from '../utils/logo';

let deferredPrompt: any = null;

export function renderPwaInstallModalHtml(): string {
  return `
  <!-- MODAL: PWA INSTALL / GHIM VÀO MÀN HÌNH CHÍNH (INSTALL APP MODAL) -->
  <div id="modal-install-pwa" class="hidden fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
    <div class="card-3d w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 bg-white my-auto">
      
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-3 border-b-2 border-slate-100">
        <div class="flex items-center gap-3">
          ${renderBrandLogoSvg(44)}
          <div>
            <h3 class="font-black text-base sm:text-lg text-slate-800 leading-tight">Cài Đặt / Ghim BIBLIO 3D</h3>
            <p class="text-xs font-bold text-slate-500">Trải nghiệm đọc sách & nghe audio như ứng dụng native</p>
          </div>
        </div>
        <button id="btn-close-pwa-modal" class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- Android / Chrome / Desktop One-Tap Install Action -->
      <div id="pwa-native-install-section" class="space-y-3">
        <div class="p-3.5 bg-emerald-50 border-2 border-emerald-200 rounded-2xl flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
            <i data-lucide="sparkles" class="w-5 h-5"></i>
          </div>
          <div class="text-xs text-emerald-950 leading-relaxed font-bold">
            <p class="font-black text-sm text-emerald-900 mb-0.5">Cài Đặt 1-Chạm Siêu Nhanh</p>
            Ứng dụng sẽ được thêm trực tiếp vào màn hình chính điện thoại, mở toàn màn hình tức thì và hoạt động mượt mà.
          </div>
        </div>

        <button type="button" id="btn-trigger-pwa-install" class="btn-3d btn-green w-full py-3 px-4 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 shadow-lg cursor-pointer">
          <i data-lucide="download" class="w-5 h-5"></i>
          <span>📲 CÀI ĐẶT / GHIM VÀO MÀN HÌNH CHÍNH</span>
        </button>
      </div>

      <!-- iOS (iPhone / iPad Safari) Step Guide -->
      <div id="pwa-ios-guide-section" class="space-y-3">
        <div class="p-3 bg-amber-50 border-2 border-amber-200 rounded-2xl">
          <div class="flex items-center gap-2 text-amber-900 font-black text-xs mb-1">
            <i data-lucide="apple" class="w-4 h-4 text-amber-700"></i>
            <span>Hướng Dẫn Cho iPhone / iPad (Safari)</span>
          </div>
          <p class="text-[11px] text-amber-800 font-bold">
            Trên trình duyệt Safari, bạn chỉ cần thực hiện 3 thao tác đơn giản:
          </p>
        </div>

        <div class="space-y-2 text-xs font-bold text-slate-700">
          <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
            <div class="w-7 h-7 rounded-lg bg-blue-500 text-white font-black flex items-center justify-center text-xs flex-shrink-0">
              1
            </div>
            <div class="flex-1">
              Nhấn vào biểu tượng <span class="inline-flex items-center px-1.5 py-0.5 rounded bg-white border border-slate-300 text-blue-600 font-black">Chia Sẻ (Share)</span> ở thanh công cụ dưới Safari.
            </div>
          </div>

          <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
            <div class="w-7 h-7 rounded-lg bg-duoGreen text-white font-black flex items-center justify-center text-xs flex-shrink-0">
              2
            </div>
            <div class="flex-1">
              Cuộn xuống chọn <span class="inline-flex items-center px-1.5 py-0.5 rounded bg-white border border-slate-300 text-slate-900 font-black">Thêm vào MH chính (Add to Home Screen)</span>.
            </div>
          </div>

          <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
            <div class="w-7 h-7 rounded-lg bg-duoPurple text-white font-black flex items-center justify-center text-xs flex-shrink-0">
              3
            </div>
            <div class="flex-1">
              Nhấn <span class="font-black text-blue-600">"Thêm" (Add)</span> ở góc trên bên phải màn hình.
            </div>
          </div>
        </div>
      </div>

      <!-- Feature Badges Grid -->
      <div class="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
        <div class="p-2.5 bg-slate-50 rounded-xl flex items-center gap-2 text-[11px] font-bold text-slate-700">
          <i data-lucide="zap" class="w-4 h-4 text-amber-500 flex-shrink-0"></i>
          <span>Mở tức thì, không giật lag</span>
        </div>
        <div class="p-2.5 bg-slate-50 rounded-xl flex items-center gap-2 text-[11px] font-bold text-slate-700">
          <i data-lucide="maximize" class="w-4 h-4 text-duoBlue flex-shrink-0"></i>
          <span>Toàn màn hình không che URL</span>
        </div>
      </div>

      <!-- Modal Footer Action -->
      <div class="pt-2">
        <button type="button" id="btn-close-pwa-confirm" class="btn-3d btn-white w-full py-2.5 rounded-xl font-bold text-xs text-slate-700">
          Đã hiểu & Đóng lại
        </button>
      </div>

    </div>
  </div>

  <!-- MOBILE PROMO PIN BANNER -->
  <div id="mobile-pwa-banner" class="hidden md:hidden fixed bottom-16 left-3 right-3 z-30 bg-gradient-to-r from-amber-500 to-amber-600 text-white p-3 rounded-2xl shadow-2xl border-2 border-amber-300 flex items-center justify-between gap-2">
    <div class="flex items-center gap-2.5 min-w-0" id="btn-mobile-banner-open">
      <div class="w-8 h-8 rounded-xl bg-white text-amber-600 flex items-center justify-center flex-shrink-0 shadow-sm font-black text-xs">
        <i data-lucide="smartphone" class="w-5 h-5"></i>
      </div>
      <div class="min-w-0">
        <p class="font-black text-xs leading-tight truncate">Ghim App Ra Màn Hình Chính</p>
        <p class="text-[10px] font-bold text-amber-100 leading-tight">Đọc toàn màn hình mượt mà không vướng URL</p>
      </div>
    </div>
    <div class="flex items-center gap-1.5 flex-shrink-0">
      <button id="btn-mobile-banner-action" class="btn-3d bg-white text-amber-900 px-2.5 py-1 rounded-xl font-black text-[11px] border-b-2 border-amber-200">
        Cài Ngay
      </button>
      <button id="btn-mobile-banner-dismiss" class="p-1 text-amber-100 hover:text-white rounded-lg">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    </div>
  </div>
  `;
}

export function openPwaInstallModal(): void {
  const modal = document.getElementById('modal-install-pwa');
  modal?.classList.remove('hidden');
}

export function closePwaInstallModal(): void {
  const modal = document.getElementById('modal-install-pwa');
  modal?.classList.add('hidden');
}

export function setupPwaListeners(): void {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const banner = document.getElementById('mobile-pwa-banner');
    if (banner && window.innerWidth < 768) {
      banner.classList.remove('hidden');
    }
  });

  document.getElementById('btn-trigger-pwa-install')?.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      closePwaInstallModal();
    } else {
      alert('Để ghim vào màn hình, bạn có thể chọn "Thêm vào MH chính" trong menu cài đặt trình duyệt!');
    }
  });

  document.getElementById('btn-close-pwa-modal')?.addEventListener('click', closePwaInstallModal);
  document.getElementById('btn-close-pwa-confirm')?.addEventListener('click', closePwaInstallModal);
  document.getElementById('btn-mobile-banner-open')?.addEventListener('click', openPwaInstallModal);
  document.getElementById('btn-mobile-banner-action')?.addEventListener('click', openPwaInstallModal);
  document.getElementById('btn-mobile-banner-dismiss')?.addEventListener('click', () => {
    document.getElementById('mobile-pwa-banner')?.classList.add('hidden');
  });
}
