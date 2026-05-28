"use client";

export default function GoogleLoginButton() {
  const handleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      alert("Google 로그인 환경변수가 설정되지 않았습니다.");
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
      className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm shadow-slate-200/70 transition hover:border-blue-200 hover:bg-blue-50"
    >
      <span className="flex size-6 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-black text-[#4285f4]">
        G
      </span>
      Google로 로그인
    </button>
  );
}
