import { definePluginSettings } from "@api/Settings";
import definePlugin, { OptionType } from "@utils/types";
import { React } from "@webpack/common";
import { calculateFamiliarity } from "./badges";
import { StreakBadge } from "./components/StreakBadge";
import { StreakCard } from "./components/StreakCard";
import { clearAllRecords, clearUserRecord, getAllRecords, getRecord, initStorage } from "./storage";
import { startTracking, stopTracking } from "./tracker";
import "./styles.css";

export const settings = definePluginSettings({
    trackVoice: {
        type: OptionType.BOOLEAN,
        description: "Track time spent together in voice channels",
        default: true
    },
    trackDms: {
        type: OptionType.BOOLEAN,
        description: "Track direct messages exchanged",
        default: true
    },
    showInPopout: {
        type: OptionType.BOOLEAN,
        description: "Show interaction streak and familiarity card in User Popout",
        default: true
    },
    showBadgeInHeader: {
        type: OptionType.BOOLEAN,
        description: "Show compact familiarity badge next to the username / badges",
        default: true
    },
    minSessionDurationSeconds: {
        type: OptionType.NUMBER,
        description: "Minimum seconds in VC together to count as a session",
        default: 60
    }
});

export default definePlugin({
    name: "Streaks",
    description: "Tracks mutual voice channel sessions, DMs, familiarity badges, and interaction streaks.",
    authors: [
        {
            name: "K9Paradox",
            id: 5059395n
        }
    ],
    settings,

    patches: [
        // Patch User Popout to inject the interaction streaks card
        {
            find: 'userPopout:',
            replacement: [
                {
                    match: /(children:\[)([\s\S]*?)(renderActivity\(\))/m,
                    replace: "$1$self.renderStreaksCard(arguments[0]?.user),$2$3"
                }
            ]
        },
        // Fallback / alternate patch for user profile bio / body section
        {
            find: '.userProfileModal',
            replacement: [
                {
                    match: /(children:\[)([\s\S]*?)(customStatus:)/m,
                    replace: "$1$self.renderStreaksBadge(arguments[0]?.user),$2$3"
                }
            ]
        }
    ],

    renderStreaksCard(user: any) {
        if (!settings.store.showInPopout || !user?.id) return null;
        return <StreakCard userId={user.id} />;
    },

    renderStreaksBadge(user: any) {
        if (!settings.store.showBadgeInHeader || !user?.id) return null;
        return <StreakBadge userId={user.id} />;
    },

    start() {
        initStorage();
        if (settings.store.trackVoice || settings.store.trackDms) {
            startTracking();
        }

        // Attach debug/helper utilities to window for easy access in DevTools console
        (window as any).StreaksTracker = {
            getRecord,
            getAllRecords,
            clearUserRecord,
            clearAllRecords,
            calculateFamiliarity
        };
    },

    stop() {
        stopTracking();
        delete (window as any).StreaksTracker;
    }
});
