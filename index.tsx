import { addMemberListDecorator, removeMemberListDecorator } from "@api/MemberListDecorators";
import { definePluginSettings } from "@api/Settings";
import ErrorBoundary from "@components/ErrorBoundary";
import definePlugin, { OptionType } from "@utils/types";
import { React } from "@webpack/common";
import { calculateFamiliarity } from "./badges";
import { StreakBadge } from "./components/StreakBadge";
import { StreakCard } from "./components/StreakCard";
import {
    clearAllRecords,
    clearUserRecord,
    createSpoofedRecord,
    getAllRecords,
    getRecord,
    initStorage,
    spoofUser
} from "./storage";
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
    showInProfileModal: {
        type: OptionType.BOOLEAN,
        description: "Show Streaks tab and header badge in Full Profile Modal",
        default: true
    },
    showInVoiceChannel: {
        type: OptionType.BOOLEAN,
        description: "Show streak icon next to usernames in Voice Channels",
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
    },
    devTestingMode: {
        type: OptionType.BOOLEAN,
        description: "🛠️ [DEV TESTING] Spoof interaction data for unrecorded users to test UI",
        default: false
    },
    devTestingTier: {
        type: OptionType.SELECT,
        description: "🛠️ [DEV TESTING] Default tier for spoofed users",
        options: [
            { label: "Bronze (Spark)", value: "Bronze" },
            { label: "Silver (Familiar)", value: "Silver" },
            { label: "Gold (Regular)", value: "Gold", default: true },
            { label: "Emerald (Companion)", value: "Emerald" },
            { label: "Amethyst (Confidant)", value: "Amethyst" },
            { label: "Ruby (Kinship)", value: "Ruby" },
            { label: "Diamond (Eternal)", value: "Diamond" }
        ]
    }
});

const renderProfileComponent = ErrorBoundary.wrap(
    ({ user }: { user?: { id: string }; isSideBar?: boolean }) => {
        if (!settings.store.showInPopout || !user?.id) return null;
        return <StreakCard userId={user.id} />;
    },
    { noop: true }
);

const renderHeaderBadge = ErrorBoundary.wrap(
    (userId?: string) => {
        if (!userId || !settings.store.showInProfileModal) return null;
        return <StreakBadge userId={userId} variant="header" />;
    },
    { noop: true }
);

const renderVoiceBadge = ErrorBoundary.wrap(
    (userId?: string) => {
        if (!userId || !settings.store.showInVoiceChannel) return null;
        return <StreakBadge userId={userId} variant="voice" />;
    },
    { noop: true }
);

const renderProfileModalTab = ErrorBoundary.wrap(
    ({ user }: { user: { id: string } }) => {
        if (!user?.id) return null;
        return (
            <div className="vc-streaks-modal-tab-content">
                <StreakCard userId={user.id} defaultExpanded={true} />
            </div>
        );
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
        },
        {
            // Full Profile Modal & Popout Header: places badge next to display name & pronouns
            find: "#{intl::USER_PROFILE_PRONOUNS}",
            replacement: {
                match: /(user:(\i).{0,100}onClickDisplayName:\i,trailing:)(\i)/,
                replace: "$1[$self.renderHeaderBadge($2?.id),$3]"
            },
            predicate: () => settings.store.showInProfileModal
        },
        {
            // Full Profile Modal Tab: adds dedicated "Streaks" tab to modal v2
            find: ".WIDGETS?",
            replacement: [
                {
                    match: /(?<=items:\i,initialSection:\i,onClose:\i\}=)(\i)/,
                    replace: "$self.getProfileModalProps($1)"
                },
                {
                    match: /children:(?=.{0,100}?component:.+?section:(\i))/,
                    replace: "$&$1.section==='STREAKS'?$self.renderProfileModalTab(arguments[0]):"
                },
                {
                    match: /type:"top",/,
                    replace: '$&className:"vc-streaks-modal-v2-tab-bar",'
                }
            ],
            predicate: () => settings.store.showInProfileModal
        },
        {
            // Voice Channel Users: adds compact flame/tier icon to username in VC
            find: "#{intl::GUEST_NAME_SUFFIX})]",
            replacement: [
                {
                    match: /(#{intl::GUEST_NAME_SUFFIX}.{0,50}?)""\](?<=guildId:(\i),.+?user:(\i).+?)/,
                    replace: '$1"",$self.renderVoiceBadge($3?.id)]'
                }
            ],
            predicate: () => settings.store.showInVoiceChannel
        }
    ],

    renderProfileComponent,
    renderHeaderBadge,
    renderVoiceBadge,
    renderProfileModalTab,

    getProfileModalProps(props: { user?: { id: string; bot?: boolean }; items: any[] }) {
        try {
            if (!props?.user?.id || props.user.bot) return props;
            const section = { text: "Streaks", section: "STREAKS" };
            return { ...props, items: [...props.items, section] };
        } catch (e) {
            console.error("[Streaks] Failed to append profile tab:", e);
        }
        return props;
    },

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
            calculateFamiliarity,
            spoofUser,
            createSpoofedRecord,
            cycleDevTier: (userId: string) => {
                const rec = getRecord(userId);
                const { currentTier } = calculateFamiliarity(rec);
                const tiers = ["Bronze", "Silver", "Gold", "Emerald", "Amethyst", "Ruby", "Diamond"];
                const nextTier = tiers[(tiers.indexOf(currentTier.name) + 1) % tiers.length];
                return spoofUser(userId, nextTier);
            }
        };
    },

    stop() {
        stopTracking();
        removeMemberListDecorator("Streaks");
        delete (window as any).StreaksTracker;
    }
});
