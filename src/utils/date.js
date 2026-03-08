import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek
} from "date-fns";

export function formatDate(date, pattern = "MMM d, yyyy") {
  if (!date) return "";
  const value = typeof date === "string" ? parseISO(date) : date;
  return format(value, pattern);
}

export function isOverdue(dueDate, status) {
  if (!dueDate || status === "done") return false;
  const due = typeof dueDate === "string" ? parseISO(dueDate) : dueDate;
  return isBefore(due, new Date()) && !isToday(due);
}

export function getMonthDays(baseDate) {
  const monthStart = startOfMonth(baseDate);
  const monthEnd = endOfMonth(baseDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = [];
  let day = gridStart;
  while (!isAfter(day, gridEnd)) {
    days.push({
      date: day,
      inMonth: isSameMonth(day, monthStart),
      isToday: isToday(day)
    });
    day = addDays(day, 1);
  }
  return days;
}
