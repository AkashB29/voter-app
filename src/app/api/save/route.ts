// src/app/api/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Voter from "@/lib/models/Voter";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { epicId, name, ward, partNo, serialNo, pollingSchool, mobile } = body;

    if (!epicId || !name || !mobile) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(mobile)) {
      return NextResponse.json(
        { error: "Mobile number must be exactly 10 digits" },
        { status: 400 }
      );
    }

    // Upsert — update if same EPIC already saved, else insert
    const voter = await Voter.findOneAndUpdate(
      { epicId },
      { epicId, name, ward, partNo, serialNo, pollingSchool, mobile, savedAt: new Date() },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Voter record saved successfully",
      id: voter._id,
    });
  } catch (err) {
    console.error("Save error:", err);
    return NextResponse.json(
      { error: "Failed to save record to database" },
      { status: 500 }
    );
  }
}
