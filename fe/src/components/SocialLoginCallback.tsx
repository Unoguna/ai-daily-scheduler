"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getLoginDestination } from "@/lib/loginDestination";
import { type OAuthProvider } from "@/lib/oauthState";
import { completeSocialLogin, type SocialLoginTokens } from "@/lib/socialLogin";

function CallbackContent({ provider }: { provider: OAuthProvider }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pending = useRef<{ key: string; promise: Promise<SocialLoginTokens> } | null>(null);
  const [message, setMessage] = useState("로그인 요청을 확인하고 있습니다...");
  const [failed, setFailed] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const query = searchParams.toString();

  useEffect(() => {
    let active = true;
    const key = `${provider}:${query}`;
    // React Strict Mode re-runs effects. Reuse the exchange promise so state/code
    // is consumed once while the active effect can still receive its result.
    if (pending.current?.key !== key) {
      pending.current = { key, promise: completeSocialLogin(provider, new URLSearchParams(query)) };
    }
    pending.current.promise.then(async (tokens) => {
      if (!active) return;
      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);
      setAuthenticated(true);
      setMessage("로그인 성공. 생활 패턴 설정을 확인하고 있습니다.");
      const destination = await getLoginDestination();
      if (active) router.replace(destination);
    }).catch((error) => {
      if (!active) return;
      setFailed(true);
      setMessage(error instanceof Error ? error.message : "로그인 처리 중 오류가 발생했습니다.");
    });
    return () => { active = false; };
  }, [provider, query, router]);

  return <CallbackMessage message={message} failed={failed} authenticated={authenticated} />;
}

export function SocialLoginCallback({ provider }: { provider: OAuthProvider }) {
  return <Suspense fallback={<CallbackMessage message="로그인 처리 중..." />}>
    <CallbackContent provider={provider} />
  </Suspense>;
}

function CallbackMessage({ message, failed = false, authenticated = false }: {
  message: string; failed?: boolean; authenticated?: boolean;
}) {
  return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
    <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <p role={failed ? "alert" : "status"} className={failed ? "text-red-700" : "text-slate-800"}>{message}</p>
      {failed && <Link href="/login" className="mt-4 block text-sm text-blue-600 underline">로그인 화면에서 다시 시작</Link>}
      {authenticated && failed && <Link href="/" className="mt-3 block text-sm text-blue-600 underline">로그인된 상태로 계속하기</Link>}
    </div>
  </main>;
}
