import KakaoLoginButton from "@/components/KakaoLoginButton";
import GoogleLoginButton from "@/components/GoogleLoginButton";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_440px] lg:px-8">
        <section className="flex flex-col gap-8">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Haru Planner
            </p>
            <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-slate-950 md:text-5xl">
              오늘의 컨디션에 맞춰 하루를 정리해요
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-500">
              목표, 고정 일정, 피드백을 한곳에 모아 부담 없는 하루 계획을
              시작하세요.
            </p>
          </div>

          <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
            {[
              ["09:00", "집중 업무", "HIGH"],
              ["13:30", "고정 일정", "CLASS"],
              ["20:00", "회고", "FEEDBACK"],
            ].map(([time, title, label]) => (
              <div
                key={time}
                className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-200/70"
              >
                <p className="text-sm font-bold text-blue-600">{time}</p>
                <p className="mt-2 font-semibold">{title}</p>
                <p className="mt-3 text-xs font-semibold text-slate-400">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-xl shadow-slate-200/70 ring-1 ring-white/60">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">로그인</h2>
            <p className="mt-2 text-sm text-slate-500">
              소셜 계정으로 빠르게 시작할 수 있어요.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <KakaoLoginButton />
            <GoogleLoginButton />
          </div>

          <p className="mt-6 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-400">
            로그인하면 일정, 목표, 컨디션 기록을 계정에 안전하게 연결합니다.
          </p>
        </section>
      </div>
    </main>
  );
}
