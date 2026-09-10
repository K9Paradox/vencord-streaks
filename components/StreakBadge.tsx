import { React, Tooltip } from "@webpack/common";
import { calculateFamiliarity, isStreakActive } from "../badges";
import { getRecord } from "../storage";
import { InteractionRecord } from "../types";

interface StreakBadgeProps {
    userId: string;
    record?: InteractionRecord;
}

export function StreakBadge({ userId, record: propRecord }: StreakBadgeProps) {
    const record = propRecord || getRecord(userId);
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

    return (
        <Tooltip text={tooltipText}>
            {(props: any) => (
                <div
                    {...props}
                    className="vc-streaks-badge"
                    style={{
                        borderColor: currentTier.color,
                        boxShadow: `0 0 8px ${currentTier.glowColor}`
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
                        <span className="vc-streaks-badge-flame">
                            🔥 {streakCount}
                        </span>
                    )}
                </div>
            )}
        </Tooltip>
    );
}
