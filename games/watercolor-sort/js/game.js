/**
 * Watercolor Sort Puzzle - Core Game Engine
 * Manages game state, user interactions, pouring validation, history stack (Undo),
 * hints, extra tubes booster, and level progress.
 */

class WatercolorGame {
    constructor() {
        this.audio = new WatercolorAudio();
        this.currentLevel = 1;
        this.tubes = [];
        this.selectedTubeIndex = null;
        this.isBusy = false; // Prevents interactions during animations
        this.history = []; // Stack for undo
        this.extraTubesAdded = 0;
        this.maxExtraTubes = 2;
        this.completedLevels = new Set();
        this.ui = null; // Bound by ui.js

        this._loadProgress();
    }

    _loadProgress() {
        try {
            const saved = localStorage.getItem('watercolor_sort_progress');
            if (saved) {
                const data = JSON.parse(saved);
                this.currentLevel = data.currentLevel || 1;
                if (Array.isArray(data.completed)) {
                    this.completedLevels = new Set(data.completed);
                }
            }
        } catch (e) {
            console.warn("Could not load local storage progress", e);
        }
    }

    _saveProgress() {
        try {
            const data = {
                currentLevel: this.currentLevel,
                completed: Array.from(this.completedLevels)
            };
            localStorage.setItem('watercolor_sort_progress', JSON.stringify(data));
        } catch (e) {
            console.warn("Could not save local storage progress", e);
        }
    }

    init(uiInstance) {
        this.ui = uiInstance;
        const lvlParam = parseInt(new URLSearchParams(window.location.search).get('level'), 10);
        if (lvlParam && lvlParam >= 1 && lvlParam <= CURATED_LEVELS.length) {
            this.currentLevel = lvlParam;
        }
        this.loadLevel(this.currentLevel);
    }

    /**
     * Load specified level number (1-36)
     */
    loadLevel(lvlNum) {
        if (lvlNum < 1 || lvlNum > CURATED_LEVELS.length) {
            lvlNum = 1;
        }

        this.currentLevel = lvlNum;
        const levelData = CURATED_LEVELS[lvlNum - 1];

        // Deep copy tube data
        this.tubes = levelData.tubes.map(t => [...t]);
        this.selectedTubeIndex = null;
        this.isBusy = false;
        this.history = [];
        this.extraTubesAdded = 0;

        if (this.ui) {
            this.ui.renderBoard(this.tubes, levelData);
            this.ui.updateControls({
                canUndo: false,
                extraTubesLeft: this.maxExtraTubes - this.extraTubesAdded,
                levelNum: this.currentLevel,
                levelTitle: levelData.title
            });
        }
    }

    /**
     * Handle tube click event
     */
    async onTubeClick(tubeIndex) {
        if (this.isBusy) return;

        // Try initializing audio context on user interaction
        this.audio.init();

        const tube = this.tubes[tubeIndex];

        // Case 1: No tube currently selected
        if (this.selectedTubeIndex === null) {
            if (tube.length === 0) {
                // Clicked an empty tube without selecting a source tube first!
                if (this.ui) {
                    this.ui.wobbleTube(tubeIndex);
                    this.ui.showNotification("請先點選有水彩的試管，再點空試管倒水");
                }
                this.audio.playGlassClink(false);
                return;
            }

            // Cannot pick a tube that is already fully sorted
            if (tube.length === TUBE_CAPACITY && tube.every(c => c === tube[0])) {
                if (this.ui) this.ui.wobbleTube(tubeIndex);
                return;
            }

            // Select this tube
            this.selectedTubeIndex = tubeIndex;
            this.audio.playGlassClink(true);
            if (this.ui) this.ui.selectTube(tubeIndex);
            return;
        }

        // Case 2: Clicking the currently selected tube again -> Deselect
        if (this.selectedTubeIndex === tubeIndex) {
            this.audio.playGlassClink(false);
            if (this.ui) this.ui.deselectTube(tubeIndex);
            this.selectedTubeIndex = null;
            return;
        }

        // Case 3: Clicking another tube -> Attempt Pour from selected to target
        const fromIdx = this.selectedTubeIndex;
        const toIdx = tubeIndex;
        const pourCheck = this.canPour(fromIdx, toIdx);

        if (!pourCheck.allowed) {
            // Cannot pour: if target is not empty and not completed, select the target instead!
            if (tube.length > 0 && !(tube.length === TUBE_CAPACITY && tube.every(c => c === tube[0]))) {
                if (this.ui) this.ui.deselectTube(fromIdx);
                this.selectedTubeIndex = toIdx;
                this.audio.playGlassClink(true);
                if (this.ui) this.ui.selectTube(toIdx);
            } else {
                // Invalid pour & cannot select target
                this.audio.playGlassClink(false);
                if (this.ui) this.ui.deselectTube(fromIdx);
                this.selectedTubeIndex = null;
            }
            return;
        }

        // Execute Pour!
        await this.executePour(fromIdx, toIdx, pourCheck.count, pourCheck.color);
    }

    /**
     * Validates if pouring from fromIdx to toIdx is allowed
     */
    canPour(fromIdx, toIdx) {
        if (fromIdx === toIdx) return { allowed: false };
        const fromTube = this.tubes[fromIdx];
        const toTube = this.tubes[toIdx];

        if (fromTube.length === 0) return { allowed: false };
        if (toTube.length >= TUBE_CAPACITY) return { allowed: false };

        const color = fromTube[fromTube.length - 1];

        // Target tube must be empty OR top color must match
        if (toTube.length > 0 && toTube[toTube.length - 1] !== color) {
            return { allowed: false };
        }

        // Calculate contiguous matching color units in fromTube
        let matchingCount = 0;
        for (let i = fromTube.length - 1; i >= 0; i--) {
            if (fromTube[i] === color) matchingCount++;
            else break;
        }

        // Limit by remaining space in toTube
        const space = TUBE_CAPACITY - toTube.length;
        const pourCount = Math.min(matchingCount, space);

        return {
            allowed: true,
            count: pourCount,
            color: color
        };
    }

