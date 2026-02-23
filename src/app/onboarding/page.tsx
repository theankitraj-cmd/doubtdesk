"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

type Step = 1 | 2 | 3;

const GRADES = [
    "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
    "Class 11", "Class 12", "Dropper",
];

const EXAMS = ["CBSE Board", "ICSE Board", "JEE Main", "JEE Advanced", "NEET", "Other"];

const SUBJECTS = [
    { icon: "📐", name: "Mathematics" },
    { icon: "⚛️", name: "Physics" },
    { icon: "🧪", name: "Chemistry" },
    { icon: "🧬", name: "Biology" },
    { icon: "📖", name: "English" },
    { icon: "💻", name: "Computer Science" },
];

const TEACHERS = [
    { id: "sharma", name: "Sharma Sir", style: "Calm & Structured", emoji: "👨‍🏫" },
    { id: "priya", name: "Priya Ma'am", style: "Warm & Encouraging", emoji: "👩‍🏫" },
    { id: "david", name: "Mr. David", style: "Clear English", emoji: "🧑‍🏫" },
];

export default function OnboardingPage() {
    const [step, setStep] = useState<Step>(1);
    const [grade, setGrade] = useState("");
    const [exam, setExam] = useState("");
    const [subjects, setSubjects] = useState<string[]>([]);
    const [teacher, setTeacher] = useState("");
    const router = useRouter();

    const toggleSubject = (name: string) => {
        setSubjects((prev) =>
            prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
        );
    };

    const handleComplete = () => {
        // Save to localStorage (mock persistence)
        localStorage.setItem(
            "doubtdesk_profile",
            JSON.stringify({ grade, exam, subjects, teacher })
        );
        router.push("/dashboard");
    };

    const canProceed = () => {
        if (step === 1) return grade && exam;
        if (step === 2) return subjects.length > 0;
        if (step === 3) return teacher;
        return false;
    };

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                {/* Header */}
                <div className={styles.header}>
                    <span className={styles.logo}>📖 DoubtDesk</span>
                    <div className={styles.progress}>
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`${styles.progressDot} ${s <= step ? styles.progressDotActive : ""
                                    } ${s === step ? styles.progressDotCurrent : ""}`}
                            ></div>
                        ))}
                    </div>
                    <span className={styles.stepLabel}>Step {step} of 3</span>
                </div>

                {/* Step 1: Grade & Exam */}
                {step === 1 && (
                    <div className={styles.stepContent}>
                        <h2 className={styles.stepTitle}>Tell us about yourself</h2>
                        <p className={styles.stepSub}>This helps your teacher personalize explanations for you.</p>

                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>What class are you in?</label>
                            <div className={styles.chipGrid}>
                                {GRADES.map((g) => (
                                    <button
                                        key={g}
                                        className={`${styles.chip} ${grade === g ? styles.chipActive : ""}`}
                                        onClick={() => setGrade(g)}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>What exam are you preparing for?</label>
                            <div className={styles.chipGrid}>
                                {EXAMS.map((e) => (
                                    <button
                                        key={e}
                                        className={`${styles.chip} ${exam === e ? styles.chipActive : ""}`}
                                        onClick={() => setExam(e)}
                                    >
                                        {e}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Subjects */}
                {step === 2 && (
                    <div className={styles.stepContent}>
                        <h2 className={styles.stepTitle}>Pick your subjects</h2>
                        <p className={styles.stepSub}>Select all subjects you want help with. You can change this later.</p>

                        <div className={styles.subjectGrid}>
                            {SUBJECTS.map((subj) => (
                                <button
                                    key={subj.name}
                                    className={`${styles.subjectCard} ${subjects.includes(subj.name) ? styles.subjectCardActive : ""
                                        }`}
                                    onClick={() => toggleSubject(subj.name)}
                                >
                                    <span className={styles.subjectIcon}>{subj.icon}</span>
                                    <span className={styles.subjectName}>{subj.name}</span>
                                    {subjects.includes(subj.name) && (
                                        <span className={styles.subjectCheck}>✓</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Choose Teacher */}
                {step === 3 && (
                    <div className={styles.stepContent}>
                        <h2 className={styles.stepTitle}>Choose your teacher</h2>
                        <p className={styles.stepSub}>
                            This teacher will appear on screen when you activate Teacher Mode.
                        </p>

                        <div className={styles.teacherGrid}>
                            {TEACHERS.map((t) => (
                                <button
                                    key={t.id}
                                    className={`${styles.teacherCard} ${teacher === t.id ? styles.teacherCardActive : ""
                                        }`}
                                    onClick={() => setTeacher(t.id)}
                                >
                                    <span className={styles.teacherEmoji}>{t.emoji}</span>
                                    <span className={styles.teacherName}>{t.name}</span>
                                    <span className={styles.teacherStyle}>{t.style}</span>
                                    {teacher === t.id && (
                                        <span className={styles.teacherSelected}>Selected ✓</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className={styles.actions}>
                    {step > 1 && (
                        <button
                            className="btn btn-outline"
                            onClick={() => setStep((step - 1) as Step)}
                        >
                            ← Back
                        </button>
                    )}
                    <div style={{ flex: 1 }}></div>
                    {step < 3 ? (
                        <button
                            className="btn btn-primary"
                            onClick={() => setStep((step + 1) as Step)}
                            disabled={!canProceed()}
                        >
                            Continue →
                        </button>
                    ) : (
                        <button
                            className="btn btn-accent btn-lg"
                            onClick={handleComplete}
                            disabled={!canProceed()}
                        >
                            🎓 Start My First Class
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
