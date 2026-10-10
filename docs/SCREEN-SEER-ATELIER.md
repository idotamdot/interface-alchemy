# Screen Seer Studio — The Professional Visual Atelier

**Product:** Interface Alchemy / Screen Seer Studio
**Purpose:** Create a professional visual direction independently of UX Designer Studio's wireframes. Website Builder ultimately combines the approved style package with separately approved UX wireframes.
**Design language:** Obsidian (#080B14), pearl (#F2EDFF), iris (#BCAEFA), glacier (#9DE0E3). Editorial serif headings, ergonomic sans controls, mono metadata. Restrained light, smoked-glass surfaces, keyboard-accessible controls, reduced-motion support.

## The Studio journey

### 01 — Creative Brief (existing generation flow, room navigation added)
Purpose: capture a visual brief, **not** an application specification.
Primary: editable description, starting point (description/surprise), 1–3 generated directions, one explicit **Design my idea** action.
States: empty; editing; generating; request error (retain draft); saved/restored. Brief autosave stays intact when switching rooms.
Acceptance: clear visual-only wording, meaningful status, accessible labels, mobile 44px+ targets; no fake sample preview presented as user-generated output.

### 02 — The Salon (existing results flow, room navigation added)
Purpose: browse generated directions as curated visual proposals.
Each concept: own name, accessible sample screen, palette/contrast checks, rationale and second-AI critique, **Select this direction**, **Explore color spiral**, save to portfolio.
States: unavailable before generation; generating; 1–3 options; selected; error; persisted. Preserve previous results if a generation attempt fails.
Next enhancement: a real side-by-side concept comparison surface without inventing typography data.

### 03 — The Materials Library (future separate room)
Inspect the chosen direction's documented color tokens, type roles, cards, inputs, spacing, states, shadows, surfaces, and optional motion. Avoid claiming a font or component token has been designed unless present in the structured direction or measured from a preview.

### 04 — The Stage (existing live interface canvas; enhancement planned)
Apply a selected appearance to **real rendered interface output**, allowing viewport switching, keyboard review, and before/after inspection. Generic example screens must be labeled as examples. Never claim application functionality merely from a visual mockup.

### 05 — Portfolio (existing API and UI)
Private saved designs and explicitly donated community directions, each with consent controls. Preserve original ownership/privacy semantics. Never silently make work public.

### 06 — Builder Handoff (future)
Export a versioned visual-style package independently from the UX Designer Studio package. Include provenance, accessibility caveats, palette, component/motion intent, approved imagery, and unresolved decisions. Website Builder merges it with the UX wireframe package, never substituting visual instructions for executable behavior.

## Design requirements
- **Presentation:** large editorial hierarchy, generous negative space, purpose-led room navigation, art-directed boards rather than generic cards
- **Interaction:** real buttons only; no decorative or dead controls; safe selection and autosave; no accidental overwrite
- **Accessibility:** contrast checked on rendered output, keyboard and screen-reader support, focus indicators, semantic headings, motion control and reduced-motion parity
- **Devices:** desktop three-column capable, tablet progressive reduction, mobile one task at a time
- **Engineering truth:** report separately whether a feature is planned, coded, built, tested, and deployed. Screenshots do not prove behavior.

## Shipped in this pass
Creative Brief and Salon room navigation is now available inside the existing Screen Seer Studio dialog. Generation moves into the Salon when actual direction results arrive. Returning to Brief preserves existing state. No new endpoints or database migrations.

## Not shipped
Standalone Compare room, materials inspector, actual approved wireframe application, Builder export, and end-to-end visual QA. These require proper source contracts and tests, not placeholder buttons.
