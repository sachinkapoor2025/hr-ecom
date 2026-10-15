"use client";

import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from "amazon-cognito-identity-js";
import { cognitoHasGroup, EMAIL_ADDRESS_MESSAGE, isValidEmailAddress } from "@hr-ecom/shared";

const poolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
const devAuth = process.env.NEXT_PUBLIC_DEV_AUTH === "true";

const userPool =
  poolId && clientId
    ? new CognitoUserPool({ UserPoolId: poolId, ClientId: clientId })
    : null;

export interface AuthUser {
  email: string;
  name?: string;
  token: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  /** Cognito `email` group — /ses-email module */
  isEmailMarketer: boolean;
}

export interface RegisterResult {
  userConfirmed: boolean;
  deliveryDestination?: string;
  deliveryMedium?: string;
}

const STORAGE_KEY = "hr_ecom_auth";

export function loadStoredAuth(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    return {
      ...parsed,
      isEmailMarketer: Boolean(parsed.isEmailMarketer ?? parsed.isSuperAdmin),
    };
  } catch {
    return null;
  }
}

export function storeAuth(user: AuthUser | null) {
  if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  else localStorage.removeItem(STORAGE_KEY);
}

function rejectInvalidEmail(email: string): Promise<never> | null {
  if (isValidEmailAddress(email)) return null;
  return Promise.reject(new Error(EMAIL_ADDRESS_MESSAGE));
}

/** Cognito usernames for this pool are email addresses. Keep login and reset on the same value. */
function cognitoUsername(email: string): string {
  return email.trim().toLowerCase();
}

export function login(email: string, password: string): Promise<AuthUser> {
  const invalid = rejectInvalidEmail(email);
  if (invalid) return invalid;

  if (!userPool && devAuth) {
    const isSuperAdmin = email.toLowerCase().includes("superadmin");
    const isAdmin = isSuperAdmin || email.toLowerCase().includes("admin");
    const isEmailMarketer =
      isSuperAdmin || email.toLowerCase().includes("email") || email.toLowerCase().includes("ses");
    const role = isSuperAdmin
      ? "super-admin"
      : isEmailMarketer && !isAdmin
        ? "email"
        : isAdmin
          ? "admin"
          : "customer";
    const user: AuthUser = {
      email,
      token: `dev:${email}:${role}`,
      isAdmin,
      isSuperAdmin,
      isEmailMarketer,
    };
    storeAuth(user);
    return Promise.resolve(user);
  }

  if (!userPool) {
    return Promise.reject(new Error("Auth not configured. Set Cognito env vars or enable dev auth."));
  }

  return new Promise((resolve, reject) => {
    const username = cognitoUsername(email);
    const user = new CognitoUser({ Username: username, Pool: userPool });
    const details = new AuthenticationDetails({ Username: username, Password: password });

    user.authenticateUser(details, {
      onSuccess: (session) => {
        const token = session.getIdToken().getJwtToken();
        const payload = session.getIdToken().decodePayload();
        const groups = payload["cognito:groups"];
        const isSuperAdmin = cognitoHasGroup(groups, "super-admin");
        const authUser: AuthUser = {
          email: username,
          name: payload.name as string | undefined,
          token,
          isSuperAdmin,
          isAdmin: cognitoHasGroup(groups, "admin") || isSuperAdmin,
          isEmailMarketer: cognitoHasGroup(groups, "email") || isSuperAdmin,
        };
        storeAuth(authUser);
        resolve(authUser);
      },
      onFailure: (err) => reject(err),
    });
  });
}

export function register(
  email: string,
  password: string,
  name?: string
): Promise<RegisterResult> {
  const invalid = rejectInvalidEmail(email);
  if (invalid) return invalid;

  if (!userPool && devAuth) {
    return Promise.resolve({ userConfirmed: true });
  }

  if (!userPool) {
    return Promise.reject(new Error("Auth not configured."));
  }

  const username = cognitoUsername(email);
  const attrs: CognitoUserAttribute[] = [
    new CognitoUserAttribute({ Name: "email", Value: username }),
  ];
  if (name) attrs.push(new CognitoUserAttribute({ Name: "name", Value: name }));

  return new Promise((resolve, reject) => {
    userPool.signUp(username, password, attrs, [], (err, result) => {
      if (err) reject(err);
      else {
        const delivery = result?.codeDeliveryDetails;
        resolve({
          userConfirmed: result?.userConfirmed ?? false,
          deliveryDestination: delivery?.Destination,
          deliveryMedium: delivery?.DeliveryMedium,
        });
      }
    });
  });
}

export function logout() {
  if (userPool) {
    const user = userPool.getCurrentUser();
    user?.signOut();
  }
  storeAuth(null);
}

