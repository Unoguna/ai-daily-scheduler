import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import type { ScheduleItem } from "@/types/scheduler";

export function Timeline({ items }: { items: ScheduleItem[] }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, index) => (
        <div
          key={`${item.startTime}-${item.title}-${index}`}
          className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-3 md:grid-cols-[110px_1fr]"
        >
          <div className="text-sm font-bold text-blue-600">
            {item.startTime.slice(0, 5)} - {item.endTime.slice(0, 5)}
          </div>
          <div>
            <div className="flex items-center justify-between gap-3">
              <strong>{item.title}</strong>
              <span className="text-xs font-semibold text-slate-500">
                {item.type}
              </span>
            </div>
            {item.description ? (
              <p className="mt-1 text-sm text-slate-500">{item.description}</p>
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
          className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 md:grid-cols-[130px_1fr]"
        >
          <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
            <input
              type="time"
              value={item.startTime.slice(0, 5)}
              onChange={(event) =>
                onChange(index, "startTime", `${event.target.value}:00`)
              }
              className="rounded-2xl border border-slate-200 px-2 py-2 text-sm"
            />
            <input
              type="time"
              value={item.endTime.slice(0, 5)}
              onChange={(event) =>
                onChange(index, "endTime", `${event.target.value}:00`)
              }
              className="rounded-2xl border border-slate-200 px-2 py-2 text-sm"
            />
          </div>
          <div className="grid gap-2">
            <input
              value={item.title}
              onChange={(event) => onChange(index, "title", event.target.value)}
              className="rounded-2xl border border-slate-200 px-3 py-2 font-semibold"
            />
            <input
              value={item.description ?? ""}
              onChange={(event) =>
                onChange(index, "description", event.target.value)
              }
              className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="설명"
            />
            <span className="text-xs font-semibold text-slate-500">
              {item.type}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CircularTimetable({
  items,
  selectedIndex,
  onSelectedIndexChange,
  onUpdateItem,
  onDeleteItem,
}: {
  items: ScheduleItem[];
  selectedIndex: number | null;
  onSelectedIndexChange: (index: number | null) => void;
  onUpdateItem?: (index: number, item: ScheduleItem) => Promise<void> | void;
  onDeleteItem?: (index: number) => Promise<void> | void;
}) {
  const selectedItem =
    selectedIndex === null ? null : (items[selectedIndex] ?? null);

  return (
    <div
      className={
        selectedItem
          ? "grid gap-5 lg:grid-cols-[430px_minmax(240px,1fr)]"
          : "flex justify-center"
      }
    >
      <div
        className={selectedItem ? "flex justify-center lg:justify-start" : ""}
      >
        <CircularTimetableChart
          items={items}
          selectedIndex={selectedIndex}
          onSelect={onSelectedIndexChange}
          centerTitle="하루 일정"
          centerSubtitle="확정됨"
          maxWidthClass="w-[430px] max-w-full"
          showClockHands
        />
      </div>
      {selectedItem ? (
        onUpdateItem && onDeleteItem ? (
          <ConfirmedScheduleEditor
            item={selectedItem}
            index={selectedIndex ?? 0}
            onUpdate={onUpdateItem}
            onDelete={onDeleteItem}
          />
        ) : (
          <ScheduleInfoPanel item={selectedItem} />
        )
      ) : null}
    </div>
  );
}

export function CircularTimetableEditor({
  items,
  onChange,
  onDelete,
}: {
  items: ScheduleItem[];
  onChange: (
    index: number,
    key: keyof ScheduleItem,
    value: string,
  ) => number | void;
  onDelete: (index: number) => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedItem =
    selectedIndex === null ? null : (items[selectedIndex] ?? null);

  const deleteItem = (index: number) => {
    onDelete(index);
    setSelectedIndex(null);
  };

  const changeItem = (
    index: number,
    key: keyof ScheduleItem,
    value: string,
  ) => {
    const nextIndex = onChange(index, key, value);
    if (typeof nextIndex === "number") {
      setSelectedIndex(nextIndex);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(320px,520px)_minmax(280px,1fr)]">
      <div className="flex min-w-0 justify-center">
        <CircularTimetableChart
          items={items}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
          centerTitle="하루 일정"
          centerSubtitle="일정을 클릭해 수정"
          maxWidthClass="max-w-[520px]"
        />
      </div>

      <div className="min-w-0">
        <div className="mb-4 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
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

        <div className="h-[320px] overflow-hidden">
          {selectedIndex !== null && selectedItem ? (
            <SelectedScheduleEditor
              item={selectedItem}
              index={selectedIndex}
              onChange={changeItem}
              onDelete={deleteItem}
            />
          ) : (
            <div className="flex h-full items-center rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm font-semibold text-slate-500">
              원형 시간표에서 수정할 일정을 선택하세요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CircularTimetableChart({
  items,
  selectedIndex,
  onSelect,
  centerTitle,
  centerSubtitle,
  maxWidthClass,
  showClockHands = false,
}: {
  items: ScheduleItem[];
  selectedIndex?: number | null;
  onSelect?: (index: number) => void;
  centerTitle: string;
  centerSubtitle: string;
  maxWidthClass: string;
  showClockHands?: boolean;
}) {
  const size = 420;
  const center = size / 2;
  const outerRadius = 178;
  const innerRadius = 104;
  const [now, setNow] = useState(() => new Date());
  const sortedItems = items
    .map((item, index) => ({ item, index }))
    .sort(
      (a, b) =>
        timeToMinutes(a.item.startTime) - timeToMinutes(b.item.startTime),
    );
  const currentMinutes = showClockHands
    ? now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60
    : null;

  useEffect(() => {
    if (!showClockHands) return;

    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [showClockHands]);

  return (
    <div className={`relative aspect-square w-full ${maxWidthClass}`}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="원형 일정 시간표"
        className="size-full"
      >
        <defs>
          <filter
            id="timetable-soft-shadow"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feDropShadow
              dx="0"
              dy="4"
              stdDeviation="4"
              floodColor="#0f172a"
              floodOpacity="0.14"
            />
          </filter>
          <filter
            id="current-time-hand-shadow"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feDropShadow
              dx="0"
              dy="2"
              stdDeviation="2"
              floodColor="#612b2b"
              floodOpacity="0.35"
            />
          </filter>
          <marker
            id="current-time-arrow"
            markerWidth="9"
            markerHeight="9"
            refX="8"
            refY="4.5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M 0 0 L 9 4.5 L 0 9 Z" fill="#b64d45" />
          </marker>
        </defs>
        <circle
          cx={center}
          cy={center}
          r={outerRadius + 13}
          fill="#f8fafc"
          stroke="#dbeafe"
          strokeWidth="1"
        />
        <circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="#ffffff"
          stroke="#cfd3c6"
          strokeWidth="1.5"
          filter="url(#timetable-soft-shadow)"
        />
        <circle cx={center} cy={center} r={innerRadius} fill="#f8fafc" />

        {Array.from({ length: 24 }, (_, hour) => {
          const angle = minutesToAngle(hour * 60);
          const outer = pointOnCircle(center, center, outerRadius + 8, angle);
          const inner = pointOnCircle(center, center, outerRadius - 8, angle);
          const label = pointOnCircle(center, center, outerRadius + 26, angle);

          return (
            <g key={hour}>
              <line
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke={hour % 6 === 0 ? "#475569" : "#cbd5e1"}
                strokeWidth={hour % 6 === 0 ? 2 : 1}
                strokeLinecap="round"
              />
              {hour % 3 === 0 ? (
                <text
                  x={label.x}
                  y={label.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-slate-500 text-[11px] font-bold"
                >
                  {String(hour).padStart(2, "0")}
                </text>
              ) : null}
            </g>
          );
        })}

        {sortedItems.map(({ item, index }) => {
          const start = timeToMinutes(item.startTime);
          const end = normalizeEndMinutes(start, timeToMinutes(item.endTime));
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
          const isCurrent =
            currentMinutes !== null &&
            isMinuteWithinRange(currentMinutes, start, end);
          const interactiveProps = onSelect
            ? {
                role: "button",
                tabIndex: 0,
                onClick: () => onSelect(index),
                onKeyDown: (event: React.KeyboardEvent<SVGPathElement>) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(index);
                  }
                },
              }
            : {};

          return (
            <g key={`${item.startTime}-${item.title}-${index}`}>
              <path
                d={path}
                aria-label={onSelect ? `${item.title} ?몄쭛` : item.title}
                fill={typeColor(item.type)}
                stroke={isSelected || isCurrent ? "#0f172a" : "#ffffff"}
                strokeWidth={isSelected || isCurrent ? 5 : 2.5}
                opacity={isCurrent ? 1 : 0.9}
                filter={isCurrent ? "url(#timetable-soft-shadow)" : undefined}
                className={
                  onSelect
                    ? "cursor-pointer transition-opacity hover:opacity-85 focus:outline-none"
                    : undefined
                }
                {...interactiveProps}
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
          fill="#ffffff"
          stroke="#e2e8f0"
          strokeWidth="1.5"
          filter="url(#timetable-soft-shadow)"
        />
        {showClockHands ? (
          <CurrentTimeHand
            center={center}
            hour={now.getHours()}
            minute={now.getMinutes()}
            second={now.getSeconds()}
          />
        ) : (
          <>
            <text
              x={center}
              y={center - 8}
              textAnchor="middle"
              className="fill-slate-950 text-[18px] font-bold"
            >
              {centerTitle}
            </text>
            <text
              x={center}
              y={center + 16}
              textAnchor="middle"
              className="fill-slate-500 text-[12px] font-semibold"
            >
              {centerSubtitle}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}

function CurrentTimeHand({
  center,
  hour,
  minute,
  second,
}: {
  center: number;
  hour: number;
  minute: number;
  second: number;
}) {
  const currentMinutes = hour * 60 + minute + second / 60;
  const angle = minutesToAngle(currentMinutes);
  const handEnd = pointOnCircle(center, center, 90, angle);

  return (
    <g aria-label="?꾩옱 ?쒓컙">
      <circle cx={center} cy={center} r="28" fill="#fff7f7" opacity="0.75" />
      <line
        x1={center}
        y1={center}
        x2={handEnd.x}
        y2={handEnd.y}
        stroke="#b64d45"
        strokeWidth="3"
        strokeLinecap="round"
        markerEnd="url(#current-time-arrow)"
        filter="url(#current-time-hand-shadow)"
      />
      <circle
        cx={center}
        cy={center}
        r="6"
        fill="#ffffff"
        stroke="#b64d45"
        strokeWidth="3"
      />
    </g>
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
  onChange: (
    index: number,
    key: keyof ScheduleItem,
    value: string,
  ) => number | void;
  onDelete: (index: number) => void;
}) {
  return (
    <section className="h-full rounded-2xl border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-slate-950">선택한 일정 수정</h3>
        <span
          className="rounded-2xl px-2 py-1 text-xs font-bold text-white"
          style={{ backgroundColor: typeColor(item.type) }}
        >
          {item.type}
        </span>
      </div>

      <div className="grid gap-2">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <label className="grid gap-1 text-xs font-semibold">
            시작
            <TimeSelect
              value={item.startTime.slice(0, 5)}
              onChange={(value) => onChange(index, "startTime", `${value}:00`)}
            />
          </label>
          <span className="mt-5 text-slate-500">-</span>
          <label className="grid gap-1 text-xs font-semibold">
            종료
            <TimeSelect
              value={item.endTime.slice(0, 5)}
              onChange={(value) => onChange(index, "endTime", `${value}:00`)}
            />
          </label>
        </div>

        <label className="grid gap-1 text-xs font-semibold">
          제목
          <input
            value={item.title}
            onChange={(event) => onChange(index, "title", event.target.value)}
            className="rounded-2xl border border-slate-200 px-3 py-1 text-sm font-normal"
          />
        </label>

        <label className="grid gap-1 text-xs font-semibold">
          설명
          <textarea
            value={item.description ?? ""}
            onChange={(event) =>
              onChange(index, "description", event.target.value)
            }
            className="h-14 rounded-2xl border border-slate-200 px-3 py-1 text-sm font-normal"
            placeholder="설명"
          />
        </label>

        <div className="flex justify-end border-t border-slate-100 pt-2">
          <button
            type="button"
            onClick={() => onDelete(index)}
            className="rounded-2xl border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50"
          >
            일정 삭제
          </button>
        </div>
      </div>
    </section>
  );
}

function ScheduleInfoPanel({ item }: { item: ScheduleItem }) {
  return (
    <section className="self-start rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-blue-600">
            {item.startTime.slice(0, 5)} - {item.endTime.slice(0, 5)}
          </p>
          <h3 className="mt-1 truncate text-lg font-bold text-slate-950">
            {item.title}
          </h3>
        </div>
        <span
          className="shrink-0 rounded-2xl px-2 py-1 text-xs font-bold text-white"
          style={{ backgroundColor: typeColor(item.type) }}
        >
          {item.type}
        </span>
      </div>
      <p className="text-sm leading-6 text-slate-500">
        {item.description || "설명 없음"}
      </p>
    </section>
  );
}

function ConfirmedScheduleEditor({
  item,
  index,
  onUpdate,
  onDelete,
}: {
  item: ScheduleItem;
  index: number;
  onUpdate: (index: number, item: ScheduleItem) => Promise<void> | void;
  onDelete: (index: number) => Promise<void> | void;
}) {
  const [draft, setDraft] = useState<ScheduleItem>(item);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setDraft(item);
  }, [item]);

  const updateDraft = (key: keyof ScheduleItem, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onUpdate(index, {
        ...draft,
        title: draft.title.trim(),
        description: draft.description?.trim() || null,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteItem = async () => {
    setIsSubmitting(true);
    try {
      await onDelete(index);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="self-start rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-blue-600">선택한 일정</p>
          <h3 className="mt-1 text-lg font-bold text-slate-950">일정 수정</h3>
        </div>
        <span
          className="shrink-0 rounded-2xl px-2 py-1 text-xs font-bold text-white"
          style={{ backgroundColor: typeColor(draft.type) }}
        >
          {draft.type}
        </span>
      </div>

      <div className="grid gap-3">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <label className="grid gap-1 text-xs font-semibold">
            시작
            <TimeSelect
              value={draft.startTime.slice(0, 5)}
              onChange={(value) => updateDraft("startTime", `${value}:00`)}
            />
          </label>
          <span className="mt-5 text-slate-500">-</span>
          <label className="grid gap-1 text-xs font-semibold">
            종료
            <TimeSelect
              value={draft.endTime.slice(0, 5)}
              onChange={(value) => updateDraft("endTime", `${value}:00`)}
            />
          </label>
        </div>

        <label className="grid gap-1 text-xs font-semibold">
          제목
          <input
            value={draft.title}
            required
            maxLength={100}
            onChange={(event) => updateDraft("title", event.target.value)}
            className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-normal"
          />
        </label>

        <label className="grid gap-1 text-xs font-semibold">
          내용
          <textarea
            value={draft.description ?? ""}
            maxLength={500}
            onChange={(event) => updateDraft("description", event.target.value)}
            className="h-24 resize-none rounded-2xl border border-slate-200 px-3 py-2 text-sm font-normal"
            placeholder="설명 없음"
          />
        </label>

        <div className="flex justify-between gap-2 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={deleteItem}
            disabled={isSubmitting}
            className="rounded-2xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
          >
            삭제
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-600 disabled:opacity-60"
          >
            저장
          </button>
        </div>
      </div>
    </form>
  );
}

function TimeSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [hour, minute] = snapTimeToFiveMinutes(value).split(":");

  return (
    <div className="grid grid-cols-[1fr_1fr] gap-1">
      <select
        aria-label="시"
        value={hour}
        onChange={(event) => onChange(`${event.target.value}:${minute}`)}
        className="min-w-0 rounded-2xl border border-slate-200 bg-white px-2 py-1 text-sm font-normal"
      >
        {Array.from({ length: 24 }, (_, index) =>
          String(index).padStart(2, "0"),
        ).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <select
        aria-label="분"
        value={minute}
        onChange={(event) => onChange(`${hour}:${event.target.value}`)}
        className="min-w-0 rounded-2xl border border-slate-200 bg-white px-2 py-1 text-sm font-normal"
      >
        {Array.from({ length: 12 }, (_, index) =>
          String(index * 5).padStart(2, "0"),
        ).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function timeToMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function snapTimeToFiveMinutes(time: string) {
  const totalMinutes = timeToMinutes(time);
  const snappedMinutes = Math.round(totalMinutes / 5) * 5;
  const normalizedMinutes = snappedMinutes % (24 * 60);
  const hour = Math.floor(normalizedMinutes / 60);
  const minute = normalizedMinutes % 60;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function normalizeEndMinutes(start: number, end: number) {
  return end <= start ? end + 24 * 60 : end;
}

function isMinuteWithinRange(current: number, start: number, end: number) {
  const normalizedCurrent = current < start ? current + 24 * 60 : current;
  return normalizedCurrent >= start && normalizedCurrent < end;
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
    FIXED_SCHEDULE: "#2563eb",
    GOAL_WORK: "#0f766e",
    BREAK: "#64748b",
  }[type];
}

function truncateLabel(title: string, durationMinutes: number) {
  const maxLength = durationMinutes >= 120 ? 10 : 6;
  return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title;
}
