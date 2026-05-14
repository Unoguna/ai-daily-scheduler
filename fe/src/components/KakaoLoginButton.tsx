"use client";

export default function KakaoLoginButton() {
  const handleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
    const redirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      alert("카카오 로그인 환경변수가 설정되지 않았습니다.");
      return;
    }

    const kakaoAuthUrl =
      `https://kauth.kakao.com/oauth/authorize` +
      `?response_type=code` +
      `&client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}`;

    window.location.href = kakaoAuthUrl;
  };

  return (
    <button
      type="button"
      onClick={handleLogin}
      className="flex w-full items-center justify-center gap-3 rounded-md bg-[#fee500] px-4 py-3 text-sm font-bold text-[#191600] shadow-sm transition hover:bg-[#f6dc00]"
    >
      <span className="flex size-6 items-center justify-center rounded-full bg-[#191600] text-xs font-black text-[#fee500]">
        K
      </span>
      카카오로 로그인
    </button>
  );
}
