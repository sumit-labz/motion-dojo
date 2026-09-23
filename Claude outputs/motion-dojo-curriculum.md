# Motion Dojo — director's practice

You're a programmer directing motion, not learning to become a motion-design engineer. The rendering pipeline (GSAP under the hood, HyperFrames for export) is already solved — that's not what you're spending time on. What you're building is design judgment: layout, staging, typographic decision-making, timing-as-emotion, and the ability to plan a piece as a director (storyboard first, then motion) and get the machine to execute it. Depth into programming happens only where it's the actual bottleneck to directing well — never by default, never as a hidden assumption.

**No hunting for references mid-session.** Every phase below front-loads its reference material before you ever open the tool, so a working session is never interrupted by "let me go find something."

**Not a course.** A practice with phases. Each phase ends with something built, not just something understood.

---

## 0. The contract

**Binding principle.** Every session produces one shot, one storyboard, or one decision that could plausibly appear in a Story Dojo piece. Not an exercise. A candidate.

**Depth rule.** You go deep on code only when directing hits a real ceiling — e.g. you need a shot HyperFrames/GSAP can't do without a specific technique, or you want to read a generated timeline well enough to judge it precisely rather than vaguely. When that happens, we name the specific thing and you learn exactly that, not "programming" in general. Otherwise: you plan, you describe, you judge; building is executed for you.

**Session shape** (variable length — a real session, not padded to a fixed time):
1. **Reference already in hand.** Pull from the phase's pre-built swipe file — never search live.
2. **Plan.** For anything beyond a single shot: a storyboard pass first (Phase 2) — static frames, beats, mood, timing intent — before any motion is touched.
3. **Direct + build.** Describe the shot/beat; it gets built; you review.
4. **Judge + log.** Name what's true and why, one line, in `LOG.md`.

**Critique cadence.** Weekly, on whatever shipped that week, against the rubric in §8.

---

## 1. The vocabulary (read once, reference forever)

You already have this instinct from cinema. This table is the translation layer so a plain-language direction reliably produces the right motion — and so you can read back a built result and know precisely what to correct.

| Say this | It's called | What it actually does |
|---|---|---|
| "Hold this longer / cut it short" | Duration | Shot length. The most under-used control. |
| "Confident vs. anxious vs. reluctant" | Ease (acceleration curve) | Character. Instant start = aggressive; long settle = reluctant. |
| "A beat before it happens" | Delay | Anticipation. Where dread lives. |
| "Who moves first says something" | Stagger | Blocking a group. Order is a statement. |
| "Sync to this moment" | Timeline + labels | The edit timeline. Structure. |
| "Let one idea bleed into the next" | Overlap | Dissolve / L-cut / J-cut. |
| "Just cut" | Instant change, no tween | The cut. Hardness. Full stop. |
| "Where's the weight / pivot" | Transform origin | Staging. Changes meaning entirely. |
| "Push in vs. zoom in" | Scale + depth | Focal length and camera distance. |
| "Dolly, lens, depth of field" | 3D camera | Transfers 1:1 from cinema. |
| "Withhold, then reveal" | Clip/mask reveal | Wipe / curtain / rack focus. |
| "Same object, new context" | Match cut | The most powerful move in the set. |
| "Let the viewer connect the dots" | Two elements in sequence | Kuleshov effect. The Story Dojo engine. |
| "Don't break the exit/entry direction" | 180-degree rule | Violated constantly on the web if nobody's watching. |
| "What stays still" | The anchor | Motion without an anchor is noise. |
| "A held breath" | A hold / silence | Ozu's pillow shot. The only way loud reads loud. |
| "Speed this as commentary" | Speed ramp | Time as an editorial opinion. |
| "The viewer holds the pace" | Scroll-driven time | No cinema equivalent — theatre/installation pacing. |

**Read once, early:** Alan Becker's #1 (squash/stretch), #2 (anticipation), #6 (slow in/slow out); the Kuleshov experiment (background read, 10 min); Murch's Rule of Six from *In the Blink of an Eye* (emotion outranks continuity 12:1 — useful for judging your own cuts later).

---

## 2. Phase 1 — Layout and staging (single frame, no motion yet)

**Design principle you're building:** composition — what goes where, what's the anchor, what has weight, before anything moves. A director who can't compose a still frame can't direct a moving one.

**Reference pack (build once, ~45 min, before session 1).**
8–12 stills — not video — of typography/graphic layout you think is strong: film title cards (paused, not played), a few Awwwards/Codrops layouts, whatever's in your own visual reference habits. For each: one line on what makes the composition work (weight, anchor, negative space) — not the visual style. This pack is what you pull from for every session in this phase; no live searching.

**Sessions**
1. Pick a still from your pack. Direct a layout with the same weight distribution, different words.
2. Same layout, direct it with the anchor moved. What changes about what the frame means?
3. Direct a frame with deliberate negative space — where nothing is, on purpose.
4. Direct two versions of the same words: one centered/stable, one off-balance/tense. Name the emotional difference.
5. Pull one beat from your Inception script. Direct its layout as a still frame — no motion — before you ever touch timing.

