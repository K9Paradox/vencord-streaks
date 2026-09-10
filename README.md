# 🔥 Streaks (Vencord Plugin)

[![License: GPL-3.0](https://img.shields.io/badge/License-GPL3-blue.svg)](LICENSE)
[![Vencord Userplugin](https://img.shields.io/badge/Vencord-Userplugin-5865F2.svg)](https://vencord.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6.svg)](https://www.typescriptlang.org/)

> **Never wonder *"Wait, have we played together before?"* again.**

**Streaks** is a client-side Vencord plugin that tracks mutual interactions between you and other Discord users. Whether you share late-night gaming voice calls or exchange DMs, Streaks keeps a private, local ledger of your shared history, awards progressive familiarity badges, and celebrates active interaction streaks.

---

## ✨ Features

- 🎙️ **Voice Channel Time & Session Tracking**: Automatically monitors when you share a VC with someone across any Discord server or group call.
- 💬 **DM Recency & Volume**: Tracks direct message interaction counts and timestamps.
- 🏅 **Familiarity Tiers**: Progressively level up badges from **Acquaintance** to **Homie** and **Veteran** as you rack up hours and sessions together.
- 🔥 **Daily Streaks**: Displays active consecutive-day streaks (e.g. `🔥 7 days`) when you interact day after day.
- 🕒 **"Last Interacted" History**: Instant context in user popouts: *"Last in VC 3 days ago in [Gaming Discord]"*.
- 📊 **Tier Progress Bar**: Visual progress indicator showing how close you are to unlocking the next familiarity tier.
- 🔒 **100% Client-Side & Private**: All data is saved exclusively on your own machine using Vencord's local storage (`DataStore` / IndexedDB). Nothing is ever sent to an external server or shared with other users.

---

## 🎖️ Familiarity Tiers

| Level | Badge | Title | Criteria | Glow Color |
|:---:|:---:|:---|:---|:---|
| **0** | ⚪ | **First Contact** | Just met / first encounter | Gray |
| **1** | 🥉 | **Acquaintance** | 15+ minutes in VC or 2+ sessions | Bronze (`#CD7F32`) |
| **2** | 🥈 | **Familiar** | 2+ hours in VC or 5+ sessions | Silver (`#B0C4DE`) |
| **3** | 🥇 | **Regular** | 10+ hours in VC or 15+ sessions | Gold (`#FEE75C`) |
| **4** | 🟢 | **Duo** | 30+ hours in VC or 30+ sessions | Emerald (`#57F287`) |
| **5** | 💖 | **Homie** | 75+ hours in VC or 60+ sessions | Pink (`#EB459E`) |
| **6** | 👑 | **Veteran** | 150+ hours in VC or 100+ sessions | Blurple (`#5865F2`) |

---

## 🖼️ User Popout Preview

When you click any user's profile, a card is seamlessly injected with their interaction stats:

```
┌─────────────────────────────────────────────────────────┐
│  [👑] Veteran                   🔥 14 days              │
│      Unbreakable bond                                   │
│                                                         │
│  Progress to Next Tier: Max Level (100%)                │
│  [====================================================] │
│                                                         │
│  ┌────────────────────────┐  ┌────────────────────────┐ │
│  │ 🎙️ VOICE TOGETHER       │  │ 💬 DMS EXCHANGED       │ │
│  │ 184h 12m               │  │ 1,420                  │ │
│  │ 86 sessions            │  │ Last: 2 hours ago      │ │
│  └────────────────────────┘  └────────────────────────┘ │
│                                                         │
│  🕒 Last seen: 2 hours ago in Valorant 5-Stack          │
│  First met on Nov 14, 2023                              │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Installation (Vencord Userplugin)

### Prerequisites
* A working git install of [Vencord](https://github.com/Vendicated/Vencord).

### Step 1: Clone into userplugins
Navigate to your local Vencord repository and clone this repo into `src/userplugins/streaks`:

```bash
cd Vencord/src/userplugins
git clone https://github.com/K9Paradox/vencord-streaks.git streaks
```

### Step 2: Build Vencord
From your main Vencord root folder:

```bash
pnpm build
```

*(or run `pnpm build --watch` for active development).*

### Step 3: Enable in Settings
1. Open Discord.
2. Go to **User Settings** -> **Vencord** -> **Plugins**.
3. Search for **Streaks** and toggle it **ON**.
4. Enjoy!

---

## ⚙️ Settings & Customization

Inside Discord Settings under the Streaks plugin configuration, you can toggle:
* **Track Voice**: Enable/disable automatic VC time tracking.
* **Track DMs**: Enable/disable logging DM message counts.
* **Show in Popout**: Toggle the interaction history card in user popouts.
* **Show Badge in Header**: Toggle the compact badge pill next to usernames.
* **Min Session Duration**: Filter out fast accidental channel hops (default: 60s).

---

## 🛠️ DevTools / Console Utilities

For debugging or data inspection, Streaks exposes a global tracker object in Discord's developer console (`Ctrl + Shift + I`):

```js
// View your interaction record with a specific user
StreaksTracker.getRecord("USER_ID_HERE");

// View all stored interaction records
StreaksTracker.getAllRecords();

// Clear interaction history for a specific user
StreaksTracker.clearUserRecord("USER_ID_HERE");

// Wipe all interaction records
StreaksTracker.clearAllRecords();
```

---

## 📜 License

Licensed under the [GNU General Public License v3.0](LICENSE).
