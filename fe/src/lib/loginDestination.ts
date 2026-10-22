import { request } from "@/lib/schedulerApi";
import type { SchedulingProfile } from "@/types/scheduler";

export async function getLoginDestination(): Promise<string> {
  const profile = await request<SchedulingProfile | null>(
    "/api/v1/schedules/scheduling-profile",
  );
  return profile ? "/" : "/scheduling-profile";
}
