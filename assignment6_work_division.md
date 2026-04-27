# Assignment 6: Feature Complete — Work Division

## What's Required

> **Feature Freeze** — all intended gameplay mechanics, rendering pipelines, and UI elements must be present and functional. No new features after this. Plus a **peer playtest with 5+ classmates** and two markdown reports.

### Deliverables Checklist
- [ ] **Feature Complete Build** — live URL or zip
- [ ] **Source Code** — updated GitHub repo
- [ ] **Feature Complete Release Notes** (Markdown) — what changed since Beta
- [ ] **User Study Results** (Markdown) — playtest feedback from 5+ classmates

---

## Current State (What We Have)

| Feature | Status |
|---------|--------|
| Seeded procedural terrain (fBm + chunk streaming) | ✅ Done |
| Altitude-based vertex colouring | ✅ Done |
| Macro noise for biome variation | ✅ Done |
| Fly camera (PointerLock + WASD) | ✅ Done |
| Dynamic time-of-day lighting | ✅ Done |
| HDR bloom + vignette post-processing | ✅ Done |
| Animated water plane | ✅ Done |
| Seed regeneration (working) | ✅ Done |
| Polished glassmorphic UI | ✅ Done |
| FPS stats toggle | ✅ Done |
| Collision detection (camera vs terrain) | ❌ Missing |
| Audio / ambient sound | ❌ Missing |
| Particle effects (clouds, dust, rain) | ❌ Missing |
| Minimap or coordinate display | ❌ Missing |
| Performance optimization (LOD, frustum culling) | ❌ Missing |
| Loading screen / onboarding | ❌ Missing |
| Peer playtest + report | ❌ Not started |
| Feature Complete release notes | ❌ Not started |

---

## 4-Way Work Division

### 👤 Person 1 — Rudra (Group Leader): Terrain Polish + Collision + Release Notes

**Focus:** Make the terrain feel complete and write the submission reports.

| Task | Details |
|------|---------|
| **Terrain collision** | Clamp camera Y to terrain height so you can't fly underground. Query the heightmap at camera (x,z) each frame and set `camera.position.y = max(camera.y, terrainHeight + 2)`. |
| **Loading screen** | Add a simple overlay that shows while initial chunks generate, then fades out. Improves first impression for playtests. |
| **Feature Complete Release Notes** | Write `Assignment6Report.md` — what changed since Beta, known issues, what's left for final polish. |
| **Coordinate/altitude HUD** | Small display showing current position and altitude — useful for playtesters to describe where issues occurred. |

**Estimated effort:** Medium — collision is the trickiest part, rest is straightforward.

---

### 👤 Person 2 — Cierra: Particle VFX + Clouds + Visual Polish

**Focus:** Add the final visual flair that takes it from "tech demo" to "experience."

| Task | Details |
|------|---------|
| **Cloud particles** | Spawn soft billboards at high altitude using `THREE.Points` or `THREE.Sprite`. Slowly drift with wind. Makes the sky feel alive. |
| **Atmospheric dust/haze** | Subtle particle layer near ground that reacts to time-of-day (golden at sunset, blue at night). |
| **Weather toggle** | Add a rain or snow particle system toggled from the UI. Doesn't need to be physically accurate — just visual. |
| **Visual polish pass** | Review all colour stops, material properties, and fog density across all 4 time presets. Make sure each looks intentionally good. |

**Estimated effort:** Medium — particle systems are mostly straightforward with Three.js.

---

### 👤 Person 3 — Krupa: Audio + Ambient Sound + Onboarding

**Focus:** Add the audio layer and make the app welcoming for first-time playtesters.

| Task | Details |
|------|---------|
| **Ambient audio** | Background nature sounds (wind, birds, water). Use `THREE.Audio` or simple HTML `<audio>`. Different loops for day vs. night. |
| **Audio controls** | Volume slider in the UI panel. Mute button. |
| **Onboarding overlay** | First-time-visitor instructions overlay — "Welcome to Terrain Explorer" with controls summary, animated arrows, and a "Start Exploring" button that locks the pointer. |
| **Favicon + meta** | Custom favicon (maybe a mountain icon), Open Graph meta tags for link previews when sharing the URL. |

**Estimated effort:** Low-Medium — audio is the main work, the rest is UI.

---

### 👤 Person 4 — Jasman: Performance + Peer Playtest + User Study Report

**Focus:** Make the build rock-solid for playtesting, then run the study.

| Task | Details |
|------|---------|
| **Performance optimization** | Add frustum culling check before creating chunks (skip chunks behind the camera). Consider LOD — reduce `CHUNK_SEGMENTS` for distant chunks. |
| **Shadow follow-camera** | Move the shadow cascade to follow the player so shadows work everywhere, not just near origin. |
| **Run peer playtest** | Recruit 5+ classmates to test the live build. For each: brief intro → think-aloud play → silent observation → post-play interview (3 questions). |
| **User Study Report** | Write `Assignment6UserStudy.md` — methodology, raw feedback per tester, common themes, action items for final sprint. |

**Estimated effort:** Medium-High — playtesting coordination takes time.

---

## Timeline (assuming 1 week)

| Day | Milestone |
|-----|-----------|
| Day 1–2 | Everyone starts coding their features in parallel |
| Day 3 | Merge all features to `main`, integration test |
| Day 4–5 | Jasman runs playtests with the merged build |
| Day 6 | Rudra writes release notes, Jasman writes user study report |
| Day 7 | Final QA, push, deploy, submit |

---

## Playtest Protocol (from assignment)

Each of the 5+ playtesters should go through:

1. **Introduction** (~1 min) — Explain the project briefly, get consent
2. **Think-Aloud** (~5 min) — Tester explores while narrating thoughts
3. **Silent Note-Taking** (~3 min) — You observe, note confusion/bugs/delight
4. **Post-Play Interview** (~3 min) — Ask:
   - "What was the most visually impressive part?"
   - "What felt confusing or broken?"
   - "What would you add or change?"

Record responses in the user study markdown.
