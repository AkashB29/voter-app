// src/app/api/mobile/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Voter from "@/lib/models/Voter";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const epicId = req.nextUrl.searchParams.get("epicId");

    if (!epicId) {
      return NextResponse.json(
        { error: "epicId is required" },
        { status: 400 },
      );
    }

    const record = await Voter.findOne({ epicId }).select("mobile").lean();

    if (!record) {
      return NextResponse.json({ mobile: null });
    }

    return NextResponse.json({ mobile: record.mobile });
  } catch (err) {
    console.error("Mobile fetch error:", err);
    return NextResponse.json({ mobile: null });
  }
}
