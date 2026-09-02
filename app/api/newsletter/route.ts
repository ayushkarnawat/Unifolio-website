import { NextResponse } from "next/server";

/**
 * Stub endpoint — validates the payload and returns success without sending
 * anywhere. Wire up to a real email service provider before launch.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.email || typeof body.email !== "string") {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  // TODO: forward to the real newsletter/ESP integration.
  return NextResponse.json({ ok: true });
}
