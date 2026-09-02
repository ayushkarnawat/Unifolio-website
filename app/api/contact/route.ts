import { NextResponse } from "next/server";

/**
 * Stub endpoint — validates the payload and returns success without sending
 * anywhere. Wire up to a real inbox/CRM integration before launch.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.email || !body?.name || !body?.message) {
    return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
  }

  // TODO: forward to the real contact-handling integration (email/CRM).
  return NextResponse.json({ ok: true });
}
