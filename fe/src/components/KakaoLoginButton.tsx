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
      className="rounded-lg bg-yellow-300 px-4 py-2 font-semibold text-black hover:opacity-90"
    >
      카카오로 로그인
    </button>
  );
}
