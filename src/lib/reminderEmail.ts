export type ReminderEmailItem = {
  title: string;
  date: string;
  note: string | null;
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatReminderDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return dateStr;
  }
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function renderReminderBlock(reminder: ReminderEmailItem): string {
  const title = escapeHtml(reminder.title);
  const formattedDate = escapeHtml(formatReminderDate(reminder.date));
  const note =
    reminder.note != null && reminder.note.trim() !== ""
      ? `<p style="font-family: Arial, sans-serif; font-size: 14px; color: #52525b; font-style: italic; margin: 0 0 0 0;">${escapeHtml(reminder.note.trim())}</p>`
      : "";

  return `
    <div style="margin-bottom: 24px;">
      <p style="font-family: Georgia, serif; font-size: 18px; font-weight: bold; color: #18181b; margin: 0 0 4px 0;">${title}</p>
      <p style="font-family: Arial, sans-serif; font-size: 13px; color: #a1a1aa; margin: 0 0 4px 0;">${formattedDate}</p>
      ${note}
    </div>
  `.trim();
}

export function buildReminderEmail(
  firstName: string,
  reminders: ReminderEmailItem[],
): string {
  const safeFirstName = escapeHtml(firstName);
  const reminderBlocks = reminders.map(renderReminderBlock).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cherish reminders</title>
</head>
<body style="margin: 0; padding: 0;">
  <div style="background: #fafafa; padding: 32px 16px;">
    <div style="max-width: 520px; margin: 0 auto; font-family: Arial, sans-serif;">
      <p style="font-family: Arial, sans-serif; font-size: 16px; color: #3f3f46; margin: 0 0 8px 0;">Hey ${safeFirstName},</p>
      <p style="font-family: Arial, sans-serif; font-size: 15px; color: #71717a; margin: 0 0 24px 0;">Here&apos;s what you wanted to remember today.</p>
      ${reminderBlocks}
      <div style="margin-top: 8px; margin-bottom: 32px;">
        <a href="https://cherish-moments.vercel.app/reminders?filter=due" style="background-color: #FF6B6C; color: white; padding: 12px 28px; border-radius: 100px; font-family: Arial, sans-serif; font-size: 14px; font-weight: 500; text-decoration: none; display: inline-block;">Open Cherish</a>
      </div>
      <p style="font-family: Arial, sans-serif; font-size: 12px; color: #a1a1aa; margin: 0;">Cherish — your little archive.</p>
    </div>
  </div>
</body>
</html>`;
}
