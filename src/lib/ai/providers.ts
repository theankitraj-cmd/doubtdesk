/* ─── Mock Avatar Providers ────────────────────────────────── */
/* These mock the external APIs (Simli, ElevenLabs, Deepgram)  */
/* Each has the same interface that real providers will use.    */

import { STEP_EXPRESSIONS, type TeacherStep } from "./config";

/* ─── Simli Mock (Speech-to-Video) ──────────────────────── */

export interface SimliSession {
    sessionId: string;
    faceModelId: string;
    status: "initializing" | "active" | "paused" | "ended";
}

export const SimliProvider = {
    /** Initialize an avatar session with a face model */
    async createSession(faceModelId: string): Promise<SimliSession> {
        // Mock: In production, this calls Simli's REST API
        await new Promise((r) => setTimeout(r, 500));
        return {
            sessionId: `simli-${Date.now()}`,
            faceModelId,
            status: "active",
        };
    },

    /** Send audio to generate lip-synced video frames */
    async sendAudio(sessionId: string, audioChunk: ArrayBuffer): Promise<{ videoUrl: string }> {
        // Mock: Simli processes audio → returns video frames
        return { videoUrl: `mockVideo://${sessionId}/frame` };
    },

    /** Set the avatar's expression */
    async setExpression(sessionId: string, expression: string): Promise<void> {
        // Mock: Simli changes the avatar's facial expression
        console.log(`[Simli] Session ${sessionId}: expression → ${expression}`);
    },

    /** Pause the avatar (while student speaks) */
    async pause(sessionId: string): Promise<void> {
        console.log(`[Simli] Session ${sessionId}: PAUSED`);
    },

    /** Resume the avatar */
    async resume(sessionId: string): Promise<void> {
        console.log(`[Simli] Session ${sessionId}: RESUMED`);
    },

    /** End the avatar session */
    async endSession(sessionId: string): Promise<void> {
        console.log(`[Simli] Session ${sessionId}: ENDED`);
    },

    /** Get cost estimate for a session */
    getCostPerMinute(): number {
        return 0.05; // $0.05/min
    },
};

/* ─── ElevenLabs Mock (Text-to-Speech) ──────────────────── */

export interface TTSConfig {
    voiceId: string;
    model: string;
    stability: number;
    similarityBoost: number;
}

export const TEACHER_VOICES: Record<string, TTSConfig> = {
    sharma: {
        voiceId: "mock-sharma-voice-id",
        model: "eleven_turbo_v2",
        stability: 0.65,
        similarityBoost: 0.75,
    },
    priya: {
        voiceId: "mock-priya-voice-id",
        model: "eleven_turbo_v2",
        stability: 0.7,
        similarityBoost: 0.8,
    },
    david: {
        voiceId: "mock-david-voice-id",
        model: "eleven_turbo_v2",
        stability: 0.6,
        similarityBoost: 0.7,
    },
};

export const ElevenLabsProvider = {
    /** Convert text to speech audio stream */
    async synthesize(text: string, voiceConfig: TTSConfig): Promise<ArrayBuffer> {
        // Mock: In production, this calls ElevenLabs streaming TTS API
        console.log(`[ElevenLabs] Synthesizing ${text.length} chars with voice ${voiceConfig.voiceId}`);
        await new Promise((r) => setTimeout(r, 300));
        return new ArrayBuffer(0); // Mock audio buffer
    },

    /** Cancel in-progress synthesis (for interruption) */
    cancelSynthesis(): void {
        console.log("[ElevenLabs] Synthesis CANCELLED");
    },

    /** Get available voices */
    getVoices(): string[] {
        return Object.keys(TEACHER_VOICES);
    },
};

/* ─── Deepgram Mock (Speech-to-Text) ──────────────────── */

export interface STTResult {
    transcript: string;
    confidence: number;
    isFinal: boolean;
    words: Array<{ word: string; start: number; end: number }>;
}

