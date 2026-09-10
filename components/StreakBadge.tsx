import { React, Tooltip } from "@webpack/common";
import { calculateFamiliarity, isStreakActive } from "../badges";
import { getRecord } from "../storage";
import { InteractionRecord } from "../types";
import { StreakFlame } from "./StreakFlame";

interface StreakBadgeProps {
    userId: string;
    record?: InteractionRecord;
    variant?: "default" | "voice" | "header";
}

export function StreakBadge({ userId, record: propRecord, variant = "default" }: StreakBadgeProps) {
    const record = propRecord || getRecord(userId);
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
        return (
            <Tooltip text={tooltipText}>
                {(props: any) => (
                    <span
                        {...props}
                        className="vc-streaks-voice-icon"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            marginLeft: "6px",
                            verticalAlign: "middle",
                            cursor: "pointer",
                            filter: `drop-shadow(0 0 4px ${currentTier.color})`
                        }}
                    >
                        {streakCount > 0 ? (
                            <StreakFlame streakDays={streakCount} size="small" showLabel={false} />
                        ) : (
                            <span
                                style={{ width: "14px", height: "14px", color: currentTier.color, display: "inline-block" }}
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
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: 600,
                            backgroundColor: "rgba(0, 0, 0, 0.45)",
                            border: `1px solid ${currentTier.color}`,
                            boxShadow: `0 0 10px ${currentTier.glowColor}`,
                            color: currentTier.color,
                            cursor: "pointer",
                            marginRight: "6px"
                        }}
                    >
                        <span
                            style={{ width: "14px", height: "14px", display: "inline-block" }}
                            dangerouslySetInnerHTML={{ __html: currentTier.iconSvg }}
                        />
                        <span>{currentTier.name}</span>
                        {streakCount > 0 && <span>🔥 {streakCount}d</span>}
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
                        <StreakFlame streakDays={streakCount} size="small" />
                    )}
                </div>
            )}
        </Tooltip>
    );
}
