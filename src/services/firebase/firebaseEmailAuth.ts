import {
  EmailAuthProvider,
  User,
  createUserWithEmailAndPassword,
  linkWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth } from './firebaseClient';

export function hasPasswordProviderLinked(user: User | null): boolean {
  if (!user) return false;
  return user.providerData.some((p) => p.providerId === 'password');
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<User> {
  const normalized = email.trim().toLowerCase();
  const result = await signInWithEmailAndPassword(auth, normalized, password);
  if (result.user && !result.user.emailVerified) {
    try {
      await sendEmailVerification(result.user);
    } catch {
      // rate-limited or already sent
    }
  }
  return result.user;
}

export async function registerWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<User> {
  const normalized = email.trim().toLowerCase();
  const result = await createUserWithEmailAndPassword(auth, normalized, password);
  if (displayName && displayName.trim()) {
    await updateProfile(result.user, { displayName: displayName.trim().slice(0, 120) });
  }
  await sendEmailVerification(result.user);
  return result.user;
}

export async function sendVerificationToCurrentUser(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Chưa đăng nhập tài khoản.');
  await sendEmailVerification(user);
}

export async function refreshCurrentUserVerification(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;
  await user.reload();
  await user.getIdToken(true);
  return Boolean(auth.currentUser?.emailVerified);
}

export async function sendResetPasswordEmail(email: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  await sendPasswordResetEmail(auth, normalized);
}

export async function linkPasswordToCurrentAccount(password: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error('Vui lòng đăng nhập tài khoản trước.');
  }
  const credential = EmailAuthProvider.credential(user.email, password);
  await linkWithCredential(user, credential);
}

export function formatFirebaseAuthError(err: any): string {
  const code = err?.code || '';
  if (code === 'auth/email-already-in-use') {
    return 'Email này đã có tài khoản (có thể đã đăng nhập bằng Google). Hãy dùng "Đăng nhập Google" rồi đặt mật khẩu liên kết, hoặc chọn "Quên mật khẩu".';
  }
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return 'Email hoặc mật khẩu chưa đúng. Nếu trước đây bạn dùng Google, hãy chọn "Quên mật khẩu" để đặt mật khẩu cho email này.';
  }
  if (code === 'auth/weak-password') {
    return 'Mật khẩu cần tối thiểu 6 ký tự.';
  }
  if (code === 'auth/invalid-email') {
    return 'Địa chỉ email không hợp lệ.';
  }
  if (code === 'auth/too-many-requests') {
    return 'Bạn thao tác quá nhanh, vui lòng đợi một lát rồi thử lại.';
  }
  if (code === 'auth/requires-recent-login') {
    return 'Để bảo mật, vui lòng đăng xuất rồi đăng nhập lại Google trước khi đặt mật khẩu liên kết.';
  }
  if (code === 'auth/provider-already-linked') {
    return 'Email này đã được thiết lập mật khẩu đăng nhập.';
  }
  return err?.message || 'Đã có lỗi xác thực xảy ra.';
}
