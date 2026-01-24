import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = ["user", "admin"] as const;
type Role = (typeof ROLES)[number];

function isValidRole(r: unknown): r is Role {
  return typeof r === "string" && ROLES.includes(r as Role);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const userRole: Role = isValidRole(role) ? role : "user";

    const db = await getDb();
    const users = db.collection("users");

    const existing = await users.findOne({
      email: trimmedEmail,
    });

    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdAt = new Date();

    const result = await users.insertOne({
      email: trimmedEmail,
      password: hashedPassword,
      role: userRole,
      createdAt,
    });

    return NextResponse.json({
      success: true,
      id: result.insertedId.toString(),
      email: trimmedEmail,
      role: userRole,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
