"use client";

import { useState } from "react";

export default function ShareButton({ name }: { name: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.origin : "";
    const text = `${name}, узнай свою натальную карту бесплатно — Anima`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Anima", text, url });
      } catch {
        // пользователь закрыл системный диалог — не ошибка
      }
      return;
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="px-6 py-2.5 rounded-full text-sm transition-all duration-200"
      style={{
        border: "1px solid rgba(200,169,107,0.3)",
        color: "var(--color-gold)",
        background: "rgba(200,169,107,0.06)",
      }}
    >
      {copied ? "Ссылка скопирована ✦" : "Поделиться с подругой ✦"}
    </button>
  );
}
