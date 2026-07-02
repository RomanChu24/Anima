export interface DigestSection {
  icon: string;
  title: string;
  text: string;
}

export interface DigestResult {
  week: string;
  theme: string;
  sections: DigestSection[];
  practice: string;
}

function extractJSON(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1) return raw.slice(firstBrace, lastBrace + 1);
  return raw.trim();
}

const SYSTEM_PROMPT = `Ты - Anima, персональный астрологический компаньон.
Пишешь только на русском языке. Обращаешься на "ты", тепло и конкретно.
Задача: персональный еженедельный дайджест на основе натальной карты и текущей даты.
Используй знания о реальных транзитах планет для указанной недели.
Не предсказываешь - помогаешь увидеть паттерны и возможности этой недели.
Верни ТОЛЬКО валидный JSON без markdown-блоков, без пояснений, без \`\`\`.`;

export async function generateDigest(params: {
  name: string;
  birthDate: string;
  birthTime: string;
  city: string;
  currentDate: string;
}): Promise<DigestResult> {
  const { name, birthDate, birthTime, city, currentDate } = params;

  const key = process.env.OPENROUTER_KEY;
  if (!key || key === "your_key_here") throw new Error("OPENROUTER_KEY not set");

  const userPrompt = `Данные рождения: Имя: ${name}, Дата: ${birthDate}, Время: ${birthTime || "неизвестно"}, Город: ${city || "неизвестен"}.
Текущая дата: ${currentDate}

Верни JSON строго в этом формате (без markdown, только чистый JSON):
{
  "week": "даты этой недели (например, 7-13 июля 2026)",
  "theme": "главная тема для ${name} на эту неделю (3-5 слов)",
  "sections": [
    { "icon": "🌙", "title": "Эмоции и отношения", "text": "2-3 предложения про эмоциональный фон этой недели" },
    { "icon": "☀", "title": "Работа и цели", "text": "2-3 предложения про рабочую энергию и возможности" },
    { "icon": "✦", "title": "Внутренний мир", "text": "2-3 предложения про внутренний процесс и осознанность" }
  ],
  "practice": "Одно конкретное действие или практика на эту неделю"
}`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://anima-flame.vercel.app",
      "X-Title": "Anima",
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || "anthropic/claude-haiku-4-5",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.85,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter ${response.status}: ${err}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response");

  try {
    return JSON.parse(extractJSON(content)) as DigestResult;
  } catch {
    throw new Error(`JSON parse failed: ${content.slice(0, 200)}`);
  }
}

export function formatDigestForTelegram(digest: DigestResult): string {
  const sections = digest.sections
    .map((s) => `${s.icon} <b>${s.title}</b>\n${s.text}`)
    .join("\n\n");

  return (
    `✦ <b>Anima · ${digest.week}</b>\n\n` +
    `<i>Тема недели: ${digest.theme}</i>\n\n` +
    sections +
    `\n\n📌 <b>Практика</b>\n${digest.practice}\n\n` +
    `—\nОбновить данные: <code>Имя, ДД.ММ.ГГГГ, ЧЧ:ММ, Город</code>\nОтписаться: /stop`
  );
}
