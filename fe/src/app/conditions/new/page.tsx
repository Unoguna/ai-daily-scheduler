"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { today, isScheduleDate } from "@/lib/schedulerApi";

export default function DailyConditionPage() {
  const router = useRouter();
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("date");
    const date = isScheduleDate(requested) ? requested : today();
    router.replace(`/schedules/generate?date=${encodeURIComponent(date)}`);
  }, [router]);
  return <main className="p-6 text-sm text-slate-600">일정 생성 화면으로 이동 중...</main>;
}
