export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.35); opacity: 1; }
        }
        @keyframes orbit-glow {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.7; }
        }
        @keyframes dot-pulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40% { transform: scale(1.3); opacity: 1; }
        }
      `}</style>

      <div className="relative w-44 h-44 mb-10">
        {/* Outer orbit */}
        <div
          className="absolute inset-0 rounded-full animate-spin"
          style={{
            border: "1.5px solid rgba(200,169,107,0.5)",
            animation: "spin 8s linear infinite, orbit-glow 3s ease-in-out infinite",
          }}
        />
        {/* Inner orbit */}
        <div
          className="absolute inset-6 rounded-full"
          style={{
            border: "1.5px solid rgba(123,111,212,0.5)",
            animation: "spin 5s linear infinite reverse, orbit-glow 2.5s ease-in-out 0.5s infinite",
          }}
        />
        {/* Glow backdrop */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(200,169,107,0.12) 0%, transparent 70%)",
            animation: "breathe 2.5s ease-in-out infinite",
          }}
        />
        {/* Planet dot on outer orbit */}
        <div
          className="absolute rounded-full"
          style={{
            width: 8,
            height: 8,
            background: "var(--color-gold)",
            top: "50%",
            left: -4,
            transform: "translateY(-50%)",
            boxShadow: "0 0 12px rgba(200,169,107,1)",
          }}
        />
        {/* Star in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-5xl"
            style={{
              color: "var(--color-gold)",
              display: "block",
              animation: "breathe 2.5s ease-in-out infinite",
              filter: "drop-shadow(0 0 10px rgba(200,169,107,0.7))",
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
      <p className="text-sm mb-8" style={{ color: "var(--color-muted)" }}>
        Читаем расположение планет на момент твоего рождения
      </p>

      {/* Dots */}
      <div className="flex gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--color-gold)",
              animation: `dot-pulse 1.4s ease-in-out ${i * 0.22}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
