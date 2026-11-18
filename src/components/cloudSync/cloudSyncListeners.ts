import {
  activateVerifiedUserSync,
  formatFirebaseAuthError,
  getFirebaseUser,
  linkPasswordToCurrentAccount,
  onFirebaseUserChange,
  refreshCurrentUserVerification,
  registerWithEmail,
  sendResetPasswordEmail,
  sendVerificationToCurrentUser,
  signInWithEmail,
  signInWithFirebaseGoogle,
  signOutFirebase,
  subscribeCloudSyncStatus,
  syncAllLocalBooksToCloud
} from '../../services/firebaseService';
import { showToast } from '../../utils/toast';
import { refreshCloudSyncUI } from './cloudSyncAccount';

type EmailAuthMode = 'login' | 'register' | 'reset';
let currentEmailMode: EmailAuthMode = 'login';

function setEmailAuthMode(mode: EmailAuthMode): void {
  currentEmailMode = mode;
  const tabs: Array<{ id: string; mode: EmailAuthMode }> = [
    { id: 'tab-email-login', mode: 'login' },
    { id: 'tab-email-register', mode: 'register' },
    { id: 'tab-email-reset', mode: 'reset' }
  ];
  tabs.forEach((t) => {
    const el = document.getElementById(t.id);
    if (!el) return;
    if (t.mode === mode) {
      el.className = 'py-1.5 rounded-lg bg-white text-slate-900 shadow-sm cursor-pointer';
    } else {
      el.className = 'py-1.5 rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer';
    }
  });

  document.getElementById('cloud-email-name-wrap')?.classList.toggle('hidden', mode !== 'register');
  document.getElementById('cloud-email-password-wrap')?.classList.toggle('hidden', mode === 'reset');

  const btnText = document.getElementById('btn-cloud-email-submit-text');
  if (btnText) {
    btnText.innerText =
      mode === 'login'
        ? 'Đăng nhập bằng Email'
        : mode === 'register'
        ? 'Tạo tài khoản Email'
        : 'Gửi liên kết đặt mật khẩu';
  }
}

export function openCloudSyncModal(): void {
  document.getElementById('modal-cloud-sync')?.classList.remove('hidden');
  setEmailAuthMode(currentEmailMode);
  refreshCloudSyncUI();
}

export function closeCloudSyncModal(): void {
  document.getElementById('modal-cloud-sync')?.classList.add('hidden');
}

export function setupCloudSyncListeners(): void {
  onFirebaseUserChange((user) => refreshCloudSyncUI(user));
  subscribeCloudSyncStatus((syncStatus) => refreshCloudSyncUI(getFirebaseUser(), syncStatus));

  document.getElementById('btn-close-cloud-modal')?.addEventListener('click', closeCloudSyncModal);
  document.getElementById('btn-close-cloud-footer')?.addEventListener('click', closeCloudSyncModal);

  document.getElementById('tab-email-login')?.addEventListener('click', () => setEmailAuthMode('login'));
  document.getElementById('tab-email-register')?.addEventListener('click', () => setEmailAuthMode('register'));
  document.getElementById('tab-email-reset')?.addEventListener('click', () => setEmailAuthMode('reset'));

  document.getElementById('btn-cloud-signin')?.addEventListener('click', async () => {
    try {
      const user = await signInWithFirebaseGoogle();
      if (user) showToast(`✅ Đã đăng nhập Google: ${user.email || user.displayName}`);
      refreshCloudSyncUI(user);
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        showToast('ℹ️ Bạn đã đóng cửa sổ đăng nhập Google.');
      } else {
        showToast(`⚠️ Đăng nhập Google thất bại: ${formatFirebaseAuthError(err)}`);
      }
    }
  });

  document.getElementById('btn-cloud-email-submit')?.addEventListener('click', async () => {
    const email = (document.getElementById('input-cloud-email') as HTMLInputElement)?.value.trim() || '';
    const password = (document.getElementById('input-cloud-password') as HTMLInputElement)?.value || '';
    const name = (document.getElementById('input-cloud-name') as HTMLInputElement)?.value.trim() || '';

    if (!email || !email.includes('@')) {
      showToast('⚠️ Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    try {
      if (currentEmailMode === 'reset') {
        await sendResetPasswordEmail(email);
        showToast(`📩 Đã gửi liên kết đặt mật khẩu tới ${email}. Hãy kiểm tra hộp thư!`);
        setEmailAuthMode('login');
        return;
      }
      if (password.length < 6) {
        showToast('⚠️ Mật khẩu phải có ít nhất 6 ký tự.');
        return;
      }
      if (currentEmailMode === 'register') {
        const user = await registerWithEmail(email, password, name);
        showToast(`📩 Đã tạo tài khoản & gửi email xác minh tới ${user.email}!`);
        refreshCloudSyncUI(user);
      } else {
        const user = await signInWithEmail(email, password);
        showToast(user.emailVerified ? `✅ Đã đăng nhập: ${user.email}` : '📩 Vui lòng xác minh Email để bật đồng bộ!');
        refreshCloudSyncUI(user);
      }
    } catch (err: any) {
      showToast(`⚠️ ${formatFirebaseAuthError(err)}`);
    }
  });

  document.getElementById('btn-cloud-verify-refresh')?.addEventListener('click', async () => {
    try {
      const verified = await refreshCurrentUserVerification();
      if (verified) {
        await activateVerifiedUserSync();
        refreshCloudSyncUI();
        showToast('✅ Email đã được xác minh! Đang đồng bộ thư viện...');
      } else {
        showToast('⏳ Email chưa được xác minh. Hãy bấm vào liên kết trong hộp thư rồi thử lại.');
      }
    } catch (err: any) {
      showToast(`⚠️ ${formatFirebaseAuthError(err)}`);
    }
  });

  document.getElementById('btn-cloud-verify-resend')?.addEventListener('click', async () => {
    try {
      await sendVerificationToCurrentUser();
      showToast('📩 Đã gửi lại email xác minh! Vui lòng kiểm tra hộp thư hoặc Spam.');
    } catch (err: any) {
      showToast(`⚠️ ${formatFirebaseAuthError(err)}`);
    }
  });

  document.getElementById('btn-cloud-link-password')?.addEventListener('click', async () => {
    const pwInput = document.getElementById('input-cloud-link-password') as HTMLInputElement;
    const password = pwInput?.value || '';
    if (password.length < 6) {
      showToast('⚠️ Mật khẩu liên kết phải có ít nhất 6 ký tự.');
      return;
    }
    try {
      await linkPasswordToCurrentAccount(password);
      if (pwInput) pwInput.value = '';
      refreshCloudSyncUI();
      showToast('🔑 Đã lưu mật khẩu! Từ giờ bạn có thể đăng nhập bằng cả Google lẫn Email này.');
    } catch (err: any) {
      showToast(`⚠️ ${formatFirebaseAuthError(err)}`);
    }
  });

  document.getElementById('btn-cloud-signout')?.addEventListener('click', async () => {
    await signOutFirebase();
    refreshCloudSyncUI(null);
    showToast('👋 Đã đăng xuất khỏi tài khoản Firebase Cloud.');
  });

  document.getElementById('btn-cloud-push-all')?.addEventListener('click', async () => {
    const user = getFirebaseUser();
    if (!user || !user.emailVerified) {
      showToast('⚠️ Vui lòng đăng nhập và xác minh Email trước khi đồng bộ.');
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
