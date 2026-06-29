import Link from "next/link";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-10">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: "rgba(8,6,26,0.97)",
          borderBottom: "1px solid rgba(200,169,107,0.06)",
        }}
      />
      <Link
        href="/"
        className="flex items-center gap-3 no-underline"
      >
        <span
          className="text-2xl leading-none"
          style={{ color: "var(--color-gold)", animation: "pulse-star 3s ease-in-out infinite" }}
        >
          ✦
        </span>
        <span
          className="font-light uppercase"
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "1.75rem",
            letterSpacing: "0.3em",
            color: "var(--color-primary)",
            lineHeight: 1,
          }}
        >
          Anima
        </span>
      </Link>

      <nav className="hidden md:flex items-center gap-8">
        <Link
          href="#how"
          className="text-sm text-muted hover:text-primary transition-colors duration-200 tracking-wide"
        >
          Как работает
        </Link>
        <Link
          href="#pricing"
          className="text-sm text-muted hover:text-primary transition-colors duration-200 tracking-wide"
        >
          Тарифы
        </Link>
      </nav>

      <Link
        href="#form"
        className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium tracking-wide transition-all duration-200"
        style={{
          background: "linear-gradient(135deg, #C8A96B 0%, #E8C99B 50%, #C8A96B 100%)",
          color: "#08061A",
        }}
      >
        Начать
      </Link>
    </header>
  );
}