export const DeepgramProvider = {
    /** Start a real-time transcription session */
    async createSession(_language: string = "en-IN"): Promise<string> {
        console.log(`[Deepgram] STT session started (${_language})`);
        return `deepgram-${Date.now()}`;
    },

    /** Process an audio chunk and get transcript */
    async processAudio(sessionId: string, audioChunk: ArrayBuffer): Promise<STTResult> {
        // Mock: Returns simulated transcription
        return {
            transcript: `Processed ${audioChunk.byteLength} for ${sessionId}`,
            confidence: 0.95,
            isFinal: false,
            words: [],
        };
    },

    /** End the transcription session */
    async endSession(sessionId: string): Promise<void> {
        console.log(`[Deepgram] STT session ${sessionId}: ENDED`);
    },
};

/* ─── Avatar Orchestrator ─────────────────────────────────── */
/* Coordinates Simli + ElevenLabs + Deepgram into a unified    */
/* avatar teaching session.                                     */

export interface AvatarOrchestratorState {
    simliSession: SimliSession | null;
    sttSessionId: string | null;
    currentStep: TeacherStep;
    currentExpression: string;
    isSpeaking: boolean;
    isListening: boolean;
    totalMinutesUsed: number;
    transcript: string;
}

export class AvatarOrchestrator {
    private state: AvatarOrchestratorState = {
        simliSession: null,
        sttSessionId: null,
        currentStep: "GREETING",
        currentExpression: "warm_smile",
        isSpeaking: false,
        isListening: false,
        totalMinutesUsed: 0,
        transcript: "",
    };

    private teacherAvatar: string;
    private onStateChange: (state: AvatarOrchestratorState) => void;
    private minuteTimer: ReturnType<typeof setInterval> | null = null;

    constructor(
        teacherAvatar: string,
        onStateChange: (state: AvatarOrchestratorState) => void
    ) {
        this.teacherAvatar = teacherAvatar;
        this.onStateChange = onStateChange;
    }

    async start(): Promise<void> {
        // Initialize Simli avatar
        const simliSession = await SimliProvider.createSession(this.teacherAvatar);
        const sttSessionId = await DeepgramProvider.createSession("en-IN");

        this.state = {
            ...this.state,
            simliSession,
            sttSessionId,
        };
        this.emit();

        // Start minute counter for usage tracking
        this.minuteTimer = setInterval(() => {
            this.state.totalMinutesUsed += 1 / 60;
            this.emit();
        }, 1000);
    }

    async speak(text: string, step: TeacherStep): Promise<void> {
        const expression = STEP_EXPRESSIONS[step] || "default";
        this.state = {
            ...this.state,
            currentStep: step,
            currentExpression: expression,
            isSpeaking: true,
            isListening: false,
        };
        this.emit();

        // Set avatar expression
        if (this.state.simliSession) {
            await SimliProvider.setExpression(this.state.simliSession.sessionId, expression);
        }

        // Synthesize speech
        const voiceConfig = TEACHER_VOICES[this.teacherAvatar] || TEACHER_VOICES.sharma;
        const _audioBuffer = await ElevenLabsProvider.synthesize(text, voiceConfig);

        // Feed audio to Simli for lip-synced video
        if (this.state.simliSession) {
            await SimliProvider.sendAudio(this.state.simliSession.sessionId, _audioBuffer);
        }

        // Update transcript
        this.state.transcript += (this.state.transcript ? "\n" : "") + text;
        this.emit();
    }

    async finishSpeaking(): Promise<void> {
        this.state = {
            ...this.state,
            isSpeaking: false,
            isListening: true,
        };
        this.emit();
    }

    async interrupt(): Promise<void> {
        ElevenLabsProvider.cancelSynthesis();
        if (this.state.simliSession) {
            await SimliProvider.pause(this.state.simliSession.sessionId);
        }
        this.state = {
            ...this.state,
            isSpeaking: false,
            isListening: true,
            currentExpression: "listening",
        };
        this.emit();
    }

    async end(): Promise<void> {
        if (this.minuteTimer) clearInterval(this.minuteTimer);
        if (this.state.simliSession) {
            await SimliProvider.endSession(this.state.simliSession.sessionId);
        }
        if (this.state.sttSessionId) {
            await DeepgramProvider.endSession(this.state.sttSessionId);
        }
        this.state = {
            ...this.state,
            simliSession: null,
            sttSessionId: null,
            isSpeaking: false,
            isListening: false,
        };
        this.emit();
    }

    getState(): AvatarOrchestratorState {
        return { ...this.state };
    }

    private emit(): void {
        this.onStateChange({ ...this.state });
    }
}
