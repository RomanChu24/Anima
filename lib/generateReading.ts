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
  energy: InsightCard;
}

const MOCK_READING: ReadingResult = {
  name: "твоя карта",
  sun: {
    sign: "Близнецы",
    title: "Солнце в Близнецах",
    subtitle: "Ядро твоей личности",
    text: "Ты живёшь интеллектом. Скучать - не твоё: мозг постоянно ищет новый стимул, идею, разговор. Люди тянутся к тебе за свежим взглядом, но иногда ты сама не можешь решить что важнее. Это не непостоянство - это широта.",
  },
  moon: {
    sign: "Скорпион",
    title: "Луна в Скорпионе",
    subtitle: "Твой эмоциональный мир",
    text: "Ты чувствуешь глубже, чем показываешь. Близкие видят спокойствие - внутри океан. Предательство переживаешь долго, а преданность ценишь выше всего. Тебе нужна честность, даже если она неудобна - полуправда для тебя хуже лжи.",
  },
  rising: {
    sign: "Весы",
    title: "Асцендент в Весах",
    subtitle: "Как тебя видят",
    text: "Первое впечатление: уравновешенная, приятная, умеет слушать. Люди хотят с тобой дружить ещё не зная почему. Ты умеешь создавать комфорт вокруг себя, но иногда это дорого стоит: сложно сказать нет, когда все ждут мира.",
  },
  energy: {
    title: "Энергия сейчас",
    subtitle: "Актуальный период",
    text: "Хорошее время для внутреннего анализа - не действий, а понимания. Если что-то давно тревожит но не выходит сформулировать, попробуй написать об этом. Слова помогут увидеть то, что чувствовалось но не осознавалось.",
  },
};

const SYSTEM_PROMPT = `Ты - Anima, мудрый ИИ-компаньон который читает натальные карты через психологические архетипы.
Пишешь только на русском языке. Обращайся к пользователю на "ты", тепло и напрямую.
Стиль: конкретный и тёплый, как умная подруга которая знает астрологию. Не предсказываешь - отражаешь.
Используй принцип Барнума-Форера: специфика через астрологические плейсменты, узнаваемость через реальные паттерны.
Не банально, не шаблонно. Каждый текст уникален для этого человека.
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

  // Calculate precise natal chart positions
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
    // Fall back to LLM-only calculation if astro fails
  }

  const dateLabel = currentDate
    ? new Date(currentDate + "T12:00:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long" })
    : "прямо сейчас";

  const userPrompt = `Данные рождения: Имя: ${name}, Дата: ${date}, Время: ${time || "неизвестно"}, Город: ${city || "неизвестен"}.
Текущая дата: ${currentDate || "неизвестна"}.${chartText}

Верни JSON строго в таком формате (без markdown, только чистый JSON):
{
  "name": "${name}",
  "sun": {
    "sign": "название знака из расчётов",
    "title": "Солнце в [Знак]",
    "subtitle": "Ядро твоей личности",
    "text": "3-4 предложения - тёплый, конкретный текст про суть личности через этот знак"
  },
  "moon": {
    "sign": "название знака из расчётов",
    "title": "Луна в [Знак]",
    "subtitle": "Твой эмоциональный мир",
    "text": "3-4 предложения про эмоциональные паттерны, потребности, реакции"
  },
  "rising": {
    "sign": "название знака из расчётов (или пустая строка если неизвестен)",
    "title": "Асцендент в [Знак]",
    "subtitle": "Как тебя видят",
    "text": "3-4 предложения про первое впечатление, маску, стиль подачи себя"
  },
  "energy": {
    "title": "Энергия сейчас",
    "subtitle": "${dateLabel}",
    "text": "3-4 предложения про актуальные транзиты и то на что стоит обратить внимание на этой неделе"
  }
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
      max_tokens: 1200,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenRouter");

  try {
    return JSON.parse(extractJSON(content)) as ReadingResult;
  } catch {
    throw new Error(`JSON parse failed. Raw: ${content.slice(0, 200)}`);
  }
}
