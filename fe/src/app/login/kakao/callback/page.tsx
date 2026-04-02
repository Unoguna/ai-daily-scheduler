"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function KakaoCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [message, setMessage] = useState("카카오 로그인 처리 중...");

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      setMessage(`카카오 로그인 실패: ${error}`);
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

        const data = await response.json();

        // 예시: accessToken 저장
        if (data.accessToken) {
          localStorage.setItem("accessToken", data.accessToken);
        }

        setMessage("로그인 성공! 잠시 후 이동합니다.");

        setTimeout(() => {
          router.push("/");
        }, 1000);
      } catch (err) {
        console.error(err);
        setMessage("백엔드 로그인 처리 중 오류가 발생했습니다.");
      }
    };

    loginWithKakao();
  }, [searchParams, router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="rounded-2xl border p-8 shadow-sm">
        <p>{message}</p>
      </div>
    </main>
  );
}
