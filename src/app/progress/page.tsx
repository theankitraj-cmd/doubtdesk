"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Link from "next/link";

/* ── Types ── */
interface WeakTopic {
    id: string;
    subject: string;
    topic: string;
    weaknessScore: number;
    timesStruggled: number;
    timesPracticed: number;
    lastSeen: string;
    trend: "improving" | "declining" | "stable";
}

interface SubjectProgress {
    subject: string;
    color: string;
    totalTopics: number;
    mastered: number;
    weak: number;
    practicing: number;
    overallScore: number;
}

interface StudyStreak {
    currentStreak: number;
    longestStreak: number;
    lastStudied: string;
    weekActivity: boolean[];
}

/* ── Mock Data ── */
const MOCK_WEAK_TOPICS: WeakTopic[] = [
    { id: "1", subject: "Physics", topic: "Thermodynamics — Carnot Cycle", weaknessScore: 0.82, timesStruggled: 5, timesPracticed: 2, lastSeen: "2026-02-23", trend: "declining" },
    { id: "2", subject: "Math", topic: "Integration by Parts", weaknessScore: 0.71, timesStruggled: 4, timesPracticed: 3, lastSeen: "2026-02-22", trend: "improving" },
    { id: "3", subject: "Chemistry", topic: "Electrochemistry — Nernst Equation", weaknessScore: 0.65, timesStruggled: 3, timesPracticed: 1, lastSeen: "2026-02-21", trend: "stable" },
    { id: "4", subject: "Physics", topic: "Electromagnetic Induction", weaknessScore: 0.58, timesStruggled: 3, timesPracticed: 4, lastSeen: "2026-02-23", trend: "improving" },
    { id: "5", subject: "Math", topic: "Differential Equations", weaknessScore: 0.45, timesStruggled: 2, timesPracticed: 5, lastSeen: "2026-02-20", trend: "improving" },
    { id: "6", subject: "Chemistry", topic: "Organic Reactions — SN1/SN2", weaknessScore: 0.39, timesStruggled: 2, timesPracticed: 4, lastSeen: "2026-02-22", trend: "stable" },
];

const MOCK_SUBJECTS: SubjectProgress[] = [
    { subject: "Physics", color: "#3B82F6", totalTopics: 24, mastered: 14, weak: 4, practicing: 6, overallScore: 68 },
    { subject: "Mathematics", color: "#8B5CF6", totalTopics: 20, mastered: 12, weak: 3, practicing: 5, overallScore: 72 },
    { subject: "Chemistry", color: "#10B981", totalTopics: 22, mastered: 15, weak: 3, practicing: 4, overallScore: 75 },
];

