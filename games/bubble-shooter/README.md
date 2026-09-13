# Bubble Shooter (泡泡射擊遊戲) 🫧

A charming, pastel-colored, notebook-themed **Bubble Shooter** game designed with the exact visual and audio continuity of our Suika Game and 2048 projects.

## 🎨 Design & Aesthetic Features

- **Notebook Beige Palette**: `#F7F3E9` background with delicate paper grid lines and `box-shadow: none`.
- **Kawaii Borderless Pastel Bubbles**: Pure solid pastel colored-pencil fills (Strawberry Pink, Mint Green, Sky Blue, Butter Yellow, Lavender, Soft Peach) with no heavy black stroke borders.
- **Cute Matte Faces**: Small solid black dot eyes (no reflections, no blush), gentle blinking animations, and hand-drawn pencil curve smiles.
- **Pure Orange Floating Scores**: Crisp score floaters in vibrant pure orange (`#F37021`, no white border/outline) with long linger duration (~2.4s) before fading out.
- **Minimalist English UI**: Clean layout featuring `SCORE`, `BEST`, `NEXT`, `CEILING DROP` foul indicators, and `RESTART`.

## 🎵 Healing Audio Experience (Web Audio API)

- **Continuous 80 BPM Music Box BGM**: Gentle looping melody (Fmaj7 -> G7 -> Em7 -> Am7 Royal Road progression) that plays smoothly in the background.
- **Interactive SFX**:
  - Sliding water drop tick on aiming rotation
  - Cute bubble shoot pop
  - Crisp wooden bell / xylophone match chime
  - Sparkle fairy arpeggio on combos and multi-drops
  - Soft thud on unanchored falling bubbles
  - Sound Mute / Unmute toggle button with SVG icons

## 🎮 How to Play & Controls

1. **Aim & Shoot**:
   - **Mouse**: Move cursor to aim with the dotted trajectory guide, click to shoot.
   - **Touch**: Drag finger on screen to preview trajectory, release to fire.
   - **Keyboard**:
     - `Left Arrow` / `A`: Rotate cannon left
     - `Right Arrow` / `D`: Rotate cannon right
     - `Up Arrow` / `Spacebar`: Shoot bubble
     - `Down Arrow` / `C` / Click swap: Swap current bubble with next bubble
     - `R`: Restart game
2. **Rules**:
   - Match **3 or more** bubbles of the same color to pop them.
   - Detached bubbles not connected to the ceiling will fall as orphans, awarding massive bonus points!
   - Every 5 misses without pops causes the ceiling to advance down by 1 row.
   - Keep the bubbles above the danger foul line!

## 🚀 One-Click Deployment Guide

### Deploy on Vercel
1. Push this repository to GitHub or GitLab.
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Import the repository and click **Deploy** (zero-configuration needed; `vercel.json` is pre-configured).

Or via Vercel CLI:
```bash
npm i -g vercel
vercel
```

### Deploy on GitHub Pages
1. Push to your GitHub repository:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```
2. In your GitHub repository settings, go to **Settings > Pages**.
3. Under **Branch**, select `main` and root `/`, then click **Save**.
4. Your game will be live at `https://<your-username>.github.io/<repo-name>/`.
