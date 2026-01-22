import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const notesCollection = db.collection('notes');

    // Find note by code
    const note = await notesCollection.findOne({ code });

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    // Check if note is more than 24 hours old
    const now = new Date();
    const createdAt = new Date(note.createdAt);
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    const isExpired = hoursSinceCreation > 24;

    // If expired, set active to false and return error
    if (isExpired) {
      if (note.active) {
        await notesCollection.updateOne(
          { code },
          { $set: { active: false } }
        );
      }
      return NextResponse.json(
        { error: 'This note has expired and is no longer available' },
        { status: 410 }
      );
    }

    // Check if note is already inactive
    if (!note.active) {
      return NextResponse.json(
        { error: 'This note is no longer available' },
        { status: 410 }
      );
    }

    return NextResponse.json({
      success: true,
      content: note.content,
      code: note.code,
    });
  } catch (error) {
    console.error('Error retrieving note:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve note' },
      { status: 500 }
    );
  }
}

