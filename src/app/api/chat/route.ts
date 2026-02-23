import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
    BASE_TEACHER_PROMPT,
    TEACHER_MODE_PROMPTS,
    isSafeQuery,
    isTeacherModeTrigger,
    type TeacherStep,
} from "@/lib/ai/config";

/* ─── Types ───────────────────────────────────────────────── */

interface ChatRequest {
    message: string;
    sessionId?: string;
    history?: Array<{ role: string; content: string }>;
    teacherMode?: boolean;
    teacherStep?: TeacherStep;
    studentProfile?: {
        grade?: string;
        exam?: string;
        subjects?: string[];
        weakTopics?: string[];
        difficultyLevel?: string;
    };
}

/* ─── Mock AI Response Generator ──────────────────────────── */
// This will be replaced with real OpenAI/Gemini calls later

function generateMockResponse(message: string, teacherStep?: TeacherStep): string {
    if (teacherStep) {
        return getMockTeacherStepResponse(message, teacherStep);
    }

    const lower = message.toLowerCase();

    if (lower.includes("newton") || lower.includes("force") || lower.includes("law")) {
        return `**Newton's Laws of Motion** are the foundation of classical mechanics. Let me explain each one clearly:\n\n**First Law (Inertia):** An object at rest stays at rest, and an object in motion stays in motion, unless acted upon by an external force.\n→ *Example:* When a bus suddenly stops, you fall forward. Your body was in motion and wanted to stay in motion!\n\n**Second Law (F = ma):** Force equals mass times acceleration.\n→ *Example:* Pushing an empty shopping cart vs a loaded one — same force, different acceleration because of different mass.\n\n**Third Law (Action-Reaction):** For every action, there is an equal and opposite reaction.\n→ *Example:* When you jump, you push the Earth down, and the Earth pushes you up!\n\nWould you like me to explain any of these in more detail? Or try a practice problem?`;
    }

    if (lower.includes("derivative") || lower.includes("differentiat") || lower.includes("calculus")) {
        return `**Differentiation** is all about finding the **rate of change** of a function.\n\n📐 **The Power Rule:** If f(x) = xⁿ, then f'(x) = n·xⁿ⁻¹\n\n**Step-by-step example:**\nFind the derivative of f(x) = 3x⁴ + 2x² - 5x + 7\n\n**Step 1:** Apply power rule to each term:\n→ d/dx(3x⁴) = 12x³\n→ d/dx(2x²) = 4x\n→ d/dx(-5x) = -5\n→ d/dx(7) = 0\n\n**Step 2:** Combine: f'(x) = **12x³ + 4x - 5**\n\n💡 **Think of it this way:** Derivative tells you the "slope" at any point. If speed is the derivative of distance, it tells you how fast you're going at any instant!\n\nShall I give you a practice problem to try?`;
    }

    if (lower.includes("chemical") || lower.includes("bond") || lower.includes("element")) {
        return `**Chemical Bonding** is how atoms stick together to form molecules. Let me break it down:\n\n🔬 **There are 3 main types:**\n\n**1. Ionic Bond:** One atom gives electrons, another takes them.\n→ *Example:* NaCl (table salt) — Na gives 1 electron to Cl\n→ *Think of it as:* One friend lending money permanently!\n\n**2. Covalent Bond:** Atoms share electrons.\n→ *Example:* H₂O — Oxygen shares electrons with 2 Hydrogen atoms\n→ *Think of it as:* Friends sharing a pizza!\n\n**3. Metallic Bond:** Electrons float freely between metal atoms.\n→ *Example:* This is why metals conduct electricity\n→ *Think of it as:* A pool of electrons that everyone can swim in!\n\n**Key Rule:** Atoms bond to get 8 electrons in their outer shell (Octet Rule).\n\nWant me to explain ionic or covalent bonding in more detail?`;
    }

    return `Great question! Let me explain this clearly.\n\nHere's how I'd approach this:\n\n**Step 1:** Identify what concept is involved\n**Step 2:** Recall the relevant formula or rule\n**Step 3:** Apply it step by step\n**Step 4:** Verify the answer\n\nThe key insight here is to break the problem into smaller parts. Each part becomes easier to solve.\n\n💡 **Pro tip:** Always start by writing down what's given and what you need to find. This clarity alone solves half the problem!\n\nWould you like me to work through a specific example? Or should I explain the underlying concept first?`;
}

