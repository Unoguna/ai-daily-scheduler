import { useState } from "react";
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

export function CircularTimetableEditor({
  items,
  onChange,
  onDelete,
}: {
  items: ScheduleItem[];
  onChange: (index: number, key: keyof ScheduleItem, value: string) => void;
  onDelete: (index: number) => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const size = 420;
  const center = size / 2;
  const outerRadius = 178;
  const innerRadius = 104;
  const selectedItem =
    selectedIndex === null ? null : items[selectedIndex] ?? null;
  const sortedItems = items
    .map((item, index) => ({ item, index }))
    .sort(
      (a, b) => timeToMinutes(a.item.startTime) - timeToMinutes(b.item.startTime),
    );

  const selectItem = (index: number) => {
    setSelectedIndex(index);
  };

  const deleteItem = (index: number) => {
    onDelete(index);
    setSelectedIndex(null);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(320px,520px)_minmax(280px,1fr)]">
      <div className="flex min-w-0 justify-center">
        <div className="relative aspect-square w-full max-w-[520px]">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            role="img"
            aria-label="원형 일정 시간표"
            className="size-full"
          >
            <circle
              cx={center}
              cy={center}
              r={outerRadius}
              fill="#fbfcf7"
              stroke="#d7d9cf"
              strokeWidth="1"
            />
            <circle cx={center} cy={center} r={innerRadius} fill="#f6f7f2" />

            {Array.from({ length: 24 }, (_, hour) => {
              const angle = minutesToAngle(hour * 60);
              const outer = pointOnCircle(
                center,
                center,
                outerRadius + 8,
                angle,
              );
              const inner = pointOnCircle(
                center,
                center,
                outerRadius - 8,
                angle,
              );
              const label = pointOnCircle(
                center,
                center,
                outerRadius + 26,
                angle,
              );

              return (
                <g key={hour}>
                  <line
                    x1={inner.x}
                    y1={inner.y}
                    x2={outer.x}
                    y2={outer.y}
                    stroke={hour % 6 === 0 ? "#66705f" : "#c8cbbf"}
                    strokeWidth={hour % 6 === 0 ? 1.5 : 1}
                  />
                  {hour % 3 === 0 ? (
                    <text
                      x={label.x}
                      y={label.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-[#66705f] text-[11px] font-bold"
                    >
                      {String(hour).padStart(2, "0")}
                    </text>
                  ) : null}
                </g>
              );
            })}

            {sortedItems.map(({ item, index }) => {
              const start = timeToMinutes(item.startTime);
              const end = normalizeEndMinutes(
                start,
                timeToMinutes(item.endTime),
              );
              const path = describeDonutSegment(
                center,
                center,
                outerRadius,
                innerRadius,
                minutesToAngle(start),
                minutesToAngle(end),
              );
              const labelPoint = pointOnCircle(
                center,
                center,
                (outerRadius + innerRadius) / 2,
                minutesToAngle((start + end) / 2),
              );
              const duration = Math.max(1, end - start);
              const isSelected = selectedIndex === index;

              return (
                <g key={`${item.startTime}-${item.title}-${index}`}>
                  <path
                    d={path}
                    role="button"
                    tabIndex={0}
                    aria-label={`${item.title} 편집`}
                    fill={typeColor(item.type)}
                    stroke={isSelected ? "#243528" : "#fbfcf7"}
                    strokeWidth={isSelected ? 4 : 2}
                    className="cursor-pointer transition-opacity hover:opacity-85 focus:outline-none"
                    onClick={() => selectItem(index)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        selectItem(index);
                      }
                    }}
                  />
                  {duration >= 45 ? (
                    <text
                      x={labelPoint.x}
                      y={labelPoint.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="pointer-events-none fill-white text-[10px] font-bold"
                    >
                      {truncateLabel(item.title, duration)}
                    </text>
                  ) : null}
                </g>
              );
            })}

            <circle
              cx={center}
              cy={center}
              r={innerRadius - 8}
              fill="#fbfcf7"
              stroke="#d7d9cf"
            />
            <text
              x={center}
              y={center - 8}
              textAnchor="middle"
              className="fill-[#243528] text-[18px] font-bold"
            >
              하루 일정
            </text>
            <text
              x={center}
              y={center + 16}
              textAnchor="middle"
              className="fill-[#66705f] text-[12px] font-semibold"
            >
              일정을 클릭해 수정
            </text>
          </svg>
        </div>
      </div>

      <div className="min-w-0">
        <div className="mb-4 flex flex-wrap gap-2 text-xs font-bold text-[#66705f]">
          {(["FIXED_SCHEDULE", "GOAL_WORK", "BREAK"] as const).map((type) => (
            <span key={type} className="inline-flex items-center gap-1">
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: typeColor(type) }}
              />
              {type}
            </span>
          ))}
        </div>

        {selectedIndex !== null && selectedItem ? (
          <SelectedScheduleEditor
            item={selectedItem}
            index={selectedIndex}
            onChange={onChange}
            onDelete={deleteItem}
          />
        ) : (
          <div className="rounded-md border border-dashed border-[#c8cbbf] bg-white p-5 text-sm font-semibold text-[#66705f]">
            원형 시간표에서 수정할 일정을 선택하세요.
          </div>
        )}
      </div>
    </div>
  );
}

