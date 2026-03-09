// src/app/api/voter/route.ts
import { NextRequest, NextResponse } from "next/server";
import https from "https";

const BBMP_URL = "https://electoralapi.bbmpgov.in/searchby-epic";

function fetchWithNoSSL(url: string, body: object): Promise<any> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const urlObj = new URL(url);

    const options: https.RequestOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: "POST",
      rejectUnauthorized: false, // equivalent to verify=False
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
        "User-Agent": "Mozilla/5.0",
        Origin: "https://gba.karnataka.gov.in",
        Referer: "https://gba.karnataka.gov.in/electoral2026/",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, json: JSON.parse(data) });
        } catch {
          reject(new Error("Invalid JSON response"));
        }
      });
    });

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

export async function POST(req: NextRequest) {
  try {
    const { epic } = await req.json();

    if (!epic || typeof epic !== "string") {
      return NextResponse.json(
        { error: "EPIC ID is required" },
        { status: 400 },
      );
    }

    const result = await fetchWithNoSSL(BBMP_URL, {
      epic_no: epic.trim().toUpperCase(),
    });

    if (result.status !== 200) {
      return NextResponse.json(
        { error: `API returned status ${result.status}` },
        { status: 502 },
      );
    }

    const data = result.json;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: "No voter found for this EPIC ID" },
        { status: 404 },
      );
    }

    const voter = data[0];

    return NextResponse.json({
      epicId: voter.voter_epic || "",
      name: (voter.name_en || "").trim(),
      ward: voter.ward_name || "",
      partNo: voter.ps_id || "",
      serialNo: parseInt(voter.ps_serial_no || "0", 10),
      pollingSchool: voter.ps_name || "",
    });
  } catch (err) {
    console.error("Voter fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch voter data. Please try again." },
      { status: 500 },
    );
  }
}