export function isCognitoConfigured(): boolean {
  return !!userPool;
}

export function isDevAuthEnabled(): boolean {
  return devAuth && !userPool;
}

export function isUnconfirmedError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: string; message?: string };
  return (
    e.code === "UserNotConfirmedException" ||
    (typeof e.message === "string" && e.message.toLowerCase().includes("not confirmed"))
  );
}

function authErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  if (err && typeof err === "object" && "message" in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return "";
}

/**
 * Forgot-password on an account that never confirmed its email.
 * Cognito: InvalidParameterException "no registered/verified email".
 */
export function isEmailUnverifiedError(err: unknown): boolean {
  if (getAuthErrorCode(err) !== "InvalidParameterException") return false;
  return /verified email|not verified|no registered\/verified/i.test(authErrorMessage(err));
}

/** Sign-in for an unconfirmed user is often reported as a bad password. */
export function isIncorrectPasswordError(err: unknown): boolean {
  if (getAuthErrorCode(err) !== "NotAuthorizedException") return false;
  return /incorrect username or password/i.test(authErrorMessage(err));
}

export function isAlreadyConfirmedError(err: unknown): boolean {
  return /already confirmed/i.test(authErrorMessage(err));
}

function getAuthErrorCode(err: unknown): string | undefined {
  if (!err || typeof err !== "object") return undefined;
  return (err as { code?: string; name?: string }).code ?? (err as { name?: string }).name;
}

export function formatAuthError(err: unknown): string {
  const code = getAuthErrorCode(err);
  if (isUnconfirmedError(err)) {
    return "Your email is not verified yet. Enter the code we sent you below.";
  }
  if (code === "CodeDeliveryFailureException") {
    return "Cognito could not send the verification email. Please try resend; if it still fails, contact support.";
  }
  if (code === "LimitExceededException") {
    return "Too many attempts. Please wait a few minutes, then try again.";
  }
  if (code === "UsernameExistsException") {
    return "An account already exists for this email. Log in, or use resend verification code if it is not verified yet.";
  }
  if (code === "InvalidPasswordException") {
    return "Password must be at least 8 characters and include uppercase, lowercase, and a number.";
  }
  if (code === "CodeMismatchException" || code === "ExpiredCodeException") {
    return "That reset code is invalid or expired. Request a new code and try again.";
  }
  if (code === "UserNotFoundException") {
    return "If an account exists for that email, a reset code has been sent.";
  }
  if (isEmailUnverifiedError(err)) {
    return "This email is not verified yet. Enter the verification code we send you, then sign in with your password.";
  }
  if (err instanceof Error && err.message) return err.message;
  return "Authentication failed";
}

export function confirmSignUp(email: string, code: string): Promise<void> {
  const invalid = rejectInvalidEmail(email);
  if (invalid) return invalid;
  if (!userPool && devAuth) return Promise.resolve();
  if (!userPool) return Promise.reject(new Error("Auth not configured."));

  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: cognitoUsername(email), Pool: userPool });
    user.confirmRegistration(code.trim(), true, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export function resendConfirmationCode(email: string): Promise<void> {
  const invalid = rejectInvalidEmail(email);
  if (invalid) return invalid;
  if (!userPool && devAuth) return Promise.resolve();
  if (!userPool) return Promise.reject(new Error("Auth not configured."));

  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: cognitoUsername(email), Pool: userPool });
    user.resendConfirmationCode((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export type ForgotPasswordDelivery = {
  deliveryMedium?: string;
  destination?: string;
};

/** Step 1: ask Cognito to email a password-reset code. */
export function forgotPassword(email: string): Promise<ForgotPasswordDelivery> {
  const invalid = rejectInvalidEmail(email);
  if (invalid) return invalid;
  if (!userPool && devAuth) {
    return Promise.resolve({ deliveryMedium: "EMAIL", destination: email });
  }
  if (!userPool) return Promise.reject(new Error("Auth not configured."));

  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: cognitoUsername(email), Pool: userPool });
    user.forgotPassword({
      onSuccess: () => resolve({}),
      onFailure: (err) => reject(err),
      inputVerificationCode: (data) => {
        resolve({
          deliveryMedium: data?.DeliveryMedium,
          destination: data?.Destination,
        });
      },
    });
  });
}

/** Step 2: confirm the emailed code and set a new password. */
export function confirmForgotPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<void> {
  const invalid = rejectInvalidEmail(email);
  if (invalid) return invalid;
  if (!userPool && devAuth) return Promise.resolve();
  if (!userPool) return Promise.reject(new Error("Auth not configured."));

  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: cognitoUsername(email), Pool: userPool });
    user.confirmPassword(code.trim(), newPassword, {
      onSuccess: () => resolve(),
      onFailure: (err) => reject(err),
    });
  });
}
