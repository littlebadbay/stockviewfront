import type { Kline } from './api/history';

export function SMA(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = new Array(values.length).fill(null);
  let sum = 0;
  for (let i = 0; i < values.length; i += 1) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    if (i >= period - 1) out[i] = sum / period;
  }
  return out;
}

export function EMA(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = new Array(values.length).fill(null);
  const k = 2 / (period + 1);
  let prev: number | null = null;
  for (let i = 0; i < values.length; i += 1) {
    const v = values[i];
    prev = prev == null ? v : v * k + prev * (1 - k);
    if (i >= period - 1) out[i] = prev;
  }
  return out;
}

export function MACD(values: number[], fast = 12, slow = 26, signal = 9) {
  const emaFast = EMA(values, fast);
  const emaSlow = EMA(values, slow);
  const macd: (number | null)[] = values.map((_, i) =>
    emaFast[i] != null && emaSlow[i] != null ? (emaFast[i]! - emaSlow[i]!) : null
  );
  const signalLine = EMA(macd.map((v) => (v == null ? 0 : v)), signal);
  const hist = macd.map((v, i) => (v != null && signalLine[i] != null ? v - signalLine[i]! : null));
  return { macd, signal: signalLine, hist };
}

export function RSI(values: number[], period = 14): (number | null)[] {
  const out: (number | null)[] = new Array(values.length).fill(null);
  if (values.length < period + 1) return out;

  let gains: number[] = [];
  let losses: number[] = [];
  for (let i = 1; i < values.length; i += 1) {
    const change = values[i] - values[i - 1];
    gains.push(Math.max(change, 0));
    losses.push(Math.max(-change, 0));
  }
  // initial averages
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  out[period] = 100 - 100 / (1 + rs);

  for (let i = period + 1; i < values.length; i += 1) {
    const g = gains[i - 1];
    const l = losses[i - 1];
    avgGain = (avgGain * (period - 1) + g) / period;
    avgLoss = (avgLoss * (period - 1) + l) / period;
    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    out[i] = 100 - 100 / (1 + rs);
  }
  return out;
}

export function BOLL(values: number[], period = 20, k = 2) {
  const mid = SMA(values, period);
  const outUpper: (number | null)[] = new Array(values.length).fill(null);
  const outLower: (number | null)[] = new Array(values.length).fill(null);
  for (let i = period - 1; i < values.length; i += 1) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j += 1) sum += values[j];
    const mean = sum / period;
    let variance = 0;
    for (let j = i - period + 1; j <= i; j += 1) {
      const diff = values[j] - mean;
      variance += diff * diff;
    }
    const std = Math.sqrt(variance / period);
    outUpper[i] = mean + k * std;
    outLower[i] = mean - k * std;
  }
  return { upper: outUpper, mid, lower: outLower };
}

export function extractCloses(data: Kline[]): number[] {
  return data.map((d) => d.close);
}
