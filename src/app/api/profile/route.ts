import { NextRequest, NextResponse } from "next/server";

/* ─── Profile API ─────────────────────────────────────────── */
// POST: Save or update student profile
// In production this would use Prisma to persist to PostgreSQL

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { grade, examTarget, subjects, preferredTeacherAvatar } = body;

        if (!grade) {
            return NextResponse.json(
                { error: "Grade is required" },
                { status: 400 }
            );
        }

        // Mock response — in production, this saves to DB via Prisma
        const profile = {
            id: "mock-profile-id",
            userId: "mock-user-id",
            grade,
            examTarget: examTarget || null,
            subjects: subjects || [],
            diagnosticResults: null,
            difficultyLevel: "medium",
            preferredTeacherAvatar: preferredTeacherAvatar || "sharma",
            preferredLanguage: "en-hi",
            totalSessions: 0,
            totalDoubtsCleared: 0,
            createdAt: new Date().toISOString(),
        };

        return NextResponse.json({
            success: true,
            profile,
        });
    } catch (error) {
        console.error("[Profile API Error]:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// GET: Retrieve current student profile
export async function GET() {
    // Mock response
    return NextResponse.json({
        profile: {
            id: "mock-profile-id",
            userId: "mock-user-id",
            grade: "Class 11",
            examTarget: "JEE Main",
            subjects: ["Mathematics", "Physics", "Chemistry"],
            difficultyLevel: "medium",
            preferredTeacherAvatar: "sharma",
            totalSessions: 12,
            totalDoubtsCleared: 45,
        },
    });
}
