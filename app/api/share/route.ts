import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { generateShareCode } from '@/lib/codeGenerator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, userId } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    let createdBy: ObjectId | undefined;
    if (userId && typeof userId === 'string') {
      try {
        createdBy = new ObjectId(userId);
      } catch {
        // ignore invalid userId
      }
    }

    const db = await getDb();
    const notesCollection = db.collection('notes');

    // Generate a unique code
    let code: string = '';
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      code = generateShareCode();
      const existingNote = await notesCollection.findOne({ code });
      
      if (!existingNote) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique || !code) {
      return NextResponse.json(
        { error: 'Failed to generate unique code. Please try again.' },
        { status: 500 }
      );
    }

    // Calculate expiration date (24 hours from now)
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);

    const doc: Record<string, unknown> = {
      content,
      code,
      active: true,
      createdAt,
      expiresAt,
    };
    if (createdBy) doc.createdBy = createdBy;

    // Insert note into database
    const result = await notesCollection.insertOne(doc);

    return NextResponse.json({
      success: true,
      code,
      id: result.insertedId,
    });
  } catch (error) {
    console.error('Error sharing note:', error);
    return NextResponse.json(
      { error: 'Failed to share note' },
      { status: 500 }
    );
  }
}

