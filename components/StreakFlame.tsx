import { React, Tooltip } from "@webpack/common";

interface StreakFlameProps {
    streakDays: number;
    showLabel?: boolean;
    size?: "small" | "medium" | "large";
}

/**
 * Returns the flame tier configuration based on streak days.
 */
function getFlameTier(days: number) {
    if (days >= 30) {
        return {
            tierClass: "flame-hypernova",
            label: "Solar Hypernova",
            description: "30+ day legendary streak! Transcendent mutual energy."
        };
    }
    if (days >= 10) {
        return {
            tierClass: "flame-inferno",
            label: "Cosmic Inferno",
            description: "10+ day streak! Burning hot mutual presence."
        };
    }
    if (days >= 4) {
        return {
            tierClass: "flame-blaze",
            label: "Blazing",
            description: "Solid daily streak going strong!"
        };
    }
    return {
        tierClass: "flame-ember",
        label: "Kindled",
        description: "Streak started! Keep it going tomorrow."
    };
}

export function StreakFlame({
    streakDays,
    showLabel = true,
    size = "medium"
}: StreakFlameProps) {
    if (streakDays <= 0) return null;

    const { tierClass, label, description } = getFlameTier(streakDays);

    const tooltipContent = (
        <div className="vc-streaks-tooltip-inner">
            <div className="vc-streaks-tooltip-bold">🔥 {streakDays} Day Streak ({label})</div>
            <div className="vc-streaks-tooltip-dim">{description}</div>
        </div>
    );

    return (
        <Tooltip text={tooltipContent}>
            {(props: any) => (
                <div
                    {...props}
                    className={`vc-streaks-flame-wrapper ${tierClass} size-${size}`}
                >
                    <div className="vc-streaks-flame-glow" />
                    <svg
                        className="vc-streaks-flame-svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            <linearGradient id="flameGradEmber" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor="#FFA41B" />
                                <stop offset="100%" stopColor="#E24A00" />
                            </linearGradient>
                            <linearGradient id="flameGradInferno" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor="#00F0FF" />
                                <stop offset="50%" stopColor="#7000FF" />
                                <stop offset="100%" stopColor="#FF007A" />
                            </linearGradient>
                            <linearGradient id="flameGradChroma" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor="#FF6B6B" />
                                <stop offset="25%" stopColor="#FFE66D" />
                                <stop offset="50%" stopColor="#4D96FF" />
                                <stop offset="75%" stopColor="#6BCB77" />
                                <stop offset="100%" stopColor="#B983FF" />
                            </linearGradient>
                        </defs>
                        {/* Outer Flame Path */}
                        <path
                            className="flame-outer"
                            d="M12 2C10.5 4.5 8 7 8 10.5C8 11.7 8.3 12.8 8.8 13.8C7.5 13.2 6.5 12 6.5 10.5C5 12.3 4 14.5 4 17C4 20.9 7.6 22 12 22C16.4 22 20 20.9 20 17C20 13.5 18 10.5 15.5 8C15.5 9.5 14.8 10.8 13.7 11.6C14.3 8.8 13.5 5.5 12 2Z"
                        />
                        {/* Inner Core Flame */}
                        <path
                            className="flame-inner"
                            d="M12 11C10.9 12.5 10 14 10 16C10 18.2 11 19.5 12 19.5C13 19.5 14 18.2 14 16C14 14.5 13.3 13.2 12 11Z"
                        />
                    </svg>

                    {/* Animated Micro-particles for High Tiers */}
                    {streakDays >= 10 && (
                        <div className="vc-streaks-spark-particles">
                            <span className="spark spark-1" />
                            <span className="spark spark-2" />
                            <span className="spark spark-3" />
                        </div>
                    )}

                    {showLabel && (
                        <span className="vc-streaks-flame-count">
                            {streakDays}
                        </span>
                    )}
                </div>
            )}
        </Tooltip>
    );
}
