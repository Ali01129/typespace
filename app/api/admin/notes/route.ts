import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { generateShareCode } from "@/lib/codeGenerator";

type NoteDoc = {
  _id: { toString(): string };
  content: string;
  code: string;
  active: boolean;
  createdAt: Date;
  expiresAt: Date;
};

export async function POST() {
  try {
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

    const result = await notes.insertOne({
      content: "",
      code,
      active: true,
      createdAt,
      expiresAt,
    });

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

export async function GET() {
  try {
    const db = await getDb();
    const notes = db.collection("notes");

    const all = (await notes
      .find({})
      .sort({ createdAt: -1 })
      .toArray()) as unknown as NoteDoc[];

    const items = all.map((n) => ({
      id: n._id.toString(),
      content: n.content,
      code: n.code,
      active: n.active,
      createdAt: n.createdAt,
      expiresAt: n.expiresAt,
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
