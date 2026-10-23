import { consumeOAuthState, type OAuthProvider } from "@/lib/oauthState";

export type SocialLoginTokens = { accessToken: string; refreshToken: string };

export async function completeSocialLogin(provider: OAuthProvider, params: Pick<URLSearchParams, "get" | "getAll">): Promise<SocialLoginTokens> {
  const states = params.getAll("state");
  consumeOAuthState(provider, states.length === 1 ? states[0] : null);
  if (params.getAll("error").length > 0) {
    throw new Error("소셜 로그인이 취소되었거나 거부되었습니다. 로그인 화면에서 다시 시도해 주세요.");
  }
  const codes = params.getAll("code");
  if (codes.length !== 1 || !codes[0].trim()) throw new Error("인가 코드가 없습니다. 로그인 화면에서 다시 시도해 주세요.");

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"}/api/v1/auth/${provider}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: codes[0] }),
  });
  if (!response.ok) throw new Error("소셜 로그인 처리에 실패했습니다. 로그인 화면에서 다시 시도해 주세요.");
  const body = await response.json();
  const tokens = body?.data ?? body;
  if (body?.success === false || typeof tokens?.accessToken !== "string" || !tokens.accessToken
    || typeof tokens?.refreshToken !== "string" || !tokens.refreshToken) {
    throw new Error("로그인 응답이 올바르지 않습니다. 로그인 화면에서 다시 시도해 주세요.");
  }
  return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
}
