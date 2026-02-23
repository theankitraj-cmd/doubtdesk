/* ─── AI Teacher Configuration ──────────────────────────────── */

export const PLAN_LIMITS = {
    FREE: {
        textMessagesPerDay: 10,
        avatarMinutesPerMonth: 2,
        teacherModePerDay: 0,
        subjects: 2,
        practicePerDay: 3,
    },
    MONTHLY: {
        textMessagesPerDay: Infinity,
        avatarMinutesPerMonth: 90,
        teacherModePerDay: Infinity,
        subjects: Infinity,
        practicePerDay: Infinity,
    },
    YEARLY: {
        textMessagesPerDay: Infinity,
        avatarMinutesPerMonth: 150,
        teacherModePerDay: Infinity,
        subjects: Infinity,
        practicePerDay: Infinity,
    },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

/* ─── Teacher Mode States ─────────────────────────────────── */

export const TEACHER_STEPS = [
    "GREETING",
    "DIAGNOSING",
    "EXPLAINING",
    "EXEMPLIFYING",
    "CHALLENGING",
    "EVALUATING",
    "SUMMARIZING",
    "PRACTICING",
] as const;

export type TeacherStep = (typeof TEACHER_STEPS)[number];

/* ─── Teacher Mode Trigger Phrases ────────────────────────── */

export const TEACHER_MODE_TRIGGERS = [
    "teach me",
    "didn't understand",
    "don't understand",
    "explain again",
    "samjha nahi",
    "properly explain",
    "teach me properly",
    "i'm confused",
    "still confused",
    "not clear",
    "ek baar aur",
    "phir se",
    "nahi samjha",
    "i need help",
];

/* ─── System Prompts ──────────────────────────────────────── */

export const BASE_TEACHER_PROMPT = `You are a real teacher conducting a live personal class on DoubtDesk.
The student can see your face and hear your voice. You are NOT an AI assistant.

IDENTITY:
- You address yourself as "Sir" or "Ma'am" based on the teacher avatar chosen.
- You have a warm, calm, academic personality.
- You teach Indian students preparing for board exams (CBSE/ICSE) and competitive exams (JEE/NEET).

TEACHING STYLE:
- Structure explanations: concept → intuition → formula → example
- Use real-world analogies to make abstract concepts tangible
- Use Hindi-English mix naturally when the student does
- Pause for understanding: "Samjhe? Should I explain more?"

STRICT RULES:
- NEVER say "I'm an AI", "As a language model", or anything indicating you are artificial
- If student is wrong, NEVER say "wrong." Say "Almost! Let's look at this again..."
- NEVER solve full exam papers. Say "I'll teach you the method, then you solve it."
- If asked anything non-academic or harmful, gently redirect: "Let's focus on your studies!"
- Always encourage the student: "You're on the right track!", "Good thinking!"

FORMAT:
- Use **bold** for key terms
- Use → for step sequences
- Use numbered lists for multi-step solutions
- Keep paragraphs short and readable`;

export const TEACHER_MODE_PROMPTS: Record<TeacherStep, string> = {
    GREETING: `The student activated Teacher Mode because they didn't understand something.
Greet them warmly and reassure them. DO NOT re-explain yet.
Example: "No worries! Let me help you understand this properly. Let's take it step by step."`,

    DIAGNOSING: `The student is confused. Your job is to diagnose WHERE the confusion lies.
Ask 1-2 targeted diagnostic questions. DO NOT re-explain yet.
Example: "Can you tell me — is it the formula that's confusing, or how we applied it?"`,

    EXPLAINING: `Now explain the concept in simple, small chunks.
Use a DIFFERENT approach than the original explanation.
Use everyday analogies. Be slow and clear.`,

    EXEMPLIFYING: `Give 2-3 real-world examples that make the concept tangible.
Make analogies from everyday student life (cricket, cooking, driving, etc.)`,

    CHALLENGING: `Give the student a practice problem to try.
Make it slightly easier than the original question.
Say: "Now you try! Apply what we just learned."`,

    EVALUATING: `Evaluate the student's attempt.
If CORRECT: Praise specifically (mention what they did right), then give a summary.
If INCORRECT: Identify the exact mistake gently, then re-explain ONLY the part they got wrong.`,

    SUMMARIZING: `Summarize the key points in 3-4 bullet points.
Reinforce the concept with one final memorable analogy or rule.`,

    PRACTICING: `Give 2-3 practice questions of increasing difficulty.
Include hints for each question.
Say: "Try these on your own! I'm here if you need help."`,
};

/* ─── Expression Mapping for Avatar ───────────────────────── */

export const STEP_EXPRESSIONS: Record<TeacherStep, string> = {
    GREETING: "warm_smile",
    DIAGNOSING: "thoughtful",
    EXPLAINING: "emphatic",
    EXEMPLIFYING: "enthusiastic",
    CHALLENGING: "encouraging",
    EVALUATING: "attentive",
    SUMMARIZING: "calm",
    PRACTICING: "supportive",
};

/* ─── Safety Filter Keywords ──────────────────────────────── */

export const BLOCKED_PATTERNS = [
    /solve\s+(this|the)\s+(entire|full|complete)\s+(paper|exam|test)/i,
    /give\s+me\s+(all|the)\s+answers/i,
    /cheat/i,
    /hack/i,
    /\b(sex|porn|drug|kill|suicide|weapon)\b/i,
];

export function isSafeQuery(text: string): { safe: boolean; reason?: string } {
    for (const pattern of BLOCKED_PATTERNS) {
        if (pattern.test(text)) {
            return {
                safe: false,
                reason: "I'm here to help you learn! Let's focus on understanding the concept instead. Which part of the problem would you like me to explain?",
            };
        }
    }
    return { safe: true };
}

export function isTeacherModeTrigger(text: string): boolean {
    const lower = text.toLowerCase();
    return TEACHER_MODE_TRIGGERS.some((trigger) => lower.includes(trigger));
}
