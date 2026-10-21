import { describe, expect, it } from "vitest";
import { isValidEmail } from "./emailValidation";

describe("isValidEmail", () => {
  it("accepts normal addresses", () => {
    for (const e of [
      "hello@example.com",
      "aditi.shanbhag@unifolio.in",
      "first.last+tag@sub.domain.co.uk",
      "  spaced@example.org  ",
      "a_b-c@my-domain.io",
    ]) expect(isValidEmail(e), e).toBe(true);
  });

  it("rejects random text and incomplete addresses", () => {
    for (const e of [
      "",
      "asdf",
      "asdf@",
      "@example.com",
      "asdf@asdf",
      "a@b.c",
      "name@domain.",
      "name@.com",
      "name@domain..com",
      "na me@example.com",
      "name@exa mple.com",
      "name@@example.com",
      "name@example.c0m",
      ".name@example.com",
      "name.@example.com",
      "na..me@example.com",
      "name@-example.com",
      "name@example-.com",
    ]) expect(isValidEmail(e), e).toBe(false);
  });

  it("rejects over-long addresses", () => {
    expect(isValidEmail(`${"a".repeat(65)}@example.com`)).toBe(false);
    expect(isValidEmail(`a@${"b".repeat(250)}.com`)).toBe(false);
  });
});
