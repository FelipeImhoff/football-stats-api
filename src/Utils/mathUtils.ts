export function parsePercentage(pctStr: string): number | null {
  if (!pctStr) return null;
  return parseFloat(pctStr.replace("%", "").replace(",", "."));
}

export function absoluteDifference(a: number, b: number): number {
  return Math.abs(a - b);
}

export function average(a: number, b: number): number {
  return (a + b) / 2;
}
