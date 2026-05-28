"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { AuthUser } from "@/types/scheduler";

export function DashboardHeader({
  user,
  onLogout,
}: {
  user: AuthUser | null;
  onLogout: () => void;
}) {
  return (
    <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm shadow-slate-200/70 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-semibold text-blue-600">Haru Planner</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
          하루 일정 코치
        </h1>
      </div>
      {user ? <ProfileBadge user={user} onLogout={onLogout} /> : null}
    </header>
  );
}

function ProfileBadge({
  user,
  onLogout,
}: {
  user: AuthUser;
  onLogout: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const initial = user.name.trim().slice(0, 1).toUpperCase() || "?";

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const toggleProfileMenu = () => {
    setIsOpen((open) => !open);
  };

  const logout = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="프로필 메뉴 열기"
        onClick={toggleProfileMenu}
        className="flex items-center gap-2 rounded-full p-1 transition hover:bg-slate-100"
      >
        <Avatar
          name={user.name}
          profileImageUrl={user.profileImageUrl}
          initial={initial}
        />
        <span
          aria-hidden="true"
          className={`h-0 w-0 border-x-[6px] border-t-[8px] border-x-transparent border-t-slate-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-40 mt-2 w-[min(300px,calc(100vw-40px))] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/80">
          <div className="mb-4 flex items-center gap-3">
            <Avatar
              name={user.name}
              profileImageUrl={user.profileImageUrl}
              initial={initial}
            />
            <div className="min-w-0">
              <p className="max-w-44 truncate text-sm font-bold text-slate-950">
                {user.name}님
              </p>
              <p className="max-w-44 truncate text-xs text-slate-500">
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              href="/profile"
              className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-center text-sm font-semibold transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              개인정보 수정
            </Link>
            <Link
              href="/goals/new"
              className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-center text-sm font-semibold transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              목표 관리
            </Link>
            <Link
              href="/fixed-schedules/new"
              className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-center text-sm font-semibold transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              고정 일정 관리
            </Link>
          </div>

          <button
            type="button"
            onClick={logout}
            className="mt-4 w-full rounded-2xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
          >
            로그아웃
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Avatar({
  name,
  profileImageUrl,
  initial,
}: {
  name: string;
  profileImageUrl?: string | null;
  initial: string;
}) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const imageUrl = resolveImageUrl(profileImageUrl);

  if (!imageUrl || failedImageUrl === imageUrl) {
    return (
      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-base font-bold text-white shadow-sm shadow-blue-600/30">
        {initial}
      </div>
    );
  }

  return (
    <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={`${name} 프로필 사진`}
        className="size-full object-cover"
        onError={() => setFailedImageUrl(imageUrl)}
      />
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

export function DateToolbar({
  selectedDate,
  onDateChange,
  isAuthenticated,
}: {
  selectedDate: string;
  onDateChange: (date: string) => void;
  isAuthenticated: boolean;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm shadow-slate-200/60 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <label className="text-sm font-medium text-slate-700">날짜</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(event) => onDateChange(event.target.value)}
          className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        />
      </div>
      <div className="flex gap-2">
        {isAuthenticated ? null : (
          <a
            href="/login"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
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
