import "dotenv/config";
import { prisma } from "../src/lib/db";

async function main() {
    console.log("🌱 Seeding DoubtDesk database...\n");

    // ─── 1. Create demo user ──────────────────────────────────
    const user = await prisma.user.upsert({
        where: { email: "ankit@example.com" },
        update: {},
        create: {
            email: "ankit@example.com",
            name: "Ankit Raj",
            authProvider: "google",
        },
    });
    console.log(`✅ User: ${user.name} (${user.email})`);

    // ─── 2. Student profile ───────────────────────────────────
    await prisma.studentProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
            userId: user.id,
            grade: "Class 12",
            examTarget: "JEE Main",
            subjects: JSON.stringify(["Physics", "Mathematics", "Chemistry"]),
            difficultyLevel: "medium",
            preferredTeacherAvatar: "sharma",
            preferredLanguage: "en-hi",
            totalSessions: 42,
            totalDoubtsCleared: 187,
        },
    });
    console.log("✅ Student profile created");

    // ─── 3. Subscription (Free tier) ─────────────────────────
    const subscription = await prisma.subscription.upsert({
        where: { id: "sub-demo-free" },
        update: {},
        create: {
            id: "sub-demo-free",
            userId: user.id,
            plan: "FREE",
            status: "ACTIVE",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date("2099-12-31"),
        },
    });
    console.log("✅ Free subscription created");

    // ─── 4. Payment (initial free) ────────────────────────────
    await prisma.payment.upsert({
        where: { id: "pay-demo-free" },
        update: {},
        create: {
            id: "pay-demo-free",
            subscriptionId: subscription.id,
            userId: user.id,
            amountPaise: 0,
            status: "SUCCESS",
        },
    });
    console.log("✅ Payment record created");

    // ─── 5. Weak topics ──────────────────────────────────────
    const weakTopics = [
        { subject: "Physics", topic: "Thermodynamics — Carnot Cycle", weaknessScore: 0.82, timesStruggled: 5, timesPracticed: 2 },
        { subject: "Mathematics", topic: "Integration by Parts", weaknessScore: 0.71, timesStruggled: 4, timesPracticed: 3 },
        { subject: "Chemistry", topic: "Electrochemistry — Nernst Equation", weaknessScore: 0.65, timesStruggled: 3, timesPracticed: 1 },
        { subject: "Physics", topic: "Electromagnetic Induction", weaknessScore: 0.58, timesStruggled: 3, timesPracticed: 4 },
        { subject: "Mathematics", topic: "Differential Equations", weaknessScore: 0.45, timesStruggled: 2, timesPracticed: 5 },
        { subject: "Chemistry", topic: "Organic Reactions — SN1/SN2", weaknessScore: 0.39, timesStruggled: 2, timesPracticed: 4 },
    ];

    for (const wt of weakTopics) {
        await prisma.weakTopic.upsert({
            where: { userId_subject_topic: { userId: user.id, subject: wt.subject, topic: wt.topic } },
            update: {},
            create: { userId: user.id, ...wt },
        });
    }
    console.log(`✅ ${weakTopics.length} weak topics created`);

    // ─── 6. Sessions ──────────────────────────────────────────
    const sessions = [
        { subject: "Physics", topic: "Newton's Laws", type: "DOUBT", mode: "TEXT_CHAT", messageCount: 12, durationSeconds: 320, avatarUsed: true, status: "COMPLETED" },
        { subject: "Mathematics", topic: "Quadratic Equations", type: "DOUBT", mode: "TEXT_CHAT", messageCount: 8, durationSeconds: 180, avatarUsed: false, status: "COMPLETED" },
        { subject: "Chemistry", topic: "Chemical Bonding", type: "DOUBT", mode: "TEACHER_MODE_AVATAR", messageCount: 15, durationSeconds: 240, avatarUsed: true, status: "COMPLETED" },
    ];

    for (const s of sessions) {
        await prisma.session.create({
            data: {
                userId: user.id,
                ...s,
                startedAt: new Date(Date.now() - Math.random() * 86400000 * 3),
                endedAt: new Date(),
            },
        });
    }
    console.log(`✅ ${sessions.length} sessions created`);

    // ─── 7. Usage record for today ────────────────────────────
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.usageRecord.upsert({
        where: { userId_usageDate: { userId: user.id, usageDate: today } },
        update: {},
        create: {
            userId: user.id,
            usageDate: today,
            textMessagesUsed: 3,
            avatarMinutesUsed: 0,
            teacherModeActivations: 1,
        },
    });
    console.log("✅ Today's usage record created");

    console.log("\n🎉 Seed complete! Demo user: ankit@example.com");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
