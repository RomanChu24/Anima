import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://anima-flame.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Натальная карта онлайн бесплатно — Anima",
    template: "%s — Anima",
  },
  description:
    "Бесплатный разбор натальной карты за 2 минуты. Солнце, Луна, Асцендент — персональный текст по твоей дате рождения. Без регистрации.",
  keywords: [
    "натальная карта",
    "натальная карта бесплатно",
    "натальная карта онлайн",
    "разбор натальной карты",
    "гороскоп рождения",
    "астрология онлайн",
  ],
  openGraph: {
    title: "Натальная карта онлайн бесплатно — Anima",
    description:
      "Бесплатный разбор натальной карты за 2 минуты. Персональный текст по твоей дате рождения — без регистрации.",
    url: siteUrl,
    siteName: "Anima",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Натальная карта онлайн бесплатно — Anima",
    description:
      "Бесплатный разбор натальной карты за 2 минуты. Без регистрации.",
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    yandex: "b10619c3b70601e0",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Inter:wght@400;500;600&display=swap&subset=cyrillic,latin"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col relative">
        <Navbar />
        <main className="flex flex-col flex-1 relative z-10">{children}</main>
        <Script id="ym-init" strategy="afterInteractive">{`
          (function(m,e,t,r,i,k,a){
            m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
          })(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=110482561','ym');
          ym(110482561,'init',{ssr:true,webvisor:true,clickmap:true,ecommerce:"dataLayer",referrer:document.referrer,url:location.href,accurateTrackBounce:true,trackLinks:true});
        `}</Script>
        <noscript>
          <div><img src="https://mc.yandex.ru/watch/110482561" style={{position:"absolute",left:"-9999px"}} alt="" /></div>
        </noscript>
      </body>
    </html>
  );
}
