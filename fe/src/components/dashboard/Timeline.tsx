import type { ScheduleItem } from "@/types/scheduler";

export function Timeline({ items }: { items: ScheduleItem[] }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, index) => (
        <div
          key={`${item.startTime}-${item.title}-${index}`}
          className="grid gap-2 rounded-md border border-[#d7d9cf] bg-white p-3 md:grid-cols-[110px_1fr]"
        >
          <div className="text-sm font-bold text-[#577060]">
            {item.startTime.slice(0, 5)} - {item.endTime.slice(0, 5)}
          </div>
          <div>
            <div className="flex items-center justify-between gap-3">
              <strong>{item.title}</strong>
              <span className="text-xs font-semibold text-[#66705f]">
                {item.type}
              </span>
            </div>
            {item.description ? (
              <p className="mt-1 text-sm text-[#66705f]">{item.description}</p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export function TimelineEditor({
  items,
  onChange,
}: {
  items: ScheduleItem[];
  onChange: (index: number, key: keyof ScheduleItem, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => (
        <div
          key={`${item.startTime}-${item.title}-${index}`}
          className="grid gap-3 rounded-md border border-[#d7d9cf] bg-white p-3 md:grid-cols-[130px_1fr]"
        >
          <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
            <input
              type="time"
              value={item.startTime.slice(0, 5)}
              onChange={(event) =>
                onChange(index, "startTime", `${event.target.value}:00`)
              }
              className="rounded-md border border-[#c8cbbf] px-2 py-2 text-sm"
            />
            <input
              type="time"
              value={item.endTime.slice(0, 5)}
              onChange={(event) =>
                onChange(index, "endTime", `${event.target.value}:00`)
              }
              className="rounded-md border border-[#c8cbbf] px-2 py-2 text-sm"
            />
          </div>
          <div className="grid gap-2">
            <input
              value={item.title}
              onChange={(event) => onChange(index, "title", event.target.value)}
              className="rounded-md border border-[#c8cbbf] px-3 py-2 font-semibold"
            />
            <input
              value={item.description ?? ""}
              onChange={(event) =>
                onChange(index, "description", event.target.value)
              }
              className="rounded-md border border-[#c8cbbf] px-3 py-2 text-sm"
              placeholder="설명"
            />
            <span className="text-xs font-semibold text-[#66705f]">
              {item.type}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
