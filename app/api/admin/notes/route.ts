import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { generateShareCode } from "@/lib/codeGenerator";

type NoteDoc = {
  _id: { toString(): string };
  content: string;
  code: string;
  active: boolean;
  createdAt: Date;
  expiresAt: Date;
  createdBy?: { toString(): string };
};

export async function POST(request: NextRequest) {
  try {
    let createdBy: ObjectId | undefined;
    try {
      const body = await request.json().catch(() => ({}));
      const userId = body?.userId;
      if (userId && typeof userId === "string") {
        createdBy = new ObjectId(userId);
      }
    } catch {
      // no body or invalid, leave createdBy undefined
    }

    const db = await getDb();
    const notes = db.collection("notes");

    let code = "";
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      code = generateShareCode();
      const existing = await notes.findOne({ code });
      if (!existing) isUnique = true;
      attempts++;
    }

    if (!isUnique || !code) {
      return NextResponse.json(
        { error: "Failed to generate unique code" },
        { status: 500 }
      );
    }

    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);

    const doc: Record<string, unknown> = {
      content: "",
      code,
      active: true,
      createdAt,
      expiresAt,
    };
    if (createdBy) doc.createdBy = createdBy;

    const result = await notes.insertOne(doc);

    const id = result.insertedId.toString();
    return NextResponse.json({
      success: true,
      note: {
        id,
        content: "",
        code,
        active: true,
        createdAt,
        expiresAt,
        ...(createdBy && { createdBy: createdBy.toString() }),
      },
    });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const db = await getDb();
    const notes = db.collection("notes");

    let query: Record<string, unknown> = {};
    if (userId) {
      try {
        query = { createdBy: new ObjectId(userId) };
      } catch {
        return NextResponse.json(
          { error: "Invalid userId" },
          { status: 400 }
        );
      }
    }
    const all = (await notes
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()) as unknown as NoteDoc[];

    const items = all.map((n) => ({
      id: n._id.toString(),
      content: n.content,
      code: n.code,
      active: n.active,
      createdAt: n.createdAt,
      expiresAt: n.expiresAt,
      ...(n.createdBy && { createdBy: n.createdBy.toString() }),
    }));

    return NextResponse.json({ success: true, notes: items });
  } catch (error) {
    console.error("Error fetching admin notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}
