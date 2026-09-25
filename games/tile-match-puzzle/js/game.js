/**
 * Paper Tile Match 3 - Core Game Engine
 * Features:
 * - AABB Occlusion detection for layered paper cards
 * - 7-Slot smart grouping tray
 * - Fluid card flight animations
 * - 3-Match elimination with particle explosion & sound
 * - Stationery power-ups: Undo, Shuffle, Extract
 * - Responsive coordinate mapping
 */

class PaperTileGame {
    constructor() {
        this.boardEl = document.getElementById('deskBoard');
        this.trayContainer = document.getElementById('trayContainer');
        this.extractShelf = document.getElementById('extractShelf');
        this.levelTitleEl = document.getElementById('levelTitle');
        this.levelSubEl = document.getElementById('levelSub');
        this.remainingCountEl = document.getElementById('remainingCount');
        this.totalCardsEl = document.getElementById('totalCards');
        this.progressBar = document.getElementById('progressBar');
        this.timerEl = document.getElementById('timerVal');
        this.scoreEl = document.getElementById('scoreVal');
        this.soundToggleBtn = document.getElementById('soundToggle');

        // Power-up elements
        this.btnUndo = document.getElementById('btnUndo');
        this.btnShuffle = document.getElementById('btnShuffle');
        this.btnExtract = document.getElementById('btnExtract');
        this.undoCountBadge = document.getElementById('undoCount');
        this.shuffleCountBadge = document.getElementById('shuffleCount');
        this.extractCountBadge = document.getElementById('extractCount');

        // Modals
        this.victoryModal = document.getElementById('victoryModal');
        this.defeatModal = document.getElementById('defeatModal');
        this.levelModal = document.getElementById('levelModal');
        this.ruleModal = document.getElementById('ruleModal');

        // Game State
        this.audio = new PaperAudio();
        this.particles = new ParticleSystem();

        this.currentLevelIndex = 0; // 0-based
        this.boardCards = [];       // Cards currently on desk
        this.trayCards = [];        // Cards currently in 7-slot tray
        this.extractedCards = [];   // Cards currently in bookmark shelf (max 3)
        this.undoStack = [];        // History of moves for undo

        this.powerups = {
            undo: 3,
            shuffle: 3,
            extract: 2
        };

        this.totalCardsInLevel = 0;
        this.score = 0;
        this.combo = 0;
        this.isProcessingMove = false;

        // Timer
        this.timerSeconds = 0;
        this.timerInterval = null;

        // Bounding Box Parameters (px)
        this.CARD_WIDTH = 58;
        this.CARD_HEIGHT = 68;
        this.OVERLAP_X = 46;
        this.OVERLAP_Y = 54;

        this.init();
    }

    init() {
        this._bindEvents();
        this._loadProgress();
        this._updatePowerupUI();
        this.loadLevel(this.currentLevelIndex);

        // Auto unlock audio on first user click
        const unlockAudio = () => {
            this.audio.init();
            if (this.audio.bgmEnabled && !this.audio.isMuted) {
                this.audio.startBgm();
            }
            window.removeEventListener('click', unlockAudio);
            window.removeEventListener('touchstart', unlockAudio);
        };
        window.addEventListener('click', unlockAudio);
        window.addEventListener('touchstart', unlockAudio);

        window.addEventListener('resize', () => {
            this._repositionBoardCards();
        });
    }

