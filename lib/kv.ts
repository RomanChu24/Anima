import { kv } from "@vercel/kv";

export interface UserRecord {
  telegramId: number;
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM or ""
  city: string;
  createdAt: string; // ISO
}

export async function saveUser(record: UserRecord): Promise<void> {
  await kv.set(`user:${record.telegramId}`, record);
}

export async function getUser(telegramId: number): Promise<UserRecord | null> {
  return kv.get<UserRecord>(`user:${telegramId}`);
}

export async function getAllUsers(): Promise<UserRecord[]> {
  const keys = await kv.keys("user:*");
  if (!keys.length) return [];
  const values = await Promise.all(keys.map((k) => kv.get<UserRecord>(k)));
  return values.filter((v): v is UserRecord => v !== null);
}

export async function deleteUser(telegramId: number): Promise<void> {
  await kv.del(`user:${telegramId}`);
}
