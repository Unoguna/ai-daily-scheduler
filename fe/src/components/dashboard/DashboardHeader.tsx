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
  onLogout,
}: {
  selectedDate: string;
  onDateChange: (date: string) => void;
  onRefresh: () => void;
  isAuthenticated: boolean;
  onLogout: () => void;
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
        {isAuthenticated ? (
          <button
            type="button"
            onClick={onLogout}
            className="rounded-md border border-[#aeb4a5] px-4 py-2 text-sm font-semibold"
          >
            로그아웃
          </button>
        ) : (
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
  toast,
}: {
  toast: {
    message: string;
    type: "loading" | "success" | "error";
  } | null;
}) {
  if (!toast) return null;

  const colorClass = {
    loading: "border-[#c8cbbf] bg-white text-[#243528]",
    success: "border-[#9fb49c] bg-[#f5fbf3] text-[#243528]",
    error: "border-[#d6a2a2] bg-[#fff7f7] text-[#612b2b]",
  }[toast.type];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-5 right-5 z-50 max-w-[calc(100vw-40px)] rounded-md border px-4 py-3 text-sm font-semibold shadow-lg md:max-w-sm ${colorClass}`}
    >
      {toast.message}
    </div>
  );
}
