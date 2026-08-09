import type { Metadata } from "next";
import Link from "next/link";
import { generateReading, ReadingResult } from "@/lib/generateReading";
import ShareButton from "@/components/ShareButton";

export const metadata: Metadata = {
  title: "Твоя натальная карта",
  description: "Персональный разбор натальной карты по дате, времени и месту рождения — архетипы, планеты, энергия периода.",
};

const PLANET_ICONS: Record<string, string> = {
  sun: "☀",
  moon: "☽",
  rising: "↑",
  mercury: "☿",
  mars: "♂",
  jupiter: "♃",
  saturn: "♄",
  energy: "✦",
};

const CARD_ACCENT: Record<string, string> = {
  sun: "rgba(200,169,107,0.12)",
  moon: "rgba(123,111,212,0.12)",
  rising: "rgba(200,169,107,0.08)",
  mercury: "rgba(100,180,210,0.10)",
  mars: "rgba(210,80,80,0.10)",
  jupiter: "rgba(180,140,80,0.10)",
  saturn: "rgba(120,120,160,0.10)",
  energy: "rgba(123,111,212,0.08)",
};

function InsightCardView({
  type,
  card,
  delay,
}: {
  type: string;
  card: { sign?: string; title: string; subtitle: string; text: string };
  delay: number;
}) {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-4"
      style={{
        background: `linear-gradient(135deg, ${CARD_ACCENT[type] ?? "rgba(200,169,107,0.08)"}, rgba(16,14,42,0.6))`,
        border: "1px solid rgba(200,169,107,0.12)",
        backdropFilter: "blur(8px)",
        animation: `fadeIn 0.6s ease ${delay}s both`,
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="text-2xl mt-0.5 shrink-0"
          style={{ color: "var(--color-gold)" }}
        >
          {PLANET_ICONS[type] ?? "✦"}
        </span>
        <div>
          <h3
            className="text-lg font-medium leading-tight"
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              color: "var(--color-gold)",
            }}
          >
            {card.title}
          </h3>
          <p className="text-xs tracking-wide uppercase mt-0.5" style={{ color: "var(--color-muted)" }}>
            {card.subtitle}
          </p>
        </div>
      </div>

      <p
        className="text-sm leading-relaxed"
        style={{ color: "var(--color-primary)", opacity: 0.9 }}
      >
        {card.text}
      </p>
    </div>
  );
}

function ErrorView() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <span className="text-4xl mb-4" style={{ color: "var(--color-muted)" }}>✦</span>
      <h2
        className="text-2xl font-light mb-3"
        style={{ fontFamily: "var(--font-cormorant), Georgia, serif", color: "var(--color-primary)" }}
      >
        Не удалось составить карту
      </h2>
      <p className="text-sm mb-8" style={{ color: "var(--color-muted)" }}>
        Попробуй ещё раз - иногда звёзды недоступны
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 rounded-full text-sm"
        style={{ border: "1px solid rgba(200,169,107,0.3)", color: "var(--color-gold)" }}
      >
        Попробовать снова
      </Link>
    </div>
  );
}

