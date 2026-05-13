import type { ApiResponse } from "@/types/scheduler";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export const today = () => new Date().toISOString().slice(0, 10);

export async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok || body?.success === false) {
    throw new Error(body?.message ?? text ?? "Request failed");
  }

  return (body as ApiResponse<T>).data;
}
