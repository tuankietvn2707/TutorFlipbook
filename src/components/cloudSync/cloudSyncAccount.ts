import { User } from 'firebase/auth';
import {
  CloudSyncStatus,
  getCloudSyncStatus,
  getFirebaseUser
} from '../../services/firebaseService';
import { refreshLucideIcons } from '../../utils/icons';

export function refreshCloudSyncUI(
  user: User | null = getFirebaseUser(),
  syncStatus: CloudSyncStatus = getCloudSyncStatus()
): void {
  const nameEl = document.getElementById('cloud-user-name');
  const emailEl = document.getElementById('cloud-user-email');
  const badgeEl = document.getElementById('cloud-status-badge');
  const signInBtn = document.getElementById('btn-cloud-signin');
  const signInText = document.getElementById('btn-cloud-signin-text');
  const signOutBtn = document.getElementById('btn-cloud-signout');
  const pushAllBtn = document.getElementById('btn-cloud-push-all') as HTMLButtonElement | null;
  const avatarBox = document.getElementById('cloud-avatar-container');

  const countBadge = document.getElementById('cloud-book-count-badge');
  const progressWrap = document.getElementById('cloud-sync-progress-wrap');
  const progressBar = document.getElementById('cloud-sync-progress-bar');
  const progressLabel = document.getElementById('cloud-sync-progress-label');
  const lastSyncedEl = document.getElementById('cloud-last-synced-text');

  const headerBtnLabel = document.getElementById('header-cloud-btn-label');
  const headerDot = document.getElementById('header-cloud-dot');
  const sidebarDot = document.getElementById('sidebar-cloud-dot');
  const mobDot = document.getElementById('mob-cloud-dot');

  const isSignedIn = Boolean(user && user.uid);

  if (isSignedIn && user) {
    if (nameEl) nameEl.innerText = user.displayName || 'Tài khoản Google';
    if (emailEl) emailEl.innerText = user.email || '';
    if (badgeEl) {
      badgeEl.innerHTML = `<i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-600"></i> Đã kết nối Firebase Cloud`;
      badgeEl.className = 'text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mt-0.5';
    }
    if (signInText) signInText.innerText = 'Đổi tài khoản';
    signInBtn?.classList.remove('btn-blue');
    signInBtn?.classList.add('btn-white');
    signOutBtn?.classList.remove('hidden');
    if (pushAllBtn) pushAllBtn.disabled = syncStatus.isSyncing;

    if (avatarBox) {
      avatarBox.innerHTML = user.photoURL
        ? `<img src="${user.photoURL}" alt="Avatar" class="w-full h-full object-cover" referrerPolicy="no-referrer" />`
        : `<i data-lucide="user-check" class="w-5 h-5 text-emerald-600"></i>`;
    }

    if (headerBtnLabel) {
      headerBtnLabel.innerText = (user.displayName || user.email || 'Cloud').split(' ')[0];
    }
    headerDot?.classList.remove('bg-slate-300');
    headerDot?.classList.add('bg-emerald-500');
    sidebarDot?.classList.remove('bg-slate-300');
    sidebarDot?.classList.add('bg-emerald-500');
    mobDot?.classList.remove('bg-amber-400');
    mobDot?.classList.add('bg-emerald-500');
  } else {
    if (nameEl) nameEl.innerText = 'Chưa đăng nhập';
    if (emailEl) emailEl.innerText = 'Đăng nhập Google để tự động đồng bộ mọi thiết bị';
    if (badgeEl) {
      badgeEl.innerHTML = `<i data-lucide="wifi-off" class="w-3.5 h-3.5"></i> Chỉ lưu trên máy này`;
      badgeEl.className = 'text-[11px] font-semibold text-amber-600 flex items-center gap-1 mt-0.5';
    }
    if (signInText) signInText.innerText = 'Đăng nhập bằng Google';
    signInBtn?.classList.add('btn-blue');
    signInBtn?.classList.remove('btn-white');
    signOutBtn?.classList.add('hidden');
    if (pushAllBtn) pushAllBtn.disabled = true;
    if (avatarBox) {
      avatarBox.innerHTML = `<i data-lucide="user" class="w-5 h-5 text-slate-400"></i>`;
    }

    if (headerBtnLabel) headerBtnLabel.innerText = 'Cloud Sync';
    headerDot?.classList.add('bg-slate-300');
    headerDot?.classList.remove('bg-emerald-500');
    sidebarDot?.classList.add('bg-slate-300');
    sidebarDot?.classList.remove('bg-emerald-500');
    mobDot?.classList.add('bg-amber-400');
    mobDot?.classList.remove('bg-emerald-500');
  }

  if (countBadge) {
    countBadge.innerText = `${syncStatus.cloudBookCount} sách trên Cloud`;
  }

  if (syncStatus.isSyncing) {
    progressWrap?.classList.remove('hidden');
    if (progressBar) progressBar.style.width = `${syncStatus.progressPercent}%`;
    if (progressLabel) progressLabel.innerText = syncStatus.syncingLabel || 'Đang đồng bộ...';
  } else {
    progressWrap?.classList.add('hidden');
  }

  if (lastSyncedEl) {
    lastSyncedEl.innerText = syncStatus.lastSyncedAt
      ? `Cập nhật gần nhất: ${syncStatus.lastSyncedAt}`
      : '';
  }

  refreshLucideIcons();
}
