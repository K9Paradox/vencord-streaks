import { addMemberListDecorator, removeMemberListDecorator } from "@api/MemberListDecorators";
import ErrorBoundary from "@components/ErrorBoundary";
import definePlugin from "@utils/types";
import { React } from "@webpack/common";
import { calculateFamiliarity } from "./badges";
import { StreakBadge } from "./components/StreakBadge";
import { StreakCard } from "./components/StreakCard";
import { settings } from "./settings";
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

export { settings };

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
    ({ user }: { user?: { id: string } }) => {
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
                match: /(user:(\i).{0,100}onClickDisplayName:\i,trailing:)(\[[^\]]+\]|\i)/,
                replace: "$1[$self.renderHeaderBadge($2?.id),$3]"
            },
            predicate: () => settings.store.showInProfileModal
        },
        {
            // Full Profile Modal Tab (Legacy / standard modal): adds dedicated "Streaks" tab
            find: ".BOT_DATA_ACCESS?(",
            replacement: [
                {
                    match: /(?<=initialSection:\i=\i\.\i\.USER_INFO,onClose:\i\}=)([^,);]+)/,
                    replace: "$self.getProfileModalProps($1)"
                },
                {
                    match: /\(0,\i\.jsx\)\(\i,\{items:\i,section:(\i)/,
                    replace: "$1==='STREAKS'?$self.renderProfileModalTab({...arguments[0],isLegacy:true}):$&"
                },
                {
                    match: /className:\i\.\i(?=,type:"top")/,
                    replace: '$& + " vc-streaks-modal-tab-bar"'
                }
            ],
            predicate: () => settings.store.showInProfileModal
        },
        {
            // Full Profile Modal Tab: adds dedicated "Streaks" tab to modal v2
            find: ".WIDGETS?",
            replacement: [
                {
                    match: /(?<=items:\i,initialSection:\i,onClose:\i\}=)([^,);]+)/,
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
                    match: /(user:(\i)[\s\S]+?#{intl::GUEST_NAME_SUFFIX}.{0,50}?"")(\])/,
                    replace: "$1,$self.renderVoiceBadge($2?.id)$3"
                }
            ],
            predicate: () => settings.store.showInVoiceChannel
        }
    ],

    renderProfileComponent,
    renderHeaderBadge,
    renderVoiceBadge,
    renderProfileModalTab,

    getProfileModalProps(props: any) {
        try {
            if (!props?.user?.id || props.user.bot) return props;
            const section = { text: "Streaks", section: "STREAKS" };
            const items = [...(props.items || [])];
            if (!items.some((item: any) => item?.section === "STREAKS")) {
                items.splice(1, 0, section);
            }
            return { ...props, items };
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
                return <StreakBadge userId={user.id} variant="memberList" />;
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
