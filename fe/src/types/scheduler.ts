export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
};

export type AuthUser = {
  userId: number;
  name: string;
  email: string;
  profileImageUrl?: string | null;
  provider?: "KAKAO" | "GOOGLE";
};

export type GoalPriority = "LOW" | "MEDIUM" | "HIGH";
export type GoalStatus = "ACTIVE" | "COMPLETED" | "INACTIVE";
export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";
export type ScheduleCategory =
  | "CLASS"
  | "STUDY"
  | "EXERCISE"
  | "WORK"
  | "MEETING"
  | "PERSONAL"
  | "OTHER";
export type ScheduleItemType = "FIXED_SCHEDULE" | "GOAL_WORK" | "BREAK";
export type EmotionState = "VERY_BAD" | "BAD" | "NEUTRAL" | "GOOD" | "VERY_GOOD";
export type EnergyPattern =
  | "MORNING_TYPE"
  | "AFTERNOON_TYPE"
  | "EVENING_TYPE"
  | "IRREGULAR";

export type Goal = {
  goalId: number;
  title: string;
  description: string | null;
  priority: GoalPriority;
  status: GoalStatus;
  targetDate: string | null;
};

export type FixedSchedule = {
  fixedScheduleId: number;
  dayOfWeek: DayOfWeek;
  title: string;
  category: ScheduleCategory;
  startTime: string;
  endTime: string;
  mandatory: boolean;
};

export type ScheduleItem = {
  type: ScheduleItemType;
  title: string;
  startTime: string;
  endTime: string;
  goalId: number | null;
  fixedScheduleId: number | null;
  description: string | null;
};

export type GeneratedSchedule = {
  date: string;
  sessionMinutes: number;
  breakMinutes: number;
  items: ScheduleItem[];
};

export type ConfirmedSchedule = {
  confirmedScheduleId: number;
  date: string;
  items: Array<ScheduleItem & { scheduleItemId: number; sequence: number }>;
};

export type ConditionForm = {
  fatigueLevel: number;
  focusLevel: number;
  emotionState: EmotionState;
  memo: string;
};

export type GoalForm = {
  title: string;
  description: string;
  priority: GoalPriority;
  targetDate: string;
};

export type FixedScheduleForm = {
  dayOfWeek: DayOfWeek;
  title: string;
  category: ScheduleCategory;
  startTime: string;
  endTime: string;
  mandatory: boolean;
};

export type FeedbackForm = {
  satisfactionScore: number;
  rawFeedback: string;
};

export type SchedulingProfileForm = {
  preferredStartTime: string;
  preferredEndTime: string;
  wakeUpTime: string;
  sleepTime: string;
  energyPattern: EnergyPattern;
  preferredSessionMinutes: number;
  breakMinutes: number;
};

export type SchedulingProfile = SchedulingProfileForm & {
  schedulingProfileId: number;
};
