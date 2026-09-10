import { InteractionRecord, InteractionType } from "./types";

const STORAGE_KEY = "Streaks_UserData";
let cache: Record<string, InteractionRecord> = {};
let isLoaded = false;

// Safe accessor for Vencord DataStore or browser localStorage
function getDataStore() {
    try {
        // @ts-ignore
        if (typeof Vencord !== "undefined" && Vencord.Plugins?.plugins?.Streaks) {
            // @ts-ignore
            return Vencord.DataStore;
        }
    } catch {}
    return null;
}

export function initStorage(): void {
    if (isLoaded) return;
    try {
        const ds = getDataStore();
        if (ds && typeof ds.get === "function") {
            const stored = ds.get(STORAGE_KEY);
            if (stored && typeof stored === "object") {
                cache = stored;
                isLoaded = true;
                return;
            }
        }

        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            cache = JSON.parse(raw);
        }
    } catch (err) {
        console.error("[Streaks] Failed to load records from storage:", err);
        cache = {};
    }
    isLoaded = true;
}

let saveTimeout: NodeJS.Timeout | null = null;
export function saveStorage(): void {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        try {
            const ds = getDataStore();
            if (ds && typeof ds.set === "function") {
                ds.set(STORAGE_KEY, cache);
            } else {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
            }
        } catch (err) {
            console.error("[Streaks] Failed to persist records to storage:", err);
        }
    }, 1000);
}

export function getRecord(userId: string): InteractionRecord | undefined {
    initStorage();
    return cache[userId];
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

    touchStreak(record);
    saveStorage();
    return record;
}

export function clearUserRecord(userId: string): void {
    initStorage();
    delete cache[userId];
    saveStorage();
}

export function clearAllRecords(): void {
    cache = {};
    saveStorage();
}
