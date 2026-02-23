"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Link from "next/link";

interface SubscriptionInfo {
    plan: string;
    status: string;
    currentPeriodEnd: string;
}

interface UsageInfo {
    textMessagesUsed: number;
    avatarMinutesUsed: number;
    teacherModeActivations: number;
}

interface PaymentRecord {
    id: string;
    amount: number;
    currency: string;
    status: string;
    method: string;
    createdAt: string;
}

interface Limits {
    textMessagesPerDay: number;
    avatarMinutesPerMonth: number;
    teacherModeActivationsPerDay: number;
}

export default function AccountPage() {
    const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
    const [usage, setUsage] = useState<UsageInfo | null>(null);
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [limits, setLimits] = useState<Limits | null>(null);
    const [loading, setLoading] = useState(true);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);

    useEffect(() => {
        fetchBillingData();
    }, []);

    const fetchBillingData = async () => {
        try {
            const res = await fetch("/api/billing");
            const data = await res.json();
            setSubscription(data.subscription);
            setUsage(data.usage);
            setPayments(data.payments);
            setLimits(data.limits);
        } catch (err) {
            console.error("Failed to fetch billing data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        const res = await fetch("/api/billing", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "cancel_subscription" }),
        });
        const data = await res.json();
        if (data.success) {
            setSubscription((prev) => prev ? { ...prev, status: "cancelled" } : null);
            setCancelModalOpen(false);
        }
    };

    const planLabel = (plan: string) => {
        switch (plan) {
            case "FREE": return "Starter (Free)";
            case "MONTHLY": return "Pro Monthly";
            case "YEARLY": return "Pro Annual";
            default: return plan;
        }
    };

    if (loading) {
        return (
            <div className={styles.accountPage}>
                <nav className={styles.nav}>
                    <Link href="/" className={styles.navLogo}>📖 <span>DoubtDesk</span></Link>
                    <Link href="/dashboard" className={styles.navBack}>← Back to Classroom</Link>
                </nav>
                <div className={styles.loadingState}>Loading your account...</div>
            </div>
        );
    }

    return (
        <div className={styles.accountPage}>
            <nav className={styles.nav}>
                <Link href="/" className={styles.navLogo}>📖 <span>DoubtDesk</span></Link>
                <Link href="/dashboard" className={styles.navBack}>← Back to Classroom</Link>
            </nav>

            <div className={styles.accountContent}>
                <h1 className={styles.pageTitle}>Account & Billing</h1>

                {/* Plan Card */}
                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2>Current Plan</h2>
                        <span className={`${styles.statusBadge} ${subscription?.status === "active" ? styles.statusActive : styles.statusInactive}`}>
                            {subscription?.status || "unknown"}
                        </span>
                    </div>
                    <div className={styles.planRow}>
                        <div>
                            <div className={styles.planName}>{planLabel(subscription?.plan || "FREE")}</div>
                            {subscription?.plan !== "FREE" && (
                                <div className={styles.planMeta}>
                                    Renews {new Date(subscription!.currentPeriodEnd).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                                </div>
                            )}
                        </div>
                        <div className={styles.planActions}>
                            <Link href="/pricing" className={styles.upgradeBtn}>
                                {subscription?.plan === "FREE" ? "🚀 Upgrade" : "Change Plan"}
                            </Link>
                            {subscription?.plan !== "FREE" && subscription?.status !== "cancelled" && (
                                <button className={styles.cancelBtn} onClick={() => setCancelModalOpen(true)}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* Usage Card */}
                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2>Today&apos;s Usage</h2>
                    </div>
                    <div className={styles.usageGrid}>
                        <div className={styles.usageItem}>
                            <div className={styles.usageLabel}>Text Doubts</div>
                            <div className={styles.usageBar}>
                                <div
                                    className={styles.usageBarFill}
                                    style={{ width: `${Math.min(100, ((usage?.textMessagesUsed || 0) / (limits?.textMessagesPerDay || 10)) * 100)}%` }}
                                ></div>
                            </div>
                            <div className={styles.usageCount}>
                                {usage?.textMessagesUsed || 0} / {limits?.textMessagesPerDay === 999999 ? "∞" : limits?.textMessagesPerDay || 10}
                            </div>
                        </div>

                        <div className={styles.usageItem}>
                            <div className={styles.usageLabel}>Avatar Teacher</div>
                            <div className={styles.usageBar}>
                                <div
                                    className={`${styles.usageBarFill} ${styles.usageBarAvatar}`}
                                    style={{ width: `${Math.min(100, ((usage?.avatarMinutesUsed || 0) / Math.max(1, limits?.avatarMinutesPerMonth || 2)) * 100)}%` }}
                                ></div>
                            </div>
                            <div className={styles.usageCount}>
                                {usage?.avatarMinutesUsed || 0} min / {limits?.avatarMinutesPerMonth || 2} min
                            </div>
                        </div>

                        <div className={styles.usageItem}>
                            <div className={styles.usageLabel}>Teacher Mode Sessions</div>
                            <div className={styles.usageBar}>
                                <div
                                    className={`${styles.usageBarFill} ${styles.usageBarTeacher}`}
                                    style={{ width: `${Math.min(100, ((usage?.teacherModeActivations || 0) / Math.max(1, limits?.teacherModeActivationsPerDay || 2)) * 100)}%` }}
                                ></div>
                            </div>
                            <div className={styles.usageCount}>
                                {usage?.teacherModeActivations || 0} / {limits?.teacherModeActivationsPerDay === 999999 ? "∞" : limits?.teacherModeActivationsPerDay || 2}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Payment History */}
                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2>Payment History</h2>
                    </div>
                    {payments.length === 0 ? (
                        <div className={styles.emptyState}>No payments yet</div>
                    ) : (
                        <div className={styles.paymentList}>
                            {payments.map((p) => (
                                <div key={p.id} className={styles.paymentRow}>
                                    <div>
                                        <div className={styles.paymentAmount}>
                                            {p.amount === 0 ? "Free" : `₹${(p.amount / 100).toLocaleString("en-IN")}`}
                                        </div>
                                        <div className={styles.paymentDate}>
                                            {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                        </div>
                                    </div>
                                    <span className={`${styles.paymentStatus} ${p.status === "captured" ? styles.paymentSuccess : ""}`}>
                                        {p.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Profile */}
                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2>Profile</h2>
                    </div>
                    <div className={styles.profileGrid}>
                        <div className={styles.profileItem}>
                            <label>Name</label>
                            <div>Ankit Raj</div>
                        </div>
                        <div className={styles.profileItem}>
                            <label>Email</label>
                            <div>ankit@example.com</div>
                        </div>
                        <div className={styles.profileItem}>
                            <label>Grade</label>
                            <div>Class 11</div>
                        </div>
                        <div className={styles.profileItem}>
                            <label>Exam Target</label>
                            <div>JEE Mains</div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Cancel Modal */}
            {cancelModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setCancelModalOpen(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3>Cancel Subscription?</h3>
                        <p>You&apos;ll lose access to Avatar Teacher and unlimited doubts at the end of your billing period.</p>
                        <div className={styles.modalActions}>
                            <button className={styles.modalKeep} onClick={() => setCancelModalOpen(false)}>
                                Keep Plan
                            </button>
                            <button className={styles.modalCancel} onClick={handleCancel}>
                                Yes, Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
