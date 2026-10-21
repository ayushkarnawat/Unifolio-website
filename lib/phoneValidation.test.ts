import { describe, expect, it } from "vitest";
import { isValidPhone } from "./phoneValidation";

describe("isValidPhone", () => {
  it("accepts normal numbers", () => {
    for (const p of ["9876543210", "+91 98765 43210", "+91-98765-43210", "(022) 2345 6789", " 098765 43210 "]) {
      expect(isValidPhone(p), p).toBe(true);
    }
  });
  it("rejects short, long and non-numeric input", () => {
    for (const p of ["", "12345", "abcdefghij", "98765 4321a", "+9198765432101234567", "98765"]) {
      expect(isValidPhone(p), p).toBe(false);
    }
  });
});
