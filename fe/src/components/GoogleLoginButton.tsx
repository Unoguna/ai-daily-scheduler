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
      className="rounded-lg bg-white px-4 py-2 font-semibold text-black border hover:bg-gray-50"
    >
      구글로 로그인
    </button>
  );
}
