import { NextRequest, NextResponse } from "next/server";
import { generateReading } from "@/lib/generateReading";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const API = `https://api.telegram.org/bot${TOKEN}`;

// Temporary in-memory state for multi-step dialog (resets on cold start)
// Replace with Vercel KV in Phase 3
const userState = new Map<number, { step: string; name?: string; date?: string; time?: string }>();

async function sendMessage(chatId: number, text: string, parseMode = "HTML") {
  await fetch(`${API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: parseMode }),
  });
}

async function handleUpdate(update: any) {
  const msg = update.message;
  if (!msg?.text) return;

  const chatId: number = msg.chat.id;
  const text: string = msg.text.trim();
  const state = userState.get(chatId) || { step: "idle" };

  if (text === "/start") {
    userState.set(chatId, { step: "ask_name" });
    await sendMessage(
      chatId,
      `✦ <b>Привет, я Anima</b>\n\nТвой персональный компаньон по натальной карте.\n\nКак тебя зовут?`
    );
    return;
  }

  if (state.step === "ask_name") {
    userState.set(chatId, { ...state, step: "ask_date", name: text });
    await sendMessage(chatId, `Приятно познакомиться, ${text} ✦\n\nВведи дату рождения в формате <b>ДД.ММ.ГГГГ</b>`);
    return;
  }

  if (state.step === "ask_date") {
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(text)) {
      await sendMessage(chatId, "Введи дату в формате <b>ДД.ММ.ГГГГ</b>, например 15.03.1995");
      return;
    }
    userState.set(chatId, { ...state, step: "ask_time", date: text });
    await sendMessage(chatId, "Время рождения в формате <b>ЧЧ:ММ</b> — если знаешь.\n\nЕсли нет, напиши <b>не знаю</b>");
    return;
  }

  if (state.step === "ask_time") {
    const time = text.toLowerCase() === "не знаю" ? "" : text;
    userState.set(chatId, { ...state, step: "ask_city", time });
    await sendMessage(chatId, "Город рождения?");
    return;
  }

  if (state.step === "ask_city") {
    const city = text;
    const { name = "", date = "", time = "" } = state;
    userState.set(chatId, { step: "idle" });

    await sendMessage(chatId, "✦ Составляю твою карту, подожди немного...");

    const [d, m, y] = date.split(".");
    const isoDate = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;

    try {
      const reading = await generateReading({ name, date: isoDate, time, city });

      const response = `✦ <b>Натальная карта ${reading.name}</b>\n\n` +
        `☀ <b>${reading.sun.title}</b>\n<i>${reading.sun.subtitle}</i>\n${reading.sun.text}\n\n` +
        `☽ <b>${reading.moon.title}</b>\n<i>${reading.moon.subtitle}</i>\n${reading.moon.text}\n\n` +
        `↑ <b>${reading.rising.title}</b>\n<i>${reading.rising.subtitle}</i>\n${reading.rising.text}\n\n` +
        `✦ <b>${reading.energy.title}</b>\n<i>${reading.energy.subtitle}</i>\n${reading.energy.text}`;

      await sendMessage(chatId, response);
      await sendMessage(
        chatId,
        `\nЧтобы получать персональный дайджест каждую неделю — оформи подписку:\n<a href="https://web.tribute.tg/s/Zxn">Подписаться за 399 ₽/мес</a>`
      );
    } catch {
      await sendMessage(chatId, "Что-то пошло не так. Попробуй ещё раз — напиши /start");
    }
    return;
  }

  await sendMessage(chatId, "Напиши /start чтобы начать ✦");
}

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    await handleUpdate(update);
  } catch {
    // silent
  }
  return NextResponse.json({ ok: true });
}
