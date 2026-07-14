export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <style>{`
        @keyframes spin-cw  { from { transform: rotate(0deg); }   to { transform: rotate(360deg); } }
        @keyframes spin-ccw { from { transform: rotate(0deg); }   to { transform: rotate(-360deg); } }
        @keyframes breathe  {
          0%, 100% { transform: scale(1);    filter: drop-shadow(0 0 6px rgba(200,169,107,0.5)); }
          50%       { transform: scale(1.35); filter: drop-shadow(0 0 18px rgba(200,169,107,0.9)); }
        }
        @keyframes dot-pulse {
          0%, 80%, 100% { transform: scale(0.5); opacity: 0.25; }
          40%            { transform: scale(1.3); opacity: 1; }
        }
      `}</style>

      <div className="relative mb-10" style={{ width: 176, height: 176 }}>
        {/* Outer orbit - clockwise */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: "1.5px solid rgba(200,169,107,0.5)",
            animation: "spin-cw 8s linear infinite",
          }}
        />
        {/* Inner orbit - counter-clockwise */}
        <div
          className="absolute rounded-full"
          style={{
            inset: 24,
            border: "1.5px solid rgba(123,111,212,0.5)",
            animation: "spin-ccw 5s linear infinite",
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
            boxShadow: "0 0 10px rgba(200,169,107,1)",
          }}
        />
        {/* Star */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            style={{
              fontSize: "3rem",
              color: "var(--color-gold)",
              display: "block",
              lineHeight: 1,
              animation: "breathe 2.5s ease-in-out infinite",
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
