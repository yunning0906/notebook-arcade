/**
 * Sketchbook Gallery (手繪手帳畫廊)
 * Manages player's completed watercolor/pastel illustrations collection,
 * saves progress into localStorage, and renders sketchbook thumbnails.
 */

class GalleryManager {
    constructor() {
        this.STORAGE_KEY = 'notebook_nonogram_progress_v1';
        this.completedPuzzles = this.loadProgress();
    }

    loadProgress() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            console.warn('LocalStorage unavailable:', e);
            return {};
        }
    }

    saveProgress(puzzleId, timeSpentSec) {
        if (!this.completedPuzzles[puzzleId]) {
            this.completedPuzzles[puzzleId] = {
                completed: true,
                bestTime: timeSpentSec,
                completedAt: new Date().toISOString()
            };
        } else {
            const cur = this.completedPuzzles[puzzleId];
            cur.bestTime = Math.min(cur.bestTime || 99999, timeSpentSec);
            cur.completed = true;
        }

        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.completedPuzzles));
        } catch (e) {
            console.warn('LocalStorage save failed:', e);
        }
    }

    isCompleted(puzzleId) {
        return !!(this.completedPuzzles[puzzleId] && this.completedPuzzles[puzzleId].completed);
    }

    getCompletedCount() {
        return Object.values(this.completedPuzzles).filter(p => p.completed).length;
    }

    renderGalleryGrid(containerEl, onSelectPuzzle) {
        if (!containerEl) return;
        containerEl.innerHTML = '';

        window.PUZZLES.forEach((puzzle, index) => {
            const isSolved = this.isCompleted(puzzle.id);
            const card = document.createElement('div');
            card.className = `gallery-card ${isSolved ? 'solved' : 'locked'}`;

            // Create mini pixel canvas/preview
            const previewBox = document.createElement('div');
            previewBox.className = 'gallery-preview-box';

            if (isSolved) {
                // Render colorful mini canvas
                const canvas = document.createElement('canvas');
                canvas.width = puzzle.size * 10;
                canvas.height = puzzle.size * 10;
                const ctx = canvas.getContext('2d');

                // Draw paper background
                ctx.fillStyle = '#FFFDF9';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Draw cells
                const cellSize = 10;
                for (let r = 0; r < puzzle.size; r++) {
                    for (let c = 0; c < puzzle.size; c++) {
                        const val = puzzle.grid[r][c];
                        if (val > 0) {
                            ctx.fillStyle = puzzle.palette[val] || '#FF7043';
                            ctx.fillRect(c * cellSize + 0.5, r * cellSize + 0.5, cellSize - 1, cellSize - 1);
                        }
                    }
                }
                previewBox.appendChild(canvas);
            } else {
                // Locked lock doodle
                previewBox.innerHTML = `
                    <div class="lock-placeholder">
                        <span class="lock-icon">
                            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </span>
                        <span class="lock-size">${puzzle.size}×${puzzle.size}</span>
                    </div>
                `;
            }

            const infoBox = document.createElement('div');
            infoBox.className = 'gallery-card-info';

            const title = document.createElement('div');
            title.className = 'gallery-card-title';
            title.textContent = isSolved ? puzzle.nameZh : `??? (${puzzle.size}×${puzzle.size})`;

            const sub = document.createElement('div');
            sub.className = 'gallery-card-sub';
            if (isSolved) {
                const best = this.completedPuzzles[puzzle.id].bestTime;
                const min = Math.floor(best / 60);
                const sec = best % 60;
                sub.textContent = `最佳 ${min}:${sec.toString().padStart(2, '0')}`;
            } else {
                sub.textContent = '尚未解開';
            }

            infoBox.appendChild(title);
            infoBox.appendChild(sub);

            card.appendChild(previewBox);
            card.appendChild(infoBox);

            card.addEventListener('click', () => {
                if (typeof onSelectPuzzle === 'function') {
                    onSelectPuzzle(index);
                }
            });

            containerEl.appendChild(card);
        });
    }
}

window.galleryManager = new GalleryManager();
