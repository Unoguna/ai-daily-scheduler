"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function KakaoCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [message, setMessage] = useState("Kakao 로그인 처리 중...");

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      setMessage(`Kakao 로그인 실패: ${error}`);
      return;
    }

    if (!code) {
      setMessage("인가 코드가 없습니다.");
      return;
    }

    const loginWithKakao = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/kakao`,
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

        if (data.accessToken) {
          localStorage.setItem("accessToken", data.accessToken);
        }

        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }

        setMessage("로그인 성공. 홈으로 이동합니다.");

        setTimeout(() => {
          router.push("/");
        }, 1000);
      } catch (err) {
        console.error(err);
        setMessage("백엔드 로그인 처리 중 오류가 발생했습니다.");
      }
    };

    void loginWithKakao();
  }, [searchParams, router]);

  return <CallbackMessage message={message} />;
}

export default function KakaoCallbackPage() {
  return (
    <Suspense fallback={<CallbackMessage message="Kakao 로그인 처리 중..." />}>
      <KakaoCallbackContent />
    </Suspense>
  );
}

function CallbackMessage({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p>{message}</p>
      </div>
    </main>
  );
}
