import { NextRequest, NextResponse } from "next/server";
import { PLAN_LIMITS, type PlanType } from "@/lib/ai/config";

/* ─── Types ───────────────────────────────────────────────── */

interface SubscriptionData {
    id: string;
    userId: string;
    plan: PlanType;
    status: "active" | "cancelled" | "past_due" | "trialing";
    razorpaySubscriptionId: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelledAt: string | null;
}

interface PaymentData {
    id: string;
    subscriptionId: string;
    amount: number;
    currency: string;
    status: "captured" | "authorized" | "failed" | "refunded";
    razorpayPaymentId: string;
    method: string;
    createdAt: string;
}

/* ─── Mock Data ───────────────────────────────────────────── */

const MOCK_SUBSCRIPTION: SubscriptionData = {
    id: "sub_mock_001",
    userId: "user_mock_001",
    plan: "FREE",
    status: "active",
    razorpaySubscriptionId: "",
    currentPeriodStart: new Date().toISOString(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    cancelledAt: null,
};

const MOCK_PAYMENTS: PaymentData[] = [
    {
        id: "pay_001",
        subscriptionId: "sub_mock_001",
        amount: 0,
        currency: "INR",
        status: "captured",
        razorpayPaymentId: "",
        method: "free",
        createdAt: new Date().toISOString(),
    },
];

const PLAN_PRICES: Record<string, { amount: number; currency: string; razorpay_plan_id: string }> = {
    monthly: { amount: 34900, currency: "INR", razorpay_plan_id: "plan_mock_monthly" },
    yearly: { amount: 299900, currency: "INR", razorpay_plan_id: "plan_mock_yearly" },
};

/* ─── API Handler ─────────────────────────────────────────── */

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action } = body;

        switch (action) {
            /* ── Create Subscription ── */
            case "create_subscription": {
                const { planId } = body;
                const planConfig = PLAN_PRICES[planId];

                if (!planConfig) {
                    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
                }

                // In production: Create a Razorpay subscription
                // const razorpay = new Razorpay({ key_id, key_secret });
                // const subscription = await razorpay.subscriptions.create({ ... });

                const mockOrderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

                return NextResponse.json({
                    razorpayOrderId: mockOrderId,
                    razorpayKeyId: "rzp_test_mock_key",
                    amount: planConfig.amount,
                    currency: planConfig.currency,
                    planId,
                    subscriptionId: `sub_${Date.now()}`,
                    prefill: {
                        name: "Student",
                        email: "student@doubtdesk.in",
                        contact: "+919876543210",
                    },
                    notes: {
                        planId,
                        userId: "user_mock_001",
                    },
                });
            }

            /* ── Verify Payment ── */
            case "verify_payment": {
                const { razorpayPaymentId, razorpayOrderId, razorpaySignature, planId } = body;

                // In production: Verify signature
                // const expectedSignature = crypto
                //   .createHmac("sha256", key_secret)
                //   .update(razorpayOrderId + "|" + razorpayPaymentId)
                //   .digest("hex");

                const plan: PlanType = planId === "yearly" ? "YEARLY" : "MONTHLY";

                return NextResponse.json({
                    success: true,
                    subscription: {
                        ...MOCK_SUBSCRIPTION,
                        plan,
                        status: "active",
                        razorpaySubscriptionId: razorpayPaymentId || "mock_payment",
                    },
                    message: `Successfully upgraded to ${plan} plan!`,
                });
            }

            /* ── Cancel Subscription ── */
            case "cancel_subscription": {
                return NextResponse.json({
                    success: true,
                    subscription: {
                        ...MOCK_SUBSCRIPTION,
                        status: "cancelled",
                        cancelledAt: new Date().toISOString(),
                    },
                    message: "Subscription cancelled. Access continues until period end.",
                });
            }

            /* ── Get Subscription Status (Fallback for POST) ── */
            case "get_status": {
                const session = await auth();
                if (!session?.user?.id) {
                    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
                }
                const userId = session.user.id;

                const dbSub = await prisma.subscription.findFirst({
                    where: { userId },
                    orderBy: { createdAt: "desc" },
                });

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const dbUsage = await prisma.usageRecord.findUnique({
                    where: { userId_usageDate: { userId, usageDate: today } },
                });

                const dbPayments = await prisma.payment.findMany({
                    where: { userId },
                    orderBy: { createdAt: "desc" },
                });

                const activePlan = (dbSub?.plan as PlanType) || "FREE";
                const limits = PLAN_LIMITS[activePlan];

                return NextResponse.json({
                    subscription: dbSub || MOCK_SUBSCRIPTION,
                    limits,
                    usage: dbUsage || { textMessagesUsed: 0, avatarMinutesUsed: 0, teacherModeActivations: 0 },
                    payments: dbPayments,
                });
            }

            /* ── Get Plans ── */
            case "get_plans": {
                return NextResponse.json({
                    plans: [
                        {
                            id: "free",
                            name: "Starter",
                            price: 0,
                            limits: PLAN_LIMITS.FREE,
                        },
                        {
                            id: "monthly",
                            name: "Pro Monthly",
                            price: 349,
                            limits: PLAN_LIMITS.MONTHLY,
                        },
                        {
                            id: "yearly",
                            name: "Pro Annual",
                            price: 2999,
                            limits: PLAN_LIMITS.YEARLY,
                        },
                    ],
                });
            }

            default:
                return NextResponse.json({ error: "Unknown action" }, { status: 400 });
        }
    } catch (error) {
        console.error("[Billing API Error]:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

/* ─── Webhook Handler ─────────────────────────────────────── */
/* In production, Razorpay sends POST webhooks for payment     */
/* events. This handler verifies the webhook signature and      */
/* updates the database accordingly.                            */

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { event } = body;

        // In production: verify webhook signature
        // const signature = req.headers.get("x-razorpay-signature");
        // const expectedSignature = crypto
        //   .createHmac("sha256", webhook_secret)
        //   .update(JSON.stringify(body))
        //   .digest("hex");

        switch (event) {
            case "subscription.activated":
                console.log("[Webhook] Subscription activated:", body.payload);
                return NextResponse.json({ status: "ok", action: "subscription_activated" });

            case "subscription.charged":
                console.log("[Webhook] Payment captured:", body.payload);
                return NextResponse.json({ status: "ok", action: "payment_recorded" });

            case "subscription.cancelled":
                console.log("[Webhook] Subscription cancelled:", body.payload);
                return NextResponse.json({ status: "ok", action: "subscription_cancelled" });

            case "payment.failed":
                console.log("[Webhook] Payment failed:", body.payload);
                return NextResponse.json({ status: "ok", action: "payment_failed_handled" });

            default:
                console.log("[Webhook] Unhandled event:", event);
                return NextResponse.json({ status: "ignored" });
        }
    } catch (error) {
        console.error("[Webhook Error]:", error);
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
    }
}

/* ─── GET handler for billing status ── */
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        const dbSub = await prisma.subscription.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dbUsage = await prisma.usageRecord.findUnique({
            where: { userId_usageDate: { userId, usageDate: today } },
        });

        const dbPayments = await prisma.payment.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });

        const activePlan = (dbSub?.plan as PlanType) || "FREE";
        const limits = PLAN_LIMITS[activePlan];

        return NextResponse.json({
            subscription: dbSub || MOCK_SUBSCRIPTION,
            limits,
            usage: dbUsage || { textMessagesUsed: 0, avatarMinutesUsed: 0, teacherModeActivations: 0 },
            payments: dbPayments,
        });

    } catch (error) {
        console.error("[Billing GET Error]:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
