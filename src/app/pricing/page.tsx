"use client";

import { useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";

/* ── Types ── */
interface Plan {
    id: string;
    name: string;
    price: string;
    priceNote: string;
    period: string;
    badge?: string;
    features: { text: string; included: boolean }[];
    highlight?: boolean;
    cta: string;
}

const PLANS: Plan[] = [
    {
        id: "free",
        name: "Starter",
        price: "₹0",
        priceNote: "Free forever",
        period: "",
        features: [
            { text: "10 text doubts per day", included: true },
            { text: "2 subjects", included: true },
            { text: "3 practice sets per day", included: true },
            { text: "7-day session history", included: true },
            { text: "2 min Avatar Teacher trial", included: true },
            { text: "Unlimited Avatar Teacher", included: false },
            { text: "All subjects", included: false },
            { text: "Priority AI responses", included: false },
            { text: "Unlimited session history", included: false },
        ],
        cta: "Current Plan",
    },
    {
        id: "monthly",
        name: "Pro",
        price: "₹349",
        priceNote: "per month",
        period: "monthly",
        badge: "Most Popular",
        highlight: true,
        features: [
            { text: "Unlimited text doubts", included: true },
            { text: "All subjects", included: true },
            { text: "Unlimited practice sets", included: true },
            { text: "Unlimited session history", included: true },
            { text: "90 min Avatar Teacher / month", included: true },
            { text: "Live voice interaction", included: true },
            { text: "Priority AI responses", included: true },
            { text: "Weak topic tracking", included: true },
            { text: "Email support", included: true },
        ],
        cta: "Upgrade to Pro",
    },
    {
        id: "yearly",
        name: "Pro Annual",
        price: "₹2,999",
        priceNote: "per year",
        period: "yearly",
        badge: "Save 28%",
        features: [
            { text: "Everything in Pro", included: true },
            { text: "150 min Avatar Teacher / month", included: true },
            { text: "Revision mode", included: true },
            { text: "Exam-specific prep", included: true },
            { text: "Progress reports", included: true },
            { text: "Priority queue (faster AI)", included: true },
            { text: "WhatsApp support", included: true },
            { text: "Early access to new features", included: true },
            { text: "₹250/month effective price", included: true },
        ],
        cta: "Upgrade to Annual",
    },
];

const FAQS = [
    {
        q: "What happens when my free doubts run out?",
        a: "You can still access your session history and previous explanations. To ask more doubts, simply upgrade to Pro — it takes 30 seconds with UPI!",
    },
    {
        q: "How does Avatar Teacher work?",
        a: "When you say 'teach me properly' or indicate confusion, a live AI teacher appears on screen — Sharma Sir, Priya Ma'am, or Mr. David — and teaches you step by step with voice, expressions, and visual explanations. It feels like a real video class!",
    },
    {
        q: "What are Avatar Teacher minutes?",
        a: "Avatar Teacher uses real-time video rendering which costs us to run. Pro gives you 90 minutes/month, Annual gives 150 minutes/month. The text chat (which is very powerful!) is always unlimited on paid plans.",
    },
    {
        q: "Can I cancel anytime?",
        a: "Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period. No questions asked.",
    },
    {
        q: "What payment methods are accepted?",
        a: "We accept UPI, all major credit/debit cards, net banking, and wallets through Razorpay — India's most trusted payment gateway.",
    },
    {
        q: "Is it safe to pay?",
        a: "Absolutely. All payments are processed securely through Razorpay (PCI-DSS compliant). We never store your card details on our servers.",
    },
];

export default function PricingPage() {
    const [currentPlan] = useState("free");
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
    const [processing, setProcessing] = useState<string | null>(null);

    const handleSubscribe = async (planId: string) => {
        if (planId === "free") return;
        setProcessing(planId);

        try {
            const res = await fetch("/api/billing", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "create_subscription", planId }),
            });
            const data = await res.json();

            if (data.razorpayOrderId) {
                // In production: open Razorpay checkout modal
                // For now, simulate success
                alert(
                    `🎉 Payment Simulation!\n\nPlan: ${planId.toUpperCase()}\nRazorpay Order: ${data.razorpayOrderId}\n\nIn production, this opens the Razorpay checkout modal.`
                );
            }
        } catch {
            alert("Payment failed. Please try again.");
        } finally {
            setProcessing(null);
        }
    };

    return (
        <div className={styles.pricingPage}>
            {/* Navbar */}
            <nav className={styles.nav}>
                <Link href="/" className={styles.navLogo}>
                    📖 <span>DoubtDesk</span>
                </Link>
                <Link href="/dashboard" className={styles.navBack}>
                    ← Back to Classroom
                </Link>
            </nav>

            {/* Hero */}
            <section className={styles.hero}>
                <div className={styles.heroBadge}>💎 Upgrade Your Learning</div>
                <h1 className={styles.heroTitle}>
                    Invest in your <span className={styles.heroAccent}>education</span>
                </h1>
                <p className={styles.heroSubtitle}>
                    Get unlimited access to AI-powered tutoring, live Avatar Teacher sessions,
                    and personalized learning paths.
                </p>

                {/* Billing Toggle */}
                <div className={styles.billingToggle}>
                    <button
                        className={`${styles.toggleBtn} ${billingCycle === "monthly" ? styles.toggleBtnActive : ""}`}
                        onClick={() => setBillingCycle("monthly")}
                    >
                        Monthly
                    </button>
                    <button
                        className={`${styles.toggleBtn} ${billingCycle === "yearly" ? styles.toggleBtnActive : ""}`}
                        onClick={() => setBillingCycle("yearly")}
                    >
                        Yearly
                        <span className={styles.saveBadge}>Save 28%</span>
                    </button>
                </div>
            </section>

            {/* Plans */}
            <section className={styles.plansSection}>
                <div className={styles.plansGrid}>
                    {PLANS.filter(
                        (p) => p.id === "free" || p.period === billingCycle
                    ).map((plan) => (
                        <div
                            key={plan.id}
                            className={`${styles.planCard} ${plan.highlight ? styles.planCardHighlight : ""} ${currentPlan === plan.id ? styles.planCardCurrent : ""}`}
                        >
                            {plan.badge && (
                                <div className={styles.planBadge}>{plan.badge}</div>
                            )}

                            <div className={styles.planHeader}>
                                <h3 className={styles.planName}>{plan.name}</h3>
                                <div className={styles.planPrice}>
                                    <span className={styles.priceAmount}>{plan.price}</span>
                                    {plan.priceNote && (
                                        <span className={styles.priceNote}>{plan.priceNote}</span>
                                    )}
                                </div>
                            </div>

                            <ul className={styles.featureList}>
                                {plan.features.map((f, i) => (
                                    <li
                                        key={i}
                                        className={`${styles.featureItem} ${!f.included ? styles.featureDisabled : ""}`}
                                    >
                                        <span className={styles.featureIcon}>
                                            {f.included ? "✓" : "✗"}
                                        </span>
                                        {f.text}
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={`${styles.planCta} ${plan.highlight ? styles.planCtaHighlight : ""} ${currentPlan === plan.id ? styles.planCtaCurrent : ""}`}
                                onClick={() => handleSubscribe(plan.id)}
                                disabled={currentPlan === plan.id || processing === plan.id}
                            >
                                {processing === plan.id ? (
                                    <span className={styles.spinner}></span>
                                ) : currentPlan === plan.id ? (
                                    "✓ Current Plan"
                                ) : (
                                    plan.cta
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Trust Indicators */}
            <section className={styles.trustSection}>
                <div className={styles.trustGrid}>
                    <div className={styles.trustItem}>
                        <span className={styles.trustIcon}>🔒</span>
                        <div>
                            <strong>Secure Payments</strong>
                            <p>PCI-DSS compliant via Razorpay</p>
                        </div>
                    </div>
                    <div className={styles.trustItem}>
                        <span className={styles.trustIcon}>💳</span>
                        <div>
                            <strong>UPI, Cards & More</strong>
                            <p>All Indian payment methods</p>
                        </div>
                    </div>
                    <div className={styles.trustItem}>
                        <span className={styles.trustIcon}>🔄</span>
                        <div>
                            <strong>Cancel Anytime</strong>
                            <p>No lock-in, no questions</p>
                        </div>
                    </div>
                    <div className={styles.trustItem}>
                        <span className={styles.trustIcon}>⚡</span>
                        <div>
                            <strong>Instant Activation</strong>
                            <p>Access within seconds</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Comparison Table */}
            <section className={styles.comparisonSection}>
                <h2 className={styles.sectionTitle}>Detailed Comparison</h2>
                <div className={styles.comparisonTable}>
                    <table>
                        <thead>
                            <tr>
                                <th>Feature</th>
                                <th>Starter</th>
                                <th className={styles.thHighlight}>Pro</th>
                                <th>Annual</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Text Doubts</td>
                                <td>10/day</td>
                                <td className={styles.tdHighlight}>Unlimited</td>
                                <td>Unlimited</td>
                            </tr>
                            <tr>
                                <td>Avatar Teacher</td>
                                <td>2 min trial</td>
                                <td className={styles.tdHighlight}>90 min/month</td>
                                <td>150 min/month</td>
                            </tr>
                            <tr>
                                <td>Subjects</td>
                                <td>2</td>
                                <td className={styles.tdHighlight}>All</td>
                                <td>All</td>
                            </tr>
                            <tr>
                                <td>Practice Sets</td>
                                <td>3/day</td>
                                <td className={styles.tdHighlight}>Unlimited</td>
                                <td>Unlimited</td>
                            </tr>
                            <tr>
                                <td>Session History</td>
                                <td>7 days</td>
                                <td className={styles.tdHighlight}>Unlimited</td>
                                <td>Unlimited</td>
                            </tr>
                            <tr>
                                <td>Voice Interaction</td>
                                <td>✗</td>
                                <td className={styles.tdHighlight}>✓</td>
                                <td>✓</td>
                            </tr>
                            <tr>
                                <td>Weak Topic Tracking</td>
                                <td>✗</td>
                                <td className={styles.tdHighlight}>✓</td>
                                <td>✓</td>
                            </tr>
                            <tr>
                                <td>Priority AI</td>
                                <td>✗</td>
                                <td className={styles.tdHighlight}>✓</td>
                                <td>✓</td>
                            </tr>
                            <tr>
                                <td>Revision Mode</td>
                                <td>✗</td>
                                <td className={styles.tdHighlight}>✗</td>
                                <td>✓</td>
                            </tr>
                            <tr>
                                <td>Effective Price</td>
                                <td>Free</td>
                                <td className={styles.tdHighlight}>₹349/mo</td>
                                <td>₹250/mo</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* FAQs */}
            <section className={styles.faqSection}>
                <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
                <div className={styles.faqList}>
                    {FAQS.map((faq, i) => (
                        <div
                            key={i}
                            className={`${styles.faqItem} ${expandedFaq === i ? styles.faqItemOpen : ""}`}
                        >
                            <button
                                className={styles.faqQuestion}
                                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                            >
                                {faq.q}
                                <span className={styles.faqChevron}>
                                    {expandedFaq === i ? "−" : "+"}
                                </span>
                            </button>
                            {expandedFaq === i && (
                                <div className={styles.faqAnswer}>{faq.a}</div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Footer */}
            <section className={styles.ctaFooter}>
                <h2>Ready to learn smarter?</h2>
                <p>Join thousands of students already using DoubtDesk</p>
                <div className={styles.ctaButtons}>
                    <button
                        className={styles.ctaPrimary}
                        onClick={() => handleSubscribe(billingCycle === "yearly" ? "yearly" : "monthly")}
                    >
                        🎓 Start Pro — {billingCycle === "yearly" ? "₹2,999/year" : "₹349/month"}
                    </button>
                    <Link href="/dashboard" className={styles.ctaSecondary}>
                        Try Free First →
                    </Link>
                </div>
            </section>
        </div>
    );
}
