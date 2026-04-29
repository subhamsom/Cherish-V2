export function formatReminderDate(dateStr: string, timeStr?: string | null): string {
  const date = new Date(`${dateStr}T00:00:00`);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  let label = "";
  if (date.toDateString() === today.toDateString()) label = "Today";
  else if (date.toDateString() === tomorrow.toDateString()) label = "Tomorrow";
  else label = date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  if (timeStr) {
    const parsedTime = new Date(timeStr);
    const formattedTime = Number.isNaN(parsedTime.getTime())
      ? timeStr
      : parsedTime.toLocaleTimeString("en-IN", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
    label += `, ${formattedTime}`;
  }
  return label;
}
