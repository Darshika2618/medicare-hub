/**
 * Backend client utilities for MediSafe.
 * Provides helpers for converting between frontend types and backend candid types.
 */

// Convert nanosecond timestamps (bigint) to JS Date
export function nsToDate(ns: bigint): Date {
  return new Date(Number(ns / 1_000_000n));
}

// Convert JS Date to nanosecond timestamp (bigint)
export function dateToNs(date: Date): bigint {
  return BigInt(date.getTime()) * 1_000_000n;
}

// Format a nanosecond timestamp to a readable date string
export function formatDate(
  ns: bigint,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = nsToDate(ns);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  });
}

// Format a nanosecond timestamp to a readable time string
export function formatTime(ns: bigint): string {
  const date = nsToDate(ns);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Format "HH:MM" to 12-hour display "9:00 AM"
export function formatScheduledTime(time: string): string {
  const [hourStr, minuteStr] = time.split(":");
  const hour = Number.parseInt(hourStr, 10);
  const minute = minuteStr || "00";
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute} ${period}`;
}

// Get today at midnight in nanoseconds
export function todayStartNs(): bigint {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dateToNs(today);
}

// Check if a nanosecond timestamp is today
export function isToday(ns: bigint): boolean {
  const date = nsToDate(ns);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

// Check if a nanosecond timestamp is in the past
export function isPast(ns: bigint): boolean {
  return nsToDate(ns) < new Date();
}

// Check if a nanosecond timestamp is within the next N days
export function isWithinDays(ns: bigint, days: number): boolean {
  const date = nsToDate(ns);
  const limit = new Date();
  limit.setDate(limit.getDate() + days);
  return date <= limit && date >= new Date();
}

// Get relative time label e.g. "Today", "Tomorrow", "In 3 days", "Oct 25"
export function getRelativeDateLabel(ns: bigint): string {
  const date = nsToDate(ns);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Compare "HH:MM" time strings to current time
export function isTimeInPast(time: string): boolean {
  const [hourStr, minuteStr] = time.split(":");
  const now = new Date();
  const scheduled = new Date();
  scheduled.setHours(
    Number.parseInt(hourStr, 10),
    Number.parseInt(minuteStr || "0", 10),
    0,
    0,
  );
  return scheduled < now;
}

export function isTimeUpcoming(time: string, windowMinutes = 30): boolean {
  const [hourStr, minuteStr] = time.split(":");
  const now = new Date();
  const scheduled = new Date();
  scheduled.setHours(
    Number.parseInt(hourStr, 10),
    Number.parseInt(minuteStr || "0", 10),
    0,
    0,
  );
  const diff = scheduled.getTime() - now.getTime();
  return diff > 0 && diff <= windowMinutes * 60 * 1000;
}
