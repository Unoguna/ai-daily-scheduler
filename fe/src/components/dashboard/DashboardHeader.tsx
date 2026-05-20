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
    <header className="flex flex-col gap-4 border-b border-[#d7d9cf] pb-5 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-sm font-semibold text-[#577060]">Haru Planner</p>
        <h1 className="text-3xl font-bold">하루 일정 코치</h1>
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
        onClick={toggleProfileMenu}
        className="flex items-center gap-3 rounded-md border border-[#c8cbbf] bg-white px-3 py-2 text-left shadow-sm transition hover:bg-[#f6f7f2]"
      >
        <Avatar
          name={user.name}
          profileImageUrl={user.profileImageUrl}
          initial={initial}
        />
        <div className="min-w-0">
          <p className="max-w-36 truncate text-sm font-bold text-[#243528]">
            {user.name}님
          </p>
          <p className="max-w-36 truncate text-xs text-[#66705f]">
            {user.email}
          </p>
        </div>
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-40 mt-2 w-[min(300px,calc(100vw-40px))] rounded-md border border-[#d7d9cf] bg-[#fbfcf7] p-4 shadow-lg">
          <div className="flex flex-col gap-2">
            <Link
              href="/profile"
              className="block rounded-md border border-[#aeb4a5] px-4 py-2 text-center text-sm font-semibold transition hover:bg-white"
            >
              개인정보 수정
            </Link>
            <Link
              href="/goals/new"
              className="block rounded-md border border-[#aeb4a5] px-4 py-2 text-center text-sm font-semibold transition hover:bg-white"
            >
              목표 관리
            </Link>
            <Link
              href="/fixed-schedules/new"
              className="block rounded-md border border-[#aeb4a5] px-4 py-2 text-center text-sm font-semibold transition hover:bg-white"
            >
              고정 일정 관리
            </Link>
          </div>

          <button
            type="button"
            onClick={logout}
            className="mt-4 w-full rounded-md border border-[#d6a2a2] px-4 py-2 text-sm font-semibold text-[#612b2b] transition hover:bg-[#fff7f7]"
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
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#577060] text-sm font-bold text-white">
        {initial}
      </div>
    );
  }

  return (
    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#d7d9cf] bg-white">
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