    _bindEvents() {
        // Sound toggle
        this.soundToggleBtn.addEventListener('click', () => {
            const isMuted = this.audio.toggleMute();
            this.soundToggleBtn.querySelector('.icon-sound-on').classList.toggle('hidden', isMuted);
            this.soundToggleBtn.querySelector('.icon-sound-off').classList.toggle('hidden', !isMuted);
        });

        // Power-ups
        this.btnUndo.addEventListener('click', () => this.handleUndo());
        this.btnShuffle.addEventListener('click', () => this.handleShuffle());
        this.btnExtract.addEventListener('click', () => this.handleExtract());

        // Header Navigation
        document.getElementById('btnPrevLevel').addEventListener('click', () => {
            if (this.currentLevelIndex > 0) {
                this.loadLevel(this.currentLevelIndex - 1);
            }
        });
        document.getElementById('btnNextLevel').addEventListener('click', () => {
            if (this.currentLevelIndex < window.GAME_LEVELS.length - 1) {
                this.loadLevel(this.currentLevelIndex + 1);
            }
        });
        document.getElementById('btnLevelSelect').addEventListener('click', () => {
            this._openLevelModal();
        });
        document.getElementById('btnHelp').addEventListener('click', () => {
            this.ruleModal.classList.remove('hidden');
        });
        document.getElementById('closeRuleModal').addEventListener('click', () => {
            this.ruleModal.classList.add('hidden');
        });

        // Modals
        document.getElementById('btnNextLevelWin').addEventListener('click', () => {
            this.victoryModal.classList.add('hidden');
            if (this.currentLevelIndex < window.GAME_LEVELS.length - 1) {
                this.loadLevel(this.currentLevelIndex + 1);
            } else {
                // Generate endless solvable
                this.loadLevel(0);
            }
        });
        document.getElementById('btnReplayWin').addEventListener('click', () => {
            this.victoryModal.classList.add('hidden');
            this.loadLevel(this.currentLevelIndex);
        });
        document.getElementById('btnRetryDefeat').addEventListener('click', () => {
            this.defeatModal.classList.add('hidden');
            this.loadLevel(this.currentLevelIndex);
        });
        document.getElementById('btnReviveDefeat').addEventListener('click', () => {
            // Revive: clear 3 cards into shelf or undo
            this.defeatModal.classList.add('hidden');
            this.handleExtract(true); // Forced extract
        });
        document.getElementById('closeLevelModal').addEventListener('click', () => {
            this.levelModal.classList.add('hidden');
        });
    }

    _loadProgress() {
        const savedLevel = localStorage.getItem('paper_tiles_level');
        if (savedLevel !== null) {
            this.currentLevelIndex = Math.min(parseInt(savedLevel, 10), window.GAME_LEVELS.length - 1);
        }
    }

    _saveProgress() {
        localStorage.setItem('paper_tiles_level', this.currentLevelIndex.toString());
    }

    _updatePowerupUI() {
        this.undoCountBadge.textContent = this.powerups.undo;
        this.shuffleCountBadge.textContent = this.powerups.shuffle;
        this.extractCountBadge.textContent = this.powerups.extract;

        this.btnUndo.disabled = this.powerups.undo <= 0 || this.undoStack.length === 0;
        this.btnShuffle.disabled = this.powerups.shuffle <= 0 || this.boardCards.length <= 1;
        this.btnExtract.disabled = this.powerups.extract <= 0 || this.trayCards.length === 0 || this.extractedCards.length >= 3;
    }

    /**
     * Load a level by index
     */
    loadLevel(levelIndex) {
        this.currentLevelIndex = levelIndex;
        const levelData = window.GAME_LEVELS[levelIndex] || window.generateRandomSolvableLevel(48);

        // Reset state
        this.boardCards = [];
        this.trayCards = [];
        this.extractedCards = [];
        this.undoStack = [];
        this.isProcessingMove = false;
        this.combo = 0;

        // Reset powerups per level
        this.powerups = { undo: 3, shuffle: 3, extract: 2 };
        this._updatePowerupUI();

        // Update UI
        this.levelTitleEl.textContent = `第 ${levelData.id} 關 · ${levelData.name}`;
        this.levelSubEl.textContent = levelData.subtitle;

        // Prepare Card Types with guaranteed multiples of 3
        const totalPos = levelData.cardPositions.length;
        this.totalCardsInLevel = totalPos;
        this.totalCardsEl.textContent = totalPos;
        this.remainingCountEl.textContent = totalPos;
        this.progressBar.style.width = '100%';

        // Generate matching triplets of icons
        const tripletsNeeded = totalPos / 3;
        const availableIcons = levelData.icons;
        const iconList = [];

        for (let i = 0; i < tripletsNeeded; i++) {
            const iconKey = availableIcons[i % availableIcons.length];
            iconList.push(iconKey, iconKey, iconKey);
        }

        // Shuffle icon distribution among positions
        for (let i = iconList.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [iconList[i], iconList[j]] = [iconList[j], iconList[i]];
        }

        // Clear boards & DOM
        this.boardEl.innerHTML = '';
        this.trayContainer.innerHTML = '';
        this.extractShelf.innerHTML = '';

        // Create tray slot guides (7 slots)
        for (let i = 0; i < 7; i++) {
            const slot = document.createElement('div');
            slot.className = 'tray-slot-placeholder';
            slot.dataset.slotIndex = i;
            this.trayContainer.appendChild(slot);
        }

        // Instantiate cards
        levelData.cardPositions.forEach((pos, idx) => {
            const iconKey = iconList[idx];
            const cardObj = {
                id: `card_${idx}`,
                unitX: pos.x,
                unitY: pos.y,
                layer: pos.layer,
                iconKey: iconKey,
                isBlocked: false,
                el: null
            };
            this.boardCards.push(cardObj);
        });

        this._renderBoard();
        this._updateOcclusion();
        this._startTimer();
    }

