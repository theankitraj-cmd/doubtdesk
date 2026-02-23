import { NextRequest, NextResponse } from "next/server";

/* ─── Sessions API ────────────────────────────────────────── */

// GET: List sessions (paginated)
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Mock sessions
    const sessions = [
        {
            id: "s1",
            type: "DOUBT",
            mode: "TEXT_CHAT",
            subject: "Physics",
            topic: "Newton's Laws",
            summaryAi: "Discussed all three laws of motion with examples.",
            durationSeconds: 420,
            messageCount: 8,
            avatarUsed: false,
            status: "COMPLETED",
            startedAt: new Date(Date.now() - 3600000).toISOString(),
            endedAt: new Date(Date.now() - 3200000).toISOString(),
        },
        {
            id: "s2",
            type: "DOUBT",
            mode: "TEACHER_MODE_AVATAR",
            subject: "Mathematics",
            topic: "Quadratic Equations",
            summaryAi: "Solved quadratic equations using formula method. Student struggled with discriminant concept.",
            durationSeconds: 600,
            messageCount: 12,
            avatarUsed: true,
            status: "COMPLETED",
            startedAt: new Date(Date.now() - 7200000).toISOString(),
            endedAt: new Date(Date.now() - 6600000).toISOString(),
        },
        {
            id: "s3",
            type: "PRACTICE",
            mode: "TEXT_CHAT",
            subject: "Chemistry",
            topic: "Chemical Bonding",
            summaryAi: "Reviewed ionic and covalent bonding with practice problems.",
            durationSeconds: 300,
            messageCount: 6,
            avatarUsed: false,
            status: "COMPLETED",
            startedAt: new Date(Date.now() - 86400000).toISOString(),
            endedAt: new Date(Date.now() - 86100000).toISOString(),
        },
    ];

    return NextResponse.json({
        sessions,
        pagination: { page, limit, total: sessions.length },
    });
}

// POST: Create new session
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { subject, topic } = body;

        const session = {
            id: `s-${Date.now()}`,
            type: "DOUBT",
            mode: "TEXT_CHAT",
            subject: subject || null,
            topic: topic || null,
            messageCount: 0,
            avatarUsed: false,
            status: "ACTIVE",
            startedAt: new Date().toISOString(),
        };

        return NextResponse.json({ session }, { status: 201 });
    } catch (error) {
        console.error("[Sessions API Error]:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
