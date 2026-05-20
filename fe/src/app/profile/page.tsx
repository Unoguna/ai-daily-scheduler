"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { request } from "@/lib/schedulerApi";
import type { AuthUser } from "@/types/scheduler";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [name, setName] = useState("");
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "loading" | "success" | "error";
  } | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const me = await request<AuthUser>("/api/v1/users/me");
        setUser(me);
        setName(me.name);
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
    <main className="min-h-screen bg-[#f6f7f2] text-[#20231f]">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-6">
        <header className="flex flex-col gap-4 border-b border-[#d7d9cf] pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#577060]">
              Haru Planner
            </p>
            <h1 className="text-3xl font-bold">개인정보 수정</h1>
          </div>
          <Link
            href="/"
            className="rounded-md border border-[#aeb4a5] px-4 py-2 text-center text-sm font-semibold"
          >
            대시보드로
          </Link>
        </header>

        <section className="rounded-md border border-[#d7d9cf] bg-[#fbfcf7] p-5 shadow-sm">
          <div className="mb-6 flex items-center gap-4">
            <ProfileImage imageUrl={imageUrl} initial={initial} />
            <div className="min-w-0">
              <p className="truncate text-lg font-bold">
                {user ? `${user.name}님` : "사용자 정보 불러오는 중"}
              </p>
              <p className="truncate text-sm text-[#66705f]">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={submitProfile} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm font-semibold">
              이름
              <input
                value={name}
                maxLength={20}
                required
                onChange={(event) => setName(event.target.value)}
                className="rounded-md border border-[#c8cbbf] bg-white px-3 py-2 font-normal"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-semibold">
              프로필 사진
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={(event) =>
                  changeProfileImage(event.target.files?.[0] ?? null)
                }
                className="rounded-md border border-[#c8cbbf] bg-white px-3 py-2 font-normal file:mr-3 file:rounded-md file:border-0 file:bg-[#577060] file:px-3 file:py-1 file:text-sm file:font-semibold file:text-white"
              />
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <Link
                href="/"
                className="rounded-md border border-[#aeb4a5] px-4 py-2 text-sm font-semibold"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={!user}
                className="rounded-md bg-[#577060] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                저장
              </button>
            </div>
          </form>
        </section>

        <StatusToast toast={toast} />
      </div>
    </main>
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
      <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-[#577060] text-2xl font-bold text-white">
        {initial}
      </div>
    );
  }

  return (
    <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#d7d9cf] bg-white">
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
