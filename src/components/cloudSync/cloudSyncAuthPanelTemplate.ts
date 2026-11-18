export function renderCloudAuthPanelHtml(): string {
  return `
    <!-- Signed-out Auth Options: Google + Email/Password -->
    <div id="cloud-auth-panel" class="space-y-3 shrink-0">
      <button
        type="button"
        id="btn-cloud-signin"
        class="w-full btn-3d btn-blue text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
      >
        <i data-lucide="log-in" class="w-4 h-4"></i>
        <span>Đăng nhập nhanh bằng Google</span>
      </button>

      <div class="relative flex items-center py-0.5">
        <div class="flex-grow border-t border-slate-200"></div>
        <span class="shrink mx-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Hoặc dùng Email & Mật khẩu
        </span>
        <div class="flex-grow border-t border-slate-200"></div>
      </div>

      <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
        <!-- Auth Mode Tabs -->
        <div class="grid grid-cols-3 gap-1 p-1 bg-slate-200/70 rounded-xl text-[11px] font-bold">
          <button type="button" id="tab-email-login" class="py-1.5 rounded-lg bg-white text-slate-900 shadow-sm cursor-pointer">
            Đăng nhập
          </button>
          <button type="button" id="tab-email-register" class="py-1.5 rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer">
            Đăng ký
          </button>
          <button type="button" id="tab-email-reset" class="py-1.5 rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer">
            Quên MK
          </button>
        </div>

        <div id="cloud-email-name-wrap" class="hidden">
          <input
            type="text"
            id="input-cloud-name"
            placeholder="Tên hiển thị (ví dụ: Cô Lan)"
            class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500"
          />
        </div>

        <input
          type="email"
          id="input-cloud-email"
          placeholder="Nhập email (ví dụ: tenban@gmail.com)"
          autocomplete="email"
          class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500"
        />

        <div id="cloud-email-password-wrap">
          <input
            type="password"
            id="input-cloud-password"
            placeholder="Mật khẩu (tối thiểu 6 ký tự)"
            autocomplete="current-password"
            class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500"
          />
        </div>

        <button
          type="button"
          id="btn-cloud-email-submit"
          class="w-full btn-3d btn-green text-white text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
        >
          <i data-lucide="mail" class="w-4 h-4"></i>
          <span id="btn-cloud-email-submit-text">Đăng nhập bằng Email</span>
        </button>

        <p class="text-[10px] font-medium text-slate-500 leading-relaxed">
          Nếu bạn dùng Email trùng với tài khoản Google đã đăng nhập trước đó, hệ thống sẽ tự động gộp chung một thư viện sách & Audio.
        </p>
      </div>
    </div>
  `;
}
