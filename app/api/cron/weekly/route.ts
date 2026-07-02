import { NextRequest, NextResponse } from "next/server";
import { getAllUsers } from "@/lib/kv";
import { generateDigest, formatDigestForTelegram } from "@/lib/generateDigest";

export const maxDuration = 60;

const TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const API = `https://api.telegram.org/bot${TOKEN}`;

async function sendMessage(chatId: number, text: string): Promise<void> {
  await fetch(`${API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let users;
  try {
    users = await getAllUsers();
  } catch {
    return NextResponse.json({ error: "KV not available" }, { status: 500 });
  }

  const currentDate = new Date().toISOString().split("T")[0];
  let sent = 0;
  let failed = 0;

  for (const user of users) {
    try {
      const digest = await generateDigest({
        name: user.name,
        birthDate: user.birthDate,
        birthTime: user.birthTime,
        city: user.city,
        currentDate,
      });
      const text = formatDigestForTelegram(digest);
      await sendMessage(user.telegramId, text);
      await new Promise((r) => setTimeout(r, 300));
      sent++;
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ ok: true, sent, failed, total: users.length });
}
