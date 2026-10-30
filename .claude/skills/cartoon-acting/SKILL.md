---
name: cartoon-acting
description: Acting and timing rules for an animated cartoon character (the channel mascot or any hero) — faces that act instead of snapping, 31 emotions with their own idle motion, anticipation/take/overshoot on every mood change, painted emotes (! ? sweat bulb) instead of text, reads-based timing, transitions on every seam. Use when animating the mascot «Нитка» or any character: "оживи персонажа", "сделай эмоции", "персонаж говорит/реагирует", "mascot acting", "character emotions".
---

# Cartoon acting (from ClaudeAnimationBase, MIT, © John Heibel)

The full guide is `references/ANIMATION_GUIDE.md` (written for p5.brush, but the acting and timing rules are engine-free);
the 31-emotion model sheet is `references/emotions.jpg`. In this studio the character is drawn in SVG (Remotion), so read
the guide for **what** to do and implement it with `src/toon/lib/anim.ts` (spring01, kick, blinkAt) and the mascot rig.

## Rules to apply every time
1. **Something happens in every shot**: the character wants, finds, tries, fails, reacts. Standing and smiling is not a shot.
2. **Cause, then reaction, in sequence.** The reaction (a take) is often the best part — give it time.
3. **Time the reads.** List what the viewer must understand in each shot; one read at a time; fast actions, slow meanings; hold after a take.
4. **Faces act, never snap.** Every mood change = squint/squash just before (anticipation) → swap the face under the squint → a take sized to the emotion → settle with overshoot. Never swap eyes/mouth between two frames.
5. **Alive**: every emotion has its own idle motion; nothing is ever frozen. Blink irregularly, not on a metronome.
6. **Avoid twinning**: one arm acts, the other does something smaller; offset timings between parts (eyes lead, body follows, hat/thread settle last).
7. **Exaggerate** poses and takes; subtle reads as nothing on a phone.
8. **Emotes, not words**: !, ?, !!, sweat drops, bulb, zzz, hearts, anger mark, swirl — painted marks that pop by the head.
9. **Character is big**: in a medium shot the mascot is ~35–45 % of the frame height; tiny characters only for wide establishing shots.
10. **Transitions always**, and rhyme the ending with the opening (same place or pose, changed).

## Emotion families (pick from these, keep the names)
joy: happy, excited, laugh, love, proud, starstruck, playful, hopeful, relieved · sly: smug, cool, mischief, suspicious ·
low: sad, cry, bored, sleepy, ko · hot: angry, furious, determined, disgusted · alarm: scared, nervous, surprised, confused, dizzy ·
mind: neutral, thinking, idea, shy.

## Common failures (check stills against them)
Signs or speech bubbles repeating the story; one brisk speed with no holds; moments over before they read; faces snapping;
linear moves and everything moving at once; timid takes; props floating near a hand instead of touching it.
