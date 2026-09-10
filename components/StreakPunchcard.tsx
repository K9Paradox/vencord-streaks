import { React, Tooltip } from "@webpack/common";

interface DailyActivity {
    voiceSeconds: number;
    dmCount: number;
}

interface StreakPunchcardProps {
    activityLog?: Record<string, DailyActivity>;
    currentTierColor?: string;
    mode?: "week" | "month";
}

/**
 * Computes an activity score from 0 to 4 based on voice duration & message count.
 */
function getActivityIntensity(activity?: DailyActivity): number {
    if (!activity) return 0;
    const { voiceSeconds, dmCount } = activity;
    if (voiceSeconds === 0 && dmCount === 0) return 0;

    // Weight voice minutes (1 min = 1 pt) + DMs (1 message = 2 pts)
    const points = (voiceSeconds / 60) + (dmCount * 2);

    if (points > 120) return 4; // High (>2h VC or heavy combo)
    if (points > 45) return 3;  // Medium-High
    if (points > 15) return 2;  // Medium
    return 1;                   // Low (>0)
}

function formatMinutes(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
        return `${hrs}h ${mins % 60}m`;
    }
    return `${mins}m`;
}

export function StreakPunchcard({
    activityLog = {},
    currentTierColor = "var(--brand-experiment, #5865F2)",
    mode = "week"
}: StreakPunchcardProps) {
    const today = new Date();
    const daysToShow = mode === "month" ? 28 : 7;

    // Generate array of date objects starting from (today - daysToShow + 1) to today
    const days = Array.from({ length: daysToShow }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (daysToShow - 1 - i));
        const dateKey = d.toISOString().split("T")[0];
        const activity = activityLog[dateKey];
        const intensity = getActivityIntensity(activity);
        const dayLabel = d.toLocaleDateString(undefined, { weekday: "narrow" });
        const fullDate = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });

        return {
            dateKey,
            dayLabel,
            fullDate,
            activity,
            intensity
        };
    });

    if (mode === "week") {
        return (
            <div className="vc-streaks-punchcard-week">
                <div className="vc-streaks-punchcard-pills">
                    {days.map(d => {
                        const tooltipContent = (
                            <div className="vc-streaks-tooltip-inner">
                                <div className="vc-streaks-tooltip-bold">{d.fullDate}</div>
                                {d.activity && (d.activity.voiceSeconds > 0 || d.activity.dmCount > 0) ? (
                                    <>
                                        {d.activity.voiceSeconds > 0 && (
                                            <div>🎙️ {formatMinutes(d.activity.voiceSeconds)} in voice</div>
                                        )}
                                        {d.activity.dmCount > 0 && (
                                            <div>💬 {d.activity.dmCount} messages</div>
                                        )}
                                    </>
                                ) : (
                                    <div className="vc-streaks-tooltip-dim">No interactions recorded</div>
                                )}
                            </div>
                        );

                        return (
                            <Tooltip key={d.dateKey} text={tooltipContent}>
                                {(props: any) => (
                                    <div
                                        {...props}
                                        className={`vc-streaks-day-pill intensity-${d.intensity}`}
                                        style={
                                            d.intensity > 0
                                                ? ({ "--pill-color": currentTierColor } as React.CSSProperties)
                                                : undefined
                                        }
                                    >
                                        <span className="vc-streaks-day-letter">{d.dayLabel}</span>
                                        <div className="vc-streaks-pill-indicator" />
                                    </div>
                                )}
                            </Tooltip>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Monthly 4-week grid (28 days)
    return (
        <div className="vc-streaks-punchcard-month">
            <div className="vc-streaks-punchcard-grid">
                {days.map(d => {
                    const tooltipContent = (
                        <div className="vc-streaks-tooltip-inner">
                            <div className="vc-streaks-tooltip-bold">{d.fullDate}</div>
                            {d.activity && (d.activity.voiceSeconds > 0 || d.activity.dmCount > 0) ? (
                                <>
                                    {d.activity.voiceSeconds > 0 && (
                                        <div>🎙️ {formatMinutes(d.activity.voiceSeconds)} in voice</div>
                                    )}
                                    {d.activity.dmCount > 0 && (
                                        <div>💬 {d.activity.dmCount} messages</div>
                                    )}
                                </>
                            ) : (
                                <div className="vc-streaks-tooltip-dim">No interactions</div>
                            )}
                        </div>
                    );

                    return (
                        <Tooltip key={d.dateKey} text={tooltipContent}>
                            {(props: any) => (
                                <div
                                    {...props}
                                    className={`vc-streaks-matrix-cell intensity-${d.intensity}`}
                                    style={
                                        d.intensity > 0
                                            ? ({ "--cell-color": currentTierColor } as React.CSSProperties)
                                            : undefined
                                    }
                                />
                            )}
                        </Tooltip>
                    );
                })}
            </div>
        </div>
    );
}
