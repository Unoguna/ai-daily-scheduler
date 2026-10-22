"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getLoginDestination } from "@/lib/loginDestination";

function GoogleCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const startedCode = useRef<string | null>(null);

  const [message, setMessage] = useState("Google 로그인 처리 중...");

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      setMessage(`Google 로그인 실패: ${error}`);
      return;
    }

    if (!code) {
      setMessage("인가 코드가 없습니다.");
      return;
    }

    if (startedCode.current === code) return;
    startedCode.current = code;

    const loginWithGoogle = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/google`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ code }),
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "백엔드 로그인 처리 실패");
        }

        const body = await response.json();
        const data = body.data ?? body;

        if (!data.accessToken || !data.refreshToken) {
          throw new Error("로그인 토큰이 없습니다.");
        }

        if (data.accessToken) {
          localStorage.setItem("accessToken", data.accessToken);
        }

        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }

        setMessage("로그인 성공. 생활 패턴 설정을 확인하고 있습니다.");
        const destination = await getLoginDestination();
        router.replace(destination);
      } catch (err) {
        console.error(err);
        setMessage("백엔드 로그인 처리 중 오류가 발생했습니다.");
      }
    };

    void loginWithGoogle();
  }, [searchParams, router]);

  return <CallbackMessage message={message} />;
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<CallbackMessage message="Google 로그인 처리 중..." />}>
      <GoogleCallbackContent />
    </Suspense>
  );
}

function CallbackMessage({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p>{message}</p>
        <Link href="/" className="mt-4 block text-sm text-blue-600 underline">계속하기</Link>
      </div>
    </main>
  );
}
