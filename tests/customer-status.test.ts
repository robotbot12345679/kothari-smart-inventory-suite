import { describe, expect, it } from "bun:test";
import { normalizeCustomerStatus } from "../src/lib/customer-status";

describe("normalizeCustomerStatus", () => {
  it("preserves an explicitly inactive customer", () => {
    expect(normalizeCustomerStatus("Inactive")).toBe("Inactive");
  });

  it("treats legacy or unrecognized statuses as active", () => {
    expect(normalizeCustomerStatus("17/07/25")).toBe("Active");
  });

  it("treats missing status as active", () => {
    expect(normalizeCustomerStatus(null)).toBe("Active");
  });
});