function getMockTeacherStepResponse(message: string, step: TeacherStep): string {
    switch (step) {
        case "GREETING":
            return "Hello! I can see this topic is giving you trouble. Don't worry at all — that's exactly why I'm here. 😊\n\nLet's work through this together, step by step. I want to first understand exactly where you're getting stuck, and then I'll explain it in a way that makes it really clear.\n\nReady? Let's begin!";

        case "DIAGNOSING":
            return "Okay, let me understand your confusion better.\n\nTell me — when you look at this concept, which part feels unclear?\n\n**A)** The basic definition itself\n**B)** The formula / mathematical part\n**C)** How to apply it in problems\n**D)** I understood the words but don't \"get\" why it works\n\nJust tell me which one (or describe in your own words), and I'll tailor my explanation accordingly.";

        case "EXPLAINING":
            return "Perfect, now I understand where you're stuck. Let me explain this differently.\n\n**Think of it like this:**\n\nImagine you're standing on a skateboard near a wall. What happens when you push the wall? *You* move backward! 🛹\n\nThe wall didn't move much (it's massive), but *it pushed you back* with exactly the same force. That's the key principle.\n\n**The rule is simple:** Forces ALWAYS come in pairs. They're equal in strength but opposite in direction, and they act on DIFFERENT objects.\n\n→ You push wall → Wall pushes you\n→ Both forces are equal\n→ But they act on different things (you vs wall)\n\nIs this making more sense now?";

        case "EXEMPLIFYING":
            return "Let me give you real-world examples that will make this stick forever:\n\n📖 **Example 1 — Walking:**\nYour foot pushes the ground *backward* → The ground pushes your foot *forward* → You move! Without the ground pushing back, you can't walk (that's why walking on ice is hard!).\n\n📖 **Example 2 — Swimming:**\nYour hands push water *backward* → Water pushes you *forward* → You glide through the pool! 🏊\n\n📖 **Example 3 — Rocket Launch:**\nThe rocket pushes hot gas *downward* → The gas pushes the rocket *upward* → LIFTOFF! 🚀\n\n📖 **Example 4 — Sitting on a Chair:**\nYou push the chair *down* (with your weight) → The chair pushes you *up* (normal force) → You don't fall through!\n\n**Notice the pattern?** In EVERY case, the two forces act on **different objects**. That's the most common mistake students make — they think both forces act on the same object.";

        case "CHALLENGING":
            return "Now it's YOUR turn! 💪 Let's see if you've really understood this.\n\n**Practice Problem:**\nA boy is standing inside a boat in a lake. He jumps from the boat onto the shore.\n\n**Question:** What happens to the boat when the boy jumps? Explain using Newton's Third Law.\n\n*Hint: Think about what the boy's feet do to the boat, and what the boat does to the boy's feet.*\n\nType your answer — don't worry about getting it perfect. I just want to see your thinking! 🧠";

        case "EVALUATING":
            return "Let me check your answer...\n\n✅ **Excellent work!** You've got the right idea!\n\nHere's the complete analysis:\n→ When the boy jumps forward, his feet push the boat **backward**\n→ The boat pushes his feet **forward** (giving him the force to jump)\n→ Result: The boy moves forward, the boat moves backward!\n\nThis is exactly Newton's Third Law in action. The forces are equal and opposite, acting on different objects (boy vs boat).\n\n⭐ **You understood it!** The fact that you connected the push and the reaction shows you've grasped the core concept.\n\nLet me give you a quick summary to lock this in...";

        case "SUMMARIZING":
            return "📋 **Quick Summary — Newton's Third Law:**\n\n1️⃣ Every force has an equal and opposite reaction force\n2️⃣ These forces act on **different objects** (not the same one!)\n3️⃣ The forces are equal in **magnitude** but opposite in **direction**\n4️⃣ They happen **simultaneously** — you can't have one without the other\n\n🧠 **Memory trick:** \"If I push you, you push me back. Always. No exceptions.\"\n\nYou did really well today! This concept clicks once you see the pattern in real life.";

        case "PRACTICING":
            return "Here are some practice problems to solidify your understanding:\n\n**Question 1 (Easy):**\nWhen you hammer a nail into a wall, the nail also pushes back on the hammer. If this is true, why does the nail go INTO the wall but the hammer doesn't go backward?\n\n*Hint: Think about what other forces are acting on the nail and hammer.*\n\n**Question 2 (Medium):**\nA horse pulls a cart. The cart pulls back on the horse with equal force (Third Law). If the forces are equal, how does the cart move forward?\n\n*Hint: Consider ALL the forces on the cart, not just the one from the horse.*\n\n**Question 3 (Challenge):**\nAn astronaut in space pushes against a satellite. Both the astronaut and the satellite move. Who moves faster, and why?\n\n*Hint: Think about F = ma for both objects.*\n\nTry these at your own pace! I'm here if you need any help. 🎯";

        default:
            return "Let me help you with that!";
    }
}

