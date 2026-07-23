import { NextRequest, NextResponse } from "next/server";
import { getAllUsers, incrementDigestCount } from "@/lib/kv";
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

  const PAYMENT_URL = "https://web.tribute.tg/s/Zxn";

  for (const user of users) {
    const digestCount = user.digestCount ?? 0;
    const isPaid = user.isPaid ?? false;

    // Free users get 1 digest, then paywall
    if (!isPaid && digestCount >= 1) {
      await sendMessage(
        user.telegramId,
        `✦ <b>Твой еженедельный дайджест готов</b>\n\nТы использовала бесплатный период. Чтобы продолжать получать персональные прогнозы каждую неделю - оформи подписку:\n\n<a href="${PAYMENT_URL}">Подписка 399 ₽/мес</a>\n\nПосле оплаты дайджест придёт в следующий понедельник автоматически ✦`
      );
      await new Promise((r) => setTimeout(r, 300));
      continue;
    }

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
      await incrementDigestCount(user.telegramId);
      await new Promise((r) => setTimeout(r, 300));
      sent++;
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ ok: true, sent, failed, total: users.length });
}
