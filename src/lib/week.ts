/** Returns the ISO date ("YYYY-MM-DD") of the Monday of the week containing `date`. */
export function getCurrentWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day; // shift back to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

/** Human-readable label like "June 29 – July 5, 2026" for the week starting at `weekStart`. */
export function formatWeekLabel(weekStart: string): string {
  const start = new Date(weekStart + "T00:00:00");
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const startStr = start.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  if (sameMonth) {
    return `${startStr}\u2013${end.getDate()}, ${end.getFullYear()}`;
  }
  const endStr = end.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  return `${startStr} \u2013 ${endStr}`;
}