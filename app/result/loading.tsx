export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="relative w-36 h-36 mb-10">
        {/* Outer orbit - slow clockwise */}
        <div
          className="absolute inset-0 rounded-full animate-spin"
          style={{
            border: "1px solid rgba(200,169,107,0.3)",
            animationDuration: "8s",
          }}
        />
        {/* Inner orbit - counter-clockwise */}
        <div
          className="absolute inset-5 rounded-full animate-spin"
          style={{
            border: "1px solid rgba(123,111,212,0.3)",
            animationDuration: "5s",
            animationDirection: "reverse",
          }}
        />
        {/* Center planet dot on outer orbit */}
        <div
          className="absolute rounded-full"
          style={{
            width: 6,
            height: 6,
            background: "var(--color-gold)",
            top: "50%",
            left: -3,
            transform: "translateY(-50%)",
            boxShadow: "0 0 8px rgba(200,169,107,0.8)",
          }}
        />
        {/* Star in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-4xl"
            style={{
              color: "var(--color-gold)",
              animation: "pulse-star 2.5s ease-in-out infinite",
            }}
          >
            ✦
          </span>
        </div>
      </div>

      <p
        className="text-xl font-light mb-2"
        style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          color: "var(--color-primary)",
        }}
      >
        Составляем твою карту...
      </p>
      <p className="text-sm" style={{ color: "var(--color-muted)" }}>
        Читаем расположение планет на момент твоего рождения
      </p>

      {/* Dots animation */}
      <div className="flex gap-2 mt-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: "var(--color-gold)",
              opacity: 0.4,
              animation: `pulse-star 1.4s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
