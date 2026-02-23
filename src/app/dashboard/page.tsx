"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import AvatarTeacher from "@/components/AvatarTeacher/AvatarTeacher";

/* ── Types ── */
interface Message {
    id: string;
    role: "student" | "teacher" | "system";
    content: string;
    timestamp: Date;
    isTeacherMode?: boolean;
    teacherStep?: string;
    isStreaming?: boolean;
}

type TeacherStep =
    | "GREETING"
    | "DIAGNOSING"
    | "EXPLAINING"
    | "EXEMPLIFYING"
    | "CHALLENGING"
    | "EVALUATING"
    | "SUMMARIZING"
    | "PRACTICING";

type TeacherModeState = "inactive" | "activating" | TeacherStep;

const STEP_LABELS: Record<TeacherStep, string> = {
    GREETING: "Greeting",
    DIAGNOSING: "Diagnosing",
    EXPLAINING: "Explaining",
    EXEMPLIFYING: "Examples",
    CHALLENGING: "Challenge",
    EVALUATING: "Evaluating",
    SUMMARIZING: "Summary",
    PRACTICING: "Practice",
};

const STEP_EXPRESSIONS: Record<TeacherStep, string> = {
    GREETING: "warm_smile",
    DIAGNOSING: "thoughtful",
    EXPLAINING: "emphatic",
    EXEMPLIFYING: "enthusiastic",
    CHALLENGING: "encouraging",
    EVALUATING: "attentive",
    SUMMARIZING: "calm",
    PRACTICING: "supportive",
};

/* ── Detect teacher trigger ── */
const TEACHER_TRIGGERS = [
    "teach me", "didn't understand", "don't understand",
    "explain again", "samjha nahi", "properly explain",
    "teach me properly", "i'm confused", "still confused", "not clear",
];

function isTeacherModeTrigger(text: string): boolean {
    const lower = text.toLowerCase();
    return TEACHER_TRIGGERS.some((t) => lower.includes(t));
}

