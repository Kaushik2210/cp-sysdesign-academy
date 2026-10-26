/** Back-of-envelope helpers for the numbers cheat sheet. Pure functions so they can be tested exactly. */

export const SECONDS = { minute: 60, hour: 3600, day: 86_400, week: 604_800, year: 31_536_000 /* 365 days */ } as const;

/** Average and peak requests per second from a daily total. Peak = average x factor. */
export function perDayToQps(eventsPerDay: number, peakFactor = 3): { average: number; peak: number } {
  const average = eventsPerDay / SECONDS.day;
  return { average, peak: average * peakFactor };
}

/** Allowed downtime in seconds for an availability percentage over a period in seconds. */
export function downtimeSeconds(availabilityPercent: number, periodSeconds: number): number {
  return (1 - availabilityPercent / 100) * periodSeconds;
}

export interface Downtime {
  perYear: number;
  perMonth: number;
  perWeek: number;
  perDay: number;
}

/** Downtime budget (seconds) per year, month (a twelfth of a year), week and day. */
export function downtimeBudget(availabilityPercent: number): Downtime {
  return {
    perYear: downtimeSeconds(availabilityPercent, SECONDS.year),
    perMonth: downtimeSeconds(availabilityPercent, SECONDS.year / 12),
    perWeek: downtimeSeconds(availabilityPercent, SECONDS.week),
    perDay: downtimeSeconds(availabilityPercent, SECONDS.day),
  };
}

/** Components that must all work (in series): availabilities multiply. Inputs are fractions 0..1. */
export function availabilitySeries(parts: number[]): number {
  return parts.reduce((a, b) => a * b, 1);
}

/** Redundant components (in parallel): the system fails only if all fail. Inputs are fractions 0..1. */
export function availabilityParallel(parts: number[]): number {
  return 1 - parts.reduce((a, b) => a * (1 - b), 1);
}

/** Raw bytes stored for records kept `days` days, multiplied by the replication factor. */
export function storageBytes(recordsPerDay: number, bytesPerRecord: number, days: number, replication = 3): number {
  return recordsPerDay * bytesPerRecord * days * replication;
}

/** Network throughput in bits per second for a request rate and response size. */
export function bandwidthBitsPerSecond(qps: number, bytesPerResponse: number): number {
  return qps * bytesPerResponse * 8;
}

/** Servers needed for a peak load, planning to use only `utilization` of each server's capacity. */
export function serversNeeded(peakQps: number, qpsPerServer: number, utilization = 0.7): number {
  return Math.max(1, Math.ceil(peakQps / (qpsPerServer * utilization)));
}

/** Format seconds as the largest sensible unit, e.g. 31536 -> "8.76 hours". */
export function formatDuration(seconds: number): string {
  const abs = Math.abs(seconds);
  const fmt = (v: number, unit: string) => `${v >= 100 ? Math.round(v) : Number(v.toPrecision(3))} ${unit}${v === 1 ? "" : "s"}`;
  if (abs < 1e-6) return fmt(seconds * 1e9, "nanosecond");
  if (abs < 1e-3) return fmt(seconds * 1e6, "microsecond");
  if (abs < 1) return fmt(seconds * 1e3, "millisecond");
  if (abs < 60) return fmt(seconds, "second");
  if (abs < 3600) return fmt(seconds / 60, "minute");
  if (abs < 86_400) return fmt(seconds / 3600, "hour");
  if (abs < 365 * 86_400) return fmt(seconds / 86_400, "day");
  return fmt(seconds / (365 * 86_400), "year");
}

/** Decimal byte formatting (KB = 1000 bytes), the convention used in capacity estimates. */
export function formatBytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  let v = bytes;
  let i = 0;
  while (v >= 1000 && i < units.length - 1) {
    v /= 1000;
    i++;
  }
  return `${v >= 100 ? Math.round(v) : Number(v.toPrecision(3))} ${units[i]}`;
}

/** Format bits per second as bps/Kbps/Mbps/Gbps. */
export function formatBitrate(bps: number): string {
  const units = ["bps", "Kbps", "Mbps", "Gbps", "Tbps"];
  let v = bps;
  let i = 0;
  while (v >= 1000 && i < units.length - 1) {
    v /= 1000;
    i++;
  }
  return `${v >= 100 ? Math.round(v) : Number(v.toPrecision(3))} ${units[i]}`;
}

/** The "human scale" trick: stretch 1 ns to 1 second so cache and network costs become intuitive. */
export function humanScale(ns: number): string {
  return formatDuration(ns);
}