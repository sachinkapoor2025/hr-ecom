"use client";

import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from "amazon-cognito-identity-js";

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
}

const STORAGE_KEY = "hr_ecom_auth";

export function loadStoredAuth(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function storeAuth(user: AuthUser | null) {
  if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  else localStorage.removeItem(STORAGE_KEY);
}

export function login(email: string, password: string): Promise<AuthUser> {
  if (!userPool && devAuth) {
    const isAdmin = email.includes("admin");
    const user: AuthUser = {
      email,
      token: `dev:${email}:${isAdmin ? "admin" : "customer"}`,
      isAdmin,
    };
    storeAuth(user);
    return Promise.resolve(user);
  }

  if (!userPool) {
    return Promise.reject(new Error("Auth not configured. Set Cognito env vars or enable dev auth."));
  }

  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: userPool });
    const details = new AuthenticationDetails({ Username: email, Password: password });

    user.authenticateUser(details, {
      onSuccess: (session) => {
        const token = session.getIdToken().getJwtToken();
        const payload = session.getIdToken().decodePayload();
        const groups: string[] = payload["cognito:groups"] ?? [];
        const authUser: AuthUser = {
          email,
          name: payload.name as string | undefined,
          token,
          isAdmin: groups.includes("admin"),
        };
        storeAuth(authUser);
        resolve(authUser);
      },
      onFailure: (err) => reject(err),
    });
  });
}

export function register(email: string, password: string, name?: string): Promise<void> {
  if (!userPool && devAuth) {
    return Promise.resolve();
  }

  if (!userPool) {
    return Promise.reject(new Error("Auth not configured."));
  }

  const attrs: CognitoUserAttribute[] = [
    new CognitoUserAttribute({ Name: "email", Value: email }),
  ];
  if (name) attrs.push(new CognitoUserAttribute({ Name: "name", Value: name }));

  return new Promise((resolve, reject) => {
    userPool.signUp(email, password, attrs, [], (err) => {
      if (err) reject(err);
      else resolve();
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
