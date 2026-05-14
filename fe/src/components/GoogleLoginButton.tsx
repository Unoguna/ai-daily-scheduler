"use client";

export default function GoogleLoginButton() {
  const handleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      alert("구글 로그인 환경변수가 설정되지 않았습니다.");
      return;
    }

    const googleAuthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth` +
      `?response_type=code` +
      `&client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent("openid email profile")}`;

    window.location.href = googleAuthUrl;
  };

  return (
    <button
      type="button"
      onClick={handleLogin}
      className="flex w-full items-center justify-center gap-3 rounded-md border border-[#c8cbbf] bg-white px-4 py-3 text-sm font-bold text-[#20231f] shadow-sm transition hover:bg-[#f6f7f2]"
    >
      <span className="flex size-6 items-center justify-center rounded-full border border-[#d7d9cf] bg-white text-xs font-black text-[#4285f4]">
        G
      </span>
      Google로 로그인
    </button>
  );
}
