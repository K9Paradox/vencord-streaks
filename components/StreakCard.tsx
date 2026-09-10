import { React } from "@webpack/common";
import { calculateFamiliarity, formatDuration, formatRelativeTime, isStreakActive } from "../badges";
import { getRecord, spoofUser } from "../storage";
import { StreakFlame } from "./StreakFlame";
import { StreakPunchcard } from "./StreakPunchcard";

const DEV_TIERS = ["Bronze", "Silver", "Gold", "Emerald", "Amethyst", "Ruby", "Diamond"];

interface StreakCardProps {
    userId: string;
    defaultExpanded?: boolean;
}

export function StreakCard({ userId, defaultExpanded = false }: StreakCardProps) {
    const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
    const [punchcardMode, setPunchcardMode] = React.useState<"week" | "month">("week");
    const [, setRenderTrigger] = React.useState(0);

    const record = getRecord(userId);
    const { currentTier, nextTier, progressPercentage, totalHours, totalSessions } = calculateFamiliarity(record);
    const streakActive = isStreakActive(record?.streak?.lastActiveDate);
    const currentStreak = streakActive ? (record?.streak?.current || 0) : 0;

    const handleCycleTier = (e: React.MouseEvent) => {
        e.stopPropagation();
        const currentIdx = DEV_TIERS.indexOf(currentTier.name);
        const nextIdx = (currentIdx + 1) % DEV_TIERS.length;
        const nextTierName = DEV_TIERS[nextIdx];
        spoofUser(userId, nextTierName);
        setRenderTrigger(prev => prev + 1);
    };

    if (!record || (record.voice.totalSeconds === 0 && record.dms.totalMessages === 0)) {
        return (
            <div className="vc-streaks-card vc-streaks-card-empty">
                <div className="vc-streaks-header">
                    <span className="vc-streaks-title">Interaction Streaks</span>
                </div>
                <div className="vc-streaks-empty-text">
                    No mutual VC or DM interactions recorded yet. Jump in a call together to ignite your streak!
                </div>
                <div style={{ marginTop: "10px", display: "flex", gap: "6px" }}>
                    <button
                        className="vc-streaks-dev-btn"
                        onClick={() => {
                            spoofUser(userId, "Gold");
                            setRenderTrigger(prev => prev + 1);
                        }}
                    >
                        🧪 Seed Mock Stats (Dev Preview)
                    </button>
                </div>
            </div>
        );
    }

    const lastSeenFormatted = formatRelativeTime(record.lastSeen);
    const lastLocation = record.lastInteractionType === "voice"
        ? (record.voice.lastGuildName ? `in ${record.voice.lastGuildName}` : "in Voice Call")
        : "via Direct Message";

    const firstSeenDate = new Date(record.firstSeen).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
    });

    return (
        <div className="vc-streaks-card">
            {/* Header row / Compact bar */}
            <div className="vc-streaks-header">
                <div className="vc-streaks-tier-info">
                    <span
                        className="vc-streaks-card-icon"
                        style={{ color: currentTier.color }}
                        dangerouslySetInnerHTML={{ __html: currentTier.iconSvg }}
                    />
                    <div>
                        <div className="vc-streaks-tier-name" style={{ color: currentTier.color }}>
                            {currentTier.name}
                        </div>
                        <div className="vc-streaks-tier-tagline">{currentTier.tagline}</div>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <button
                        className="vc-streaks-dev-cycle-btn"
                        onClick={handleCycleTier}
                        title="Click to cycle next tier (Dev Testing)"
                    >
                        🧪
                    </button>
                    {currentStreak > 0 && (
                        <StreakFlame streakDays={currentStreak} size="medium" />
                    )}
                    <button
                        className={`vc-streaks-toggle-btn ${isExpanded ? "expanded" : ""}`}
                        onClick={() => setIsExpanded(!isExpanded)}
                        title={isExpanded ? "Collapse view" : "Expand telemetry"}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Next tier progress bar */}
            {nextTier && (
                <div className="vc-streaks-progress-container">
                    <div className="vc-streaks-progress-labels">
                        <span>Progress to {nextTier.name}</span>
                        <span>{progressPercentage}%</span>
                    </div>
                    <div className="vc-streaks-progress-bar-bg">
                        <div
                            className="vc-streaks-progress-bar-fill"
                            style={{
                                width: `${progressPercentage}%`,
                                backgroundColor: nextTier.color,
                                boxShadow: `0 0 8px ${nextTier.glowColor}`
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Detailed Expanded Telemetry */}
            {isExpanded && (
                <>
                    {/* Stats Grid */}
                    <div className="vc-streaks-stats-grid">
                        <div className="vc-streaks-stat-box">
                            <div className="vc-streaks-stat-label">🎙️ Voice Together</div>
                            <div className="vc-streaks-stat-value">{formatDuration(record.voice.totalSeconds)}</div>
                            <div className="vc-streaks-stat-sub">{totalSessions} {totalSessions === 1 ? "session" : "sessions"}</div>
                        </div>

                        <div className="vc-streaks-stat-box">
                            <div className="vc-streaks-stat-label">💬 DMs Exchanged</div>
                            <div className="vc-streaks-stat-value">{record.dms.totalMessages}</div>
                            <div className="vc-streaks-stat-sub">
                                {record.dms.lastDmDate ? `Last: ${formatRelativeTime(record.dms.lastDmDate)}` : "None yet"}
                            </div>
                        </div>
                    </div>

                    {/* Activity Heatmap / Punchcard */}
                    <div className="vc-streaks-punchcard-section">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                            <span className="vc-streaks-section-label">Interaction Momentum</span>
                            <button
                                style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: "10px",
                                    color: "var(--interactive-normal, #949ba4)",
                                    cursor: "pointer",
                                    textDecoration: "underline"
                                }}
                                onClick={() => setPunchcardMode(punchcardMode === "week" ? "month" : "week")}
                            >
                                {punchcardMode === "week" ? "Show Month" : "Show 7 Days"}
                            </button>
                        </div>
                        <StreakPunchcard
                            activityLog={(record as any).activityLog}
                            currentTierColor={currentTier.color}
                            mode={punchcardMode}
                        />
                    </div>

                    {/* Footer / Last Interaction Info */}
                    <div className="vc-streaks-footer">
                        <div className="vc-streaks-last-interacted">
                            🕒 Last seen: <strong>{lastSeenFormatted}</strong> {lastLocation}
                        </div>
                        <div className="vc-streaks-first-seen">
                            First met on {firstSeenDate}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
