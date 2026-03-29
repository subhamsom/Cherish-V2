const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** Display a Postgres DATE string (YYYY-MM-DD) as e.g. "14 Mar 2025" (no leading zero on day). */
export function formatMemoryDate(yyyyMmDd: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(yyyyMmDd.trim());
  if (!match) return yyyyMmDd;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  if (monthIndex < 0 || monthIndex > 11) return yyyyMmDd;
  return `${day} ${MONTHS_SHORT[monthIndex]} ${year}`;
}

/** Today's date in local timezone as YYYY-MM-DD (for <input type="date">). */
export function todayIsoDateLocal() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** UTC calendar date from an ISO timestamp, as YYYY-MM-DD. */
export function isoDateFromCreatedAt(createdAt: string) {
  const date = new Date(createdAt);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  return `${date.getUTCDate()} ${month} ${date.getUTCFullYear()}`;
}

