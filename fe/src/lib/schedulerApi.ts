import type { ApiResponse } from "@/types/scheduler";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export const today = () => new Date().toISOString().slice(0, 10);

let refreshPromise: Promise<string> | null = null;

function accessToken() {
  return typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
}

function sessionExpired(): never {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    if (window.location.pathname !== "/login") window.location.replace("/login");
  }
  throw new Error("로그인이 만료되었습니다. 다시 로그인해 주세요.");
}

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;
  const refreshToken = typeof window !== "undefined"
    ? localStorage.getItem("refreshToken") : null;
  if (!refreshToken) return sessionExpired();

  refreshPromise = (async () => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    // Network/server failures should not discard an otherwise valid session.
    if ([400, 401, 403, 404].includes(response.status)) {
      if (localStorage.getItem("refreshToken") === refreshToken) return sessionExpired();
      throw new Error("로그인 상태가 변경되었습니다. 다시 시도해 주세요.");
    }
    if (!response.ok) throw new Error("로그인 갱신에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    const body = await response.json();
    const tokens = body?.data;
    if (body?.success === false || !tokens?.accessToken || !tokens?.refreshToken) {
      throw new Error("로그인 갱신 응답이 올바르지 않습니다.");
    }
    // A late refresh must not restore a session after logout or replace a new login.
    if (localStorage.getItem("refreshToken") !== refreshToken) {
      throw new Error("로그인 상태가 변경되었습니다. 다시 시도해 주세요.");
    }
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
    return tokens.accessToken as string;
  })();
  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const send = (token: string | null) => {
    const headers = new Headers(init.headers);
    if (!(init.body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (token) headers.set("Authorization", `Bearer ${token}`);
    else headers.delete("Authorization");
    return fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  };

  const originalToken = accessToken();
  let response = await send(originalToken);
  if (response.status === 401) {
    // Another request may already have refreshed while this response was in flight.
    const currentToken = accessToken();
    const token = currentToken && currentToken !== originalToken
      ? currentToken : await refreshAccessToken();
    response = await send(token);
    if (response.status === 401) {
      if (accessToken() === token) return sessionExpired();
      throw new Error("로그인 상태가 변경되었습니다. 다시 시도해 주세요.");
    }
  }

  const text = await response.text();
  let body: ApiResponse<T> | null = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(response.ok ? "서버 응답 형식이 올바르지 않습니다." : "요청에 실패했습니다.");
  }
  if (!response.ok || body?.success === false) {
    throw new Error(body?.message || "요청에 실패했습니다.");
  }
  return body?.data as T;
}
