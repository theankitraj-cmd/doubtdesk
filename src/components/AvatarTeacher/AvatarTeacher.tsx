"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import styles from "./AvatarTeacher.module.css";

/* ── Types ── */
export interface AvatarTeacherProps {
    teacherName: string;
    teacherStep: string;
    expression: string;
    isSpeaking: boolean;
    transcript: string;
    onEndClass: () => void;
    onMicToggle: (active: boolean) => void;
    onInterrupt: () => void;
    sessionTimeSeconds: number;
}

type ExpressionEmoji = Record<string, string>;

const EXPRESSION_MAP: ExpressionEmoji = {
    warm_smile: "😊",
    thoughtful: "🤔",
    emphatic: "📝",
    enthusiastic: "💡",
    encouraging: "💪",
    attentive: "👀",
    calm: "😌",
    supportive: "🤗",
    proud_smile: "🎉",
    gentle_encouragement: "🙏",
    listening: "👂",
    default: "👨‍🏫",
};

const STEP_LABELS: Record<string, string> = {
    GREETING: "Welcome & Introduction",
    DIAGNOSING: "Understanding Your Confusion",
    EXPLAINING: "Explaining the Concept",
    EXEMPLIFYING: "Real-World Examples",
    CHALLENGING: "Practice Time!",
    EVALUATING: "Checking Your Answer",
    SUMMARIZING: "Key Takeaways",
    PRACTICING: "Practice Problems",
};

