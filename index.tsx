import ErrorBoundary from "@components/ErrorBoundary";
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
    minSessionDurationSeconds: {
        type: OptionType.NUMBER,
        description: "Minimum seconds in VC together to count as a session",
        default: 60
    }
});

const profilePopoutComponent = ErrorBoundary.wrap(
    (props: { user?: { id: string }; }) => {
        if (!settings.store.showInPopout || !props?.user?.id) return null;
        return <StreakCard userId={props.user.id} />;
    },
    { noop: true }
);

export default definePlugin({
    name: "Streaks",
    description: "Tracks mutual voice channel sessions, DMs, familiarity badges, and interaction streaks.",
    tags: ["Utility", "Friends", "Voice"],
    authors: [
        {
            name: "TheK9.",
            id: 153303492981686274n
        }
    ],
    settings,

    patches: [
        {
            // Standard Vencord UserProfilePopout injection (matching ReviewDB / ShowConnections)
            find: '"UserProfilePopout");',
            replacement: {
                match: /userId:\i\.id,guild:\i\}\)(?=])/,
                replace: "$&,$self.profilePopoutComponent(arguments[0])"
            }
        }
    ],

    profilePopoutComponent,

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
