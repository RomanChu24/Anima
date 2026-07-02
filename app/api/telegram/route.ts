import { NextRequest, NextResponse } from "next/server";
import { generateReading } from "@/lib/generateReading";
import { saveUser, getUser, deleteUser } from "@/lib/kv";

export const maxDuration = 60;

const TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const API = `https://api.telegram.org/bot${TOKEN}`;

async function sendMessage(chatId: number, text: string, parseMode = "HTML") {
  await fetch(`${API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: parseMode }),
  });
}

// Parse: "Имя, ДД.ММ.ГГГГ, ЧЧ:ММ, Город" or "Имя, ДД.ММ.ГГГГ, не знаю, Город"
function parseData(text: string) {
  const parts = text.split(",").map((s) => s.trim());
  if (parts.length < 3) return null;
  const [name, date, timeOrNo, ...cityParts] = parts;
  if (!/^\d{2}\.\d{2}\.\d{4}$/.test(date)) return null;
  const time = timeOrNo.toLowerCase() === "не знаю" ? "" : timeOrNo;
  const city = cityParts.join(", ") || "";
  return { name, date, time, city };
}

async function handleUpdate(update: any) {
  const msg = update.message;
  if (!msg?.text) return;

  const chatId: number = msg.chat.id;
  const text: string = msg.text.trim();

  // /stop - unsubscribe from weekly digests
  if (text === "/stop") {
    try { await deleteUser(chatId); } catch {}
    await sendMessage(
      chatId,
      "✦ Ты отписана от еженедельных дайджестов.\n\nВозвращайся когда захочешь - напиши /start"
    );
    return;
  }

  // /start [from_web]
  if (text === "/start" || text.startsWith("/start ")) {
    const fromWeb = text.includes("from_web");

    let existing = null;
    try { existing = await getUser(chatId); } catch {}

    if (existing) {
      await sendMessage(
        chatId,
        `✦ <b>С возвращением, ${existing.name}!</b>\n\nТвоя карта сохранена. Каждый понедельник получаешь персональный дайджест.\n\nХочешь обновить данные? Пришли снова:\n<code>Имя, ДД.ММ.ГГГГ, ЧЧ:ММ, Город</code>`
      );
    } else if (fromWeb) {
      await sendMessage(
        chatId,
        `✦ <b>Привет, я Anima</b>\n\nТы только что увидела свою карту на сайте. Сохраним её - и каждый понедельник ты будешь получать персональный дайджест.\n\nПришли данные:\n<code>Имя, ДД.ММ.ГГГГ, ЧЧ:ММ, Город</code>\n\n<i>Пример: Мария, 15.03.1995, 14:30, Москва</i>`
      );
    } else {
      await sendMessage(
        chatId,
        `✦ <b>Привет, я Anima</b>\n\nТвой персональный компаньон по натальной карте.\n\nПришли данные одним сообщением:\n<code>Имя, ДД.ММ.ГГГГ, ЧЧ:ММ, Город</code>\n\nЕсли не знаешь время рождения:\n<code>Имя, ДД.ММ.ГГГГ, не знаю, Город</code>\n\n<i>Пример: Мария, 15.03.1995, 14:30, Москва</i>`
      );
    }
    return;
  }

  const data = parseData(text);
  if (data) {
    await sendMessage(chatId, "✦ Составляю твою карту, подожди немного...");

    const [d, m, y] = data.date.split(".");
    const isoDate = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    const currentDate = new Date().toISOString().split("T")[0];

    try {
      const reading = await generateReading({
        name: data.name,
        date: isoDate,
        time: data.time,
        city: data.city,
        currentDate,
      });

      // Save user for weekly digests (silent fail if KV not configured)
      try {
        await saveUser({
          telegramId: chatId,
          name: data.name,
          birthDate: isoDate,
          birthTime: data.time,
          city: data.city,
          createdAt: new Date().toISOString(),
        });
      } catch {}

      const response =
        `✦ <b>Натальная карта ${reading.name}</b>\n\n` +
        `☀ <b>${reading.sun.title}</b>\n<i>${reading.sun.subtitle}</i>\n${reading.sun.text}\n\n` +
        `☽ <b>${reading.moon.title}</b>\n<i>${reading.moon.subtitle}</i>\n${reading.moon.text}\n\n` +
        `↑ <b>${reading.rising.title}</b>\n<i>${reading.rising.subtitle}</i>\n${reading.rising.text}\n\n` +
        `✦ <b>${reading.energy.title}</b>\n<i>${reading.energy.subtitle}</i>\n${reading.energy.text}`;

      await sendMessage(chatId, response);
      await sendMessage(
        chatId,
        `🗓 <b>Каждый понедельник</b> ты будешь получать персональный дайджест - бесплатно.\n\nТвои данные сохранены ✦\n\nЕсли захочешь поддержать проект:\n<a href="https://web.tribute.tg/s/Zxn">Подписка 399 ₽/мес</a>\n\nОтписаться: /stop`
      );
    } catch {
      await sendMessage(chatId, "Что-то пошло не так. Попробуй ещё раз - напиши /start");
    }
    return;
  }

  await sendMessage(
    chatId,
    `Напиши /start чтобы начать ✦\n\nИли пришли данные в формате:\n<code>Имя, ДД.ММ.ГГГГ, ЧЧ:ММ, Город</code>`
  );
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
