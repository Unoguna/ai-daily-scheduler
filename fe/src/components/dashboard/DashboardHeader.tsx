export function DashboardHeader({
  token,
  onTokenChange,
  onSaveToken,
}: {
  token: string;
  onTokenChange: (token: string) => void;
  onSaveToken: () => void;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-[#d7d9cf] pb-5 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-sm font-semibold text-[#577060]">Haru Planner</p>
        <h1 className="text-3xl font-bold">하루 일정 코치</h1>
      </div>
      <div className="flex flex-col gap-2 md:w-[520px]">
        <label className="text-sm font-semibold">Access Token</label>
        <div className="flex gap-2">
          <input
            value={token}
            onChange={(event) => onTokenChange(event.target.value)}
            className="min-w-0 flex-1 rounded-md border border-[#c8cbbf] bg-white px-3 py-2 text-sm"
            placeholder="로그인 후 accessToken이 자동 저장됩니다."
          />
          <button
            type="button"
            onClick={onSaveToken}
            className="rounded-md bg-[#243528] px-4 py-2 text-sm font-semibold text-white"
          >
            저장
          </button>
        </div>
      </div>
    </header>
  );
}

export function DateToolbar({
  selectedDate,
  onDateChange,
  onRefresh,
}: {
  selectedDate: string;
  onDateChange: (date: string) => void;
  onRefresh: () => void;
}) {
  return (
    <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <label className="text-sm font-semibold">날짜</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(event) => onDateChange(event.target.value)}
          className="rounded-md border border-[#c8cbbf] bg-white px-3 py-2"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-md border border-[#aeb4a5] px-4 py-2 text-sm font-semibold"
        >
          새로고침
        </button>
        <a
          href="/login"
          className="rounded-md border border-[#aeb4a5] px-4 py-2 text-sm font-semibold"
        >
          로그인
        </a>
      </div>
    </section>
  );
}

export function StatusMessage({
  loading,
  message,
}: {
  loading: boolean;
  message: string;
}) {
  if (!message) return null;

  return (
    <div className="rounded-md border border-[#c8cbbf] bg-white px-4 py-3 text-sm">
      {loading ? "처리 중..." : message}
    </div>
  );
}
