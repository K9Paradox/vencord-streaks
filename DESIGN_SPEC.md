# 🎨 Streaks Plugin — Visual Identity, Micro-Interactions & UX Specification

Comprehensive design system, UI architecture, and micro-interaction specifications for the **Vencord Streaks** plugin. Built to blend indistinguishably into Discord's native Dark & Midnight themes while providing dopamine-rich tactile feedback.

---

## 1. Visual Hierarchy & Popout Design System

### 1.1 Discord-Native Aesthetic & Color Tokens
The Streaks components hook directly into Discord's CSS variables and Midnight palette (`#111214`), adding subtle translucent surfaces, frosted glass backdrops, and chromatic accent rims.

```css
:root {
  /* Surface Tokens */
  --vc-streaks-surface-base: var(--background-secondary, #2b2d31);
  --vc-streaks-surface-subtle: var(--background-secondary-alt, #1e1f22);
  --vc-streaks-surface-floating: var(--background-floating, #111214);
  --vc-streaks-border-subtle: rgba(255, 255, 255, 0.06);
  --vc-streaks-border-highlight: rgba(255, 255, 255, 0.14);

  /* Typography */
  --vc-streaks-font-family: var(--font-primary, "gg sans", "Noto Sans", "Helvetica Neue", sans-serif);
  --vc-streaks-font-mono: var(--font-code, "Consolas", "Courier New", monospace);

  /* Elevation & Glows */
  --vc-streaks-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.24);
  --vc-streaks-shadow-glow: 0 0 16px -2px var(--tier-glow-color, rgba(88, 101, 242, 0.4));
}
```

### 1.2 Component Modes: Compact vs. Detailed Expanded

#### A. Compact Mode (Default for Small Popouts & Quick Glance)
- **Dimensions**: Single integrated strip (height: 38px) tucked above the User Profile Bio.
- **Visual Flow**:
  `[ Tier Icon + Tier Name ] ── [ Mini Progress Notch ] ── [ 🔥 Streak Pill ] ── [ Expand Button ▾ ]`
- **Interactions**:
  - Hovering over the streak pill displays a rich tooltip showing longest streak & hours till expiration.
  - Clicking the expand toggle unfolds the full card with a smooth height spring animation.

#### B. Detailed Expanded Mode (Deep Dive Telemetry Hub)
- **Top Row**: Prominent Badge Heraldry, Tier Title, Level Subtitle, and Animated Streak Flame.
- **Mid Row (Familiarity XP Gauge)**: Dual-track progress bar (evaluates Voice Hours vs. VC Sessions), showing next tier preview with XP-style percentage.
- **Telemetry Grid (2x2 or 2x1)**:
  - 🎙️ **Voice Together**: Total hours with tabular numbers + session count + average call length.
  - 💬 **DMs Exchanged**: Message volume + recency status.
- **Activity Punchcard**: 7-day or 28-day contribution matrix showing day-by-day interaction intensity.
- **Provenance Footer**: "First met on [Date]" + "Last shared voice session in [Guild Channel] ([Time Ago])".

---

## 2. Activity Heatmap & Punchcard UX

### 2.1 7-Day Micro-Sparkline & 28-Day Punchcard Grid
To visualize mutual momentum without cluttering Discord's user popout, Streaks provides two swappable activity visualizations:

1. **7-Day Day-Pill Strip (Minimalist Default)**:
   Seven vertical rounded capsules representing Monday through Sunday (or rolling 7 days).
   - Empty day: Dim gray outline (`rgba(255, 255, 255, 0.08)`).
   - Low activity (<30m VC or <10 DMs): Level 1 Tier tint (`30%` opacity).
   - Medium activity (30m-2h VC or 10-50 DMs): Level 2 Tier tint (`65%` opacity).
   - High activity (>2h VC or >50 DMs): Full solid glow (`100%` saturation + subtle drop-shadow).

2. **28-Day Punchcard (GitHub-style 4x7 matrix)**:
   A miniature 4-week grid of 8x8px rounded squares with 3px gaps.
   - Hovering any cell reveals a native Discord tooltip:
     `"Thu, Sep 8 • 3h 14m in VC (Gaming Den), 42 DMs"`

