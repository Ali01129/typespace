import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

type NoteDoc = {
  _id: { toString(): string };
  content: string;
  code: string;
  active: boolean;
  createdAt: Date;
  expiresAt: Date;
};

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
