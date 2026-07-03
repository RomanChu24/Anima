import { GeoVector, Ecliptic, SiderealTime, Body } from "astronomy-engine";

const SIGNS_RU = [
  "Овен", "Телец", "Близнецы", "Рак", "Лев", "Дева",
  "Весы", "Скорпион", "Стрелец", "Козерог", "Водолей", "Рыбы",
];

function lonToSign(lon: number): { sign: string; degree: number } {
  const normalized = ((lon % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const degree = Math.floor(normalized % 30);
  return { sign: SIGNS_RU[signIndex], degree };
}

function getEclipticLon(body: Body, date: Date): number {
  const vec = GeoVector(body, date, true);
  const ecl = Ecliptic(vec);
  return ecl.elon;
}

function calcAscendant(date: Date, lat: number, lon: number): number {
  const eps = 23.4397 * (Math.PI / 180);
  const gst = SiderealTime(date);
  const lst = ((gst + lon / 15) % 24 + 24) % 24;
  const ramc = lst * 15 * (Math.PI / 180);
  const latRad = lat * (Math.PI / 180);
  let asc = Math.atan2(
    Math.cos(ramc),
    -(Math.sin(eps) * Math.tan(latRad) + Math.cos(eps) * Math.sin(ramc))
  ) * (180 / Math.PI);
  return ((asc % 360) + 360) % 360;
}

export interface PlanetPosition {
  sign: string;
  degree: number;
  label: string;
}

export interface NatalChart {
  sun: PlanetPosition;
  moon: PlanetPosition;
  mercury: PlanetPosition;
  mars: PlanetPosition;
  jupiter: PlanetPosition;
  saturn: PlanetPosition;
  rising: PlanetPosition | null;
}

export function calculateNatalChart(params: {
  date: string;
  time: string;
  lat: number;
  lon: number;
}): NatalChart {
  const { date, time, lat, lon } = params;
  const hasTime = !!time && time.length >= 4;

  const utcOffsetHours = Math.round(lon / 15);
  let isoString: string;
  if (hasTime) {
    const [h, m] = time.split(":").map(Number);
    const localMinutes = h * 60 + m - utcOffsetHours * 60;
    const baseDate = new Date(date + "T12:00:00Z");
    const utcDate = new Date(baseDate.getTime() + localMinutes * 60000 - 12 * 3600000);
    isoString = utcDate.toISOString();
  } else {
    isoString = date + "T12:00:00Z";
  }

  const d = new Date(isoString);

  const toPos = (body: Body): PlanetPosition => {
    const s = lonToSign(getEclipticLon(body, d));
    return { ...s, label: `${s.degree}° ${s.sign}` };
  };

  let rising: PlanetPosition | null = null;
  if (hasTime) {
    const asc = lonToSign(calcAscendant(d, lat, lon));
    rising = { ...asc, label: `${asc.degree}° ${asc.sign}` };
  }

  return {
    sun: toPos(Body.Sun),
    moon: toPos(Body.Moon),
    mercury: toPos(Body.Mercury),
    mars: toPos(Body.Mars),
    jupiter: toPos(Body.Jupiter),
    saturn: toPos(Body.Saturn),
    rising,
  };
}

export function chartToPromptText(chart: NatalChart, hasTime: boolean): string {
  const lines = [
    `• Солнце: ${chart.sun.label}`,
    `• Луна: ${chart.moon.label}${!hasTime ? " (время неизвестно - возможна погрешность ±7°)" : ""}`,
    `• Меркурий: ${chart.mercury.label}`,
    `• Марс: ${chart.mars.label}`,
    `• Юпитер: ${chart.jupiter.label}`,
    `• Сатурн: ${chart.saturn.label}`,
    chart.rising
      ? `• Асцендент: ${chart.rising.label}`
      : `• Асцендент: не определён (время рождения неизвестно)`,
  ];
  return lines.join("\n");
}
