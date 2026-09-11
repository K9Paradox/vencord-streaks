import * as DataStore from "@api/DataStore";
import { settings } from "./settings";
import { InteractionRecord, InteractionType } from "./types";

const STORAGE_KEY = "Streaks_UserData";
let cache: Record<string, InteractionRecord> = {};
let isLoaded = false;

export async function initStorage(): Promise<void> {
    if (isLoaded) return;
    try {
        const stored = await DataStore.get<Record<string, InteractionRecord>>(STORAGE_KEY);
        if (stored && typeof stored === "object") {
            cache = stored;
        }
    } catch (err) {
        console.error("[Streaks] Failed to load records from DataStore:", err);
    }
    isLoaded = true;
}

let saveTimeout: any = null;
export function saveStorage(): void {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
        try {
            await DataStore.set(STORAGE_KEY, cache);
        } catch (err) {
            console.error("[Streaks] Failed to persist records to DataStore:", err);
        }
    }, 1000);
}

export function createSpoofedRecord(userId: string, tier = "Gold"): InteractionRecord {
    const now = Date.now();
    const presets: Record<string, { voiceHours: number; sessions: number; dms: number; streak: number; longest: number }> = {
        Bronze: { voiceHours: 0.3, sessions: 3, dms: 12, streak: 3, longest: 3 },
        Silver: { voiceHours: 3.2, sessions: 7, dms: 45, streak: 6, longest: 8 },
        Gold: { voiceHours: 14.5, sessions: 19, dms: 180, streak: 15, longest: 20 },
        Emerald: { voiceHours: 42.0, sessions: 38, dms: 450, streak: 35, longest: 40 },
        Amethyst: { voiceHours: 95.0, sessions: 72, dms: 920, streak: 68, longest: 75 },
        Ruby: { voiceHours: 180.0, sessions: 130, dms: 2100, streak: 110, longest: 110 },
        Diamond: { voiceHours: 380.0, sessions: 250, dms: 5000, streak: 365, longest: 365 }
    };

    const p = presets[tier] || presets.Gold;
    const voiceSeconds = Math.round(p.voiceHours * 3600);

    // Build 28-day sample punchcard activity log
    const activityLog: Record<string, { voiceSeconds: number; dmCount: number }> = {};
    for (let i = 0; i < 28; i++) {
        const d = new Date(now - i * 86400000).toISOString().split("T")[0];
        if (i % 2 === 0 || i % 3 === 0) {
            activityLog[d] = {
                voiceSeconds: Math.floor(Math.random() * 3600) + 900,
                dmCount: Math.floor(Math.random() * 20) + 2
            };
        }
    }

    return {
        _isSpoofed: true,
        userId,
        username: "Spoofed User",
        firstSeen: now - 60 * 86400000,
        lastSeen: now,
        lastInteractionType: "voice",
        voice: {
            totalSeconds: voiceSeconds,
            sessionsCount: p.sessions,
            lastSessionDate: now - 1800000,
            lastGuildName: "Gaming Lounge",
            lastChannelName: "Duo Queue"
        },
        dms: {
            totalMessages: p.dms,
            lastDmDate: now - 3600000
        },
        streak: {
            current: p.streak,
            longest: p.longest,
            lastActiveDate: new Date().toISOString().split("T")[0]
        },
        activityLog
    };
}

export function spoofUser(userId: string, tier = "Gold"): InteractionRecord {
    initStorage();
    const mock = createSpoofedRecord(userId, tier);
    cache[userId] = mock;
    saveStorage();
    return mock;
}

export function getRecord(userId: string): InteractionRecord | undefined {
    initStorage();
    if (cache[userId]) return cache[userId];

    try {
        if (settings.store?.devTestingMode) {
            const tier = settings.store?.devTestingTier || "Gold";
            return createSpoofedRecord(userId, tier);
        }
    } catch {}

    return undefined;
}

export function getAllRecords(): Record<string, InteractionRecord> {
    initStorage();
    return cache;
}

export function getOrCreateRecord(userId: string, username?: string): InteractionRecord {
    initStorage();
    if (!cache[userId]) {
        const now = Date.now();
        cache[userId] = {
            userId,
            username,
            firstSeen: now,
            lastSeen: now,
            lastInteractionType: "voice",
            voice: {
                totalSeconds: 0,
                sessionsCount: 0,
                lastSessionDate: 0
            },
            dms: {
                totalMessages: 0,
                lastDmDate: 0
            },
            streak: {
                current: 0,
                longest: 0,
                lastActiveDate: ""
            }
        };
    } else if (username && !cache[userId].username) {
        cache[userId].username = username;
    }
    return cache[userId];
}

export function touchStreak(record: InteractionRecord): void {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    if (record.streak.lastActiveDate === today) {
        // Already logged activity today, maintain current streak
        return;
    }

    if (record.streak.lastActiveDate === yesterday) {
        // Consecutive day
        record.streak.current += 1;
    } else {
        // Broken streak or first time
        record.streak.current = 1;
    }

    if (record.streak.current > record.streak.longest) {
        record.streak.longest = record.streak.current;
    }
    record.streak.lastActiveDate = today;
}

function logDailyActivity(record: InteractionRecord, voiceSeconds = 0, dmCount = 0): void {
    if (!record.activityLog) record.activityLog = {};
    const today = new Date().toISOString().split("T")[0];
    if (!record.activityLog[today]) {
        record.activityLog[today] = { voiceSeconds: 0, dmCount: 0 };
    }
    record.activityLog[today].voiceSeconds += voiceSeconds;
    record.activityLog[today].dmCount += dmCount;

    // Keep storage ultra-light: prune entries older than 35 days
    const keys = Object.keys(record.activityLog);
    if (keys.length > 35) {
        keys.sort();
        while (keys.length > 30) {
            const oldKey = keys.shift();
            if (oldKey) delete record.activityLog[oldKey];
        }
    }
}

export function recordVoiceHeartbeat(
    userId: string,
    secondsDelta: number,
    guildName?: string,
    channelName?: string,
    username?: string
): InteractionRecord {
    const record = getOrCreateRecord(userId, username);
    const now = Date.now();

    record.lastSeen = now;
    record.lastInteractionType = "voice";
    record.voice.totalSeconds += secondsDelta;
    record.voice.lastSessionDate = now;

    if (guildName) record.voice.lastGuildName = guildName;
    if (channelName) record.voice.lastChannelName = channelName;

    logDailyActivity(record, secondsDelta, 0);
    touchStreak(record);
    saveStorage();
    return record;
}

export function recordVoiceSessionFinish(userId: string): void {
    const record = getRecord(userId);
    if (!record) return;

    record.voice.sessionsCount += 1;
    saveStorage();
}

export function recordDmInteraction(userId: string, username?: string): InteractionRecord {
    const record = getOrCreateRecord(userId, username);
    const now = Date.now();

    record.lastSeen = now;
    record.lastInteractionType = "dm";
    record.dms.totalMessages += 1;
    record.dms.lastDmDate = now;

    logDailyActivity(record, 0, 1);
    touchStreak(record);
    saveStorage();
    return record;
}

export function clearUserRecord(userId: string): void {
    initStorage();
    delete cache[userId];
    saveStorage();
}

export async function clearAllRecords(): Promise<void> {
    cache = {};
    if (saveTimeout) clearTimeout(saveTimeout);
    try {
        await DataStore.set(STORAGE_KEY, {});
        console.log("[Streaks] Database cleared successfully.");
    } catch (e) {
        console.error("[Streaks] Failed to clear DataStore:", e);
    }
}
