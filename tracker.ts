import {
    ChannelStore,
    FluxDispatcher,
    GuildStore,
    SelectedChannelStore,
    UserStore,
    VoiceStateStore
} from "@webpack/common";
import { recordDmInteraction, recordVoiceHeartbeat, recordVoiceSessionFinish } from "./storage";

const HEARTBEAT_INTERVAL_MS = 30000; // 30 seconds
const HEARTBEAT_SECONDS = 30;
const MIN_SESSION_FOR_INCREMENT = 60; // minimum 60s in VC to count as a distinct session

interface ActiveSessionData {
    startedAt: number;
    durationSeconds: number;
    guildName?: string;
    channelName?: string;
}

const activeVoiceUsers = new Map<string, ActiveSessionData>();
let heartbeatTimer: NodeJS.Timeout | null = null;
let isTracking = false;

function onHeartbeat() {
    try {
        const currentUserId = UserStore.getCurrentUser()?.id;
        const voiceChannelId = SelectedChannelStore.getVoiceChannelId();

        if (!currentUserId || !voiceChannelId) {
            // Not connected to voice, finalize any remaining sessions
            finalizeAllActiveVoiceSessions();
            return;
        }

        const channel = ChannelStore.getChannel(voiceChannelId);
        const guild = channel?.guild_id ? GuildStore.getGuild(channel.guild_id) : undefined;
        const guildName = guild?.name || (channel?.isDM?.() ? "Direct Voice" : "Voice Call");
        const channelName = channel?.name || "Voice";

        // Fetch all voice states for this channel
        const voiceStates: Record<string, { userId: string }> =
            VoiceStateStore.getVoiceStatesForChannel(voiceChannelId) || {};

        const currentActiveUserIds = new Set<string>();

        for (const [userId, state] of Object.entries(voiceStates)) {
            const uid = state.userId || userId;
            if (uid === currentUserId) continue;

            const user = UserStore.getUser(uid);
            if (user?.bot) continue;

            currentActiveUserIds.add(uid);

            let session = activeVoiceUsers.get(uid);
            if (!session) {
                session = {
                    startedAt: Date.now(),
                    durationSeconds: 0,
                    guildName,
                    channelName
                };
                activeVoiceUsers.set(uid, session);
            }

            session.durationSeconds += HEARTBEAT_SECONDS;
            recordVoiceHeartbeat(uid, HEARTBEAT_SECONDS, guildName, channelName, user?.username);
        }

        // Check if any users have left the channel
        for (const [uid, session] of activeVoiceUsers.entries()) {
            if (!currentActiveUserIds.has(uid)) {
                if (session.durationSeconds >= MIN_SESSION_FOR_INCREMENT) {
                    recordVoiceSessionFinish(uid);
                }
                activeVoiceUsers.delete(uid);
            }
        }
    } catch (err) {
        console.error("[Streaks] Error in voice heartbeat:", err);
    }
}

function finalizeAllActiveVoiceSessions() {
    for (const [uid, session] of activeVoiceUsers.entries()) {
        if (session.durationSeconds >= MIN_SESSION_FOR_INCREMENT) {
            recordVoiceSessionFinish(uid);
        }
    }
    activeVoiceUsers.clear();
}

function handleMessageCreate({ message }: { message: any }) {
    try {
        if (!message || !message.channel_id) return;

        const currentUserId = UserStore.getCurrentUser()?.id;
        if (!currentUserId) return;

        const channel = ChannelStore.getChannel(message.channel_id);
        if (!channel) return;

        // Channel types: 1 = DM, 3 = Group DM
        const isDm = channel.type === 1 || (channel.isDM && channel.isDM());
        if (!isDm) return;

        let targetId: string | null = null;
        let targetUsername: string | undefined;

        if (message.author?.id && message.author.id !== currentUserId) {
            targetId = message.author.id;
            targetUsername = message.author.username;
        } else {
            // Local user sent a message in DM, find recipient
            const recipientId = channel.getRecipientId ? channel.getRecipientId() : channel.recipients?.[0];
            if (recipientId && recipientId !== currentUserId) {
                targetId = recipientId;
                targetUsername = UserStore.getUser(recipientId)?.username;
            }
        }

        if (targetId) {
            recordDmInteraction(targetId, targetUsername);
        }
    } catch (err) {
        console.error("[Streaks] Error tracking DM message:", err);
    }
}

export function startTracking(): void {
    if (isTracking) return;
    isTracking = true;

    // Start Voice heartbeat interval
    heartbeatTimer = setInterval(onHeartbeat, HEARTBEAT_INTERVAL_MS);

    // Subscribe to Message Create
    FluxDispatcher.subscribe("MESSAGE_CREATE", handleMessageCreate);

    console.log("[Streaks] Interaction tracker started.");
}

export function stopTracking(): void {
    if (!isTracking) return;
    isTracking = false;

    if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
    }

    finalizeAllActiveVoiceSessions();
    FluxDispatcher.unsubscribe("MESSAGE_CREATE", handleMessageCreate);

    console.log("[Streaks] Interaction tracker stopped.");
}
