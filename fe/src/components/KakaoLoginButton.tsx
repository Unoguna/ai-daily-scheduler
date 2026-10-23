"use client";

import { socialAuthorizationUrl } from "@/lib/oauthState";

export default function KakaoLoginButton() {
  const handleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
    const redirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      alert("카카오 로그인 환경변수가 설정되지 않았습니다.");
      return;
    }

    try {
      window.location.href = socialAuthorizationUrl("kakao", clientId, redirectUri);
    } catch (error) {
      alert(error instanceof Error ? error.message : "로그인을 시작할 수 없습니다.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogin}
      className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#fee500] px-4 py-3 text-sm font-semibold text-[#191600] shadow-sm shadow-slate-200/70 transition hover:bg-[#f6dc00]"
    >
      <span className="flex size-6 items-center justify-center rounded-full bg-[#191600] text-xs font-black text-[#fee500]">
        K
      </span>
      카카오로 로그인
    </button>
  );
}
