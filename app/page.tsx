"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

function formatDate(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
}

function formatTime(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function parseDateToISO(dateStr: string): string {
  const [d, m, y] = dateStr.split(".");
  if (!d || !m || !y || y.length < 4) return "";
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function validateDate(dateStr: string): string {
  if (!dateStr || dateStr.length < 10) return "Укажи дату рождения в формате ДД.ММ.ГГГГ";
  const [d, m, y] = dateStr.split(".").map(Number);
  if (d < 1 || d > 31) return "Число должно быть от 1 до 31";
  if (m < 1 || m > 12) return "Месяц должен быть от 1 до 12";
  if (y < 1920 || y > 2020) return "Проверь год рождения (1920-2020)";
  return "";
}

function validateTime(timeStr: string): string {
  if (!timeStr) return "";
  if (timeStr.length < 5) return "Время в формате ЧЧ:ММ";
  const [h, m] = timeStr.split(":").map(Number);
  if (h < 0 || h > 23) return "Часы: от 0 до 23";
  if (m < 0 || m > 59) return "Минуты: от 0 до 59";
  return "";
}

export default function HomePage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", date: "", time: "", city: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    const dateErr = validateDate(form.date);
    if (dateErr) errs.date = dateErr;
    const timeErr = validateTime(form.time);
    if (timeErr) errs.time = timeErr;
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    const params = new URLSearchParams({
      name: form.name,
      date: parseDateToISO(form.date),
      time: form.time,
      city: form.city,
    });
    router.push(`/result?${params.toString()}`);
  };

  const canSubmit = form.date.length === 10 && !loading;

  return (
    <>
    <div className="flex flex-col items-center justify-start md:justify-center min-h-screen px-5 md:px-6 pt-24 pb-6 md:py-32">
      {/* Hero */}
      <div
        className="text-center mb-4 md:mb-12 max-w-xl"
        style={{ animation: "fadeIn 0.8s ease both" }}
      >
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-xs tracking-wide"
          style={{
            border: "1px solid rgba(200,169,107,0.25)",
            background: "rgba(200,169,107,0.06)",
            color: "var(--color-gold)",
          }}
        >
          <span style={{ opacity: 0.7 }}>✦</span>
          <span>Ранний доступ · Присоединяйся первой</span>
        </div>

        <h1
          className="uppercase tracking-[0.2em] font-semibold mb-2 md:mb-4"
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "clamp(2.2rem, 7vw, 5rem)",
            color: "var(--color-primary)",
            lineHeight: 1.1,
          }}
        >
          Натальная карта
        </h1>

        <p
          className="mb-3 md:mb-6 font-light"
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "clamp(1rem, 3.5vw, 1.7rem)",
            color: "var(--color-gold)",
            lineHeight: 1.3,
            letterSpacing: "0.01em",
          }}
        >
          Расшифровка тебя — по дате, времени и месту рождения
        </p>

        <p
          className="mb-4 md:mb-6"
          style={{ color: "var(--color-muted)", fontSize: "0.8rem" }}
        >
          4 инсайта о тебе&nbsp;&nbsp;·&nbsp;&nbsp;2 минуты&nbsp;&nbsp;·&nbsp;&nbsp;Бесплатно
        </p>

        <p className="hidden md:block text-base leading-relaxed" style={{ color: "var(--color-muted)" }}>
          Есть вещи о себе, которые ты чувствуешь —
          <br />
          но не можешь объяснить.{" "}
          <span style={{ color: "var(--color-primary)" }}>
            Натальная карта — это ответы, которые ты искала.
          </span>
        </p>
      </div>

      {/* Form card */}
      <div
        id="form"
        className="w-full max-w-md rounded-2xl p-5 md:p-8"
        style={{
          background: "rgba(16,14,42,0.8)",
          border: "1px solid rgba(200,169,107,0.15)",
          backdropFilter: "blur(12px)",
          animation: "fadeIn 0.8s ease 0.2s both",
        }}
      >
        <h2
          className="text-lg md:text-xl font-medium mb-3 md:mb-5"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif", color: "var(--color-gold)" }}
        >
          Данные рождения
        </h2>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3 md:gap-5">
          <div>
            <label className="field-label">Имя</label>
            <input
              type="text"
              placeholder="Как тебя зовут?"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>

          <div>
            <label className="field-label">
              Дата рождения
            </label>
            <input
              type="text"
              placeholder="ДД.ММ.ГГГГ"
              value={form.date}
              onChange={(e) => set("date", formatDate(e.target.value))}
              inputMode="numeric"
              maxLength={10}
            />
            {errors.date && (
              <p className="text-xs mt-1.5" style={{ color: "#E88A6B" }}>{errors.date}</p>
            )}
          </div>

          <div>
            <label className="field-label">Время рождения</label>
            <input
              type="text"
              placeholder="ЧЧ:ММ (необязательно)"
              value={form.time}
              onChange={(e) => set("time", formatTime(e.target.value))}
              inputMode="numeric"
              maxLength={5}
            />
            {errors.time && (
              <p className="text-xs mt-1.5" style={{ color: "#E88A6B" }}>{errors.time}</p>
            )}
          </div>

          <div>
            <label className="field-label">Город рождения</label>
            <input
              type="text"
              placeholder="Москва, Санкт-Петербург, Алматы..."
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-2 py-3.5 rounded-xl text-sm font-medium tracking-wide transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: canSubmit
                ? "linear-gradient(135deg, #C8A96B 0%, #E8C99B 100%)"
                : "rgba(200,169,107,0.3)",
              color: "#08061A",
            }}
          >
            {loading ? "Переходим к карте..." : "Составить карту ✦"}
          </button>

          <p className="text-center text-xs mt-2 leading-relaxed" style={{ color: "var(--color-muted)", opacity: 0.45 }}>
            Нажимая «Составить карту», ты соглашаешься с{" "}
            <a href="/privacy" style={{ color: "var(--color-gold)", opacity: 0.7, textDecoration: "underline" }}>
              политикой конфиденциальности
            </a>
          </p>
        </form>
      </div>

      <div
        className="hidden md:flex flex-wrap justify-center gap-6 mt-10 text-xs"
        style={{ color: "var(--color-muted)", opacity: 0.55, animation: "fadeIn 0.8s ease 0.4s both" }}
      >
        <span>✦ Архетипы Юнга</span>
        <span>✦ Натальная астрология</span>
        <span>✦ Только про тебя</span>
      </div>
    </div>

    {/* Как работает */}
    <section
      id="how"
      className="w-full max-w-3xl mx-auto px-6 py-20 md:py-28"
    >
      <p className="text-center text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "var(--color-muted)" }}>
        механика
      </p>
      <h2
        className="text-center text-3xl md:text-4xl font-light mb-16"
        style={{ fontFamily: "var(--font-cormorant), Georgia, serif", color: "var(--color-primary)" }}
      >
        Как это работает
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            num: "01",
            title: "Момент рождения",
            text: "Каждая секунда уникальна. В момент твоего появления на свет планеты занимали положение, которое больше никогда не повторится.",
          },
          {
            num: "02",
            title: "Язык архетипов",
            text: "Тысячелетия наблюдений собрали паттерны: как положение планет отражается в характере, реакциях и жизненных сценариях человека.",
          },
          {
            num: "03",
            title: "Твоя карта",
            text: "Пересечение твоего уникального момента и этих паттернов — персональный текст, который мог быть написан только о тебе.",
          },
        ].map(({ num, title, text }) => (
          <div key={num} className="flex flex-col gap-4">
            <span
              className="text-4xl font-light"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif", color: "var(--color-gold)", opacity: 0.4 }}
            >
              {num}
            </span>
            <h3
              className="text-lg font-medium"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif", color: "var(--color-primary)" }}
            >
              {title}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
              {text}
            </p>
          </div>
        ))}
      </div>
    </section>

    {/* Разделитель */}
    <div className="w-full max-w-3xl mx-auto px-6">
      <div className="h-px" style={{ background: "rgba(200,169,107,0.1)" }} />
    </div>

    {/* Тарифы */}
    <section
      id="pricing"
      className="w-full max-w-3xl mx-auto px-6 py-20 md:py-28"
    >
      <p className="text-center text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "var(--color-muted)" }}>
        тарифы
      </p>
      <h2
        className="text-center text-3xl md:text-4xl font-light mb-4"
        style={{ fontFamily: "var(--font-cormorant), Georgia, serif", color: "var(--color-primary)" }}
      >
        Начни бесплатно
      </h2>
      <p className="text-center text-sm mb-14" style={{ color: "var(--color-muted)" }}>
        Первый разбор — бесплатно. Подписка — если захочешь большего.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Free */}
        <div
          className="rounded-2xl p-7 flex flex-col gap-5"
          style={{ border: "1px solid rgba(200,169,107,0.15)", background: "rgba(16,14,42,0.5)" }}
        >
          <div>
            <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "var(--color-muted)" }}>Бесплатно</p>
            <p
              className="text-4xl font-light"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif", color: "var(--color-primary)" }}
            >
              0 ₽
            </p>
          </div>
          <ul className="flex flex-col gap-2.5 text-sm flex-1" style={{ color: "var(--color-muted)" }}>
            {["Полный разбор натальной карты", "4 персональных инсайта", "Солнце, Луна, Асцендент, Энергия", "Без регистрации"].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span style={{ color: "var(--color-gold)", marginTop: 1 }}>✦</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <a
            href="#form"
            className="block text-center py-3 rounded-xl text-sm font-medium transition-all duration-200"
            style={{ border: "1px solid rgba(200,169,107,0.3)", color: "var(--color-gold)" }}
          >
            Получить разбор
          </a>
        </div>

        {/* Paid */}
        <div
          className="rounded-2xl p-7 flex flex-col gap-5 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(200,169,107,0.12) 0%, rgba(16,14,42,0.8) 100%)", border: "1px solid rgba(200,169,107,0.3)" }}
        >
          <div>
            <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "var(--color-muted)" }}>Подписка</p>
            <p
              className="text-4xl font-light"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif", color: "var(--color-primary)" }}
            >
              399 ₽<span className="text-lg" style={{ color: "var(--color-muted)" }}>/мес</span>
            </p>
          </div>
          <ul className="flex flex-col gap-2.5 text-sm flex-1" style={{ color: "var(--color-muted)" }}>
            {["Всё из бесплатного", "Персональный дайджест каждую неделю", "Что планеты говорят о тебе сейчас", "Доставка в Telegram", "Скоро: личный чат с Anima"].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span style={{ color: "var(--color-gold)", marginTop: 1 }}>✦</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <button
            disabled
            className="block w-full text-center py-3 rounded-xl text-sm font-medium opacity-40 cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #C8A96B 0%, #E8C99B 100%)", color: "#08061A" }}
          >
            Открывается в июле
          </button>
        </div>
      </div>
    </section>
    </>
  );
}
