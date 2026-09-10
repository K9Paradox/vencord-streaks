import { BadgeTier, FamiliarityProgress, InteractionRecord } from "./types";

export const BADGE_TIERS: BadgeTier[] = [
    {
        level: 0,
        name: "First Contact",
        tagline: "Just met",
        minHours: 0,
        minSessions: 0,
        color: "#949BA4",
        glowColor: "rgba(148, 155, 164, 0.2)",
        iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>`
    },
    {
        level: 1,
        name: "Acquaintance",
        tagline: "Crossed paths in VC",
        minHours: 0.25, // 15 mins
        minSessions: 2,
        color: "#CD7F32",
        glowColor: "rgba(205, 127, 50, 0.3)",
        iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>`
    },
    {
        level: 2,
        name: "Familiar",
        tagline: "Frequent presence",
        minHours: 2,
        minSessions: 5,
        color: "#B0C4DE",
        glowColor: "rgba(176, 196, 222, 0.35)",
        iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
    },
    {
        level: 3,
        name: "Regular",
        tagline: "Solid gaming buddy",
        minHours: 10,
        minSessions: 15,
        color: "#FEE75C",
        glowColor: "rgba(254, 231, 92, 0.4)",
        iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/></svg>`
    },
    {
        level: 4,
        name: "Duo",
        tagline: "Reliable teammate",
        minHours: 30,
        minSessions: 30,
        color: "#57F287",
        glowColor: "rgba(87, 242, 135, 0.4)",
        iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 3s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>`
    },
    {
        level: 5,
        name: "Homie",
        tagline: "Inner circle",
        minHours: 75,
        minSessions: 60,
        color: "#EB459E",
        glowColor: "rgba(235, 69, 158, 0.45)",
        iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`
    },
    {
        level: 6,
        name: "Veteran",
        tagline: "Unbreakable bond",
        minHours: 150,
        minSessions: 100,
        color: "#5865F2",
        glowColor: "rgba(88, 101, 242, 0.5)",
        iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L9 9l-8 3 8 3 3 8 3-8 8-3-8-3-3-8z"/></svg>`
    }
];

export function calculateFamiliarity(record?: InteractionRecord): FamiliarityProgress {
    if (!record) {
        return {
            currentTier: BADGE_TIERS[0],
            nextTier: BADGE_TIERS[1],
            progressPercentage: 0,
            totalHours: 0,
            totalSessions: 0
        };
    }

    const totalHours = Math.round((record.voice.totalSeconds / 3600) * 10) / 10;
    const totalSessions = record.voice.sessionsCount;

    let currentTierIndex = 0;
    for (let i = BADGE_TIERS.length - 1; i >= 0; i--) {
        const tier = BADGE_TIERS[i];
        if (totalHours >= tier.minHours || totalSessions >= tier.minSessions) {
            currentTierIndex = i;
            break;
        }
    }

    const currentTier = BADGE_TIERS[currentTierIndex];
    const nextTier = BADGE_TIERS[currentTierIndex + 1];

    let progressPercentage = 100;
    if (nextTier) {
        const hoursProgress = Math.min(1, totalHours / (nextTier.minHours || 1));
        const sessionProgress = Math.min(1, totalSessions / (nextTier.minSessions || 1));
        // Take the best of either hours or session progress
        progressPercentage = Math.round(Math.max(hoursProgress, sessionProgress) * 100);
    }

    return {
        currentTier,
        nextTier,
        progressPercentage,
        totalHours,
        totalSessions
    };
}

export function isStreakActive(lastActiveDate?: string): boolean {
    if (!lastActiveDate) return false;
    const today = new Date().toISOString().split("T")[0];
    const yesterdayDate = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    return lastActiveDate === today || lastActiveDate === yesterdayDate;
}

export function formatRelativeTime(timestamp: number): string {
    if (!timestamp) return "Never";
    const diffMs = Date.now() - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return "Just now";
    if (diffMin === 1) return "1 minute ago";
    if (diffMin < 60) return `${diffMin} minutes ago`;
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
}

export function formatDuration(seconds: number): string {
    if (!seconds || seconds <= 0) return "0 mins";
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
}
