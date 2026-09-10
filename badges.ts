import { BadgeTier, FamiliarityProgress, InteractionRecord } from "./types";

export const BADGE_TIERS: BadgeTier[] = [
    {
        level: 0,
        name: "First Contact",
        tagline: "Just met",
        minHours: 0,
        minSessions: 0,
        color: "var(--streaks-tier-first-contact, #949BA4)",
        glowColor: "var(--streaks-tier-first-contact-glow, rgba(148, 155, 164, 0.25))",
        iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 2"/></svg>`
    },
    {
        level: 1,
        name: "Bronze",
        tagline: "Acquaintance • Crossed paths in VC",
        minHours: 0.25, // 15 mins
        minSessions: 2,
        color: "var(--streaks-tier-bronze, #CD7F32)",
        glowColor: "var(--streaks-tier-bronze-glow, rgba(205, 127, 50, 0.40))",
        iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 2.18l6 2.25v4.66c0 3.97-2.6 7.68-6 8.78-3.4-1.1-6-4.81-6-8.78V6.43l6-2.25z"/><circle cx="12" cy="11" r="2.5"/></svg>`
    },
    {
        level: 2,
        name: "Silver",
        tagline: "Familiar • Frequent presence",
        minHours: 2,
        minSessions: 5,
        color: "var(--streaks-tier-silver, #E2E8F0)",
        glowColor: "var(--streaks-tier-silver-glow, rgba(226, 232, 240, 0.45))",
        iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 4.8 5.3.8-3.8 3.7.9 5.3-4.8-2.5-4.8 2.5.9-5.3-3.8-3.7 5.3-.8L12 2z"/><path d="M12 6.5l-1.3 2.7-3 .4 2.2 2.1-.5 3 2.6-1.4 2.6 1.4-.5-3 2.2-2.1-3-.4L12 6.5z" opacity="0.4"/></svg>`
    },
    {
        level: 3,
        name: "Gold",
        tagline: "Regular • Solid gaming buddy",
        minHours: 10,
        minSessions: 15,
        color: "var(--streaks-tier-gold, #FEE75C)",
        glowColor: "var(--streaks-tier-gold-glow, rgba(254, 231, 92, 0.50))",
        iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/></svg>`
    },
    {
        level: 4,
        name: "Emerald",
        tagline: "Duo • Reliable teammate",
        minHours: 30,
        minSessions: 30,
        color: "var(--streaks-tier-emerald, #57F287)",
        glowColor: "var(--streaks-tier-emerald-glow, rgba(87, 242, 135, 0.55))",
        iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 3l-4 6 10 12 10-12-4-6H6zm1.5 2h9l2.7 4H4.8l2.7-4zm-3 5.5h15L12 19.8 4.5 10.5z"/></svg>`
    },
    {
        level: 5,
        name: "Amethyst",
        tagline: "Homie • Inner circle",
        minHours: 60,
        minSessions: 50,
        color: "var(--streaks-tier-amethyst, #A855F7)",
        glowColor: "var(--streaks-tier-amethyst-glow, rgba(168, 85, 247, 0.55))",
        iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l8 6v8l-8 6-8-6V8l8-6zm0 2.8L6 9.3v5.4l6 4.5 6-4.5V9.3L12 4.8zm0 2.7l4 3v3l-4 3-4-3v-3l4-3z"/></svg>`
    },
    {
        level: 6,
        name: "Ruby",
        tagline: "Kindred • Unbreakable synergy",
        minHours: 120,
        minSessions: 85,
        color: "var(--streaks-tier-ruby, #F23F43)",
        glowColor: "var(--streaks-tier-ruby-glow, rgba(242, 63, 67, 0.60))",
        iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`
    },
    {
        level: 7,
        name: "Chroma Diamond",
        tagline: "Veteran • Mythic tier legend",
        minHours: 200,
        minSessions: 150,
        color: "var(--streaks-tier-diamond, #00F0FF)",
        glowColor: "var(--streaks-tier-diamond-glow, rgba(0, 240, 255, 0.70))",
        iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L9 9l-8 3 8 3 3 8 3-8 8-3-8-3-3-8zm0 4.5l1.8 4.7 4.7 1.8-4.7 1.8L12 18.5l-1.8-4.7L5.5 12l4.7-1.8L12 5.5z"/></svg>`
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
