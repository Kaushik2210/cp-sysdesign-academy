import { describe, expect, it } from "vitest";
import {
  SECONDS,
  availabilityParallel,
  availabilitySeries,
  bandwidthBitsPerSecond,
  downtimeBudget,
  formatBitrate,
  formatBytes,
  formatDuration,
  perDayToQps,
  serversNeeded,
  storageBytes,
} from "../src/lib/numbers";

describe("perDayToQps", () => {
  it("one million per day is about 11.6 per second", () => {
    expect(perDayToQps(1_000_000).average).toBeCloseTo(11.574, 2);
  });
  it("applies the peak factor", () => {
    expect(perDayToQps(86_400, 5)).toEqual({ average: 1, peak: 5 });
  });
});

describe("availability", () => {
  it("99.9% allows 8.76 hours a year", () => {
    expect(downtimeBudget(99.9).perYear / 3600).toBeCloseTo(8.76, 2);
  });
  it("99.99% allows 52.56 minutes a year and 99.999% allows 315.36 seconds", () => {
    expect(downtimeBudget(99.99).perYear / 60).toBeCloseTo(52.56, 2);
    expect(downtimeBudget(99.999).perYear).toBeCloseTo(315.36, 2);
  });
  it("100% allows no downtime", () => {
    expect(downtimeBudget(100).perYear).toBe(0);
  });
  it("series multiplies and parallel combines failure probabilities", () => {
    expect(availabilitySeries([0.999, 0.999])).toBeCloseTo(0.998001, 6);
    expect(availabilityParallel([0.99, 0.99])).toBeCloseTo(0.9999, 6);
    expect(availabilitySeries([])).toBe(1);
  });
  it("chains of nines get worse in series and better in parallel", () => {
    expect(availabilitySeries([0.999, 0.999, 0.999])).toBeLessThan(0.999);
    expect(availabilityParallel([0.9, 0.9])).toBeGreaterThan(0.9);
  });
});

describe("capacity", () => {
  it("storage multiplies records, size, days and replication", () => {
    expect(storageBytes(1_000_000, 500, 365, 3)).toBe(547_500_000_000);
  });
  it("bandwidth converts bytes to bits", () => {
    expect(bandwidthBitsPerSecond(1000, 125_000)).toBe(1_000_000_000);
  });
  it("servers round up and keep headroom", () => {
    expect(serversNeeded(1000, 500, 0.7)).toBe(3);
    expect(serversNeeded(1, 500)).toBe(1);
    expect(SECONDS.year).toBe(365 * 86_400);
  });
});

describe("formatting", () => {
  it("picks sensible units", () => {
    expect(formatDuration(31_536)).toBe("8.76 hours");
    expect(formatDuration(0.0005)).toBe("500 microseconds");
    expect(formatDuration(1)).toBe("1 second");
    expect(formatDuration(125_000_000)).toBe("3.96 years");
  });
  it("formats bytes with decimal units and bit rates", () => {
    expect(formatBytes(547_500_000_000)).toBe("548 GB");
    expect(formatBytes(999)).toBe("999 B");
    expect(formatBitrate(1_000_000_000)).toBe("1 Gbps");
    expect(formatBitrate(1500)).toBe("1.5 Kbps");
  });
});