export default function Dashboard() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "system",
            content: "Welcome to your classroom! Ask any doubt to begin.",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [teacherMode, setTeacherMode] = useState<TeacherModeState>("inactive");
    const [teacherStepIndex, setTeacherStepIndex] = useState(0);
    const [sessionTime, setSessionTime] = useState(0);
    const [showSidebar, setShowSidebar] = useState(true);

    // Avatar state
    const [avatarSpeaking, setAvatarSpeaking] = useState(false);
    const [avatarExpression, setAvatarExpression] = useState("default");
    const [avatarTranscript, setAvatarTranscript] = useState("");
    const [micActive, setMicActive] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const isAvatarActive = teacherMode !== "inactive" && teacherMode !== "activating";

    /* Timer */
    useEffect(() => {
        timerRef.current = setInterval(() => setSessionTime((t) => t + 1), 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    /* Auto scroll */
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    /* Auto resize textarea */
    useEffect(() => {
        const el = inputRef.current;
        if (el) { el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 120) + "px"; }
    }, [input]);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, "0")}`;
    };

    const addMessage = useCallback(
        (role: Message["role"], content: string, extra?: Partial<Message>) => {
            const msg: Message = {
                id: Date.now().toString() + Math.random(),
                role, content, timestamp: new Date(), ...extra,
            };
            setMessages((prev) => [...prev, msg]);
            return msg;
        }, []
    );

    const simulateStreaming = useCallback(
        (content: string, extra?: Partial<Message>) => {
            return new Promise<void>((resolve) => {
                setIsTyping(true);
                const msgId = Date.now().toString() + Math.random();
                setMessages((prev) => [
                    ...prev,
                    { id: msgId, role: "teacher", content: "", timestamp: new Date(), isStreaming: true, ...extra },
                ]);
                let i = 0;
                const words = content.split(" ");
                const interval = setInterval(() => {
                    if (i < words.length) {
                        setMessages((prev) =>
                            prev.map((m) => m.id === msgId ? { ...m, content: words.slice(0, i + 1).join(" ") } : m)
                        );
                        i++;
                    } else {
                        setMessages((prev) =>
                            prev.map((m) => (m.id === msgId ? { ...m, isStreaming: false } : m))
                        );
                        setIsTyping(false);
                        clearInterval(interval);
                        resolve();
                    }
                }, 40);
            });
        }, []
    );

    /* ── Fetch from chat API ── */
    const fetchChatResponse = async (message: string, teacherStep?: string) => {
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message, teacherMode: teacherMode !== "inactive", teacherStep }),
            });
            return await res.json();
        } catch {
            return { reply: "Connection error. Please try again." };
        }
    };

    /* ── Fetch from avatar API ── */
    const fetchAvatarStep = async (step: TeacherStep, studentMessage?: string) => {
        try {
            const res = await fetch("/api/avatar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "step", step, studentMessage }),
            });
            return await res.json();
        } catch {
            return { speech: "I'm having trouble connecting. Let me try again.", expression: "default" };
        }
    };

    /* ── Avatar speak sequence ── */
    const avatarSpeak = async (text: string, step: TeacherStep): Promise<void> => {
        const expression = STEP_EXPRESSIONS[step];
        setAvatarExpression(expression);
        setAvatarSpeaking(true);

        // Build transcript line by line
        setAvatarTranscript((prev) => prev + (prev ? "\n\n" : "") + `**[${STEP_LABELS[step]}]**\n${text}`);

        // Simulate speaking duration based on word count
        const words = text.split(" ").length;
        const durationMs = Math.max(2000, (words / 150) * 60 * 1000);

        // Also stream into chat
        await simulateStreaming(text, { isTeacherMode: true, teacherStep: step });

        // Simulate remaining speaking time
        const remainingMs = durationMs - words * 40;
        if (remainingMs > 0) {
            await new Promise((r) => setTimeout(r, Math.min(remainingMs, 1000)));
        }

        setAvatarSpeaking(false);
    };

    /* ── Start Avatar Teacher Mode ── */
    const startAvatarTeacherMode = async (triggerText: string) => {
        setTeacherMode("activating");
        addMessage("system", "🎬 Teacher Mode Activating — Sharma Sir is joining the class...");
        setAvatarTranscript("");

        // Initialize avatar session
        await fetch("/api/avatar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "start", teacherAvatar: "sharma", sessionId: `s-${Date.now()}` }),
        });

        await new Promise((r) => setTimeout(r, 1200));

        // Run through teacher steps
        const steps: TeacherStep[] = ["GREETING", "DIAGNOSING", "EXPLAINING", "EXEMPLIFYING", "CHALLENGING"];
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            setTeacherMode(step);
            setTeacherStepIndex(i);

            const data = await fetchAvatarStep(step, triggerText);
            await avatarSpeak(data.speech, step);

            if (i < steps.length - 1) {
                await new Promise((r) => setTimeout(r, 600));
            }
        }
    };

    /* ── Handle interruption ── */
    const handleInterrupt = useCallback(async () => {
        setAvatarSpeaking(false);
        setAvatarExpression("listening");
        await fetch("/api/avatar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "interrupt" }),
        });
        addMessage("system", "✋ Teacher paused — you can speak or type.");
    }, [addMessage]);

    /* ── End Avatar Teacher Mode ── */
    const handleEndClass = useCallback(async () => {
        setTeacherMode("inactive");
        setAvatarSpeaking(false);
        setAvatarTranscript("");
        setAvatarExpression("default");
        await fetch("/api/avatar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "end", sessionId: "current" }),
        });
        addMessage("system", "👋 Teacher Mode ended. Great session! You can continue asking doubts.");
    }, [addMessage]);

    /* ── Mic toggle ── */
    const handleMicToggle = useCallback((active: boolean) => {
        setMicActive(active);
    }, []);

    /* ── Send message ── */
    const handleSend = async () => {
        const text = input.trim();
        if (!text || isTyping) return;
        setInput("");
        addMessage("student", text);

        if (isAvatarActive) {
            // In Avatar Teacher Mode → evaluate student answer
            setIsTyping(true);
            const data = await fetchAvatarStep("EVALUATING", text);
            setTeacherMode("EVALUATING");
            await avatarSpeak(data.speech, "EVALUATING");
            return;
        }

        if (isTeacherModeTrigger(text)) {
            await startAvatarTeacherMode(text);
            return;
        }

        // Normal text response
        const data = await fetchChatResponse(text);
        await simulateStreaming(data.reply);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    /* ── Teacher Mode step dots ── */
    const allSteps: TeacherStep[] = ["GREETING", "DIAGNOSING", "EXPLAINING", "EXEMPLIFYING", "CHALLENGING", "EVALUATING", "SUMMARIZING"];

    return (
        <div className={styles.dashboard}>
            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${showSidebar ? styles.sidebarOpen : ""}`}>
                <div className={styles.sidebarHeader}>
                    <Link href="/" className={styles.sidebarLogo}>📖 <span>DoubtDesk</span></Link>
                </div>

                <div className={styles.sidebarSection}>
                    <div className={styles.sidebarLabel}>Your Classroom</div>
                    <button className={styles.newSessionBtn}>✨ New Doubt Session</button>
                </div>

                <div className={styles.sidebarSection}>
                    <div className={styles.sidebarLabel}>Recent Sessions</div>
                    <div className={styles.sessionList}>
                        <div className={`${styles.sessionItem} ${styles.sessionItemActive}`}>
                            <span className={styles.sessionDot}></span>
                            <div>
                                <div className={styles.sessionTitle}>Newton&apos;s Laws</div>
                                <div className={styles.sessionMeta}>Physics · Just now</div>
                            </div>
                        </div>
                        <div className={styles.sessionItem}>
                            <span className={styles.sessionDot}></span>
                            <div>
                                <div className={styles.sessionTitle}>Quadratic Equations</div>
                                <div className={styles.sessionMeta}>Math · 2h ago</div>
                            </div>
                        </div>
                        <div className={styles.sessionItem}>
                            <span className={styles.sessionDot}></span>
                            <div>
                                <div className={styles.sessionTitle}>Chemical Bonding</div>
                                <div className={styles.sessionMeta}>Chemistry · Yesterday</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.sidebarSection}>
                    <div className={styles.sidebarLabel}>Weak Topics</div>
                    <div className={styles.weakTopics}>
                        <div className={styles.weakTopic}>
                            <span>Thermodynamics</span>
                            <div className={styles.weakBar}><div className={styles.weakBarFill} style={{ width: "35%" }}></div></div>
                        </div>
                        <div className={styles.weakTopic}>
                            <span>Integration</span>
                            <div className={styles.weakBar}><div className={styles.weakBarFill} style={{ width: "55%" }}></div></div>
                        </div>
                    </div>
                    <Link href="/progress" className={styles.sidebarLink}>📊 View All Progress →</Link>
                </div>

                <div className={styles.sidebarSection}>
                    <div className={styles.sidebarLabel}>Quick Links</div>
                    <div className={styles.quickLinks}>
                        <Link href="/progress" className={styles.quickLink}>📊 Progress & Revision</Link>
                        <Link href="/pricing" className={styles.quickLink}>💎 Upgrade Plan</Link>
                        <Link href="/account" className={styles.quickLink}>⚙️ Account & Billing</Link>
                    </div>
                </div>

                <div className={styles.sidebarFooter}>
                    <div className={styles.userCard}>
                        <div className={styles.userAvatar}>A</div>
                        <div>
                            <div className={styles.userName}>Ankit</div>
                            <div className={styles.userPlan}>Free Plan</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Area */}
            <main className={styles.main}>
                {/* Top Bar */}
                <div className={styles.topBar}>
                    <button className={styles.sidebarToggle} onClick={() => setShowSidebar(!showSidebar)}>☰</button>
                    <div className={styles.topBarCenter}>
                        <span className={styles.topBarSubject}>Physics</span>
                        <span className={styles.topBarDot}>·</span>
                        <span className={styles.topBarTopic}>Newton&apos;s Laws</span>
                    </div>
                    <div className={styles.topBarRight}>
                        {isAvatarActive && (
                            <div className={styles.teacherModeBadge}>
                                <span className={styles.teacherModePulse}></span>
                                🎬 Avatar Teacher
                            </div>
                        )}
                        <div className={styles.sessionTimer}>⏱️ {formatTime(sessionTime)}</div>
                    </div>
                </div>

                {/* Avatar Teacher Panel — shows above chat when active */}
                {isAvatarActive && (
                    <div className={styles.avatarPanel}>
                        <AvatarTeacher
                            teacherName="Sharma Sir"
                            teacherStep={teacherMode as TeacherStep}
                            expression={avatarExpression}
                            isSpeaking={avatarSpeaking}
                            transcript={avatarTranscript}
                            onEndClass={handleEndClass}
                            onMicToggle={handleMicToggle}
                            onInterrupt={handleInterrupt}
                            sessionTimeSeconds={sessionTime}
                        />
                    </div>
                )}

                {/* Step progress bar — shows when avatar active */}
                {isAvatarActive && (
                    <div className={styles.stepProgressBar}>
                        {allSteps.map((s, i) => (
                            <div key={s} className={styles.stepItem}>
                                <div className={`${styles.stepDot} ${i <= teacherStepIndex ? styles.stepDotActive : ""} ${teacherMode === s ? styles.stepDotCurrent : ""}`}></div>
                                <span className={`${styles.stepName} ${teacherMode === s ? styles.stepNameActive : ""}`}>
                                    {STEP_LABELS[s]}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Messages */}
                <div className={`${styles.chatArea} ${isAvatarActive ? styles.chatAreaCompact : ""}`}>
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`${styles.message} ${msg.role === "student"
                                ? styles.messageStudent
                                : msg.role === "system"
                                    ? styles.messageSystem
                                    : msg.isTeacherMode
                                        ? styles.messageTeacherMode
                                        : styles.messageTeacher
                                }`}
                        >
                            {msg.role === "teacher" && (
                                <div className={styles.messageLabel}>
                                    {msg.isTeacherMode ? "🎬 Live Class" : "🎓 Teacher Reply"}
                                    {msg.teacherStep && (
                                        <span className={styles.messageStepBadge}>{msg.teacherStep}</span>
                                    )}
                                </div>
                            )}
                            {msg.role === "system" && (
                                <div className={styles.messageLabel}>📋 System</div>
                            )}
                            <div className={styles.messageContent}>
                                {msg.content.split("\n").map((line, i) => (
                                    <p key={i}>{line || <br />}</p>
                                ))}
                            </div>
                            {msg.isStreaming && <div className={styles.cursor}></div>}
                            <div className={styles.messageTime}>
                                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                        </div>
                    ))}
                    {isTyping && messages[messages.length - 1]?.role !== "teacher" && (
                        <div className={`${styles.message} ${styles.messageTeacher}`}>
                            <div className={styles.typingIndicator}>
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef}></div>
                </div>

                {/* Input Area */}
                <div className={styles.inputArea}>
                    <div className={styles.inputWrapper}>
                        <textarea
                            ref={inputRef}
                            className={styles.inputField}
                            placeholder={
                                isAvatarActive
                                    ? "Type your answer or reply to your teacher..."
                                    : "Ask your doubt here... (e.g. Explain Newton's 3rd law)"
                            }
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={1}
                        />
                        <div className={styles.inputActions}>
                            <button className={styles.inputActionBtn} title="Voice input">🎤</button>
                            <button className={styles.inputActionBtn} title="Upload image">📷</button>
                            <button
                                className={`${styles.sendBtn} ${input.trim() ? styles.sendBtnActive : ""}`}
                                onClick={handleSend}
                                disabled={!input.trim() || isTyping}
                            >↑</button>
                        </div>
                    </div>
                    <div className={styles.inputHints}>
                        <span>💡 Try: &quot;Explain Newton&apos;s 3rd law&quot; then say &quot;teach me properly&quot; for Avatar Teacher</span>
                    </div>
                </div>
            </main>
        </div>
    );
}
