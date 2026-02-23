import { NextRequest, NextResponse } from "next/server";
import { PLAN_LIMITS, type PlanType } from "@/lib/ai/config";

/* ─── Usage API ───────────────────────────────────────────── */

// GET: Today's usage stats
export async function GET() {
    // Mock — in production, fetched from UsageRecord table
    const usage = {
        date: new Date().toISOString().split("T")[0],
        textMessagesUsed: 3,
        avatarMinutesUsed: 0,
        teacherModeActivations: 1,
        plan: "FREE" as PlanType,
        limits: PLAN_LIMITS.FREE,
        remaining: {
            textMessages: PLAN_LIMITS.FREE.textMessagesPerDay - 3,
            avatarMinutes: PLAN_LIMITS.FREE.avatarMinutesPerMonth - 0,
        },
    };

    return NextResponse.json({ usage });
}

// POST: Increment usage counter
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { type } = body; // "text_message" | "avatar_minute" | "teacher_mode"

        // Mock — in production, this increments the UsageRecord
        return NextResponse.json({
            success: true,
            type,
            message: `Usage recorded: ${type}`,
        });
    } catch (error) {
        console.error("[Usage API Error]:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
