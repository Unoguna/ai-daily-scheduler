import KakaoLoginButton from "@/components/KakaoLoginButton";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold">로그인</h1>
        <p className="mb-4 text-sm text-gray-600">
          카카오 소셜 로그인 테스트 페이지
        </p>

        <KakaoLoginButton />
      </div>
    </main>
  );
}
