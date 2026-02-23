"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import styles from "./page.module.css";

type AuthTab = "login" | "signup";

function LoginForm() {
    const [tab, setTab] = useState<AuthTab>("login");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

    const handleSendOtp = async () => {
        if (!phone || phone.length < 10) return;
        setLoading(true);
        // Simulate OTP send
        await new Promise((r) => setTimeout(r, 1000));
        setOtpSent(true);
        setLoading(false);
    };

    const handleVerifyOtp = async () => {
        if (!otp || otp.length < 4) return;
        setLoading(true);
        await new Promise((r) => setTimeout(r, 800));
        setLoading(false);
        // Simulate successful login
        router.push("/onboarding");
    };

    const handleGoogleLogin = () => {
        setLoading(true);
        signIn("google", { callbackUrl });
    };

    const handleDevLogin = () => {
        setLoading(true);
        signIn("credentials", { email: "ankit@example.com", callbackUrl });
    };

    return (
        <div className={styles.page}>
            <div className={styles.left}>
                <div className={styles.leftContent}>
                    <Link href="/" className={styles.logo}>
                        📖 <span>DoubtDesk</span>
                    </Link>
                    <h1 className={styles.leftTitle}>
                        Your personal teacher
                        <br />
                        is waiting for you.
                    </h1>
                    <p className={styles.leftSub}>
                        Join thousands of students who are learning smarter with AI-powered tutoring.
                    </p>
                    <div className={styles.leftStats}>
                        <div className={styles.leftStat}>
                            <span className={styles.leftStatNum}>24/7</span>
                            <span className={styles.leftStatLabel}>Always Available</span>
                        </div>
                        <div className={styles.leftStat}>
                            <span className={styles.leftStatNum}>6+</span>
                            <span className={styles.leftStatLabel}>Subjects</span>
                        </div>
                        <div className={styles.leftStat}>
                            <span className={styles.leftStatNum}>Free</span>
                            <span className={styles.leftStatLabel}>To Start</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.right}>
                <div className={styles.formCard}>
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${tab === "login" ? styles.tabActive : ""}`}
                            onClick={() => { setTab("login"); setOtpSent(false); setOtp(""); }}
                        >
                            Login
                        </button>
                        <button
                            className={`${styles.tab} ${tab === "signup" ? styles.tabActive : ""}`}
                            onClick={() => { setTab("signup"); setOtpSent(false); setOtp(""); }}
                        >
                            Sign Up
                        </button>
                    </div>

                    <h2 className={styles.formTitle}>
                        {tab === "login" ? "Welcome back!" : "Create your account"}
                    </h2>
                    <p className={styles.formSub}>
                        {tab === "login"
                            ? "Continue your learning journey."
                            : "Start clearing doubts in under 2 minutes."}
                    </p>

                    {/* Google OAuth */}
                    <button className={styles.googleBtn} onClick={handleGoogleLogin} disabled={loading}>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.26c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
                            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>

                    {/* Developer Login */}
                    {process.env.NODE_ENV === "development" && (
                        <button className={`${styles.googleBtn} ${styles.devBtn}`} onClick={handleDevLogin} disabled={loading} style={{ marginTop: 12, borderStyle: 'dashed' }}>
                            🚀 Quick Login (Dev Mode)
                        </button>
                    )}

                    <div className={styles.divider}>
                        <span>or use phone number</span>
                    </div>

                    {/* Phone OTP */}
                    <div className={styles.inputGroup}>
                        <label>Phone Number</label>
                        <div className={styles.phoneInput}>
                            <span className={styles.phonePrefix}>+91</span>
                            <input
                                type="tel"
                                placeholder="Enter your phone number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                maxLength={10}
                            />
                        </div>
                    </div>

                    {!otpSent ? (
                        <button
                            className={`btn btn-primary ${styles.submitBtn}`}
                            onClick={handleSendOtp}
                            disabled={phone.length < 10 || loading}
                        >
                            {loading ? "Sending OTP..." : "Send OTP"}
                        </button>
                    ) : (
                        <>
                            <div className={styles.inputGroup}>
                                <label>Enter OTP</label>
                                <div className={styles.otpInputs}>
                                    {[0, 1, 2, 3].map((i) => (
                                        <input
                                            key={i}
                                            type="text"
                                            maxLength={1}
                                            className={styles.otpBox}
                                            value={otp[i] || ""}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, "");
                                                const newOtp = otp.split("");
                                                newOtp[i] = val;
                                                setOtp(newOtp.join(""));
                                                // Auto-focus next
                                                if (val && e.target.nextElementSibling) {
                                                    (e.target.nextElementSibling as HTMLInputElement).focus();
                                                }
                                            }}
                                        />
                                    ))}
                                </div>
                                <p className={styles.otpNote}>
                                    OTP sent to +91 {phone} · <button onClick={() => setOtpSent(false)}>Change</button>
                                </p>
                            </div>
                            <button
                                className={`btn btn-primary ${styles.submitBtn}`}
                                onClick={handleVerifyOtp}
                                disabled={otp.length < 4 || loading}
                            >
                                {loading ? "Verifying..." : "Verify & Continue"}
                            </button>
                        </>
                    )}

                    <p className={styles.termsNote}>
                        By continuing, you agree to our{" "}
                        <a href="#">Terms of Service</a> and{" "}
                        <a href="#">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
