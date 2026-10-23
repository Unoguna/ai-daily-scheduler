export type OAuthProvider = "google" | "kakao";

const STORAGE_KEY = "oauth.pending-login";
const STATE_LIFETIME_MS = 10 * 60 * 1000;
const invalidState = "로그인 요청을 확인할 수 없거나 만료되었습니다. 로그인 화면에서 다시 시도해 주세요.";

export function createOAuthState(provider: OAuthProvider): string {
  try {
    const bytes = new Uint8Array(32);
    window.crypto.getRandomValues(bytes);
    const state = Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
    // A new login attempt replaces any older attempt in the same tab.
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ provider, state, createdAt: Date.now() }));
    return state;
  } catch {
    throw new Error("로그인 보안 정보를 저장할 수 없습니다. 브라우저의 사이트 저장소 설정을 확인해 주세요.");
  }
}

export function consumeOAuthState(provider: OAuthProvider, returnedState: string | null): void {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    // Consume even a failed or cancelled callback. A retry must begin a new login.
    window.sessionStorage.removeItem(STORAGE_KEY);
    if (!raw || !returnedState || !/^[a-f0-9]{64}$/.test(returnedState)) throw new Error();
    const pending = JSON.parse(raw);
    const age = Date.now() - pending?.createdAt;
    if (pending?.provider !== provider || pending?.state !== returnedState
      || !Number.isSafeInteger(pending?.createdAt) || age < 0 || age >= STATE_LIFETIME_MS) {
      throw new Error();
    }
  } catch {
    throw new Error(invalidState);
  }
}

export function socialAuthorizationUrl(provider: OAuthProvider, clientId: string, redirectUri: string): string {
  const state = createOAuthState(provider);
  const url = new URL(provider === "google"
    ? "https://accounts.google.com/o/oauth2/v2/auth" : "https://kauth.kakao.com/oauth/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  if (provider === "google") url.searchParams.set("scope", "openid email profile");
  return url.toString();
}
