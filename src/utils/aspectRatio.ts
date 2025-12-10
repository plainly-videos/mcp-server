import type { AspectRatio } from "../sdk";

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function getAspectRatio(width: number, height: number): AspectRatio | null {
  if (width <= 0 || height <= 0) return null;

  const d = gcd(width, height);
  const w = width / d;
  const h = height / d;

  return `${w}:${h}`;
}
