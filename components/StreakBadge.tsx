import { React, Tooltip } from "@webpack/common";
import { calculateFamiliarity, isStreakActive } from "../badges";
import { settings } from "../settings";
import { createSpoofedRecord, getRecord } from "../storage";
import { InteractionRecord } from "../types";
import { StreakFlame } from "./StreakFlame";

interface StreakBadgeProps {
    userId: string;
    record?: InteractionRecord;
    variant?: "default" | "voice" | "header" | "memberList";
}

export function StreakBadge({ userId, record: propRecord, variant = "default" }: StreakBadgeProps) {
    let record = propRecord || getRecord(userId);
    if ((!record || (record.voice.totalSeconds === 0 && record.dms.totalMessages === 0)) && settings.store.devTestingMode) {
        record = createSpoofedRecord(userId, settings.store.devTestingTier || "Gold");
    }
    if (!record || (record.voice.totalSeconds === 0 && record.dms.totalMessages === 0)) {
        return null;
    }
    const { currentTier } = calculateFamiliarity(record);
    const streakActive = isStreakActive(record?.streak?.lastActiveDate);
    const streakCount = streakActive ? (record?.streak?.current || 0) : 0;

    const tooltipText = (
        <div className="vc-streaks-badge-tooltip">
            <div className="vc-streaks-tooltip-title">{currentTier.name}</div>
            <div className="vc-streaks-tooltip-desc">{currentTier.tagline}</div>
            {streakCount > 0 && (
                <div className="vc-streaks-tooltip-streak">
                    🔥 {streakCount} day streak!
                </div>
            )}
        </div>
    );

    if (variant === "voice") {
        if (streakCount > 0) {
            return (
                <span
                    className="vc-streaks-voice-icon"
                    style={{
                        color: currentTier.color
                    }}
                >
                    <StreakFlame streakDays={streakCount} size="small" showLabel={true} />
                </span>
            );
        }

        return (
            <Tooltip text={tooltipText}>
                {(props: any) => (
                    <span
                        {...props}
                        className="vc-streaks-voice-icon"
                        style={{
                            color: currentTier.color
                        }}
                    >
                        <span
                            className="vc-streaks-voice-tier-star"
                            dangerouslySetInnerHTML={{ __html: currentTier.iconSvg }}
                        />
                    </span>
                )}
            </Tooltip>
        );
    }

    if (variant === "memberList") {
        return (
            <Tooltip text={tooltipText}>
                {(props: any) => (
                    <span
                        {...props}
                        className="vc-streaks-memberlist-badge"
                        style={{ color: currentTier.color }}
                    >
                        {streakCount > 0 ? (
                            <StreakFlame streakDays={streakCount} size="small" showLabel={true} />
                        ) : (
                            <span
                                className="vc-streaks-memberlist-star"
                                dangerouslySetInnerHTML={{ __html: currentTier.iconSvg }}
                            />
                        )}
                    </span>
                )}
            </Tooltip>
        );
    }

    if (variant === "header") {
        return (
            <Tooltip text={tooltipText}>
                {(props: any) => (
                    <div
                        {...props}
                        className="vc-streaks-header-badge"
                        style={{
                            borderColor: currentTier.color,
                            color: currentTier.color
                        }}
                    >
                        <span
                            className="vc-streaks-header-icon"
                            dangerouslySetInnerHTML={{ __html: currentTier.iconSvg }}
                        />
                        <span className="vc-streaks-header-tier">{currentTier.name}</span>
                        {streakCount > 0 && <span className="vc-streaks-header-flame">🔥 {streakCount}d</span>}
                    </div>
                )}
            </Tooltip>
        );
    }

    return (
        <Tooltip text={tooltipText}>
            {(props: any) => (
                <div
                    {...props}
                    className="vc-streaks-badge"
                    style={{
                        borderColor: currentTier.color,
                        boxShadow: `0 0 6px ${currentTier.glowColor}`
                    }}
                >
                    <span
                        className="vc-streaks-badge-icon"
                        style={{ color: currentTier.color }}
                        dangerouslySetInnerHTML={{ __html: currentTier.iconSvg }}
                    />
                    <span className="vc-streaks-badge-name" style={{ color: currentTier.color }}>
                        {currentTier.name}
                    </span>
                    {streakCount > 0 && (
                        <StreakFlame streakDays={streakCount} size="small" />
                    )}
                </div>
            )}
        </Tooltip>
    );
}