    _startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerSeconds = 0;
        this.timerEl.textContent = '0:00';
        this.timerInterval = setInterval(() => {
            this.timerSeconds++;
            const m = Math.floor(this.timerSeconds / 60);
            const s = this.timerSeconds % 60;
            this.timerEl.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
        }, 1000);
    }

    /**
     * Compute pixel coordinates from relative grid units
     */
    _getPixelCoords(unitX, unitY, layer) {
        const boardRect = this.boardEl.getBoundingClientRect();
        // Base coordinate multiplier scaled to current board dimensions
        const scale = Math.min(boardRect.width / 520, boardRect.height / 460) || 1;
        const unitPx = 48 * scale;
        const left = (unitX * unitPx) + 12;
        const top = (unitY * unitPx) + 10;
        return { left, top, scale };
    }

    /**
     * Render all cards onto the desk board
     */
    _renderBoard() {
        this.boardEl.innerHTML = '';

        this.boardCards.forEach(card => {
            const { left, top } = this._getPixelCoords(card.unitX, card.unitY, card.layer);
            const iconData = window.TILE_ICONS[card.iconKey];

            const el = document.createElement('div');
            el.className = 'desk-card';
            el.id = card.id;
            el.dataset.icon = card.iconKey;
            el.style.left = `${left}px`;
            el.style.top = `${top}px`;
            el.style.zIndex = card.layer * 10;

            // Card Inner styling (Sweet Card Game 3D aesthetic)
            el.innerHTML = `
                <div class="card-inner">
                    <div class="card-icon-wrap">
                        ${iconData.svg}
                    </div>
                </div>
                <div class="card-shadow-layer"></div>
            `;

            // Click listener
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleCardClick(card);
            });

            card.el = el;
            this.boardEl.appendChild(el);
        });
    }

    _repositionBoardCards() {
        this.boardCards.forEach(card => {
            if (!card.el) return;
            const { left, top } = this._getPixelCoords(card.unitX, card.unitY, card.layer);
            card.el.style.left = `${left}px`;
            card.el.style.top = `${top}px`;
        });
    }

    /**
     * Recompute occlusion state for all cards on the desk
     * A card is blocked if any card on a HIGHER layer overlaps its bounding box
     */
    _updateOcclusion() {
        const boardRect = this.boardEl.getBoundingClientRect();
        const scale = Math.min(boardRect.width / 520, boardRect.height / 460) || 1;
        const overlapX = this.OVERLAP_X * scale;
        const overlapY = this.OVERLAP_Y * scale;

        this.boardCards.forEach(cardA => {
            const posA = this._getPixelCoords(cardA.unitX, cardA.unitY, cardA.layer);
            let blocked = false;

            for (const cardB of this.boardCards) {
                if (cardA === cardB) continue;
                if (cardB.layer > cardA.layer) {
                    const posB = this._getPixelCoords(cardB.unitX, cardB.unitY, cardB.layer);
                    const dx = Math.abs(posA.left - posB.left);
                    const dy = Math.abs(posA.top - posB.top);

                    if (dx < overlapX && dy < overlapY) {
                        blocked = true;
                        break;
                    }
                }
            }

            const wasBlocked = cardA.isBlocked;
            cardA.isBlocked = blocked;

            if (cardA.el) {
                if (blocked) {
                    cardA.el.classList.add('is-blocked');
                    cardA.el.classList.remove('is-free');
                } else {
                    cardA.el.classList.remove('is-blocked');
                    cardA.el.classList.add('is-free');

                    // If it just became free, play a subtle unlock pop
                    if (wasBlocked) {
                        cardA.el.classList.add('unlocked-pop');
                        setTimeout(() => cardA.el && cardA.el.classList.remove('unlocked-pop'), 300);
                    }
                }
            }
        });
    }

    /**
     * Player clicks a card on the desk
     */
    async handleCardClick(card) {
        if (this.isProcessingMove) return;
        if (card.isBlocked) {
            // Blocked card click: subtle wiggle + feedback
            if (card.el) {
                card.el.classList.add('card-locked-wiggle');
                setTimeout(() => card.el && card.el.classList.remove('card-locked-wiggle'), 300);
            }
            this.audio.playCardSnap(0.7);
            return;
        }

        // Check if tray is completely full (7 cards)
        if (this.trayCards.length >= 7) {
            this.audio.playTrayWarning();
            this.trayContainer.classList.add('tray-shake');
            setTimeout(() => this.trayContainer.classList.remove('tray-shake'), 400);
            return;
        }

        this.isProcessingMove = true;

        // Audio: Crisp "Pa!" snap
        this.audio.playCardSnap(1.0 + Math.random() * 0.1);
        this.audio.playCardSlide();

        // Save Undo State
        const undoData = {
            card: card,
            from: 'board',
            boardIndex: this.boardCards.indexOf(card)
        };

        // Remove from board data array
        const boardIdx = this.boardCards.indexOf(card);
        if (boardIdx > -1) {
            this.boardCards.splice(boardIdx, 1);
        }

        // Recompute occlusion immediately so cards underneath unlock gracefully
        this._updateOcclusion();
        this._updateHeaderStats();

        // Calculate Target Slot in Tray with Smart Adjacent Grouping
        // Group cards with the same icon together
        let insertIndex = this.trayCards.length;
        let lastSameIndex = -1;
        for (let i = 0; i < this.trayCards.length; i++) {
            if (this.trayCards[i].iconKey === card.iconKey) {
                lastSameIndex = i;
            }
        }
        if (lastSameIndex !== -1) {
            insertIndex = lastSameIndex + 1;
        }

        undoData.trayIndex = insertIndex;
        this.undoStack.push(undoData);
        this._updatePowerupUI();

        // Smooth flight animation to tray
        await this._flyCardToTray(card, insertIndex);

        // Check for 3-Match elimination
        await this._checkTrayElimination();

        this.isProcessingMove = false;
        this._updatePowerupUI();

        // Check Defeat / Victory
        this._checkGameStatus();
    }

    /**
     * Animate card flying from its current location to the target tray slot
     */
    _flyCardToTray(card, insertIndex) {
        return new Promise(resolve => {
            const startRect = card.el.getBoundingClientRect();

            // Insert into trayCards array
            this.trayCards.splice(insertIndex, 0, card);

            // Rebuild Tray DOM Elements to render new order
            this._renderTrayDOM();

            const targetEl = card.trayEl;
            const targetRect = targetEl.getBoundingClientRect();

            // Create a floating clone for smooth flight
            const clone = card.el.cloneNode(true);
            clone.classList.add('flying-card');
            clone.classList.remove('is-free', 'is-blocked');
            clone.style.left = `${startRect.left}px`;
            clone.style.top = `${startRect.top}px`;
            clone.style.width = `${startRect.width}px`;
            clone.style.height = `${startRect.height}px`;
            clone.style.zIndex = '9998';
            document.body.appendChild(clone);

            // Hide original element from desk and hide target slot momentarily
            card.el.remove();
            targetEl.style.opacity = '0';

            // Trigger smooth transform transition
            requestAnimationFrame(() => {
                clone.style.transition = 'all 0.28s cubic-bezier(0.22, 1, 0.36, 1)';
                clone.style.left = `${targetRect.left}px`;
                clone.style.top = `${targetRect.top}px`;
                clone.style.width = `${targetRect.width}px`;
                clone.style.height = `${targetRect.height}px`;
                clone.style.transform = 'rotate(0deg) scale(1)';

                setTimeout(() => {
                    targetEl.style.opacity = '1';
                    clone.remove();
                    resolve();
                }, 290);
            });
        });
    }

    /**
     * Render the 7 slots of the tray and place cards accurately
     */
    _renderTrayDOM() {
        // Clear all cards inside placeholders
        const placeholders = this.trayContainer.querySelectorAll('.tray-slot-placeholder');

        placeholders.forEach((slot, i) => {
            slot.innerHTML = '';
            if (this.trayCards[i]) {
                const card = this.trayCards[i];
                const iconData = window.TILE_ICONS[card.iconKey];

                const cardEl = document.createElement('div');
                cardEl.className = 'tray-card';
                cardEl.id = `tray_${card.id}`;
                cardEl.dataset.icon = card.iconKey;
                cardEl.innerHTML = `
                    <div class="card-inner">
                        <div class="card-icon-wrap">
                            ${iconData.svg}
                        </div>
                    </div>
                `;
                card.trayEl = cardEl;
                slot.appendChild(cardEl);
            }
        });
    }

    /**
     * Check if tray contains 3 matching cards and eliminate them
     */
    async _checkTrayElimination() {
        const counts = {};
        this.trayCards.forEach(c => {
            counts[c.iconKey] = (counts[c.iconKey] || 0) + 1;
        });

        // Find match
        let matchIcon = null;
        for (const [icon, count] of Object.entries(counts)) {
            if (count >= 3) {
                matchIcon = icon;
                break;
            }
        }

        if (!matchIcon) return;

        // Found 3 matching cards!
        this.combo++;
        const points = 100 * this.combo;
        this.score += points;
        this.scoreEl.textContent = this.score;

        // Locate the 3 cards in the tray
        const matchingCards = [];
        const indices = [];
        this.trayCards.forEach((c, idx) => {
            if (c.iconKey === matchIcon && matchingCards.length < 3) {
                matchingCards.push(c);
                indices.push(idx);
            }
        });

        // Highlight matching cards with elimination glow
        matchingCards.forEach(c => {
            if (c.trayEl) c.trayEl.classList.add('match-eliminating');
        });

        // Sound effect
        this.audio.playTripleMatch();

        // Particle explosion at center of the 3 cards
        if (matchingCards[1] && matchingCards[1].trayEl) {
            const rect = matchingCards[1].trayEl.getBoundingClientRect();
            this.particles.burstAt(rect.left + rect.width / 2, rect.top + rect.height / 2, { count: 32 });
        }

        await new Promise(r => setTimeout(r, 260));

        // Remove from trayCards array
        this.trayCards = this.trayCards.filter(c => !matchingCards.includes(c));

        // Re-render tray DOM so remaining cards slide neatly to the left
        this._renderTrayDOM();
        this._updateHeaderStats();

        // Check if subsequent cascade match exists (rare but possible)
        await this._checkTrayElimination();
    }

    _updateHeaderStats() {
        const remaining = this.boardCards.length + this.trayCards.length + this.extractedCards.length;
        this.remainingCountEl.textContent = remaining;
        const pct = Math.max(0, (remaining / this.totalCardsInLevel) * 100);
        this.progressBar.style.width = `${pct}%`;
    }

    /**
     * Check if game has ended (Win or Loss)
     */
    _checkGameStatus() {
        const totalRemaining = this.boardCards.length + this.trayCards.length + this.extractedCards.length;

        // VICTORY!
        if (totalRemaining === 0) {
            clearInterval(this.timerInterval);
            this.audio.playVictory();
            this.particles.celebrateShower();

            // Show Victory Modal
            setTimeout(() => {
                document.getElementById('winScore').textContent = this.score;
                document.getElementById('winTime').textContent = this.timerEl.textContent;
                this.victoryModal.classList.remove('hidden');
                this._saveProgress();
            }, 500);
            return;
        }

        // DEFEAT: Tray has 7 cards and no 3-match
        if (this.trayCards.length >= 7) {
            this.audio.playGameOver();
            setTimeout(() => {
                document.getElementById('defeatRemaining').textContent = totalRemaining;
                this.defeatModal.classList.remove('hidden');
            }, 300);
        }
    }

    /* ==========================================================================
       Power-up Handlers (Undo, Shuffle, Extract)
       ========================================================================== */

    /**
     * 1. 撤回 (Undo / 回溯時光)
     */
    handleUndo() {
        if (this.powerups.undo <= 0 || this.undoStack.length === 0 || this.isProcessingMove) return;

        const lastAction = this.undoStack.pop();
        this.powerups.undo--;
        this._updatePowerupUI();

        const { card, trayIndex } = lastAction;

        // Remove from tray
        const currentTrayIdx = this.trayCards.indexOf(card);
        if (currentTrayIdx > -1) {
            this.trayCards.splice(currentTrayIdx, 1);
        }
        this._renderTrayDOM();

        // Restore to board
        this.boardCards.push(card);
        const { left, top } = this._getPixelCoords(card.unitX, card.unitY, card.layer);
        const iconData = window.TILE_ICONS[card.iconKey];

        const el = document.createElement('div');
        el.className = 'desk-card';
        el.id = card.id;
        el.dataset.icon = card.iconKey;
        el.style.left = `${left}px`;
        el.style.top = `${top}px`;
        el.style.zIndex = card.layer * 10;

        el.innerHTML = `
            <div class="card-inner">
                <div class="card-icon-wrap">
                    ${iconData.svg}
                </div>
            </div>
            <div class="card-shadow-layer"></div>
        `;

        el.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleCardClick(card);
        });

        card.el = el;
        this.boardEl.appendChild(el);

        // Sound & Occlusion update
        this.audio.playUndo();
        this._updateOcclusion();
        this._updateHeaderStats();
    }

    /**
     * 2. 洗牌 (Shuffle / 桌面重整)
     */
    handleShuffle() {
        if (this.powerups.shuffle <= 0 || this.boardCards.length <= 1 || this.isProcessingMove) return;

        this.powerups.shuffle--;
        this._updatePowerupUI();
        this.audio.playShuffle();

        // Collect all icon keys on remaining board cards
        const icons = this.boardCards.map(c => c.iconKey);

        // Fisher-Yates Shuffle
        for (let i = icons.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [icons[i], icons[j]] = [icons[j], icons[i]];
        }

        // Reassign & trigger flip animation
        this.boardCards.forEach((card, idx) => {
            card.iconKey = icons[idx];
            const iconData = window.TILE_ICONS[card.iconKey];

            if (card.el) {
                card.el.classList.add('shuffle-flipping');
                setTimeout(() => {
                    card.el.innerHTML = `
                        <div class="card-inner">
                            <div class="card-icon-wrap">
                                ${iconData.svg}
                            </div>
                        </div>
                        <div class="card-shadow-layer"></div>
                    `;
                    setTimeout(() => card.el.classList.remove('shuffle-flipping'), 150);
                }, 150);
            }
        });
    }

    /**
     * 3. 移出 (Extract / 暫存書籤槽)
     */
    handleExtract(isRevive = false) {
        if (!isRevive && (this.powerups.extract <= 0 || this.trayCards.length === 0 || this.extractedCards.length >= 3)) return;

        if (!isRevive) {
            this.powerups.extract--;
            this._updatePowerupUI();
        }

        this.audio.playExtract();

        // Extract up to 3 cards from the tray into the bookmark shelf
        const extractCount = Math.min(3 - this.extractedCards.length, this.trayCards.length);
        const movedCards = this.trayCards.splice(0, extractCount);

        movedCards.forEach(card => {
            this.extractedCards.push(card);
        });

        // Re-render shelf & tray
        this._renderShelfDOM();
        this._renderTrayDOM();
        this._updateHeaderStats();
    }

    _renderShelfDOM() {
        this.extractShelf.innerHTML = '';
        if (this.extractedCards.length === 0) {
            this.extractShelf.classList.add('empty-shelf');
            this.extractShelf.innerHTML = '<span class="shelf-hint">書籤暫存區（空）</span>';
            return;
        }

        this.extractShelf.classList.remove('empty-shelf');
        this.extractedCards.forEach((card, idx) => {
            const iconData = window.TILE_ICONS[card.iconKey];
            const item = document.createElement('div');
            item.className = 'shelf-card';
            item.innerHTML = `
                <div class="card-inner">
                    <div class="card-icon-wrap">${iconData.svg}</div>
                </div>
            `;

            // Clicking card in shelf moves it back to tray
            item.addEventListener('click', () => {
                if (this.trayCards.length >= 7) {
                    this.audio.playTrayWarning();
                    return;
                }

                // Remove from shelf
                this.extractedCards.splice(idx, 1);
                this._renderShelfDOM();

                // Add to tray
                this.trayCards.push(card);
                this.audio.playCardSnap(1.1);
                this._renderTrayDOM();
                this._checkTrayElimination();
                this._checkGameStatus();
                this._updateHeaderStats();
                this._updatePowerupUI();
            });

            this.extractShelf.appendChild(item);
        });
    }

    _openLevelModal() {
        const grid = document.getElementById('levelListGrid');
        grid.innerHTML = '';

        window.GAME_LEVELS.forEach((lvl, idx) => {
            const btn = document.createElement('button');
            btn.className = `level-select-item ${idx === this.currentLevelIndex ? 'current' : ''}`;
            btn.innerHTML = `
                <div class="level-stamp">第 ${lvl.id} 關</div>
                <div class="level-item-name">${lvl.name}</div>
                <div class="level-item-cards">${lvl.cardPositions.length} 張牌</div>
            `;
            btn.addEventListener('click', () => {
                this.levelModal.classList.add('hidden');
                this.loadLevel(idx);
            });
            grid.appendChild(btn);
        });

        this.levelModal.classList.remove('hidden');
    }
}

// Start Game on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new PaperTileGame();
});
