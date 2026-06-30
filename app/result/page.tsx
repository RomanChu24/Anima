import Link from "next/link";
import { generateReading, ReadingResult } from "@/lib/generateReading";
import ShareButton from "@/components/ShareButton";

const PLANET_ICONS: Record<string, string> = {
  sun: "☀",
  moon: "☽",
  rising: "↑",
  energy: "✦",
};

const CARD_ACCENT: Record<string, string> = {
  sun: "rgba(200,169,107,0.12)",
  moon: "rgba(123,111,212,0.12)",
  rising: "rgba(200,169,107,0.08)",
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
        background: `linear-gradient(135deg, ${CARD_ACCENT[type]}, rgba(16,14,42,0.6))`,
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
          {PLANET_ICONS[type]}
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
      <span className="text-4xl mb-4" style={{ color: "var(--color-muted)" }}>
        ✦
      </span>
      <h2
        className="text-2xl font-light mb-3"
        style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          color: "var(--color-primary)",
        }}
      >
        Не удалось составить карту
      </h2>
      <p className="text-sm mb-8" style={{ color: "var(--color-muted)" }}>
        Попробуй ещё раз - иногда звёзды недоступны
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 rounded-full text-sm"
        style={{
          border: "1px solid rgba(200,169,107,0.3)",
          color: "var(--color-gold)",
        }}
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

  if (!date) {
    return <ErrorView />;
  }

  let reading: ReadingResult;
  try {
    reading = await generateReading({ name, date, time, city });
  } catch {
    return <ErrorView />;
  }

  const displayName = reading.name || name || "твоя";
  const formattedDate = date
    ? new Date(date + "T12:00:00").toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="flex flex-col items-center px-6 py-32 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div
        className="text-center mb-12 w-full"
        style={{ animation: "fadeIn 0.6s ease both" }}
      >
        <p
          className="text-xs tracking-[0.3em] uppercase mb-3"
          style={{ color: "var(--color-muted)" }}
        >
          натальная карта
        </p>
        <h1
          className="text-4xl md:text-5xl font-light mb-4"
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            color: "var(--color-primary)",
          }}
        >
          {displayName}
        </h1>
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          {[formattedDate, time && `${time}`, city]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <InsightCardView type="sun" card={reading.sun} delay={0.1} />
        <InsightCardView type="moon" card={reading.moon} delay={0.2} />
        <InsightCardView type="rising" card={reading.rising} delay={0.3} />
        <InsightCardView type="energy" card={reading.energy} delay={0.4} />
      </div>

      {/* CTA подписка */}
      <div
        className="mt-10 w-full rounded-2xl p-6 text-center"
        style={{
          background: "linear-gradient(135deg, rgba(200,169,107,0.12) 0%, rgba(16,14,42,0.8) 100%)",
          border: "1px solid rgba(200,169,107,0.3)",
          animation: "fadeIn 0.6s ease 0.5s both",
        }}
      >
        <p
          className="text-lg font-medium mb-2"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif", color: "var(--color-primary)" }}
        >
          Хочешь знать, что с тобой происходит каждую неделю?
        </p>
        <p className="text-sm mb-5" style={{ color: "var(--color-muted)" }}>
          Персональный дайджест по твоей карте — в Telegram, раз в неделю
        </p>
        <Link
          href="/#pricing"
          className="inline-block px-6 py-2.5 rounded-full text-sm font-medium"
          style={{
            background: "linear-gradient(135deg, #C8A96B 0%, #E8C99B 100%)",
            color: "#08061A",
          }}
        >
          Узнать о подписке
        </Link>
      </div>

      {/* Footer */}
      <div
        className="mt-8 text-center flex flex-col items-center gap-4"
        style={{ animation: "fadeIn 0.6s ease 0.6s both" }}
      >
        <ShareButton name={displayName} />

        <Link
          href="/"
          className="text-sm transition-colors duration-200"
          style={{ color: "var(--color-gold)", opacity: 0.8 }}
        >
          ← Составить другую карту
        </Link>

        <p
          className="text-xs leading-relaxed max-w-sm"
          style={{ color: "var(--color-muted)", opacity: 0.4 }}
        >
          Anima - пространство для самопознания и рефлексии. Тексты основаны на интерпретации символики натальной карты и носят ознакомительный характер. Не являются психологической консультацией или предсказанием.
        </p>
      </div>
    </div>
  );
}
