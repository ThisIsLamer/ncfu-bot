const MSK_OFFSET = 3 * 60 * 60_000;

export function toMsk(date: Date): Date {
  return new Date(date.getTime() + MSK_OFFSET);
}

export function formatDateRu(date: Date): string {
  const msk = toMsk(date);
  const day = String(msk.getUTCDate()).padStart(2, '0');
  const month = String(msk.getUTCMonth() + 1).padStart(2, '0');
  const year = msk.getUTCFullYear();
  const hours = String(msk.getUTCHours()).padStart(2, '0');
  const minutes = String(msk.getUTCMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} в ${hours}:${minutes}`;
}

export function formatTimeRu(date: Date): string {
  const msk = toMsk(date);
  const hours = String(msk.getUTCHours()).padStart(2, '0');
  const minutes = String(msk.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
