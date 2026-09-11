export type InteractionType = "voice" | "dm";

export interface VoiceStats {
    totalSeconds: number;
    sessionsCount: number;
    lastSessionDate: number;
    lastGuildName?: string;
    lastChannelName?: string;
}

export interface DmStats {
    totalMessages: number;
    lastDmDate: number;
}

export interface StreakStats {
    current: number;
    longest: number;
    lastActiveDate: string; // ISO date format: YYYY-MM-DD
}

export interface DailyActivity {
    voiceSeconds: number;
    dmCount: number;
}

export interface InteractionRecord {
    userId: string;
    username?: string;
    _isSpoofed?: boolean;
    firstSeen: number;
    lastSeen: number;
    lastInteractionType: InteractionType;
    voice: VoiceStats;
    dms: DmStats;
    streak: StreakStats;
    activityLog?: Record<string, DailyActivity>;
}

export interface BadgeTier {
    level: number;
    name: string;
    tagline: string;
    minHours: number;
    minSessions: number;
    color: string;
    glowColor: string;
    iconSvg: string;
}

export interface FamiliarityProgress {
    currentTier: BadgeTier;
    nextTier?: BadgeTier;
    progressPercentage: number;
    totalHours: number;
    totalSessions: number;
}

export interface StreaksSettings {
    trackVoice: boolean;
    trackDms: boolean;
    showInPopout: boolean;
    showBadgeInHeader: boolean;
    minSessionDurationSeconds: number;
    streakWindowDays: number;
}
