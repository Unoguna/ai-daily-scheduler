"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input, Panel, Select } from "@/components/dashboard/FormControls";
import { request } from "@/lib/schedulerApi";
import type { EnergyPattern, SchedulingProfile, SchedulingProfileForm } from "@/types/scheduler";

export default function SchedulingProfilePage() {
  const router = useRouter();
  const [scheduleProfileForm, setScheduleProfileForm] =
    useState<SchedulingProfileForm>({
      preferredStartTime: "09:00:00",
      preferredEndTime: "22:00:00",
      wakeUpTime: "07:30:00",
      sleepTime: "23:30:00",
      energyPattern: "MORNING_TYPE",
      preferredSessionMinutes: 50,
      breakMinutes: 10,
    });
  const [hasSchedulingProfile, setHasSchedulingProfile] = useState(false);

  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: "loading" | "success" | "error" } | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      router.replace("/login");
      return;
    }
    let active = true;
    request<SchedulingProfile | null>("/api/v1/schedules/scheduling-profile")
      .then(profile => {
        if (!active) return;
        if (profile) {
          setScheduleProfileForm({
            preferredStartTime: profile.preferredStartTime,
            preferredEndTime: profile.preferredEndTime,
            wakeUpTime: profile.wakeUpTime,
            sleepTime: profile.sleepTime,
            energyPattern: profile.energyPattern,
            preferredSessionMinutes: profile.preferredSessionMinutes,
            breakMinutes: profile.breakMinutes,
          });
        }
        setHasSchedulingProfile(Boolean(profile));
        setLoaded(true);
        setToast(null);
      })
      .catch(error => {
        if (active) setToast({ type: "error", message: error instanceof Error ? error.message : "설정을 불러오지 못했습니다." });
      });
    return () => { active = false; };
  }, [router, attempt]);

  const submitSchedulingProfile = async (event: FormEvent) => {
    event.preventDefault();
    if (!loaded || saving) return;
    setSaving(true);
    setToast(null);
    try {
      await request("/api/v1/schedules/scheduling-profile", {
        method: hasSchedulingProfile ? "PUT" : "POST",
        body: JSON.stringify(scheduleProfileForm),
      });
      setHasSchedulingProfile(true);
      router.replace("/");
    } catch (error) {
      setToast({ type: "error", message: error instanceof Error ? error.message : "저장에 실패했습니다." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-blue-600">Haru Planner</p>
          <h1 className="mt-2 text-2xl font-semibold">나에게 맞는 하루 설정</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">일정을 만들기 전에 생활 패턴을 알려주세요. 저장한 설정은 이후에도 수정할 수 있습니다.</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">취침·선호 종료 시간이 시작 시간보다 이르면 자정을 넘는 구간으로 처리합니다. 일정은 선택한 날짜의 00:00~23:59 기준이며, 새벽 일정도 해당 날짜에 표시합니다.</p>
          {hasSchedulingProfile && <Link href="/" className="mt-4 inline-block text-sm text-blue-600 underline">대시보드로</Link>}
        </header>
        {!loaded ? (
          <section className="rounded-2xl bg-white p-6" aria-live="polite">
            {toast?.type === "error" ? <button type="button" onClick={() => { setToast(null); setAttempt(value => value + 1); }} className="text-blue-600 underline">설정 다시 불러오기</button> : "설정을 불러오는 중..."}
          </section>
        ) : (
        <Panel title="스케줄링 프로필">
          <form
            onSubmit={submitSchedulingProfile}
            className="flex flex-col gap-4"
          >
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                label="선호 시작"
                type="time"
                required
                value={scheduleProfileForm.preferredStartTime.slice(0, 5)}
                onChange={(value) =>
                  setScheduleProfileForm((form) => ({
                    ...form,
                    preferredStartTime: value ? `${value}:00` : "",
                  }))
                }
              />
              <Input
                label="선호 종료"
                type="time"
                required
                value={scheduleProfileForm.preferredEndTime.slice(0, 5)}
                onChange={(value) =>
                  setScheduleProfileForm((form) => ({
                    ...form,
                    preferredEndTime: value ? `${value}:00` : "",
                  }))
                }
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Input
                label="기상"
                type="time"
                required
                value={scheduleProfileForm.wakeUpTime.slice(0, 5)}
                onChange={(value) =>
                  setScheduleProfileForm((form) => ({
                    ...form,
                    wakeUpTime: value ? `${value}:00` : "",
                  }))
                }
              />
              <Input
                label="취침"
                type="time"
                required
                value={scheduleProfileForm.sleepTime.slice(0, 5)}
                onChange={(value) =>
                  setScheduleProfileForm((form) => ({
                    ...form,
                    sleepTime: value ? `${value}:00` : "",
                  }))
                }
              />
            </div>

            <Select
              label="에너지 패턴"
              value={scheduleProfileForm.energyPattern}
              options={[
                "MORNING_TYPE",
                "AFTERNOON_TYPE",
                "EVENING_TYPE",
                "IRREGULAR",
              ]}
              onChange={(value) =>
                setScheduleProfileForm((form) => ({
                  ...form,
                  energyPattern: value as EnergyPattern,
                }))
              }
            />

            <div className="grid gap-3 md:grid-cols-2">
              <MinuteField
                label="집중 시간"
                min={10}
                max={300}
                value={scheduleProfileForm.preferredSessionMinutes}
                onChange={(value) =>
                  setScheduleProfileForm((form) => ({
                    ...form,
                    preferredSessionMinutes: value,
                  }))
                }
              />
              <MinuteField
                label="휴식 시간"
                min={0}
                max={180}
                value={scheduleProfileForm.breakMinutes}
                onChange={(value) =>
                  setScheduleProfileForm((form) => ({
                    ...form,
                    breakMinutes: value,
                  }))
                }
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="submit" disabled={saving} className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{saving ? "저장 중..." : "저장하고 시작하기"}</button>
            </div>
          </form>
        </Panel>

        )}
        <StatusToast toast={toast} />
      </div>
    </main>
  );
}

function MinuteField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold">
      {label}
      <input
        type="number"
        required
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="rounded-2xl border border-slate-200 bg-white px-3 py-2 font-normal"
      />
    </label>
  );
}


function StatusToast({
  toast,
}: {
  toast: {
    message: string;
    type: "loading" | "success" | "error";
  } | null;
}) {
  if (!toast) return null;

  const colorClass = {
    loading: "border-slate-200 bg-white text-slate-950",
    success: "border-emerald-200 bg-emerald-50 text-slate-950",
    error: "border-red-200 bg-red-50 text-red-700",
  }[toast.type];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-5 right-5 z-50 max-w-[calc(100vw-40px)] rounded-2xl border px-4 py-3 text-sm font-semibold shadow-lg md:max-w-sm ${colorClass}`}
    >
      {toast.message}
    </div>
  );
}

