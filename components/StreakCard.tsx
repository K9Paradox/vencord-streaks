import { React } from "@webpack/common";
import { calculateFamiliarity, formatDuration, formatRelativeTime, isStreakActive } from "../badges";
import { settings } from "../settings";
import { createSpoofedRecord, getRecord } from "../storage";
import { InteractionRecord } from "../types";
import { StreakFlame } from "./StreakFlame";
import { StreakPunchcard } from "./StreakPunchcard";

interface StreakCardProps {
    userId: string;
    record?: InteractionRecord;
    defaultExpanded?: boolean;
    theme?: string;
}

export function StreakCard({ userId, record: propRecord, defaultExpanded = false, theme }: StreakCardProps) {
    const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
    const [punchcardMode, setPunchcardMode] = React.useState<"week" | "month">("week");

    let record = propRecord || getRecord(userId);
    const isSpoofed = Boolean(
        (record as any)?._isSpoofed ||
        ((!record || (record.voice.totalSeconds === 0 && record.dms.totalMessages === 0)) && settings.store.devTestingMode)
    );
    if ((!record || (record.voice.totalSeconds === 0 && record.dms.totalMessages === 0)) && settings.store.devTestingMode) {
        record = createSpoofedRecord(userId, settings.store.devTestingTier || "Gold");
    }

    const { currentTier, nextTier, progressPercentage, totalHours, totalSessions } = calculateFamiliarity(record);
    const streakActive = isStreakActive(record?.streak?.lastActiveDate);
    const currentStreak = streakActive ? (record?.streak?.current || 0) : 0;
    const themeClass = theme ? `theme-${theme} vc-streaks-theme-${theme}` : "";

    if (!record || (record.voice.totalSeconds === 0 && record.dms.totalMessages === 0)) {
        return (
            <div className={`vc-streaks-card vc-streaks-card-empty ${themeClass}`}>
                <div className="vc-streaks-card-header">
                    <span className="vc-streaks-section-label">Streaks & Activity</span>
                </div>
                <div className="vc-streaks-empty-desc">
                    No mutual voice channel or DM interactions recorded yet. Jump in a call together to start a streak!
                </div>
            </div>
        );
    }

    const lastSeenFormatted = formatRelativeTime(record.lastSeen);
    const lastLocation = record.lastInteractionType === "voice"
        ? (record.voice.lastGuildName ? `in ${record.voice.lastGuildName}` : "in voice call")
        : "via direct message";

    const firstSeenDate = new Date(record.firstSeen).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
    });

    return (
        <div className={`vc-streaks-card ${isExpanded ? "vc-streaks-card-expanded" : ""} ${themeClass}`}>
            {/* Header: Section label + Streak Pill + Expand Toggle */}
            <div className="vc-streaks-card-header" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="vc-streaks-header-left">
                    <span className="vc-streaks-section-label">
                        Streaks & Activity
                        {isSpoofed && (
                            <span className="vc-streaks-dev-pill" title="Dev Testing Mode active in Settings">
                                DEV PREVIEW
                            </span>
                        )}
                    </span>
                </div>
                <div className="vc-streaks-header-right">
                    {currentStreak > 0 && (
                        <div className="vc-streaks-header-streak-pill">
                            <StreakFlame streakDays={currentStreak} size="small" showLabel={true} />
                        </div>
                    )}
                    <button
                        className={`vc-streaks-toggle-btn ${isExpanded ? "expanded" : ""}`}
                        aria-label={isExpanded ? "Collapse telemetry" : "Expand telemetry"}
                        title={isExpanded ? "Collapse" : "Expand"}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Main Overview Row */}
            <div className="vc-streaks-overview-row" onClick={() => setIsExpanded(!isExpanded)}>
                <div
                    className="vc-streaks-tier-icon-box"
                    style={{
                        borderColor: currentTier.color,
                        boxShadow: `0 0 10px -2px ${currentTier.glowColor}`
                    }}
                >
                    <span
                        className="vc-streaks-icon-svg"
                        style={{ color: currentTier.color }}
                        dangerouslySetInnerHTML={{ __html: currentTier.iconSvg }}
                    />
                </div>

                <div className="vc-streaks-overview-text">
                    <div className="vc-streaks-tier-title-row">
                        <span className="vc-streaks-tier-title" style={{ color: currentTier.color }}>
                            {currentTier.name}
                        </span>
                        <span className="vc-streaks-overview-quickstats">
                            {totalHours > 0 && `${totalHours}h VC`}
                            {totalHours > 0 && record.dms.totalMessages > 0 && " • "}
                            {record.dms.totalMessages > 0 && `${record.dms.totalMessages} msgs`}
                        </span>
                    </div>
                    <div className="vc-streaks-tier-tagline">
                        {currentTier.tagline}
                    </div>
                </div>
            </div>

            {/* Sleek Progress Bar to Next Tier */}
            {nextTier && (
                <div className="vc-streaks-progress-wrap">
                    <div className="vc-streaks-progress-meta">
                        <span className="vc-streaks-progress-target">Next: {nextTier.name}</span>
                        <span className="vc-streaks-progress-pct">{progressPercentage}%</span>
                    </div>
                    <div className="vc-streaks-progress-track">
                        <div
                            className="vc-streaks-progress-fill"
                            style={{
                                width: `${progressPercentage}%`,
                                backgroundColor: nextTier.color
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Expanded Telemetry Section */}
            {isExpanded && (
                <div className="vc-streaks-expanded-body">
                    {/* Two-Column Telemetry Stat Cards */}
                    <div className="vc-streaks-stats-grid">
                        <div className="vc-streaks-stat-card">
                            <div className="vc-streaks-stat-top">
                                <span className="vc-streaks-stat-label">Voice Together</span>
                            </div>
                            <div className="vc-streaks-stat-value">
                                {formatDuration(record.voice.totalSeconds)}
                            </div>
                            <div className="vc-streaks-stat-detail">
                                {totalSessions} {totalSessions === 1 ? "session" : "sessions"}
                            </div>
                        </div>

                        <div className="vc-streaks-stat-card">
                            <div className="vc-streaks-stat-top">
                                <span className="vc-streaks-stat-label">Direct Messages</span>
                            </div>
                            <div className="vc-streaks-stat-value">
                                {record.dms.totalMessages}
                            </div>
                            <div className="vc-streaks-stat-detail">
                                {record.dms.lastDmDate ? `Last: ${formatRelativeTime(record.dms.lastDmDate)}` : "No direct messages"}
                            </div>
                        </div>
                    </div>

                    {/* Activity Momentum (Punchcard) */}
                    <div className="vc-streaks-punchcard-container">
                        <div className="vc-streaks-punchcard-top">
                            <span className="vc-streaks-stat-label">Activity Momentum</span>
                            <button
                                className="vc-streaks-view-toggle-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setPunchcardMode(punchcardMode === "week" ? "month" : "week");
                                }}
                            >
                                {punchcardMode === "week" ? "Show 28d" : "Show 7d"}
                            </button>
                        </div>
                        <StreakPunchcard
                            activityLog={(record as any).activityLog}
                            currentTierColor={currentTier.color}
                            mode={punchcardMode}
                        />
                    </div>

                    {/* Timeline Footer */}
                    <div className="vc-streaks-footer-timeline">
                        <div className="vc-streaks-footer-item">
                            <span className="vc-streaks-footer-dot" />
                            <span>Last seen <strong>{lastSeenFormatted}</strong> {lastLocation}</span>
                        </div>
                        <div className="vc-streaks-footer-item vc-streaks-footer-sub">
                            <span>First crossed paths on {firstSeenDate}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
