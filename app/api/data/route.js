import { NextResponse } from "next/server";
import { redis } from "../../../lib/redis";

const KEY = "arirang:data";

export async function GET() {
  try {
    const raw = await redis.get(KEY);
    const value = typeof raw === "string" ? JSON.parse(raw) : raw;
    return NextResponse.json({ value: value || null });
  } catch (e) {
    return NextResponse.json({ value: null, error: String(e) }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    await redis.set(KEY, JSON.stringify(body));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
