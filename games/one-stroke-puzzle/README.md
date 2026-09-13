# One-Stroke Line Puzzle (一筆畫解謎遊戲)

A warm, healing, notebook-style One-Stroke Line Puzzle game. Designed with a hand-drawn colored-pencil aesthetic matching the beloved Suika Game and 2048 notebook editions.

## ✨ Features
- **Notebook Graph Paper Aesthetic**: Beige background (`#F7F3E9`) with light grid lines, pencil outlines (`#524338`), zero harsh shadows, and pure pastel blocks (Sakura pink, sunny yellow, melon mint, sky blue, lilac).
- **English UI & Typography**: Lighter weights (`font-weight: 500 ~ 600`), pure black / pencil text (`SCORE`, `BEST`, `LEVEL`, `RESTART`, `UNDO`, `HINT`).
- **Web Audio API Soundscape**:
  - Continuous 80 BPM music box / kalimba background music playing gentle royal road chords.
  - Cute water drop sounds when dragging along the path.
  - Ascending wooden bell xylophone notes for each filled tile.
  - Magical fairy arpeggio on level completion.
  - Soft undo click.
- **Gameplay**:
  - Smooth touch & mouse drag: Swipe through tiles to fill every square in a single continuous stroke.
  - Natural backtracking: Moving backward automatically undoes the path cleanly.
  - Multiple level packs: Handcrafted shapes (Heart, Star, Cat, Mushroom, Boat, Cup, etc.), plus portals/warps and double-pass tiles.
  - Procedural Generator: Infinite solvable random puzzles for endless replayability.
  - AI Hint & Undo support.

## 🚀 One-Click Deployment

### 1. Vercel
- Push this repo to GitHub.
- Import into [Vercel](https://vercel.com/new).
- The project is pure static HTML/CSS/JS — no build command needed!

### 2. GitHub Pages
- Go to repository **Settings > Pages**.
- Under **Build and deployment > Branch**, select `main` / `(root)`.
- Click **Save**.

### 3. Local Development
Run with any static server:
```bash
npx serve .
# or
python3 -m http.server 8000
```
Open `http://localhost:3000` or `http://localhost:8000` in your browser.
