import { React } from "@webpack/common";
import { calculateFamiliarity, formatDuration, formatRelativeTime, isStreakActive } from "../badges";
import { getRecord } from "../storage";

interface StreakCardProps {
    userId: string;
}

export function StreakCard({ userId }: StreakCardProps) {
    const record = getRecord(userId);
    const { currentTier, nextTier, progressPercentage, totalHours, totalSessions } = calculateFamiliarity(record);
    const streakActive = isStreakActive(record?.streak?.lastActiveDate);
    const currentStreak = streakActive ? (record?.streak?.current || 0) : 0;

    if (!record || (record.voice.totalSeconds === 0 && record.dms.totalMessages === 0)) {
        return (
            <div className="vc-streaks-card vc-streaks-card-empty">
                <div className="vc-streaks-header">
                    <span className="vc-streaks-title">Interaction Streaks</span>
                </div>
                <div className="vc-streaks-empty-text">
                    No mutual VC or DM interactions recorded yet. Jump in a call together to start your streak!
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
            {/* Header row */}
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

                {currentStreak > 0 && (
                    <div className="vc-streaks-flame-pill">
                        🔥 {currentStreak} {currentStreak === 1 ? "day" : "days"}
                    </div>
                )}
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
                                boxShadow: `0 0 6px ${nextTier.glowColor}`
                            }}
                        />
                    </div>
                </div>
            )}

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

            {/* Footer / Last Interaction Info */}
            <div className="vc-streaks-footer">
                <div className="vc-streaks-last-interacted">
                    <span>🕒 Last seen: <strong>{lastSeenFormatted}</strong> {lastLocation}</span>
                </div>
                <div className="vc-streaks-first-seen">
                    First met on {firstSeenDate}
                </div>
            </div>
        </div>
    );
}
