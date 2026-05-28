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
              ?ㅻ뒛??而⑤뵒?섏뿉 留욎떠 ?섎（瑜??뺣━?댁슂
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-500">
              紐⑺몴, 怨좎젙 ?쇱젙, ?쇰뱶諛깆쓣 ?쒓납??紐⑥븘 遺???녿뒗 ?섎（ 怨꾪쉷??              시작?섏꽭??
            </p>
          </div>

          <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
            {[
              ["09:00", "吏묒쨷 ?낅Т", "HIGH"],
              ["13:30", "怨좎젙 ?쇱젙", "CLASS"],
              ["20:00", "?뚭퀬", "FEEDBACK"],
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
              ?뚯뀥 怨꾩젙?쇰줈 鍮좊Ⅴ寃?시작?????덉뼱??
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <KakaoLoginButton />
            <GoogleLoginButton />
          </div>

          <p className="mt-6 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-400">
            濡쒓렇?명븯硫??쇱젙, 紐⑺몴, 而⑤뵒??湲곕줉??怨꾩젙???덉쟾?섍쾶 ?곌껐?⑸땲??
          </p>
        </section>
      </div>
    </main>
  );
}