const MOCK_STREAK: StudyStreak = {
    currentStreak: 7,
    longestStreak: 14,
    lastStudied: "2026-02-23",
    weekActivity: [true, true, true, false, true, true, true],
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function ProgressPage() {
    const [weakTopics, setWeakTopics] = useState<WeakTopic[]>(MOCK_WEAK_TOPICS);
    const [subjects] = useState<SubjectProgress[]>(MOCK_SUBJECTS);
    const [streak] = useState<StudyStreak>(MOCK_STREAK);
    const [selectedSubject, setSelectedSubject] = useState<string>("all");
    const [revisionMode, setRevisionMode] = useState(false);
    const [revisionTopicIdx, setRevisionTopicIdx] = useState(0);
    const [revisionAnswer, setRevisionAnswer] = useState("");
    const [revisionResult, setRevisionResult] = useState<"correct" | "incorrect" | null>(null);

    const filteredTopics = selectedSubject === "all"
        ? weakTopics
        : weakTopics.filter((t) => t.subject === selectedSubject);

    const sortedTopics = [...filteredTopics].sort((a, b) => b.weaknessScore - a.weaknessScore);

    /* ── Revision Questions ── */
    const REVISION_QUESTIONS = [
        { topic: "Thermodynamics", question: "A Carnot engine operates between 500K and 300K. What is its efficiency?", hint: "η = 1 − T_cold / T_hot", answer: "40%" },
        { topic: "Integration", question: "Evaluate: ∫ x·eˣ dx", hint: "Use integration by parts: ∫u·dv = u·v − ∫v·du", answer: "x·eˣ − eˣ + C" },
        { topic: "Electrochemistry", question: "What is the Nernst equation for a cell at 25°C?", hint: "E = E° − (RT/nF)·ln(Q)", answer: "E = E° − (0.0592/n)·log Q" },
    ];

    const handleRevisionSubmit = () => {
        // Simple check — in production, this would use AI evaluation
        setRevisionResult(revisionAnswer.trim().length > 0 ? "correct" : "incorrect");
    };

    const handleNextRevision = () => {
        setRevisionResult(null);
        setRevisionAnswer("");
        setRevisionTopicIdx((prev) => (prev + 1) % REVISION_QUESTIONS.length);
    };

    const handleMarkPracticed = (id: string) => {
        setWeakTopics((prev) =>
            prev.map((t) =>
                t.id === id
                    ? { ...t, timesPracticed: t.timesPracticed + 1, weaknessScore: Math.max(0, t.weaknessScore - 0.05), trend: "improving" as const }
                    : t
            )
        );
    };

    const getScoreColor = (score: number) => {
        if (score >= 0.7) return "#EF4444";
        if (score >= 0.4) return "#F59E0B";
        return "#10B981";
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case "improving": return "📈";
            case "declining": return "📉";
            default: return "➡️";
        }
    };

    return (
        <div className={styles.progressPage}>
            {/* Nav */}
            <nav className={styles.nav}>
                <Link href="/" className={styles.navLogo}>📖 <span>DoubtDesk</span></Link>
                <div className={styles.navActions}>
                    <Link href="/dashboard" className={styles.navLink}>← Classroom</Link>
                    <Link href="/account" className={styles.navLink}>Account</Link>
                </div>
            </nav>

            <div className={styles.content}>
                <div className={styles.pageHeader}>
                    <div>
                        <h1 className={styles.pageTitle}>Your Progress</h1>
                        <p className={styles.pageSubtitle}>Track weak topics, practice with revision mode, and level up</p>
                    </div>
                    <button
                        className={`${styles.revisionToggle} ${revisionMode ? styles.revisionToggleActive : ""}`}
                        onClick={() => setRevisionMode(!revisionMode)}
                    >
                        {revisionMode ? "📝 Exit Revision" : "🔄 Start Revision Mode"}
                    </button>
                </div>

                {/* Revision Mode */}
                {revisionMode && (
                    <section className={styles.revisionPanel}>
                        <div className={styles.revisionHeader}>
                            <h2>🔄 Revision Mode — Spaced Repetition</h2>
                            <span className={styles.revisionCount}>
                                Question {revisionTopicIdx + 1} / {REVISION_QUESTIONS.length}
                            </span>
                        </div>

                        <div className={styles.revisionCard}>
                            <div className={styles.revisionTopic}>
                                {REVISION_QUESTIONS[revisionTopicIdx].topic}
                            </div>
                            <div className={styles.revisionQuestion}>
                                {REVISION_QUESTIONS[revisionTopicIdx].question}
                            </div>
                            <div className={styles.revisionHint}>
                                💡 Hint: {REVISION_QUESTIONS[revisionTopicIdx].hint}
                            </div>

                            {!revisionResult && (
                                <div className={styles.revisionInput}>
                                    <textarea
                                        value={revisionAnswer}
                                        onChange={(e) => setRevisionAnswer(e.target.value)}
                                        placeholder="Type your answer..."
                                        rows={3}
                                    />
                                    <button className={styles.revisionSubmit} onClick={handleRevisionSubmit}>
                                        Check Answer
                                    </button>
                                </div>
                            )}

                            {revisionResult && (
                                <div className={`${styles.revisionFeedback} ${revisionResult === "correct" ? styles.feedbackCorrect : styles.feedbackIncorrect}`}>
                                    <div className={styles.feedbackIcon}>
                                        {revisionResult === "correct" ? "🎉" : "🤔"}
                                    </div>
                                    <div>
                                        <strong>{revisionResult === "correct" ? "Great job!" : "Not quite..."}</strong>
                                        <p>Expected: {REVISION_QUESTIONS[revisionTopicIdx].answer}</p>
                                    </div>
                                    <button className={styles.nextBtn} onClick={handleNextRevision}>
                                        Next Question →
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Stats Row */}
                <div className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>🔥</div>
                        <div className={styles.statValue}>{streak.currentStreak}</div>
                        <div className={styles.statLabel}>Day Streak</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>📚</div>
                        <div className={styles.statValue}>{weakTopics.length}</div>
                        <div className={styles.statLabel}>Weak Topics</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>🏆</div>
                        <div className={styles.statValue}>
                            {subjects.reduce((a, s) => a + s.mastered, 0)}
                        </div>
                        <div className={styles.statLabel}>Mastered</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>⏱️</div>
                        <div className={styles.statValue}>{streak.longestStreak}</div>
                        <div className={styles.statLabel}>Best Streak</div>
                    </div>
                </div>

                {/* Week Activity */}
                <section className={styles.card}>
                    <h2 className={styles.cardTitle}>This Week</h2>
                    <div className={styles.weekGrid}>
                        {DAYS.map((day, i) => (
                            <div key={day} className={styles.weekDay}>
                                <div className={`${styles.weekDot} ${streak.weekActivity[i] ? styles.weekDotActive : ""}`}>
                                    {streak.weekActivity[i] ? "✓" : ""}
                                </div>
                                <span>{day}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Subject Progress */}
                <section className={styles.card}>
                    <h2 className={styles.cardTitle}>Subject Progress</h2>
                    <div className={styles.subjectGrid}>
                        {subjects.map((s) => (
                            <div key={s.subject} className={styles.subjectCard}>
                                <div className={styles.subjectHeader}>
                                    <span className={styles.subjectName}>{s.subject}</span>
                                    <span className={styles.subjectScore} style={{ color: s.color }}>
                                        {s.overallScore}%
                                    </span>
                                </div>
                                <div className={styles.subjectBar}>
                                    <div
                                        className={styles.subjectBarFill}
                                        style={{ width: `${s.overallScore}%`, background: s.color }}
                                    ></div>
                                </div>
                                <div className={styles.subjectMeta}>
                                    <span>✅ {s.mastered} mastered</span>
                                    <span>📝 {s.practicing} practicing</span>
                                    <span>⚠️ {s.weak} weak</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Weak Topics */}
                <section className={styles.card}>
                    <div className={styles.cardHeaderRow}>
                        <h2 className={styles.cardTitle}>Weak Topics</h2>
                        <div className={styles.filterRow}>
                            <button
                                className={`${styles.filterBtn} ${selectedSubject === "all" ? styles.filterBtnActive : ""}`}
                                onClick={() => setSelectedSubject("all")}
                            >All</button>
                            {["Physics", "Math", "Chemistry"].map((s) => (
                                <button
                                    key={s}
                                    className={`${styles.filterBtn} ${selectedSubject === s ? styles.filterBtnActive : ""}`}
                                    onClick={() => setSelectedSubject(s)}
                                >{s}</button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.topicList}>
                        {sortedTopics.map((topic) => (
                            <div key={topic.id} className={styles.topicItem}>
                                <div className={styles.topicLeft}>
                                    <div
                                        className={styles.topicScoreBar}
                                        style={{ background: getScoreColor(topic.weaknessScore) }}
                                    >
                                        <div
                                            className={styles.topicScoreFill}
                                            style={{ width: `${(1 - topic.weaknessScore) * 100}%` }}
                                        ></div>
                                    </div>
                                    <div>
                                        <div className={styles.topicName}>{topic.topic}</div>
                                        <div className={styles.topicMeta}>
                                            <span className={styles.topicSubject}>{topic.subject}</span>
                                            <span>Struggled {topic.timesStruggled}× · Practiced {topic.timesPracticed}×</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.topicRight}>
                                    <span className={styles.topicTrend}>{getTrendIcon(topic.trend)}</span>
                                    <button
                                        className={styles.practiceBtn}
                                        onClick={() => handleMarkPracticed(topic.id)}
                                    >Practice</button>
                                    <Link href="/dashboard" className={styles.askBtn}>Ask Doubt</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
