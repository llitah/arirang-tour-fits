import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { redis } from "../../../lib/redis";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  try {
    const value = await redis.get("img:" + id);
    return NextResponse.json({ value: value || null });
  } catch (e) {
    return NextResponse.json({ value: null, error: String(e) }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { dataUrl } = await req.json();
    if (!dataUrl) return NextResponse.json({ error: "missing dataUrl" }, { status: 400 });
    const id = randomUUID();
    await redis.set("img:" + id, dataUrl);
    return NextResponse.json({ id });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