**Exit test:** you can look at any still frame (yours or a reference) and say, correctly, what's the anchor and why the composition reads the way it does.

---

## 3. Phase 2 — Storyboarding (director-level planning tool)

This is a real HyperFrames capability: the agent writes a `storyboard.html` — a static, browser-viewable contact sheet — as a *proposal*, before any motion is built. It separates what you lock (narrative beats, timing intent, shot sequence) from what gets delegated to execution (exact palette, exact easing) — the director/executor split you want.

**What you learn here:** how to write a beat sheet — time-coded, one row per beat, with mood direction and visual description in plain language — and review a storyboard before committing to a build. Layout-planning applied at the scale of a whole piece instead of one frame.

**Sessions**
1. Take one scene from your Inception script (e.g. Scene 4 — Desire/Opponent). Write a beat table: time code, VO line, mood direction, visual description, one line each. No motion decisions yet — staging in time, not yet timing.
2. Get a storyboard.html built from that beat table. Review it as a static contact sheet — does the sequence of frames make sense before anything moves?
3. Revise the beat table based on what you saw. This loop (beat table → storyboard → revise) is the actual director skill — most judgment happens here, before a single second of motion exists.
4. Lock one storyboard. This becomes the plan for Phase 4's build.

**Exit test:** you can hand off a beat table and get back a storyboard that matches your intent closely enough that revisions are small, not structural.

---

## 4. Phase 3 — Kinetic typography: when to use what

**Design principle you're building:** a decision-maker's menu for type in motion. Not "how do character staggers work" — you'll never write that code — but "given this line and this moment, which move is the right one, and which would actively hurt it." This is the thing that separates directing type well from directing type randomly.

**Reference pack (build once, 30–45 min, before session 1).**
8–12 clips of kinetic typography you think is genuinely good — Art of the Title, Codrops text-reveal demos, film title sequences, a couple of Awwwards sites. For each: frame-step once, name what its timing/staggering does — not its visual style. Same discipline as Phase 1's pack. This becomes your reference for every session below and for Phase 5 onward.

