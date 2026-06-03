export const readableAuthError = (error, fallback = 'Could not sign in.') => {
  const code = error?.code || '';
  if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') return 'Email or password does not match an account yet.';
  if (code === 'auth/email-already-in-use') return 'That email already has an account. Switch to Sign In instead.';
  if (code === 'auth/weak-password') return 'Use a password with at least 6 characters.';
  if (code === 'auth/too-many-requests') return 'Too many attempts. Wait a moment, then try again.';
  if (code === 'auth/network-request-failed') return 'Network connection dropped before sign-in finished.';
  if (code === 'auth/operation-not-allowed') return 'This sign-in method is not enabled in Firebase Authentication yet.';
  if (code === 'auth/unauthorized-domain') return 'This domain is not allowed for Firebase sign-in yet.';
  if (code === 'auth/popup-closed-by-user') return 'Google sign-in was closed before it finished.';
  if (code === 'auth/invalid-api-key') return 'This build has an invalid Firebase API key. Check the Firebase config and redeploy.';
  return error?.message || fallback;
};