export default function AvatarTeacher({
    teacherName,
    teacherStep,
    expression,
    isSpeaking,
    transcript,
    onEndClass,
    onMicToggle,
    onInterrupt,
    sessionTimeSeconds,
}: AvatarTeacherProps) {
    const [micActive, setMicActive] = useState(false);
    const [volume, setVolume] = useState(80);
    const [showTranscript, setShowTranscript] = useState(true);
    const [waveformBars, setWaveformBars] = useState<number[]>(Array(24).fill(4));
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animFrameRef = useRef<number>(0);

    /* ── Avatar face animation (canvas) ── */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const drawAvatar = () => {
            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0, 0, w, h);

            // Background gradient
            const grad = ctx.createRadialGradient(w / 2, h / 2, 30, w / 2, h / 2, w / 2);
            grad.addColorStop(0, "#3A7A3A");
            grad.addColorStop(1, "#1A3A1A");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // Head circle
            ctx.beginPath();
            ctx.arc(w / 2, h * 0.4, 60, 0, Math.PI * 2);
            ctx.fillStyle = "#F5D0A9";
            ctx.fill();

            // Hair
            ctx.beginPath();
            ctx.arc(w / 2, h * 0.34, 62, Math.PI, 0);
            ctx.fillStyle = "#2C1810";
            ctx.fill();

            // Eyes
            const eyeY = h * 0.38;
            const blinkPhase = Math.sin(Date.now() / 3000) > 0.95;
            const eyeH = blinkPhase ? 1 : 5;

            ctx.beginPath();
            ctx.ellipse(w / 2 - 18, eyeY, 5, eyeH, 0, 0, Math.PI * 2);
            ctx.fillStyle = "#2C1810";
            ctx.fill();

            ctx.beginPath();
            ctx.ellipse(w / 2 + 18, eyeY, 5, eyeH, 0, 0, Math.PI * 2);
            ctx.fill();

            // Expression-based mouth
            const mouthY = h * 0.46;
            ctx.beginPath();
            if (isSpeaking) {
                const openAmount = 4 + Math.sin(Date.now() / 100) * 6;
                ctx.ellipse(w / 2, mouthY, 12, openAmount, 0, 0, Math.PI * 2);
                ctx.fillStyle = "#8B4040";
                ctx.fill();
            } else {
                const smileAmount =
                    expression === "warm_smile" || expression === "proud_smile"
                        ? 8
                        : expression === "thoughtful"
                            ? 2
                            : 5;
                ctx.arc(w / 2, mouthY - smileAmount, 14, 0.2, Math.PI - 0.2);
                ctx.strokeStyle = "#8B4040";
                ctx.lineWidth = 2.5;
                ctx.stroke();
            }

            // Glasses
            ctx.strokeStyle = "#444";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(w / 2 - 30, eyeY - 8, 22, 16, 3);
            ctx.roundRect(w / 2 + 8, eyeY - 8, 22, 16, 3);
            ctx.moveTo(w / 2 - 8, eyeY);
            ctx.lineTo(w / 2 + 8, eyeY);
            ctx.stroke();

            // Body (shoulders)
            ctx.beginPath();
            ctx.ellipse(w / 2, h * 0.72, 80, 50, 0, Math.PI, 0);
            ctx.fillStyle = "#2D5F2D";
            ctx.fill();

            // Collar
            ctx.beginPath();
            ctx.moveTo(w / 2 - 15, h * 0.55);
            ctx.lineTo(w / 2, h * 0.62);
            ctx.lineTo(w / 2 + 15, h * 0.55);
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
            ctx.stroke();

            // Name tag
            ctx.fillStyle = "rgba(255,255,255,0.15)";
            ctx.roundRect(w / 2 - 40, h * 0.82, 80, 20, 4);
            ctx.fill();
            ctx.fillStyle = "#fff";
            ctx.font = "11px Inter, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(teacherName, w / 2, h * 0.86);

            animFrameRef.current = requestAnimationFrame(drawAvatar);
        };

        drawAvatar();
        return () => cancelAnimationFrame(animFrameRef.current);
    }, [expression, isSpeaking, teacherName]);

    /* ── Waveform animation ── */
    useEffect(() => {
        if (!isSpeaking) {
            setWaveformBars(Array(24).fill(4));
            return;
        }
        const interval = setInterval(() => {
            setWaveformBars(
                Array(24)
                    .fill(0)
                    .map(() => 4 + Math.random() * 28)
            );
        }, 80);
        return () => clearInterval(interval);
    }, [isSpeaking]);

    const toggleMic = useCallback(() => {
        const next = !micActive;
        setMicActive(next);
        onMicToggle(next);
    }, [micActive, onMicToggle]);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, "0")}`;
    };

    const emoji = EXPRESSION_MAP[expression] || EXPRESSION_MAP.default;
    const stepLabel = STEP_LABELS[teacherStep] || teacherStep;

    return (
        <div className={styles.avatarContainer}>
            {/* Video / Avatar Area */}
            <div className={styles.videoSection}>
                <div className={styles.videoFrame}>
                    <canvas
                        ref={canvasRef}
                        className={styles.avatarCanvas}
                        width={280}
                        height={300}
                    />

                    {/* Expression overlay */}
                    <div className={styles.expressionBadge}>
                        <span>{emoji}</span>
                    </div>

                    {/* Step indicator */}
                    <div className={styles.stepOverlay}>
                        <div className={styles.stepPulse}></div>
                        <span>{stepLabel}</span>
                    </div>

                    {/* Audio waveform */}
                    <div className={styles.waveform}>
                        {waveformBars.map((h, i) => (
                            <div
                                key={i}
                                className={styles.waveBar}
                                style={{
                                    height: `${h}px`,
                                    opacity: isSpeaking ? 0.9 : 0.2,
                                }}
                            ></div>
                        ))}
                    </div>
                </div>

                {/* Teacher info */}
                <div className={styles.teacherInfo}>
                    <div className={styles.teacherLabel}>
                        <div className={styles.liveDot}></div>
                        LIVE CLASS
                    </div>
                    <div className={styles.teacherNameBig}>{teacherName}</div>
                    <div className={styles.teacherStatus}>
                        {isSpeaking ? "Speaking..." : "Listening..."}
                    </div>
                </div>
            </div>

            {/* Live Notes Panel */}
            <div className={styles.notesSection}>
                <div className={styles.notesHeader}>
                    <h3>📝 Live Notes</h3>
                    <button
                        className={styles.transcriptToggle}
                        onClick={() => setShowTranscript(!showTranscript)}
                    >
                        {showTranscript ? "Hide Transcript" : "Show Transcript"}
                    </button>
                </div>

                {showTranscript && (
                    <div className={styles.transcriptArea}>
                        {transcript.split("\n").map((line, i) => (
                            <p key={i} className={styles.transcriptLine}>
                                {line || <br />}
                            </p>
                        ))}
                        {isSpeaking && <div className={styles.transcriptCursor}></div>}
                    </div>
                )}
            </div>

            {/* Controls Bar */}
            <div className={styles.controlsBar}>
                <div className={styles.controlsLeft}>
                    <div className={styles.timer}>
                        ⏱️ {formatTime(sessionTimeSeconds)}
                    </div>
                    <div className={styles.volumeControl}>
                        🔊
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume}
                            onChange={(e) => setVolume(Number(e.target.value))}
                            className={styles.volumeSlider}
                        />
                    </div>
                </div>

                <div className={styles.controlsCenter}>
                    <button
                        className={`${styles.controlBtn} ${micActive ? styles.controlBtnActive : ""}`}
                        onClick={toggleMic}
                        title={micActive ? "Mute mic" : "Unmute mic"}
                    >
                        {micActive ? "🎤" : "🔇"}
                        <span>{micActive ? "Mic On" : "Mic Off"}</span>
                    </button>

                    <button
                        className={styles.controlBtn}
                        onClick={onInterrupt}
                        title="Interrupt teacher"
                        disabled={!isSpeaking}
                    >
                        ✋
                        <span>Interrupt</span>
                    </button>

                    <button className={`${styles.controlBtn} ${styles.endBtn}`} onClick={onEndClass}>
                        🛑
                        <span>End Class</span>
                    </button>
                </div>

                <div className={styles.controlsRight}>
                    <div className={styles.qualityBadge}>HD</div>
                </div>
            </div>
        </div>
    );
}