**The decision table (build this as you go — it's the actual deliverable of this phase)**

| Move | What it reads as | When it's right | When it actively hurts |
|---|---|---|---|
| Line-by-line masked reveal | Measured, controlled, readable | Longer statements, anything meant to be absorbed | Never really hurts — it's the safe default |
| Character-by-character stagger | Ornamental, performative, slower to read | Titles, single words, moments where *watching it arrive* is the point | Sentences meant to be read quickly — legibility usually breaks |
| Word-by-word stagger | A middle ground — rhythm without destroying legibility | Short punchy lines, list-like structures | Long sentences — rhythm turns into a wait |
| Stagger from center outward | A reveal, an opening-up | Something being disclosed or discovered | A statement that should feel flat/factual instead |
| Stagger from edges inward | A convergence, a closing-in, a decision forming | A conclusion, a coming-together of ideas | An opening line — implies ending, not beginning |
| Mask moving opposite the text | Tension, resistance, something being pulled against | A line about conflict, reluctance, opposition | A calm or settled line — the friction reads as noise |
| Hard cut, no reveal | A fact. No emotional runway. | Something stated plainly, without editorializing | The line needing space to land emotionally |
| Weight/thickness animating in | The idea gaining conviction as it arrives | A line that's building toward certainty | A line that should feel already-true from frame one |
| One letter moving, rest static | Isolates a single idea inside a larger statement | Drawing attention to one word's double meaning | Overused — dilutes if every line does this |

**Sessions**
1. Pick two clips from your pack using different moves on similar material (e.g. both reveal a short punchy line, differently). Name why each director chose what they chose — fill in a row of the table above from what you observe.
2. Pull "He says: I do this for the money" (Scene 2). Using the table, decide which move is right for it, and why — direct that version.
3. Pull "Mal keeps appearing." (Scene 4). Direct it with the move the table says is wrong on purpose. Confirm it actually hurts. This is as useful as getting it right.
4. Pull "Once you see it, the heist stops being the point" (Scene 3). This line changes register mid-sentence — decide whether it needs one move or two combined, and direct it.
5. Take one full beat's dialogue from your script and assign a move to every line using only the table — no new decisions, just application. Time yourself; this should get fast.

**Exit test:** given any new line from your script, you can name the right move and the wrong move for it in under 30 seconds, and explain why in one sentence each.

---

## 5. Phase 4 — Motion as direction (timing and weight)

**Design principle:** now that composition, staging, and typographic decision-making are real skills, add timing — same direct/build/judge loop, applied to the locked storyboard from Phase 2 and the type decisions from Phase 3.

**Sessions** — pulled directly from your Inception script beats:
1. Direct the arrival of "Mal." — describe the feeling (intrusive? inevitable?), get 2–3 timing variations, judge which is true.
2. Direct "home" (Scene 3) two ways — heavy and weightless. Same words, only the feeling changes.
3. Direct the anticipation beat for "the money" (Scene 2) — pull back before the reveal.
4. Direct one full transition: the match cut described in your Story Dojo notes (surface claim → deeper pattern).
5. Take the storyboard locked in Phase 2 and the type-move decisions from Phase 3. Direct motion for each beat in sequence. This is your first assembled candidate piece.

**Exit test:** the mute test — strip narration, and the sequence still reads as an argument to someone who hasn't been told what it's about.

---

## 6. Phase 5 — Space and camera: the director's vocabulary for 3D

**This is vocabulary, not Three.js.** You are not learning the API. You're learning what a director already half-knows from cinema, mapped onto the handful of concepts that matter when a beat genuinely calls for depth. Entered only when Phase 4 produces a beat that a flat frame can't serve — never studied speculatively ahead of that need.

**The vocabulary**

| Say this | It's called | What it actually does |
|---|---|---|
| "Push the camera in" vs "zoom the lens in" | Dolly vs. zoom | Push-in changes perspective/depth relationships; zoom doesn't. Different emotional read — intimacy vs. surveillance. |
| "Wide lens vs. long lens on the same framing" | Field of view (fov) | Wide exaggerates depth and distorts edges (unease); long compresses depth (intimacy, flatness). |
| "Shoot from below / at eye level / from above" | Camera height | Power relations — looking up implies power over the viewer, looking down implies power over the subject. |
| "Layer things at different distances" | Depth/parallax | Depth without needing full 3D geometry — planes at different distances moving at different rates on camera move. |
| "Light it from one side only" | Directional lighting as staging | Where light falls is where attention falls; the rest recedes. |
| "Let it fade into fog/haze at distance" | Atmospheric fog | Atmospheric perspective — hides what's not ready to be seen yet, reveals by camera move. |
| "Only the in-focus thing is what's true" | Depth of field | What's sharp is what the viewer should believe; what's blurred is peripheral or unresolved. |

**Reference pack (build once, before session 1, only when this phase actually starts).**
4–6 clips where 3D/depth is doing real narrative work, not just spectacle — camera moves in film openings, a couple of well-directed WebGL sites. Same discipline: one line per clip on what the depth/camera choice is *doing*, not how it looks.

**Sessions**
1. Take one Phase 4 beat. Ask: does this actually need depth, or does a flat frame already serve it? If flat serves it, stop — log that decision and move on. (Your own Story Dojo principle: dimension only when it adds discovery.)
2. For a beat that does need it: direct the same framing at two different lens choices (wide vs. long). Name the emotional difference.
3. Direct the same shot at three camera heights. Name the power relation each implies.
4. Direct a reveal using fog/depth-of-field instead of a cut or mask — withholding through space instead of through time.
5. Direct one real Inception beat in depth, only if Phase 5 session 1 confirmed it earns the dimension.

**Exit test:** you can answer "does this beat need 3D?" with *no* at least once, correctly, and mean it.

---

## 7. Later phases (same model: plan → direct → build → judge)

Paced by what your actual Story Dojo work needs, not a fixed calendar:

- **Sequencing at scale.** Full-scene assembly from a locked storyboard — rhythm, holds, overlap, across a whole beat sheet.
- **Scroll as time.** Director decision, made at the storyboard stage: which beats are viewer-paced (scrubbed) vs. author-paced (triggered).
- **Sound.** Cross-referenced with your existing `sound-design.md` — accent mapping, silence as design, synced to the same beat sheet.
- **Vertical slice.** Assemble the actual Inception scrollyteller from the candidates built across every phase above.

---

## 8. Critique rubric

Applied weekly, to whatever shipped.

1. **Mute test.** Strip narration/labels. Does it still communicate a relationship on its own?
2. **Function before technique.** Name the emotional function in one word first. Does the result serve it?
3. **Anchor test.** What's deliberately still? Everything moving is noise.
4. **Eye-trace.** Where does the eye land first and last? Was that your decision?
5. **Speed.** Could this be 30% faster? (Almost always yes.)
6. **The hold.** Is there a still moment? No hold fails by default.
7. **Kill test.** Remove one element — does it still read? If yes, it was decoration.
8. **Type-move check.** For anything with text: does the decision table in Phase 3 back up the move used, or was it picked by habit?

**Scoring:** pass/fail each. Four or fewer passes means redirect, not refine.

---

## 9. Progress log

One row per session in `LOG.md`.

| # | Date | Phase | What I directed | What I learned (your judgment, in your words) | Candidate? |
|---|---|---|---|---|---|

---

## 10. Anti-patterns to watch for

- **Live reference hunting.** If you're searching for a reference mid-session, the pre-built pack failed — fix the pack, don't work around it.
- **Building motion before the storyboard is locked.** Phase 2 exists so Phase 4 isn't redesigning structure mid-build.
- **Picking a type move by habit instead of the table.** Phase 3's whole point is a considered decision, not a default reveal.
- **Learning code "just in case."** Depth is earned by a specific ceiling you actually hit, named specifically — never studied speculatively. This applies doubly to 3D — Phase 5 exists precisely to stop that from happening by accident.
- **Hedging the judgment.** "This one's fine" isn't a judgment. Name the emotion or name why you can't yet.
- **Skipping the log** because a session didn't land. Sessions that didn't land are the data.
- **Asking for the decision instead of the build.** Building is delegated. Which version is true is never delegated.
