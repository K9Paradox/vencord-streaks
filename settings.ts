import { definePluginSettings } from "@api/Settings";
import { OptionType } from "@utils/types";

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
