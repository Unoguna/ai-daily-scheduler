export function shiftCalendarDate(date: string, days: number): string {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function calendarWeek(date: string) {
  const day = new Date(`${date}T12:00:00Z`).getUTCDay();
  const start = shiftCalendarDate(date, -((day + 6) % 7));
  return { start, end: shiftCalendarDate(start, 6) };
}
