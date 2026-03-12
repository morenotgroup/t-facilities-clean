import { addMinutes, format } from "date-fns";

export function normalizeText(value: string | undefined | null) {
  return (value || "").trim();
}

export function toList(value: string | undefined | null) {
  return normalizeText(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

export function formatDateTimeBr(value: string) {
  if (!value) return "";
  return format(new Date(value), "dd/MM/yyyy HH:mm");
}

export function formatTime(value: string) {
  if (!value) return "";
  return format(new Date(value), "HH:mm");
}

export function addMinutesToTime(start: string, minutes: number) {
  const [hours, mins] = start.split(":").map(Number);
  const base = new Date();
  base.setHours(hours, mins, 0, 0);
  return format(addMinutes(base, minutes), "HH:mm");
}

export function minutesBetween(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diff = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
  return diff > 0 ? diff : 0;
}

export function getWeekParity(date = new Date()) {
  const firstJan = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - firstJan.getTime();
  const day = Math.floor(diff / 86400000);
  const week = Math.ceil((day + firstJan.getDay() + 1) / 7);
  return week % 2 === 0 ? "even" : "odd";
}

export function weekdayPt(date = new Date()) {
  return ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"][date.getDay()];
}
