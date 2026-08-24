# deck-framework

Shared CSS and JS for the single-file HTML presentation decks built by the `/slides`
skill in [`petmakris/dashboard`](https://github.com/petmakris/dashboard) (private repo).

This repo holds only the generic visual framework — the slide canvas, cover/divider
layouts, the present-mode and speaker-notes JS. No deck content, no talk titles, no
speaker notes live here. It exists so every deck can point at one real source instead
of each one carrying its own copy-pasted block.

## Files

- `deck.css` — the shared style block: design tokens, slide canvas, all shared
  components (`.introb`, `.ctxp`, `.grail`, `.card`, …), present mode, notes drawer.
- `deck.js` — the shared script: page numbering, zoom-to-fit, present mode, speaker
  notes drawer, jump nav. Entirely generic — nothing per-deck.

## Usage

A deck references a **pinned version tag**, never `@latest` — a deck already presented
from should never change shape just because the framework moved on. Bump the tag by
hand when you actually want a deck to pick up a framework update.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/petmakris/deck-framework@v1.0.0/deck.css">
...
<script src="https://cdn.jsdelivr.net/gh/petmakris/deck-framework@v1.0.0/deck.js"></script>
```

Served via [jsDelivr](https://www.jsdelivr.com/), which mirrors any public GitHub repo
as a CDN — no hosting to run, cached globally, versioned by git tag.

**Trade-off accepted:** decks now need a network connection to render correctly. A
deck opened with no internet will show unstyled HTML. This replaced the previous
"fully self-contained, works offline" guarantee by deliberate choice, to kill
copy-paste drift between decks.

## Versioning

Semver tags (`v1.0.0`, `v1.1.0`, …). A breaking change to a class a deck already
uses is a major bump; a new component or additive tweak is minor/patch. Existing
decks are unaffected by a new tag until someone edits that deck's pinned version.

## Per-deck overrides

Nothing here. A deck that needs something this framework doesn't have adds its own
extra `<style>` block after the `<link>` tag, exactly as before — this repo only
replaces the part that used to be hand-copied verbatim.