export default async function ResultPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const p = await searchParams;
  const name = typeof p.name === "string" ? p.name : "";
  const date = typeof p.date === "string" ? p.date : "";
  const time = typeof p.time === "string" ? p.time : "";
  const city = typeof p.city === "string" ? p.city : "";

  if (!date) return <ErrorView />;

  const currentDate = new Date().toISOString().split("T")[0];

  let reading: ReadingResult;
  try {
    reading = await generateReading({ name, date, time, city, currentDate });
  } catch (err) {
    console.error("[result] generateReading failed:", err);
    return <ErrorView />;
  }

  const displayName = reading.name || name || "твоя";

  const today = new Date();
  const dow = today.getDay();
  const daysUntilMonday = (8 - dow) % 7 || 7;
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilMonday);
  const nextMondayStr = nextMonday.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });

  const formattedDate = date
    ? new Date(date + "T12:00:00").toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const planetCards: Array<{ key: keyof ReadingResult; delay: number; wide?: boolean }> = [
    { key: "sun", delay: 0.1 },
    { key: "moon", delay: 0.15 },
    { key: "rising", delay: 0.2 },
    { key: "mercury", delay: 0.25 },
    { key: "mars", delay: 0.3 },
    { key: "jupiter", delay: 0.35 },
    { key: "saturn", delay: 0.4, wide: true },
  ];

  return (
    <div className="flex flex-col items-center px-6 py-32 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-12 w-full" style={{ animation: "fadeIn 0.6s ease both" }}>
        <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "var(--color-muted)" }}>
          натальная карта
        </p>
        <h1
          className="text-4xl md:text-5xl font-light mb-4"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif", color: "var(--color-primary)" }}
        >
          {displayName}
        </h1>
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          {[formattedDate, time && `${time}`, city].filter(Boolean).join(" · ")}
        </p>
      </div>

      {/* Planet cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {planetCards.map(({ key, delay, wide }) => (
          <div key={key} className={wide ? "md:col-span-2" : ""}>
            <InsightCardView
              type={key}
              card={reading[key] as { sign?: string; title: string; subtitle: string; text: string }}
              delay={delay}
            />
          </div>
        ))}
      </div>

      {/* Energy card - full width */}
      <div className="w-full mt-4">
        <InsightCardView type="energy" card={reading.energy} delay={0.45} />
      </div>

      {/* Glossary */}
      {reading.glossary && (
        <div
          className="w-full mt-4 rounded-2xl p-6"
          style={{
            background: "rgba(16,14,42,0.4)",
            border: "1px solid rgba(200,169,107,0.08)",
            animation: "fadeIn 0.6s ease 0.5s both",
          }}
        >
          <p className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: "var(--color-muted)" }}>
            Для тех, кто только знакомится с астрологией
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-primary)", opacity: 0.75 }}>
            {reading.glossary}
          </p>
        </div>
      )}

      {/* Digest Preview */}
      <div className="w-full mt-8" style={{ animation: "fadeIn 0.6s ease 0.55s both" }}>
        <p className="text-xs tracking-[0.25em] uppercase text-center mb-4" style={{ color: "var(--color-gold)", opacity: 0.7 }}>
          ✦ превью понедельничного дайджеста
        </p>
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(200,169,107,0.25)", background: "rgba(16,14,42,0.8)" }}>
          {/* Header */}
          <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(200,169,107,0.12)", background: "rgba(200,169,107,0.05)" }}>
            <span style={{ fontSize: "1.1rem" }}>🗓</span>
            <div>
              <p className="text-xs" style={{ color: "var(--color-muted)" }}>Anima · персональный дайджест</p>
              <p className="text-sm font-medium" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", color: "var(--color-primary)" }}>
                Понедельник, {nextMondayStr}
              </p>
            </div>
          </div>

          {/* Visible: energy of the week */}
          <div className="px-6 pt-5 pb-4">
            <p className="text-xs tracking-wide uppercase mb-2" style={{ color: "var(--color-gold)", opacity: 0.7 }}>✦ энергия недели</p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-primary)", opacity: 0.9 }}>
              {reading.energy.text}
            </p>
          </div>

          {/* Locked: teaser of more content */}
          <div className="relative px-6 pb-4" style={{ overflow: "hidden" }}>
            <div style={{ filter: "blur(3px)", userSelect: "none", pointerEvents: "none", opacity: 0.45 }}>
              <p className="text-xs tracking-wide uppercase mb-2" style={{ color: "var(--color-accent)" }}>✦ личные транзиты</p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-primary)" }}>
                Венера активирует твой натальный Юпитер - время неожиданных встреч и возможностей. Марс входит в напряжение с твоим Солнцем - важно не форсировать события...
              </p>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1"
              style={{ background: "linear-gradient(to bottom, transparent 0%, rgba(16,14,42,0.97) 60%)" }}>
              <p className="text-xs font-medium" style={{ color: "var(--color-muted)" }}>+ персональные транзиты для {displayName}</p>
              <p className="text-xs" style={{ color: "var(--color-muted)", opacity: 0.6 }}>доступны в Telegram</p>
            </div>
          </div>

          {/* CTA */}
          <div className="px-6 pb-6 pt-2 text-center">
            <a
              href="https://t.me/Anima_Card_Bot?start=from_web"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3.5 rounded-full text-sm font-medium mb-3"
              style={{ background: "linear-gradient(135deg, #C8A96B 0%, #E8C99B 100%)", color: "#08061A" }}
            >
              Получать каждый понедельник в Telegram
            </a>
            <p className="text-xs" style={{ color: "var(--color-muted)", opacity: 0.55 }}>
              Первый дайджест бесплатно ✦ <Link href="/#pricing" style={{ textDecoration: "underline" }}>Подробности о подписке</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center flex flex-col items-center gap-4" style={{ animation: "fadeIn 0.6s ease 0.6s both" }}>
        <ShareButton name={displayName} />
        <Link href="/" className="text-sm transition-colors duration-200" style={{ color: "var(--color-gold)", opacity: 0.8 }}>
          ← Составить другую карту
        </Link>
        <p className="text-xs leading-relaxed max-w-sm" style={{ color: "var(--color-muted)", opacity: 0.4 }}>
          Прогноз носит символический и рекомендательный характер. Не является руководством к действию, медицинской, юридической или финансовой консультацией. Все решения принимаете вы самостоятельно.
        </p>
      </div>
    </div>
  );
}