function SelectedScheduleEditor({
  item,
  index,
  onChange,
  onDelete,
}: {
  item: ScheduleItem;
  index: number;
  onChange: (index: number, key: keyof ScheduleItem, value: string) => void;
  onDelete: (index: number) => void;
}) {
  return (
    <section className="rounded-md border border-[#d7d9cf] bg-white p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-bold text-[#243528]">선택한 일정 수정</h3>
        <span
          className="rounded-md px-2 py-1 text-xs font-bold text-white"
          style={{ backgroundColor: typeColor(item.type) }}
        >
          {item.type}
        </span>
      </div>

      <div className="grid gap-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <label className="grid gap-1 text-sm font-semibold">
            시작
            <input
              type="time"
              value={item.startTime.slice(0, 5)}
              onChange={(event) =>
                onChange(index, "startTime", `${event.target.value}:00`)
              }
              className="min-w-0 rounded-md border border-[#c8cbbf] px-2 py-2 font-normal"
            />
          </label>
          <span className="mt-6 text-[#66705f]">-</span>
          <label className="grid gap-1 text-sm font-semibold">
            종료
            <input
              type="time"
              value={item.endTime.slice(0, 5)}
              onChange={(event) =>
                onChange(index, "endTime", `${event.target.value}:00`)
              }
              className="min-w-0 rounded-md border border-[#c8cbbf] px-2 py-2 font-normal"
            />
          </label>
        </div>

        <label className="grid gap-1 text-sm font-semibold">
          제목
          <input
            value={item.title}
            onChange={(event) => onChange(index, "title", event.target.value)}
            className="rounded-md border border-[#c8cbbf] px-3 py-2 font-normal"
          />
        </label>

        <label className="grid gap-1 text-sm font-semibold">
          설명
          <textarea
            value={item.description ?? ""}
            onChange={(event) =>
              onChange(index, "description", event.target.value)
            }
            className="min-h-24 rounded-md border border-[#c8cbbf] px-3 py-2 font-normal"
            placeholder="설명"
          />
        </label>

        <div className="flex justify-end border-t border-[#e1e3da] pt-4">
          <button
            type="button"
            onClick={() => onDelete(index)}
            className="rounded-md border border-[#d6a2a2] px-4 py-2 text-sm font-semibold text-[#612b2b] transition hover:bg-[#fff7f7]"
          >
            일정 삭제
          </button>
        </div>
      </div>
    </section>
  );
}

function timeToMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function normalizeEndMinutes(start: number, end: number) {
  return end <= start ? end + 24 * 60 : end;
}

function minutesToAngle(minutes: number) {
  return (minutes / (24 * 60)) * 360 - 90;
}

function pointOnCircle(cx: number, cy: number, radius: number, angle: number) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function describeDonutSegment(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number,
) {
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  const outerStart = pointOnCircle(cx, cy, outerRadius, startAngle);
  const outerEnd = pointOnCircle(cx, cy, outerRadius, endAngle);
  const innerStart = pointOnCircle(cx, cy, innerRadius, endAngle);
  const innerEnd = pointOnCircle(cx, cy, innerRadius, startAngle);

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerEnd.x} ${innerEnd.y}`,
    "Z",
  ].join(" ");
}

function typeColor(type: ScheduleItem["type"]) {
  return {
    FIXED_SCHEDULE: "#577060",
    GOAL_WORK: "#435c8a",
    BREAK: "#b47b50",
  }[type];
}

function truncateLabel(title: string, durationMinutes: number) {
  const maxLength = durationMinutes >= 120 ? 10 : 6;
  return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title;
}
