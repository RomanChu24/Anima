import { kv } from "@vercel/kv";

export interface UserRecord {
  telegramId: number;
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM or ""
  city: string;
  createdAt: string; // ISO
  digestCount: number; // how many weekly digests sent
  isPaid: boolean;     // paid or granted free access
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

export async function incrementDigestCount(telegramId: number): Promise<void> {
  const user = await getUser(telegramId);
  if (!user) return;
  await kv.set(`user:${telegramId}`, { ...user, digestCount: (user.digestCount ?? 0) + 1 });
}

export async function grantAccess(telegramId: number): Promise<boolean> {
  const user = await getUser(telegramId);
  if (!user) return false;
  await kv.set(`user:${telegramId}`, { ...user, isPaid: true });
  return true;
}
