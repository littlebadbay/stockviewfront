import { config } from '../config';

export type Kline = {
  time: number; // ms epoch
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type Interval = '1m' | '5m' | '15m' | '60m' | '1d';

const intervalToMs: Record<Interval, number> = {
  '1m': 60_000,
  '5m': 5 * 60_000,
  '15m': 15 * 60_000,
  '60m': 60 * 60_000,
  '1d': 24 * 60 * 60_000
};

function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function synthesizeHistory(symbol: string, interval: Interval, points = 1200): Kline[] {
  const now = Date.now();
  const step = intervalToMs[interval];
  const start = now - points * step;
  const seed = Array.from(symbol).reduce((acc, c) => acc + c.charCodeAt(0), 0) + step;
  const rnd = seededRandom(seed);

  let price = 100 + (rnd() - 0.5) * 10;
  const data: Kline[] = [];
  for (let i = 0; i < points; i += 1) {
    // random walk with mean reversion
    const t = start + i * step;
    const drift = (rnd() - 0.5) * 0.6;
    const reversion = (100 - price) * 0.002;
    const change = drift + reversion;
    const open = price;
    let close = open * (1 + change / 100);
    const high = Math.max(open, close) * (1 + rnd() * 0.01);
    const low = Math.min(open, close) * (1 - rnd() * 0.01);
    const volume = 1000 + rnd() * 5000;

    // jitter to ensure OHLC relationship
    close = Math.max(low * 1.0005, Math.min(close, high * 0.9995));
    price = close;

    data.push({ time: t, open, high, low, close, volume });
  }
  return data;
}

export async function fetchHistory(symbol: string, interval: Interval, limit = 1200): Promise<Kline[]> {
  // If no API base configured, use synthesized data
  if (!config.apiBaseUrl) {
    return synthesizeHistory(symbol, interval, limit);
  }

  const url = new URL('/history', config.apiBaseUrl);
  url.searchParams.set('symbol', symbol);
  url.searchParams.set('interval', interval);
  url.searchParams.set('limit', String(limit));

  try {
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const arr = (await res.json()) as any[];
    // normalize potential field names
    const data: Kline[] = arr.map((d) => ({
      time: Number(d.time ?? d.t ?? d[0]),
      open: Number(d.open ?? d.o ?? d[1]),
      high: Number(d.high ?? d.h ?? d[2]),
      low: Number(d.low ?? d.l ?? d[3]),
      close: Number(d.close ?? d.c ?? d[4]),
      volume: Number(d.volume ?? d.v ?? d[5] ?? 0)
    }));
    return data.sort((a, b) => a.time - b.time).slice(-limit);
  } catch (e) {
    // fallback to synth data on failure
    return synthesizeHistory(symbol, interval, limit);
  }
}
