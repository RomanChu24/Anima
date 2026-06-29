import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 pt-32 pb-20">
      <Link
        href="/"
        className="text-sm mb-8 inline-block transition-colors"
        style={{ color: "var(--color-muted)" }}
      >
        ← Назад
      </Link>

      <h1
        className="text-3xl font-light mb-2"
        style={{ fontFamily: "var(--font-cormorant), Georgia, serif", color: "var(--color-primary)" }}
      >
        Политика конфиденциальности
      </h1>
      <p className="text-sm mb-10" style={{ color: "var(--color-muted)" }}>
        Последнее обновление: июнь 2025
      </p>

      {[
        {
          title: "Кто мы",
          text: "Anima — сервис персональных разборов на основе натальной карты. Настоящая политика описывает как мы обрабатываем данные, которые ты вводишь при использовании сервиса.",
        },
        {
          title: "Какие данные мы получаем",
          text: "Для составления разбора ты вводишь: имя (необязательно), дату рождения, время рождения (необязательно), город рождения. Мы не собираем email, телефон, платёжные данные или данные устройства на этапе разбора.",
        },
        {
          title: "Как используются данные",
          text: "Введённые данные используются исключительно для генерации персонального текста. Данные передаются в сервис OpenRouter (США) для обработки языковой моделью и не сохраняются на наших серверах после получения результата.",
        },
        {
          title: "Трансграничная передача",
          text: "Для работы сервиса данные передаются за пределы Российской Федерации — в США (OpenRouter Inc.). Нажимая «Составить карту», ты даёшь согласие на такую передачу.",
        },
        {
          title: "Хранение данных",
          text: "Мы не сохраняем персональные данные в базах данных. Данные существуют только в рамках одного сеанса генерации и не используются повторно.",
        },
        {
          title: "Твои права",
          text: "Ты вправе в любой момент прекратить использование сервиса. Поскольку данные не хранятся, запрос на удаление не требуется. По вопросам — пиши на r.churakov@gmail.com.",
        },
      ].map(({ title, text }) => (
        <section key={title} className="mb-8">
          <h2
            className="text-lg font-medium mb-2"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif", color: "var(--color-gold)" }}
          >
            {title}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
            {text}
          </p>
        </section>
      ))}

      <div
        className="mt-12 pt-8 text-xs"
        style={{ borderTop: "1px solid rgba(200,169,107,0.1)", color: "var(--color-muted)", opacity: 0.5 }}
      >
        Anima является инструментом самопознания и не оказывает психологических, медицинских или юридических услуг.
      </div>
    </div>
  );
}
