import { User } from 'firebase/auth';
import {
  CloudSyncStatus,
  getCloudSyncStatus,
  getFirebaseUser,
  hasPasswordProviderLinked
} from '../../services/firebaseService';
import { refreshLucideIcons } from '../../utils/icons';

function toggleStatusDots(connected: boolean): void {
  const headerDot = document.getElementById('header-cloud-dot');
  const sidebarDot = document.getElementById('sidebar-cloud-dot');
  const mobDot = document.getElementById('mob-cloud-dot');

  headerDot?.classList.toggle('bg-emerald-500', connected);
  headerDot?.classList.toggle('bg-slate-300', !connected);
  sidebarDot?.classList.toggle('bg-emerald-500', connected);
  sidebarDot?.classList.toggle('bg-slate-300', !connected);
  mobDot?.classList.toggle('bg-emerald-500', connected);
  mobDot?.classList.toggle('bg-amber-400', !connected);
}

export function refreshCloudSyncUI(
  user: User | null = getFirebaseUser(),
  syncStatus: CloudSyncStatus = getCloudSyncStatus()
): void {
  const nameEl = document.getElementById('cloud-user-name');
  const emailEl = document.getElementById('cloud-user-email');
  const badgeEl = document.getElementById('cloud-status-badge');
  const signOutBtn = document.getElementById('btn-cloud-signout');
  const authPanel = document.getElementById('cloud-auth-panel');
  const verifyBanner = document.getElementById('cloud-verify-banner');
  const linkPasswordCard = document.getElementById('cloud-link-password-card');
  const syncDetailsCard = document.getElementById('cloud-sync-details-card');
  const pushAllBtn = document.getElementById('btn-cloud-push-all') as HTMLButtonElement | null;
  const avatarBox = document.getElementById('cloud-avatar-container');

  const countBadge = document.getElementById('cloud-book-count-badge');
  const progressWrap = document.getElementById('cloud-sync-progress-wrap');
  const progressBar = document.getElementById('cloud-sync-progress-bar');
  const progressLabel = document.getElementById('cloud-sync-progress-label');
  const lastSyncedEl = document.getElementById('cloud-last-synced-text');
  const headerBtnLabel = document.getElementById('header-cloud-btn-label');

  const isSignedIn = Boolean(user && user.uid);
  const isVerified = Boolean(user && user.emailVerified);

  if (isSignedIn && user) {
    if (nameEl) nameEl.innerText = user.displayName || user.email?.split('@')[0] || 'Tài khoản Cloud';
    if (emailEl) emailEl.innerText = user.email || '';
    signOutBtn?.classList.remove('hidden');
    authPanel?.classList.add('hidden');

    if (isVerified) {
      if (badgeEl) {
        badgeEl.innerHTML = `<i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-600"></i> Đã xác thực & đồng bộ theo Email`;
        badgeEl.className = 'text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mt-0.5';
      }
      verifyBanner?.classList.add('hidden');
      syncDetailsCard?.classList.remove('hidden');
      linkPasswordCard?.classList.toggle('hidden', hasPasswordProviderLinked(user));
      if (pushAllBtn) pushAllBtn.disabled = syncStatus.isSyncing;
      if (headerBtnLabel) {
        headerBtnLabel.innerText = (user.displayName || user.email?.split('@')[0] || 'Cloud').split(' ')[0];
      }
      toggleStatusDots(true);
    } else {
      if (badgeEl) {
        badgeEl.innerHTML = `<i data-lucide="clock" class="w-3.5 h-3.5 text-amber-600"></i> Chờ xác minh Email`;
        badgeEl.className = 'text-[11px] font-semibold text-amber-600 flex items-center gap-1 mt-0.5';
      }
      verifyBanner?.classList.remove('hidden');
      syncDetailsCard?.classList.add('hidden');
      linkPasswordCard?.classList.add('hidden');
      if (headerBtnLabel) headerBtnLabel.innerText = 'Chờ xác minh';
      toggleStatusDots(false);
    }

    if (avatarBox) {
      avatarBox.innerHTML = user.photoURL
        ? `<img src="${user.photoURL}" alt="Avatar" class="w-full h-full object-cover" referrerPolicy="no-referrer" />`
        : `<i data-lucide="user-check" class="w-5 h-5 text-emerald-600"></i>`;
    }
  } else {
    if (nameEl) nameEl.innerText = 'Chưa đăng nhập';
    if (emailEl) emailEl.innerText = 'Chọn Google hoặc Email bên dưới';
    if (badgeEl) {
      badgeEl.innerHTML = `<i data-lucide="wifi-off" class="w-3.5 h-3.5"></i> Chỉ lưu trên máy này`;
      badgeEl.className = 'text-[11px] font-semibold text-amber-600 flex items-center gap-1 mt-0.5';
    }
    signOutBtn?.classList.add('hidden');
    authPanel?.classList.remove('hidden');
    verifyBanner?.classList.add('hidden');
    syncDetailsCard?.classList.add('hidden');
    linkPasswordCard?.classList.add('hidden');
    if (avatarBox) avatarBox.innerHTML = `<i data-lucide="user" class="w-5 h-5 text-slate-400"></i>`;
    if (headerBtnLabel) headerBtnLabel.innerText = 'Cloud Sync';
    toggleStatusDots(false);
  }

  if (countBadge) countBadge.innerText = `${syncStatus.cloudBookCount} sách trên Cloud`;
  if (syncStatus.isSyncing) {
    progressWrap?.classList.remove('hidden');
    if (progressBar) progressBar.style.width = `${syncStatus.progressPercent}%`;
    if (progressLabel) progressLabel.innerText = syncStatus.syncingLabel || 'Đang đồng bộ...';
  } else {
    progressWrap?.classList.add('hidden');
  }
  if (lastSyncedEl) {
    lastSyncedEl.innerText = syncStatus.lastSyncedAt ? `Cập nhật gần nhất: ${syncStatus.lastSyncedAt}` : '';
  }

  refreshLucideIcons();
}
