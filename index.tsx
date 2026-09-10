import { addMemberListDecorator, removeMemberListDecorator } from "@api/MemberListDecorators";
import { definePluginSettings } from "@api/Settings";
import ErrorBoundary from "@components/ErrorBoundary";
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
    showInMemberList: {
        type: OptionType.BOOLEAN,
        description: "Show mini streak badge in Member List and DM sidebar",
        default: true
    },
    minSessionDurationSeconds: {
        type: OptionType.NUMBER,
        description: "Minimum seconds in VC together to count as a session",
        default: 60
    }
});

const renderProfileComponent = ErrorBoundary.wrap(
    ({ user }: { user?: { id: string }; isSideBar?: boolean }) => {
        if (!settings.store.showInPopout || !user?.id) return null;
        return <StreakCard userId={user.id} />;
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
    dependencies: ["MemberListDecoratorsAPI"],
    settings,

    patches: [
        {
            // DM profile sidebar
            find: ".SIDEBAR,disableToolbar:",
            replacement: {
                match: /user:(\i),widgets:.{0,100}?\}\),(?=.{0,100}unownedWishlistItems:\i,wishlistId:\i)/,
                replace: "$&$self.renderProfileComponent({user:$1,isSideBar:true}),"
            }
        },
        {
            // User popout (matches module 727584)
            find: '"UserProfilePopout");',
            replacement: {
                match: /user:(\i),widgets:.{0,100}?\}\),/,
                replace: "$&$self.renderProfileComponent({user:$1}),"
            }
        }
    ],

    renderProfileComponent,

    async start() {
        await initStorage();
        if (settings.store.trackVoice || settings.store.trackDms) {
            startTracking();
        }

        if (settings.store.showInMemberList) {
            addMemberListDecorator("Streaks", ({ user }) => {
                if (!user || user.bot) return null;
                return <StreakBadge userId={user.id} />;
            });
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
        removeMemberListDecorator("Streaks");
        delete (window as any).StreaksTracker;
    }
});
