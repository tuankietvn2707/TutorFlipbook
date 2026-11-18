import {
  getFirebaseUser,
  onFirebaseUserChange,
  signInWithFirebaseGoogle,
  signOutFirebase,
  subscribeCloudSyncStatus,
  syncAllLocalBooksToCloud
} from '../../services/firebaseService';
import { showToast } from '../../utils/toast';
import { refreshCloudSyncUI } from './cloudSyncAccount';

export function openCloudSyncModal(): void {
  document.getElementById('modal-cloud-sync')?.classList.remove('hidden');
  refreshCloudSyncUI();
}

export function closeCloudSyncModal(): void {
  document.getElementById('modal-cloud-sync')?.classList.add('hidden');
}

export function setupCloudSyncListeners(): void {
  onFirebaseUserChange((user) => {
    refreshCloudSyncUI(user);
  });

  subscribeCloudSyncStatus((syncStatus) => {
    refreshCloudSyncUI(getFirebaseUser(), syncStatus);
  });

  document.getElementById('btn-close-cloud-modal')?.addEventListener('click', closeCloudSyncModal);
  document.getElementById('btn-close-cloud-footer')?.addEventListener('click', closeCloudSyncModal);

  document.getElementById('btn-cloud-signin')?.addEventListener('click', async () => {
    try {
      const user = await signInWithFirebaseGoogle();
      if (user) {
        showToast(`✅ Đã đăng nhập: ${user.email || user.displayName}`);
      }
      refreshCloudSyncUI(user);
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user') {
        showToast('ℹ️ Bạn đã đóng cửa sổ đăng nhập Google.');
      } else {
        showToast(`⚠️ Đăng nhập thất bại: ${err?.message || 'Vui lòng thử lại'}`);
      }
    }
  });

  document.getElementById('btn-cloud-signout')?.addEventListener('click', async () => {
    await signOutFirebase();
    refreshCloudSyncUI(null);
    showToast('👋 Đã đăng xuất khỏi tài khoản Firebase Cloud.');
  });

  document.getElementById('btn-cloud-push-all')?.addEventListener('click', async () => {
    const user = getFirebaseUser();
    if (!user) {
      showToast('⚠️ Vui lòng đăng nhập Google trước khi đồng bộ.');
      return;
    }

    showToast('☁️ Đang đồng bộ toàn bộ sách & file Audio lên Firebase...');
    try {
      const count = await syncAllLocalBooksToCloud();
      showToast(`✅ Đã đồng bộ xong ${count} cuốn sách lên Firebase Cloud!`);
    } catch (err: any) {
      showToast(`⚠️ Đồng bộ thất bại: ${err?.message || 'Lỗi kết nối Cloud'}`);
    }
  });
}
