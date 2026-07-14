import { geocodeCity } from "./geocode";
import { calculateNatalChart, chartToPromptText } from "./astro";

export interface InsightCard {
  sign?: string;
  title: string;
  subtitle: string;
  text: string;
}

export interface ReadingResult {
  name: string;
  sun: InsightCard;
  moon: InsightCard;
  rising: InsightCard;
  mercury: InsightCard;
  mars: InsightCard;
  jupiter: InsightCard;
  saturn: InsightCard;
  energy: InsightCard;
  glossary: string;
}

const MOCK_READING: ReadingResult = {
  name: "твоя карта",
  sun: {
    sign: "Близнецы",
    title: "Солнце в Близнецах",
    subtitle: "Ядро твоей личности",
    text: "Ты живёшь интеллектом. Скучать - не твоё: мозг постоянно ищет новый стимул, идею, разговор.",
  },
  moon: {
    sign: "Скорпион",
    title: "Луна в Скорпионе",
    subtitle: "Твой эмоциональный мир",
    text: "Ты чувствуешь глубже, чем показываешь. Близкие видят спокойствие - внутри океан.",
  },
  rising: {
    sign: "Весы",
    title: "Асцендент в Весах",
    subtitle: "Как тебя видят",
    text: "Первое впечатление: уравновешенная, приятная, умеет слушать.",
  },
  mercury: {
    sign: "Телец",
    title: "Меркурий в Тельце",
    subtitle: "Как ты думаешь и говоришь",
    text: "Думаешь основательно, слова взвешиваешь. Лишнего не скажешь, но если сказала - держишь.",
  },
  mars: {
    sign: "Лев",
    title: "Марс в Льве",
    subtitle: "Твоя энергия и действие",
    text: "Действуешь с размахом. Когда что-то важно - вкладываешь всё и требуешь признания.",
  },
  jupiter: {
    sign: "Рыбы",
    title: "Юпитер в Рыбах",
    subtitle: "Где тебе везёт",
    text: "Рост через интуицию и сострадание. Помогая другим - находишь себя.",
  },
  saturn: {
    sign: "Козерог",
    title: "Сатурн в Козероге",
    subtitle: "Твои уроки и дисциплина",
    text: "Учишься через структуру и ответственность. Долгосрочная работа даётся лучше быстрых решений.",
  },
  energy: {
    title: "Энергия сейчас",
    subtitle: "Актуальный период",
    text: "Хорошее время для внутреннего анализа. Слова помогут увидеть то, что чувствовалось но не осознавалось.",
  },
  glossary: "Солнце в Близнецах - это про постоянный поиск новизны и идей. Луна в Скорпионе говорит о глубоких чувствах под спокойной поверхностью. Асцендент в Весах - то первое впечатление гармоничного человека, которое ты производишь.",
};

const SYSTEM_PROMPT = `Ты - Anima, мудрый ИИ-компаньон который читает натальные карты через психологические архетипы.
Пишешь только на русском языке. Обращайся к пользователю на "ты", тепло и напрямую.
Стиль: конкретный и тёплый, как умная подруга которая знает астрологию. Не предсказываешь - отражаешь.
Не банально, не шаблонно. Каждый текст уникален для этого человека.
Упоминай имя человека 1-2 раза в тексте каждой карточки - органично, как будто говоришь лично с ней.
Точные астрологические расчёты уже выполнены и переданы тебе - используй их. Не пересчитывай знаки самостоятельно.
Верни ТОЛЬКО валидный JSON без markdown-блоков, без пояснений, без \`\`\`.`;

function extractJSON(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1) return raw.slice(firstBrace, lastBrace + 1);
  return raw.trim();
}

export async function generateReading(params: {
  name?: string;
  date?: string;
  time?: string;
  city?: string;
  currentDate?: string;
}): Promise<ReadingResult> {
  const { name = "подруга", date = "", time = "", city = "", currentDate = "" } = params;

  const key = process.env.OPENROUTER_KEY;
  if (!key || key === "your_key_here") {
    await new Promise((r) => setTimeout(r, 2000));
    return { ...MOCK_READING, name: name || "твоя карта" };
  }

  let chartText = "";
  try {
    const geo = await geocodeCity(city);
    const chart = calculateNatalChart({
      date,
      time,
      lat: geo?.lat ?? 55.75,
      lon: geo?.lon ?? 37.62,
    });
    chartText = "\nТочные астрологические расчёты:\n" + chartToPromptText(chart, !!time);
  } catch {
    // Fall back to LLM-only if astro fails
  }

  const dateLabel = currentDate
    ? new Date(currentDate + "T12:00:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long" })
    : "прямо сейчас";

  const userPrompt = `Данные рождения: Имя: ${name}, Дата: ${date}, Время: ${time || "неизвестно"}, Город: ${city || "неизвестен"}.
Текущая дата: ${currentDate || "неизвестна"}.${chartText}

Верни JSON строго в таком формате (без markdown, только чистый JSON):
{
  "name": "${name}",
  "sun": { "sign": "знак", "title": "Солнце в [Знак]", "subtitle": "Ядро твоей личности", "text": "3-4 предложения про суть личности" },
  "moon": { "sign": "знак", "title": "Луна в [Знак]", "subtitle": "Твой эмоциональный мир", "text": "3-4 предложения про эмоциональные паттерны" },
  "rising": { "sign": "знак", "title": "Асцендент в [Знак]", "subtitle": "Как тебя видят", "text": "3-4 предложения про первое впечатление" },
  "mercury": { "sign": "знак", "title": "Меркурий в [Знак]", "subtitle": "Как ты думаешь и говоришь", "text": "3-4 предложения про стиль мышления и коммуникации" },
  "mars": { "sign": "знак", "title": "Марс в [Знак]", "subtitle": "Твоя энергия и действие", "text": "3-4 предложения про мотивацию, желания, как добиваешься целей" },
  "jupiter": { "sign": "знак", "title": "Юпитер в [Знак]", "subtitle": "Где тебе везёт", "text": "3-4 предложения про зону роста и удачи" },
  "saturn": { "sign": "знак", "title": "Сатурн в [Знак]", "subtitle": "Твои уроки и дисциплина", "text": "3-4 предложения про жизненные уроки и зону роста через усилие" },
  "energy": { "title": "Энергия сейчас", "subtitle": "${dateLabel}", "text": "3-4 предложения про актуальные транзиты этой недели" },
  "glossary": "2-3 предложения для тех, кто не знает астрологию: простыми словами объясни что означают ключевые планеты и знаки в этой карте - без терминов, без перечислений, как будто рассказываешь подруге за чашкой чая"
}`;

  const callOpenRouter = async () => {
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
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenRouter error ${response.status}: ${err}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty response from OpenRouter");

    return JSON.parse(extractJSON(content)) as ReadingResult;
  };

  try {
    return await callOpenRouter();
  } catch (err) {
    console.error("[generateReading] attempt 1 failed:", err);
    await new Promise((r) => setTimeout(r, 1500));
    return await callOpenRouter();
  }
}
