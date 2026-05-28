"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Input,
  Panel,
  Select,
  SubmitButton,
} from "@/components/dashboard/FormControls";
import { request } from "@/lib/schedulerApi";
import type {
  AuthUser,
  EnergyPattern,
  SchedulingProfile,
  SchedulingProfileForm,
} from "@/types/scheduler";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [name, setName] = useState("");
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
  const [toast, setToast] = useState<{
    message: string;
    type: "loading" | "success" | "error";
  } | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const savedToken = localStorage.getItem("accessToken");
      if (!savedToken) {
        router.replace("/login");
        return;
      }

      try {
        const me = await request<AuthUser>("/api/v1/users/me");
        setUser(me);
        setName(me.name);

        const schedulingProfile =
          await request<SchedulingProfile | null>(
            "/api/v1/schedules/scheduling-profile",
          );
        if (schedulingProfile) {
          setScheduleProfileForm({
            preferredStartTime: schedulingProfile.preferredStartTime,
            preferredEndTime: schedulingProfile.preferredEndTime,
            wakeUpTime: schedulingProfile.wakeUpTime,
            sleepTime: schedulingProfile.sleepTime,
            energyPattern: schedulingProfile.energyPattern,
            preferredSessionMinutes: schedulingProfile.preferredSessionMinutes,
            breakMinutes: schedulingProfile.breakMinutes,
          });
          setHasSchedulingProfile(true);
        }
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        router.replace("/login");
      }
    };

    void loadProfile();
  }, [router]);

  useEffect(() => {
    if (!toast || toast.type === "loading") return;

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const changeProfileImage = (file: File | null) => {
    setProfileImageFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const submitProfile = (event: FormEvent) => {
    event.preventDefault();

    void run(async () => {
      if (!user) return;

      const nextUser = { ...user };
      const trimmedName = name.trim();

      if (trimmedName && trimmedName !== user.name) {
        const response = await request<{ userId: number; name: string }>(
          "/api/v1/users/me/name",
          {
            method: "PATCH",
            body: JSON.stringify({ name: trimmedName }),
          },
        );
        nextUser.name = response.name;
      }

      if (profileImageFile) {
        const formData = new FormData();
        formData.append("file", profileImageFile);

        const response = await request<{
          userId: number;
          profileImageUrl: string;
        }>("/api/v1/users/me/profile-image", {
          method: "PATCH",
          body: formData,
        });
        nextUser.profileImageUrl = response.profileImageUrl;
      }

      setUser(nextUser);
      setName(nextUser.name);
      setProfileImageFile(null);
      setPreviewUrl(null);
    }, "개인정보를 수정했습니다.");
  };

  const submitSchedulingProfile = (event: FormEvent) => {
    event.preventDefault();

    void run(async () => {
      const method = hasSchedulingProfile ? "PUT" : "POST";
      await request<{ id: number } | SchedulingProfile>(
        "/api/v1/schedules/scheduling-profile",
        {
          method,
          body: JSON.stringify(scheduleProfileForm),
        },
      );
      setHasSchedulingProfile(true);
    }, "스케줄링 프로필을 저장했습니다.");
  };

  const run = async (action: () => Promise<void>, successMessage: string) => {
    setToast({ message: "처리 중...", type: "loading" });
    try {
      await action();
      setToast({ message: successMessage, type: "success" });
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : "요청에 실패했습니다.",
        type: "error",
      });
    }
  };

  const imageUrl = previewUrl ?? resolveImageUrl(user?.profileImageUrl);
  const initial = user?.name.trim().slice(0, 1).toUpperCase() || "?";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm shadow-slate-200/70 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Haru Planner
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">개인정보 수정</h1>
          </div>
          <Link
            href="/"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-semibold shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            대시보드로
          </Link>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-6 flex items-center gap-4">
            <ProfileImage imageUrl={imageUrl} initial={initial} />
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-slate-950">
                {user ? `${user.name}님` : "사용자 정보를 불러오는 중"}
              </p>
              <p className="truncate text-sm text-slate-500">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={submitProfile} className="flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              이름
              <input
                value={name}
                maxLength={20}
                required
                onChange={(event) => setName(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 font-normal shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              프로필 사진
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={(event) =>
                  changeProfileImage(event.target.files?.[0] ?? null)
                }
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 font-normal shadow-sm file:mr-3 file:rounded-2xl file:border-0 file:bg-blue-600 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-white"
              />
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <Link
                href="/"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={!user}
                className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50"
              >
                저장
              </button>
            </div>
          </form>
        </section>

        <Panel title="스케줄링 프로필">
          <form
            onSubmit={submitSchedulingProfile}
            className="flex flex-col gap-4"
          >
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                label="선호 시작"
                type="time"
                value={scheduleProfileForm.preferredStartTime.slice(0, 5)}
                onChange={(value) =>
                  setScheduleProfileForm((form) => ({
                    ...form,
                    preferredStartTime: `${value}:00`,
                  }))
                }
              />
              <Input
                label="선호 종료"
                type="time"
                value={scheduleProfileForm.preferredEndTime.slice(0, 5)}
                onChange={(value) =>
                  setScheduleProfileForm((form) => ({
                    ...form,
                    preferredEndTime: `${value}:00`,
                  }))
                }
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Input
                label="기상"
                type="time"
                value={scheduleProfileForm.wakeUpTime.slice(0, 5)}
                onChange={(value) =>
                  setScheduleProfileForm((form) => ({
                    ...form,
                    wakeUpTime: `${value}:00`,
                  }))
                }
              />
              <Input
                label="취침"
                type="time"
                value={scheduleProfileForm.sleepTime.slice(0, 5)}
                onChange={(value) =>
                  setScheduleProfileForm((form) => ({
                    ...form,
                    sleepTime: `${value}:00`,
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
              <SubmitButton label="스케줄링 프로필 저장" />
            </div>
          </form>
        </Panel>

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
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="rounded-2xl border border-slate-200 bg-white px-3 py-2 font-normal"
      />
    </label>
  );
}

function ProfileImage({
  imageUrl,
  initial,
}: {
  imageUrl: string | null;
  initial: string;
}) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);

  if (!imageUrl || failedImageUrl === imageUrl) {
    return (
      <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
        {initial}
      </div>
    );
  }

  return (
    <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt="프로필 사진"
        className="size-full object-cover"
        onError={() => setFailedImageUrl(imageUrl)}
      />
    </div>
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

function resolveImageUrl(profileImageUrl?: string | null) {
  if (!profileImageUrl) return null;
  if (
    profileImageUrl.startsWith("http://") ||
    profileImageUrl.startsWith("https://") ||
    profileImageUrl.startsWith("blob:")
  ) {
    return profileImageUrl;
  }

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
  return `${apiBaseUrl}${profileImageUrl}`;
}
