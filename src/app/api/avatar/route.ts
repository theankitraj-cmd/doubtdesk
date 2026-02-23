import { NextRequest, NextResponse } from "next/server";
import {
    TEACHER_MODE_PROMPTS,
    STEP_EXPRESSIONS,
    PLAN_LIMITS,
    type TeacherStep,
    type PlanType,
} from "@/lib/ai/config";

/* ─── Types ───────────────────────────────────────────────── */

interface AvatarStartRequest {
    sessionId: string;
    teacherAvatar: string; // "sharma" | "priya" | "david"
    subject?: string;
    topic?: string;
}

interface AvatarStepRequest {
    sessionId: string;
    step: TeacherStep;
    studentMessage?: string;
}

/* ─── Face Model Registry ─────────────────────────────────── */

const FACE_MODELS: Record<string, { name: string; simliModelId: string; voiceId: string }> = {
    sharma: {
        name: "Sharma Sir",
        simliModelId: "mock-simli-sharma-01",
        voiceId: "mock-eleven-sharma-voice",
    },
    priya: {
        name: "Priya Ma'am",
        simliModelId: "mock-simli-priya-01",
        voiceId: "mock-eleven-priya-voice",
    },
    david: {
        name: "Mr. David",
        simliModelId: "mock-simli-david-01",
        voiceId: "mock-eleven-david-voice",
    },
};

/* ─── Mock Avatar Response Generator ──────────────────────── */

function generateAvatarSpeech(step: TeacherStep, studentMessage?: string): {
    speech: string;
    expression: string;
    voiceTone: string;
    durationEstimateMs: number;
} {
    const expression = STEP_EXPRESSIONS[step] || "default";
    const promptHint = TEACHER_MODE_PROMPTS[step] || "";

    const speeches: Record<TeacherStep, string> = {
        GREETING:
            "Hello! I'm so glad you asked for help. Don't worry at all — we'll work through this together. I can see this topic is tricky, but once I explain it in a different way, you'll definitely get it. Ready? Let's begin!",
        DIAGNOSING:
            "Okay, before I explain, let me understand where you're stuck. Tell me — is it the basic concept that's confusing? Or do you understand the theory but can't apply it in problems? Maybe the mathematical part is what's tricky? Just tell me in your own words, and I'll know exactly how to help.",
        EXPLAINING:
            "Perfect, now I understand. Let me explain this completely differently. Think of it this way — imagine you're at a supermarket pushing a shopping cart. When the cart is empty, a small push makes it zoom forward. But when it's fully loaded with groceries, the same push barely moves it. That's basically what F equals m times a means. The same force produces less acceleration when the mass is greater. The formula is simple, but the intuition is everything.",
        EXEMPLIFYING:
            "Let me give you some real-life examples that will make this click forever. Example one — when you're on a bus and it suddenly brakes, you fall forward. That's inertia, the first law. Example two — a cricket ball hit with more force goes further. That's F equals ma, the second law. Example three — when a rocket launches, the hot gas pushes down, and the rocket pushes up. Equal and opposite, that's the third law. See how physics is literally everywhere around you?",
        CHALLENGING:
            "Now it's your turn! I want you to try this problem. A car of mass 1000 kg is moving at 20 meters per second. The driver applies brakes and the car stops in 5 seconds. Find the braking force. Hint — first find the deceleration using v equals u plus at, then use F equals ma. Take your time, and type your answer!",
        EVALUATING:
            "Let me check your answer... Excellent work! You got the approach absolutely right. The deceleration is 4 meters per second squared, and the braking force is 4000 Newtons. The negative sign just means the force is opposite to the direction of motion. You've really understood this concept well! I'm proud of your progress.",
        SUMMARIZING:
            "Let me give you the key takeaways. Point one — Newton's laws describe how forces affect motion. Point two — F equals ma is the most important equation in mechanics. Point three — forces always come in pairs, acting on different objects. Point four — understanding the intuition is more important than memorizing formulas. If you understand WHY, the HOW becomes easy.",
        PRACTICING:
            "Here are three practice questions for you. Question one, easy — a ball of mass 0.5 kg is thrown with a force of 10 N. Find its acceleration. Question two, medium — a truck and a car collide. The truck exerts 5000 N on the car. What force does the car exert on the truck? Question three, challenge — an elevator of mass 800 kg accelerates upward at 2 meters per second squared. Find the tension in the cable. Try these on your own — I'm here if you need help!",
    };

    const speech = speeches[step] || "Let me help you understand this better.";
    const wordsPerMinute = 150;
    const words = speech.split(" ").length;
    const durationEstimateMs = (words / wordsPerMinute) * 60 * 1000;

    return {
        speech,
        expression,
        voiceTone: step === "GREETING" ? "warm" : step === "CHALLENGING" ? "encouraging" : "clear",
        durationEstimateMs,
    };
}

/* ─── API Routes ──────────────────────────────────────────── */

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action } = body;

        switch (action) {
            case "start": {
                const { teacherAvatar, sessionId } = body as AvatarStartRequest & { action: string };
                const model = FACE_MODELS[teacherAvatar] || FACE_MODELS.sharma;

                // In production: Initialize Simli session, LiveKit room, Deepgram STT
                return NextResponse.json({
                    avatarSession: {
                        id: `avatar-${Date.now()}`,
                        sessionId,
                        teacherName: model.name,
                        faceModelId: model.simliModelId,
                        voiceId: model.voiceId,
                        livekitToken: "mock-livekit-token",
                        livekitRoomUrl: "wss://mock-livekit.example.com",
                        status: "active",
                    },
                    costPerMinute: 0.05,
                });
            }

            case "step": {
                const { step, studentMessage } = body as AvatarStepRequest & { action: string };
                const response = generateAvatarSpeech(step, studentMessage);

                return NextResponse.json({
                    ...response,
                    step,
                    timestamp: new Date().toISOString(),
                });
            }

            case "interrupt": {
                return NextResponse.json({
                    success: true,
                    message: "Avatar paused. Listening to student...",
                    expression: "listening",
                });
            }

            case "end": {
                const { sessionId } = body;
                return NextResponse.json({
                    success: true,
                    sessionId,
                    recap: {
                        totalMinutes: 5.2,
                        stepsCompleted: ["GREETING", "DIAGNOSING", "EXPLAINING", "EXEMPLIFYING", "CHALLENGING"],
                        topicsCovered: ["Newton's Laws of Motion"],
                    },
                });
            }

            case "usage": {
                const plan: PlanType = "FREE";
                return NextResponse.json({
                    avatarMinutesUsed: 1.5,
                    avatarMinutesLimit: PLAN_LIMITS[plan].avatarMinutesPerMonth,
                    remaining: PLAN_LIMITS[plan].avatarMinutesPerMonth - 1.5,
                    plan,
                });
            }

            default:
                return NextResponse.json({ error: "Unknown action" }, { status: 400 });
        }
    } catch (error) {
        console.error("[Avatar API Error]:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
