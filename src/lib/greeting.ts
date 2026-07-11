/** "Good morning" / "Good afternoon" / "Good evening" based on the current local hour. */
export function getTimeOfDayGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/**
 * Best-effort first name for a greeting. Prefers a real display name if set;
 * otherwise derives one from the email's local part (e.g. "dora@ambi-tech.rw" -> "Dora",
 * "dora.uwase@ambi-tech.rw" -> "Dora").
 */
export function getFirstName(displayName?: string | null, email?: string | null): string {
  if (displayName && displayName.trim()) {
    return displayName.trim().split(/\s+/)[0];
  }
  if (email) {
    const local = email.split("@")[0];
    const first = local.split(/[._-]/)[0];
    if (first) return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
  }
  return "there";
}