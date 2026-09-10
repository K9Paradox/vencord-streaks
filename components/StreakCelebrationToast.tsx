import { React } from "@webpack/common";
import { BadgeTier } from "../types";

interface StreakCelebrationToastProps {
    friendName: string;
    oldTier?: BadgeTier;
    newTier: BadgeTier;
    onDismiss?: () => void;
}

/**
 * Plays a synthesized retro-futuristic chime using the native Web Audio API.
 * Requires no external audio files or asset CDN.
 */
export function playLevelUpChime(enabled = true): void {
    if (!enabled) return;
    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;

        const ctx = new AudioContextClass();
        if (ctx.state === "suspended") {
            ctx.resume();
        }

        // Ascending chime chord: C5 (523.25Hz), E5 (659.25Hz), G5 (783.99Hz), C6 (1046.50Hz)
        const notes = [523.25, 659.25, 783.99, 1046.50];
        const startTime = ctx.currentTime + 0.05;

        notes.forEach((freq, index) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, startTime + index * 0.09);

            // Soft envelope attack & gentle exponential release
            gain.gain.setValueAtTime(0, startTime + index * 0.09);
            gain.gain.linearRampToValueAtTime(0.18, startTime + index * 0.09 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + index * 0.09 + 0.45);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(startTime + index * 0.09);
            osc.stop(startTime + index * 0.09 + 0.5);
        });
    } catch (err) {
        // AudioContext may be blocked or restricted; silently ignore
        console.warn("[Streaks] Audio feedback playback skipped:", err);
    }
}

export function StreakCelebrationToast({
    friendName,
    oldTier,
    newTier,
    onDismiss
}: StreakCelebrationToastProps) {
    React.useEffect(() => {
        // Play audio chime on mount
        playLevelUpChime(true);

        const timer = setTimeout(() => {
            if (onDismiss) onDismiss();
        }, 5500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="vc-streaks-celebration-toast" onClick={onDismiss}>
            {/* Ambient radiant background blur */}
            <div
                className="vc-streaks-toast-ambient"
                style={{ backgroundColor: newTier.glowColor }}
            />

            {/* Confetti particles */}
            <div className="vc-streaks-confetti-container">
                <span className="confetti c1" style={{ backgroundColor: newTier.color }} />
                <span className="confetti c2" style={{ backgroundColor: "#FEE75C" }} />
                <span className="confetti c3" style={{ backgroundColor: "#57F287" }} />
                <span className="confetti c4" style={{ backgroundColor: newTier.color }} />
            </div>

            {/* Badge Icon presentation */}
            <div
                className="vc-streaks-toast-icon-frame"
                style={{
                    borderColor: newTier.color,
                    boxShadow: `0 0 16px ${newTier.glowColor}`
                }}
            >
                <span
                    className="vc-streaks-toast-icon"
                    style={{ color: newTier.color }}
                    dangerouslySetInnerHTML={{ __html: newTier.iconSvg }}
                />
            </div>

            {/* Text description */}
            <div className="vc-streaks-toast-body">
                <div className="vc-streaks-toast-headline">
                    LEVEL UP! ⭐
                </div>
                <div className="vc-streaks-toast-message">
                    You & <strong>{friendName}</strong> reached{" "}
                    <span style={{ color: newTier.color, fontWeight: 700 }}>
                        {newTier.name}
                    </span>
                    !
                </div>
                <div className="vc-streaks-toast-tagline">
                    "{newTier.tagline}"
                </div>
            </div>

            <button
                className="vc-streaks-toast-close"
                onClick={(e) => {
                    e.stopPropagation();
                    if (onDismiss) onDismiss();
                }}
            >
                ✕
            </button>
        </div>
    );
}
