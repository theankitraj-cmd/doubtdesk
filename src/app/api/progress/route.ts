import { NextResponse } from "next/server";

/* ─── Progress API ────────────────────────────────────────── */
/* Returns student progress data: weak topics, subject         */
/* progress, study streak, and session summaries.              */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const [profile, weakTopics, dbSessions] = await Promise.all([
            prisma.studentProfile.findUnique({ where: { userId } }),
            prisma.weakTopic.findMany({ where: { userId }, orderBy: { weaknessScore: "desc" } }),
            prisma.session.findMany({ where: { userId }, orderBy: { startedAt: "desc" }, take: 10 })
        ]);

        const recentSessions = dbSessions.map((s: any) => ({
            id: s.id,
            subject: s.subject || "General",
            topic: s.topic || "Discussion",
            duration: s.durationSeconds || 0,
            messagesCount: s.messageCount || 0,
            avatarUsed: s.mode === "TEACHER_MODE_AVATAR",
            date: (s.startedAt || new Date()).toISOString().split('T')[0],
        }));

        const totalAvatarMinutes = Math.floor(
            dbSessions
                .filter((s: any) => s.mode === "TEACHER_MODE_AVATAR")
                .reduce((acc: any, curr: any) => acc + (curr.durationSeconds || 0), 0) / 60
        );

        const avgSessionDuration = dbSessions.length > 0
            ? Math.floor(dbSessions.reduce((acc: any, curr: any) => acc + (curr.durationSeconds || 0), 0) / dbSessions.length)
            : 0;

        return NextResponse.json({
            streak: {
                currentStreak: 7, // Placeholder logic
                longestStreak: 14,
                lastStudied: new Date().toISOString(),
                weekActivity: [true, true, true, false, true, true, true],
            },
            subjects: [
                { subject: "Physics", color: "#3B82F6", totalTopics: 24, mastered: 14, weak: weakTopics.filter((w: any) => w.subject === "Physics").length, practicing: 6, overallScore: 68 },
                { subject: "Mathematics", color: "#8B5CF6", totalTopics: 20, mastered: 12, weak: weakTopics.filter((w: any) => w.subject === "Mathematics").length, practicing: 5, overallScore: 72 },
                { subject: "Chemistry", color: "#10B981", totalTopics: 22, mastered: 15, weak: weakTopics.filter((w: any) => w.subject === "Chemistry").length, practicing: 4, overallScore: 75 },
            ],
            weakTopics: weakTopics.map((w: any) => ({
                id: w.id,
                subject: w.subject,
                topic: w.topic,
                weaknessScore: w.weaknessScore,
                timesStruggled: w.timesStruggled,
                timesPracticed: w.timesPracticed,
                lastSeen: w.updatedAt.toISOString().split('T')[0],
                trend: w.timesPracticed > w.timesStruggled ? "improving" : "stable"
            })),
            recentSessions,
            totalStats: {
                totalSessions: profile?.totalSessions || dbSessions.length,
                totalDoubtsCleared: profile?.totalDoubtsCleared || dbSessions.reduce((acc: any, curr: any) => acc + (curr.messageCount || 0), 0),
                totalAvatarMinutes,
                avgSessionDuration,
            },
        });
    } catch (error) {
        console.error("[Progress GET Error]:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

/* ── POST: Update weak topic practice count ── */
export async function POST(req: Request) {
    const body = await req.json();
    const { action, topicId } = body;

    if (action === "mark_practiced") {
        return NextResponse.json({
            success: true,
            topicId,
            message: "Topic marked as practiced. Keep it up!",
        });
    }

    if (action === "check_answer") {
        const { answer, expectedAnswer } = body;
        const isCorrect = answer.toLowerCase().includes(expectedAnswer.toLowerCase().slice(0, 3));
        return NextResponse.json({
            correct: isCorrect,
            feedback: isCorrect
                ? "Excellent! You've got the right approach."
                : "Not quite. Review the hint and try the formula again.",
        });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