/* ─── Gemini Integration ────────────────────────────────────── */

async function callGemini(
    message: string,
    history: Array<{ role: string; content: string }> = [],
    systemInstruction: string
): Promise<string | null> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null; // Fallback to mock

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction,
        });

        // Map history to Gemini format (user/model roles)
        const geminiHistory = history
            .filter((msg) => msg.role === "STUDENT" || msg.role === "TEACHER")
            .map((msg) => ({
                role: msg.role === "STUDENT" ? "user" : "model",
                parts: [{ text: msg.content }],
            }));

        const chat = model.startChat({
            history: geminiHistory,
        });

        const result = await chat.sendMessage(message);
        return result.response.text();
    } catch (error) {
        console.error("[Gemini API Error]:", error);
        return null; // Fallback to mock on error
    }
}

/* ─── API Route ───────────────────────────────────────────── */

export async function POST(req: NextRequest) {
    try {
        const authSession = await auth();
        const userId = authSession?.user?.id;

        const body: ChatRequest = await req.json();
        const { message, teacherMode, teacherStep, studentProfile, history = [] } = body;
        let { sessionId } = body;

        if (!message || typeof message !== "string") {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        // Safety check
        const safety = isSafeQuery(message);
        if (!safety.safe) {
            return NextResponse.json({ reply: safety.reason, blocked: true });
        }

        const shouldActivateTeacher = !teacherMode && isTeacherModeTrigger(message);

        // Build context for the system prompt
        const contextParts: string[] = [BASE_TEACHER_PROMPT];
        if (studentProfile) {
            contextParts.push(`\nSTUDENT CONTEXT:`);
            if (studentProfile.grade) contextParts.push(`Grade: ${studentProfile.grade}`);
            if (studentProfile.exam) contextParts.push(`Exam: ${studentProfile.exam}`);
            if (studentProfile.subjects) contextParts.push(`Subjects: ${studentProfile.subjects.join(", ")}`);
            if (studentProfile.weakTopics) contextParts.push(`Weak Topics: ${studentProfile.weakTopics.join(", ")}`);
            if (studentProfile.difficultyLevel) contextParts.push(`Difficulty: ${studentProfile.difficultyLevel}`);
        }

        if (teacherMode && teacherStep) {
            contextParts.push(`\nTEACHER MODE STEP: ${teacherStep}`);
            contextParts.push(TEACHER_MODE_PROMPTS[teacherStep]);
        }

        const systemInstruction = contextParts.join("\n");

        // Save USER message to DB if authenticated
        if (userId && sessionId) {
            // First ensure session exists
            const dbSession = await prisma.session.findUnique({ where: { id: sessionId } });
            if (!dbSession) {
                await prisma.session.create({
                    data: {
                        id: sessionId,
                        userId,
                        type: "DOUBT",
                        mode: teacherMode ? "TEACHER_MODE_AVATAR" : "TEXT_CHAT",
                    }
                });
            }

            await prisma.message.create({
                data: {
                    sessionId,
                    role: "STUDENT",
                    content: message,
                }
            });
        }

        // Attempt Gemini call
        let reply = await callGemini(message, history, systemInstruction);

        // Fallback to mock if API key missing or failed
        if (!reply) {
            reply = generateMockResponse(message, teacherStep);
        }

        // Save AI message to DB if authenticated
        if (userId && sessionId && reply) {
            await prisma.message.create({
                data: {
                    sessionId,
                    role: "TEACHER",
                    content: reply,
                    metadata: JSON.stringify({ teacherStep, teacherMode })
                }
            });

            // Update session metrics
            await prisma.session.update({
                where: { id: sessionId },
                data: {
                    messageCount: { increment: 2 },
                    mode: teacherMode ? "TEACHER_MODE_AVATAR" : "TEXT_CHAT",
                }
            });
        }

        return NextResponse.json({
            reply,
            teacherModeTrigger: shouldActivateTeacher,
            teacherStep: teacherStep || null,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("[Chat API Error]:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
