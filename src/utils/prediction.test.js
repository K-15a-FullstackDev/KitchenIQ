import { daysToEmpty, lowStockStatus } from "./prediction";

describe("daysToEmpty", () => {
  test("basic divide and 1-decimal rounding", () => {
    expect(daysToEmpty(10, 2)).toBe(5);
    expect(daysToEmpty(5, 3)).toBe(1.7);
  });

  test("Infinity when usage <= 0", () => {
    expect(daysToEmpty(10, 0)).toBe(Infinity);
    expect(daysToEmpty(10, -1)).toBe(Infinity);
  });

  test("0 for invalid/negative stock", () => {
    expect(daysToEmpty(-1, 2)).toBe(0);
    expect(daysToEmpty("bad", 2)).toBe(0);
  });
});

describe("lowStockStatus", () => {
  test("low by reorder point", () => {
    const r = lowStockStatus({
      currentStock: 2,
      reorderPoint: 5,
      dailyUsageAvg: 1,
    });
    expect(r.low).toBe(true);
    expect(r.reason).toBe("reorder");
    expect(r.daysToEmpty).toBe(2);
  });

  test("low by soon-to-empty (<=3 days)", () => {
    const r = lowStockStatus({
      currentStock: 5,
      dailyUsageAvg: 2,
      reorderPoint: 1,
    });
    expect(r.low).toBe(true);
    expect(r.reason).toBe("soon");
    expect(r.daysToEmpty).toBe(2.5);
  });

  test("not low when stock > reorder and dtoe > 3", () => {
    const r = lowStockStatus({
      currentStock: 20,
      dailyUsageAvg: 2,
      reorderPoint: 5,
    });
    expect(r.low).toBe(false);
    expect(r.reason).toBeNull();
    expect(r.daysToEmpty).toBe(10);
  });
});
