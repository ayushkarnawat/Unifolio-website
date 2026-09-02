export type MobilePlatform = "ios" | "android" | "unknown";

export function detectMobilePlatform(userAgent: string): MobilePlatform {
  const ua = userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(ua)) {
    return "ios";
  }

  if (/android/.test(ua)) {
    return "android";
  }

  return "unknown";
}
