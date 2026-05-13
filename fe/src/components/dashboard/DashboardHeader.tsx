export function DashboardHeader({
  userName,
}: {
  userName: string | null;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-[#d7d9cf] pb-5 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-sm font-semibold text-[#577060]">Haru Planner</p>
        <h1 className="text-3xl font-bold">하루 일정 코치</h1>
      </div>
      {userName ? (
        <div className="rounded-md border border-[#c8cbbf] bg-white px-4 py-2 text-sm font-semibold text-[#243528]">
          {userName}님
        </div>
      ) : null}
    </header>
  );
}

export function DateToolbar({
  selectedDate,
  onDateChange,
  onRefresh,
  isAuthenticated,
}: {
  selectedDate: string;
  onDateChange: (date: string) => void;
  onRefresh: () => void;
  isAuthenticated: boolean;
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
        {isAuthenticated ? null : (
          <a
            href="/login"
            className="rounded-md border border-[#aeb4a5] px-4 py-2 text-sm font-semibold"
          >
            로그인
          </a>
        )}
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
