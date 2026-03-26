export function formatDate(dateString: string) {
  const date = new Date(dateString);
  const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  return `${date.getUTCDate()} ${month} ${date.getUTCFullYear()}`;
}

