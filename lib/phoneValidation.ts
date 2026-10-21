/** Phone check for the waitlist form: 10 to 15 digits, with an optional leading "+" and common separators. */
export function isValidPhone(value: string): boolean {
  const v = value.trim();
  if (!/^\+?[0-9\s().-]+$/.test(v)) return false;
  const digits = v.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}
