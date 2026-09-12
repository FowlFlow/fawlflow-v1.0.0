import type { Dict } from "../types";

export const authEn: Dict = {
  getStarted: "Get Started Now",
  userName: "User Name",
  usernamePlaceholder: "john Deo",
  passwordPlaceholder: "Enter your password",
  forgotPassword: "Forgot Password",
  signingIn: "Signing in…",
  signIn: "Sign In",
  resetPassword: "Reset Password",
  resetPasswordDesc: "Enter your username, recovery code, and a new password.",
  recoveryCode: "Recovery Code",
  newPassword: "New Password",
  resetting: "Resetting…",
  backToSignIn: "Back to Sign In",
  passwordUpdated: "Password updated",
  saveRecoveryCode:
    "Save your new recovery code somewhere safe — it won't be shown again.",
  errorInvalidCredentials: "Invalid username or password.",
  errorFillAllFields: "Please fill in all fields.",
  errorPasswordTooShort: "New password must be at least 8 characters.",
  errorInvalidRecovery: "Username or recovery code is incorrect.",
};

// Login, forgot-password, and reset-password screens stay in English in
// BOTH locales — account/credential screens are conventionally English in
// Sri Lankan apps even when the rest of the UI is Sinhala (per app owner
// request: "for login page ... username password in english ... for like
// these places add english language").
export const authSi: Dict = { ...authEn };