    /**
     * Executes the pouring animation and updates state
     */
    async executePour(fromIdx, toIdx, count, color) {
        this.isBusy = true;
        this.selectedTubeIndex = null;

        try {
            // 1. Save history snapshot for Undo
            this.history.push({
                tubes: this.tubes.map(t => [...t]),
                fromIdx: fromIdx,
                toIdx: toIdx,
                count: count,
                color: color
            });

            // 2. Play realistic "glug-glug" water stream sound
            const pourDurationMs = 600 + count * 180;
            this.audio.startPouringStream(pourDurationMs);

            // 3. Trigger fluid pouring animation in UI
            if (this.ui) {
                await this.ui.animatePour(fromIdx, toIdx, count, color, pourDurationMs);
            }

            // 4. Update tubes data model
            for (let i = 0; i < count; i++) {
                this.tubes[fromIdx].pop();
                this.tubes[toIdx].push(color);
            }

            // Guarantee 100% accurate DOM synchronization
            if (this.ui) {
                this.ui.syncTube(fromIdx, this.tubes[fromIdx]);
                this.ui.syncTube(toIdx, this.tubes[toIdx]);
            }

            // 5. Check if target tube is now fully completed
            const toTube = this.tubes[toIdx];
            const isTargetCompleted = (toTube.length === TUBE_CAPACITY && toTube.every(c => c === color));
            if (isTargetCompleted) {
                this.audio.playCorkPop();
                if (this.ui) {
                    this.ui.sealTubeWithCork(toIdx, color);
                }
            }

            // 6. Update UI controls (Undo available)
            if (this.ui) {
                this.ui.updateControls({
                    canUndo: this.history.length > 0,
                    extraTubesLeft: this.maxExtraTubes - this.extraTubesAdded,
                    levelNum: this.currentLevel
                });
            }

            // 7. Check for Level Victory
            const won = isBoardSolved(this.tubes, TUBE_CAPACITY);
            if (won) {
                this.completedLevels.add(this.currentLevel);
                this._saveProgress();
                this.audio.playVictory();
                if (this.ui) {
                    await this.ui.showVictoryModal(this.currentLevel);
                }
            }
        } catch (err) {
            console.error('Error during executePour:', err);
            if (this.ui) {
                this.ui.syncTube(fromIdx, this.tubes[fromIdx]);
                this.ui.syncTube(toIdx, this.tubes[toIdx]);
            }
        } finally {
            this.isBusy = false;
        }
    }

    /**
     * Undo the last move
     */
    async undo() {
        if (this.isBusy || this.history.length === 0) return;

        this.isBusy = true;
        this.audio.playUndo();

        try {
            const lastState = this.history.pop();
            this.tubes = lastState.tubes.map(t => [...t]);
            this.selectedTubeIndex = null;

            if (this.ui) {
                this.ui.renderBoard(this.tubes, CURATED_LEVELS[this.currentLevel - 1]);
                this.ui.updateControls({
                    canUndo: this.history.length > 0,
                    extraTubesLeft: this.maxExtraTubes - this.extraTubesAdded,
                    levelNum: this.currentLevel
                });
            }
        } finally {
            this.isBusy = false;
        }
    }

    /**
     * Restart current level to initial layout
     */
    restart() {
        if (this.isBusy) return;
        this.loadLevel(this.currentLevel);
    }

    /**
     * Add an extra empty tube if player is in a tight spot
     */
    addExtraTube() {
        if (this.isBusy) return;
        if (this.extraTubesAdded >= this.maxExtraTubes) {
            if (this.ui) this.ui.showNotification("此關卡已達增加試管上限");
            return;
        }

        this.audio.playGlassClink(true);
        this.extraTubesAdded++;
        this.tubes.push([]); // Add empty tube

        if (this.ui) {
            this.ui.renderBoard(this.tubes, CURATED_LEVELS[this.currentLevel - 1]);
            this.ui.updateControls({
                canUndo: this.history.length > 0,
                extraTubesLeft: this.maxExtraTubes - this.extraTubesAdded,
                levelNum: this.currentLevel
            });
            this.ui.showNotification("已為您添置一根備用手繪試管");
        }
    }

    /**
     * Provide gentle hint by finding a winning move from BFS solver
     */
    getHint() {
        if (this.isBusy) return;

        // Run fast BFS solver
        const solution = solveWaterSort(this.tubes, 2000, TUBE_CAPACITY);

        if (solution.solved && solution.moves.length > 0) {
            const nextMove = solution.moves[0];
            if (this.ui) {
                this.ui.highlightHint(nextMove.from, nextMove.to);
            }
        } else {
            // Find any valid move
            const validMoves = getValidMoves(this.tubes, TUBE_CAPACITY);
            if (validMoves.length > 0) {
                const move = validMoves[0];
                if (this.ui) {
                    this.ui.highlightHint(move.from, move.to);
                }
            } else {
                if (this.ui) {
                    this.ui.showNotification("目前無可行傾倒，建議使用「復原」或「+試管」");
                }
            }
        }
    }

    /**
     * Advance to next level
     */
    nextLevel() {
        if (this.currentLevel < CURATED_LEVELS.length) {
            this.loadLevel(this.currentLevel + 1);
        } else {
            this.loadLevel(1);
        }
    }
}

window.WatercolorGame = WatercolorGame;
