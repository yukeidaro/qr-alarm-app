# Design System Document: QRバーコードアラーム

## 1. Overview & Creative North Star: "The Midnight Chronometer"
The creative direction for this system is **"The Midnight Chronometer."** This vision moves beyond simple utility to treat the smartphone screen as a high-end, physical bedside object—inspired by the functional purism of Dieter Rams and the tactile minimalism of Muji. 

To break the "standard app" feel, we rely on **Extreme Typographic Contrast** and **Atmospheric Negative Space**. We reject the "boxed" layout of traditional apps. Instead, elements float in a deep matte void, organized by a strict mathematical grid that feels intentional and architectural. The interface should feel silent, warm, and premium, reducing cognitive load for a user who is either falling asleep or waking up.

---

### 2. Colors: Tonal Depth & The "No-Line" Rule
The palette is rooted in deep shadows and warm, incandescent highlights. We avoid digital "pure" colors in favor of organic, analog-inspired tones.

*   **Primary Background (`surface-dim` / `#0A0A0A`):** A true matte black. This is the canvas.
*   **The "No-Line" Rule:** 1px solid borders are strictly prohibited for sectioning. Structural division must be achieved through:
    *   **Background Shifts:** Use `surface-container-low` (#1C1B1B) to define a card area against the `surface` (#131313) background.
    *   **Negative Space:** Use the `spacing-8` (2.75rem) or `spacing-10` (3.5rem) tokens to create a "void" that acts as a natural separator.
*   **Surface Hierarchy & Nesting:** 
    *   Base Layer: `surface-container-lowest` (#0E0E0E)
    *   Interactive Cards: `surface-container` (#201F1F)
    *   Raised Modals/Pop-ups: `surface-container-high` (#2A2A2A)
*   **The Amber Glow (`primary` / `#D4A574`):** This is your only interactive signifier. Use it sparingly for active toggles, selected states, and "Start" actions. It represents the glow of a physical filaments lamp.

---

### 3. Typography: Editorial Sophistication
Typography is the primary design element. The hierarchy relies on extreme weight variance rather than color.

*   **Display (The Hero Time):** Use `display-lg` with an ultra-thin weight (100-200). In Japanese (Inter/Plus Jakarta Sans), this creates a hairline-fine elegance that feels like a luxury watch face.
*   **Headlines & Titles:** Use `headline-sm` for Japanese section headers (e.g., アラーム設定). Keep the tracking tight and the weight at `light (300)`.
*   **Body & Labels:** Use `body-md` for secondary information in `secondary` (#6B6560).
*   **Japanese Typesetting:** Ensure a `line-height` of 1.6–1.8 for all body text to maintain the "Muji" breathing room. Never center-align long text; stick to intentional left-alignment to maintain a strong vertical axis.

---

### 4. Elevation & Depth: Tonal Layering
Traditional shadows are replaced with **Tonal Layering**. We simulate physical depth by stacking shades of charcoal and obsidian.

*   **The Layering Principle:** To highlight an alarm card, do not add a shadow. Instead, place the card (`surface-container-low`) on the background (`surface-dim`). The subtle contrast creates a "soft lift."
*   **Ghost Borders:** If a boundary is required for accessibility (e.g., an input field), use a "Ghost Border" using the `outline-variant` token at **15% opacity**. It should be barely perceptible—a suggestion of an edge, not a hard stop.
*   **Glassmorphism:** For the QR Scanner overlay or floating action buttons, use `surface-variant` with a **20px backdrop-blur**. This softens the "Deep Matte" background and makes the UI feel layered like stacked sheets of dark smoked glass.

---

### 5. Components: Functional Minimalism

*   **Buttons (Pill-Shaped):**
    *   **Primary:** `surface-container-highest` background with `primary` (#D4A574) text. No fill.
    *   **Secondary:** Ghost borders only. Text in `on-surface-variant`.
    *   **Destructive:** Text in `soft-red` (#C47070). No background.
*   **The Alarm Toggle:** Use a pill-shaped track. `unchecked` state is `surface-container-high`; `checked` state is `primary` (#D4A574). The "knob" should always be `on-background` (#E5E2E1) to maintain high tactile visibility.
*   **Lists & Cards:** 
    *   **Forbid dividers.** Use `spacing-4` (1.4rem) between list items. 
    *   If a visual separator is essential, use a `hairline divider` (#1E1C1A) that does not touch the edges of the screen (inset by 24px).
*   **Input Fields (QR/Barcode Entry):**
    *   Typography-first. No boxes. Just a `label-sm` in amber and a large `headline-md` value. Use a simple hairline underline in `outline-variant` (#50453B) to indicate the focus area.
*   **Time Picker:** A vertical scroll using `display-md`. The center (active) value is `primary-text` (#F5F0EB), while values above and below fade into `secondary-text` (#6B6560) with no sharp container lines.

---

### 6. Do's and Don'ts

*   **DO:** Use asymmetrical layouts. Place the time in the top-left and the "Next Alarm" in the bottom-right to create a dynamic, editorial feel.
*   **DO:** Honor the Japanese character set. Use `Plus Jakarta Sans` for Latin numerals and a clean, high-legibility Sans-Serif for Japanese characters.
*   **DON'T:** Use any blue or green. Even for "Success" states. Success is indicated by the Amber (`primary`) glow or a subtle haptic pulse.
*   **DON'T:** Use standard "Card" containers with heavy padding. Let the content breathe against the matte black background.
*   **DON'T:** Use motion that "pops." Use slow, linear fades (300ms) or "sliding glass" transitions to maintain the luxury bedside clock aesthetic.
*   **DO:** Use the `rounded-md` (1.5rem) or `rounded-lg` (2rem) for all container corners to soften the brutalism of the black palette.

---

### 7. Spacing Strategy
Use the **3.5rem (Spacing 10)** token as your "Master Margin." All primary content blocks should be inset by this value to create a centered, focused column of information that feels like a gallery plaque.