### 2.2 Storage Schema for Daily Punchcards
To preserve lightweight client storage, daily activity is recorded in a rolling 30-day map:

```typescript
export interface DailyActivity {
  voiceSeconds: number;
  dmCount: number;
}

// In InteractionRecord:
export interface InteractionRecord {
  // ... existing fields ...
  activityLog?: Record<string, DailyActivity>; // Key: "YYYY-MM-DD"
}
```

---

## 3. The 7 Tier Badges & Flame FX

### 3.1 Tier Aesthetic Palette & Lore

| Tier | Name | Icon Motif | Base Color | Glow Hex | Lore Tagline |
|:---:|:---|:---|:---:|:---:|:---|
| **1** | **Bronze** (Acquaintance) | Shield with forged bronze rivets | `#CD7F32` | `rgba(205, 127, 50, 0.45)` | *"Paths crossed in voice"* |
| **2** | **Silver** (Familiar) | Polished winged crest with frosted accents | `#B0C4DE` | `rgba(176, 196, 222, 0.50)` | *"A frequent presence"* |
| **3** | **Gold** (Regular) | Sunburst crowned chalice / radiant emblem | `#FEE75C` | `rgba(254, 231, 92, 0.55)` | *"Solid party member"* |
| **4** | **Emerald** (Duo) | Luminescent faceted gem with energy tendrils | `#57F287` | `rgba(87, 242, 135, 0.55)` | *"Reliable co-op partner"* |
| **5** | **Amethyst** (Homie) | Crystalline prism with violet aura | `#A855F7` | `rgba(168, 85, 247, 0.60)` | *"Inner circle confidant"* |
| **6** | **Ruby** (Kindred) | Smoldering heart-ruby with molten flares | `#F23F43` | `rgba(242, 63, 67, 0.65)` | *"Unshakable resonance"* |
| **7** | **Chroma** (Veteran) | Mythic celestial star with dynamic iridescent gradient | Dynamic Rainbow | `rgba(88, 101, 242, 0.70)` | *"Legendary bond"* |

### 3.2 Flame Evolution by Streak Days
- **Sparks (1–3 Days)**: Gentle orange flame emoji / vector with soft breathing pulse.
- **Blaze (4–9 Days)**: Radiant golden-orange fire with rising heat shimmer CSS animation.
- **Inferno (10–29 Days)**: Violet-blue hyper-flame with dynamic rim-light and crackle scale micro-pops.
- **Solar Nova (30+ Days)**: Chromatic flame surrounded by CSS orbital floating particle sparks.

---

## 4. Celebration & Milestone Micro-Interactions

### 4.1 In-App Level-Up Banner & Toast
When an active voice session or incoming message pushes you past a tier boundary:
1. **Toast Notification**: A sleek Discord-style glass toast slides into the bottom right corner:
   - Displays animated badge icon transitioning from old tier to new tier.
   - Text: *"Familiarity Level Up! You and @Friend reached Duo (Tier 4)!"*
   - Auto-dismisses in 5 seconds or on click.
2. **Profile Card "First Reveal" Animation**:
   If you open a friend's popout after a recent milestone unlock, the badge plays a 1.2s "shatter-and-reveal" aura shine before settling into its idle state.

### 4.2 Web Audio API Synthesized Chime (Zero External Asset Dependency)
Instead of bundling large `.mp3` or `.wav` files that can fail to load or get blocked by CORS, Streaks utilizes native `AudioContext` to synthesize a delightful, soft retro-futuristic chime:
- Notes: Pentatonic ascending sequence (e.g. `C5` -> `E5` -> `G5` -> `C6`).
- Waveform: Soft sine wave with a warm low-pass filter and exponential decay.
- Respects system volume and an optional toggle in Vencord settings: `playSoundOnLevelUp`.

---

## 5. Implementation Code Recipes

See accompanying components and styles in the repository:
- `components/StreakPunchcard.tsx`
- `components/StreakFlame.tsx`
- `components/StreakCelebrationToast.tsx`
- `badges.ts` (Tier updates)
- `styles.css` (Glassmorphism, animations, keyframes)
