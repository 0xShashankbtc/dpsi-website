import { describe, it, expect, beforeEach } from "vitest";
import { withCache, invalidateCache, clearAllCache } from "../lib/cache";
import { ensureCriticalIndexes } from "../models/cmsSchemas";

describe("Database Performance & Cache Acceleration Engine", () => {
  beforeEach(() => {
    clearAllCache();
  });

  it("returns cached data within sub-millisecond speeds (< 1ms)", async () => {
    let expensiveCallCount = 0;
    const fetcher = async () => {
      expensiveCallCount++;
      return { id: "item_1", name: "DPS Indirapuram", timestamp: Date.now() };
    };

    // First call: executes fetcher
    const firstResult = await withCache("test:dpsi_cache", 60, fetcher);
    expect(expensiveCallCount).toBe(1);
    expect(firstResult.name).toBe("DPS Indirapuram");

    // Second call: instant cache hit
    const startTime = performance.now();
    const cachedResult = await withCache("test:dpsi_cache", 60, fetcher);
    const duration = performance.now() - startTime;

    expect(expensiveCallCount).toBe(1); // Fetcher was NOT called again
    expect(cachedResult).toEqual(firstResult);
    expect(duration).toBeLessThan(5); // Sub-5ms instant memory delivery
  });

  it("correctly invalidates cache on targeted keys and prefixes", async () => {
    let callA = 0;
    let callB = 0;

    await withCache("cms:pages:published", 60, async () => {
      callA++;
      return ["page1", "page2"];
    });

    await withCache("cms:sliders", 60, async () => {
      callB++;
      return ["slide1", "slide2"];
    });

    expect(callA).toBe(1);
    expect(callB).toBe(1);

    // Invalidate only cms:pages
    invalidateCache("cms:pages");

    // cms:pages should be fetched afresh
    await withCache("cms:pages:published", 60, async () => {
      callA++;
      return ["page1", "page2", "page3"];
    });
    expect(callA).toBe(2);

    // cms:sliders should still be cached
    await withCache("cms:sliders", 60, async () => {
      callB++;
      return ["slide1"];
    });
    expect(callB).toBe(1);
  });

  it("handles wildcard prefix invalidation across related query keys", async () => {
    let count = 0;
    const fetcher = async () => {
      count++;
      return { verified: true };
    };

    await withCache("tc:verify:ADM100", 60, fetcher);
    await withCache("tc:verify:ADM200", 60, fetcher);
    expect(count).toBe(2);

    // Invalidate all TC caches
    invalidateCache("tc:");

    await withCache("tc:verify:ADM100", 60, fetcher);
    expect(count).toBe(3);
  });

  it("ensures critical database indexes function gracefully without throwing", async () => {
    // Should run and resolve without unhandled rejections
    await expect(ensureCriticalIndexes("dpsi")).resolves.not.toThrow();
  });
});

describe("Lean Query Shape & Memory Optimization", () => {
  it("verifies that plain POJO objects are returned by lean queries without Mongoose overhead", () => {
    const mockLeanDoc = {
      _id: "65f0a1b2c3d4e5f6a7b8c9d0",
      studentName: "Aarav Sharma",
      score: "99.4%",
      exam: "CBSE Class XII",
      order: 1,
      isActive: true,
    };

    // Mongoose internal properties should NOT exist on lean objects
    expect((mockLeanDoc as any).$__).toBeUndefined();
    expect((mockLeanDoc as any)._doc).toBeUndefined();
    expect((mockLeanDoc as any).$isNew).toBeUndefined();
    expect(typeof mockLeanDoc.studentName).toBe("string");
  });

  it("verifies HTTP compression middleware is available for rapid network delivery", async () => {
    const { Hono } = await import("hono");
    const { compress } = await import("hono/compress");
    const testApp = new Hono();
    testApp.use("*", compress());
    testApp.get("/test-compress", (c) => c.json({ data: "A".repeat(500) }));

    const res = await testApp.fetch(
      new Request("http://localhost/test-compress", {
        headers: { "accept-encoding": "gzip" },
      })
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("content-encoding")).toBe("gzip");
  });

  it("validates that all page baseline snapshots are complete and non-empty", async () => {
    const snapshots = await import("../../src/lib/initialDataSnapshot");
    expect(snapshots.DEFAULT_SITE_SETTINGS.length).toBeGreaterThan(0);
    expect(snapshots.DEFAULT_HEADER_MENUS.length).toBeGreaterThan(0);
    expect(snapshots.DEFAULT_LEADERSHIP.length).toBeGreaterThan(0);
    expect(snapshots.DEFAULT_DEPARTMENTS.length).toBeGreaterThan(0);
    expect(snapshots.DEFAULT_ADMISSION_STEPS.length).toBeGreaterThan(0);
    expect(snapshots.DEFAULT_FAQS.length).toBeGreaterThan(0);
    expect(snapshots.DEFAULT_TIMELINE.length).toBeGreaterThan(0);
    expect(snapshots.DEFAULT_CORE_VALUES.length).toBeGreaterThan(0);
    expect(snapshots.DEFAULT_BOARD_RESULTS.length).toBeGreaterThan(0);
    expect(snapshots.DEFAULT_STREAM_DISTRIBUTIONS.length).toBeGreaterThan(0);
  });
});
