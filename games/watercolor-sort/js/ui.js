/**
 * Watercolor Sort Puzzle - UI Controller & Fluid Animation Engine
 * Handles rendering, SVG water stream generation, particle effects,
 * modals, and responsive layout.
 * 
 * Clean, flat Morandi watercolor rendering without gradients, stickers, or glass shine.
 */

class WatercolorUI {
    constructor(game) {
        this.game = game;
        this.tubesContainer = document.getElementById('tubesContainer');
        this.pourStreamSvg = document.getElementById('pourStreamSvg');
        this.streamPath = document.getElementById('streamPath');
        this.particleCanvas = document.getElementById('particleCanvas');
        this.particleCtx = this.particleCanvas ? this.particleCanvas.getContext('2d') : null;
        
        this.particles = [];
        this.isParticleLoopRunning = false;

        this._bindUIEvents();
        this._initCanvasResize();
    }

    _bindUIEvents() {
        // Controls
        const undoBtn = document.getElementById('undoBtn');
        const restartBtn = document.getElementById('restartBtn');
        const addTubeBtn = document.getElementById('addTubeBtn');
        const hintBtn = document.getElementById('hintBtn');
        const levelSelectBtn = document.getElementById('levelSelectBtn');
        const soundToggleBtn = document.getElementById('soundToggleBtn');
        const helpBtn = document.getElementById('helpBtn');

        if (undoBtn) undoBtn.addEventListener('click', () => this.game.undo());
        if (restartBtn) restartBtn.addEventListener('click', () => this.game.restart());
        if (addTubeBtn) addTubeBtn.addEventListener('click', () => this.game.addExtraTube());
        if (hintBtn) hintBtn.addEventListener('click', () => this.game.getHint());

        if (soundToggleBtn) {
            soundToggleBtn.addEventListener('click', () => {
                const muted = this.game.audio.toggleMute();
                this._updateSoundIcon(muted);
            });
        }

        // Modals
        if (levelSelectBtn) {
            levelSelectBtn.addEventListener('click', () => this.openLevelSelectModal());
        }
        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.openHelpModal());
        }

        // Close modal buttons
        document.querySelectorAll('.modal-close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal-overlay');
                if (modal) modal.classList.add('hidden');
            });
        });

        // Click outside modal to close
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) overlay.classList.add('hidden');
            });
        });

        // Victory modal next level button
        const nextLevelBtn = document.getElementById('nextLevelBtn');
        if (nextLevelBtn) {
            nextLevelBtn.addEventListener('click', () => {
                document.getElementById('victoryModal').classList.add('hidden');
                this.game.nextLevel();
            });
        }

        // Victory modal replay button
        const victoryReplayBtn = document.getElementById('victoryReplayBtn');
        if (victoryReplayBtn) {
            victoryReplayBtn.addEventListener('click', () => {
                document.getElementById('victoryModal').classList.add('hidden');
                this.game.restart();
            });
        }
    }

    _initCanvasResize() {
        if (!this.particleCanvas) return;
        const resize = () => {
            this.particleCanvas.width = window.innerWidth;
            this.particleCanvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();
    }

    _updateSoundIcon(isMuted) {
        const iconOn = document.getElementById('soundIconOn');
        const iconOff = document.getElementById('soundIconOff');
        if (iconOn && iconOff) {
            if (isMuted) {
                iconOn.classList.add('hidden');
                iconOff.classList.remove('hidden');
            } else {
                iconOn.classList.remove('hidden');
                iconOff.classList.add('hidden');
            }
        }
    }

    /**
     * Render the game board with tubes & liquid layers
     */
    renderBoard(tubes, levelData) {
        this.tubesContainer.innerHTML = '';
        
        // Dynamic grid sizing based on tube count
        const tubeCount = tubes.length;
        if (tubeCount <= 4) {
            this.tubesContainer.className = 'tubes-container layout-compact';
        } else if (tubeCount <= 6) {
            this.tubesContainer.className = 'tubes-container layout-medium';
        } else if (tubeCount <= 8) {
            this.tubesContainer.className = 'tubes-container layout-standard';
        } else {
            this.tubesContainer.className = 'tubes-container layout-wide';
        }

        tubes.forEach((tubeColors, index) => {
            const tubeEl = this._createTubeElement(tubeColors, index);
            this.tubesContainer.appendChild(tubeEl);
        });

        // Header Title update
        const levelNumEl = document.getElementById('levelNumberDisplay');
        const levelTitleEl = document.getElementById('levelTitleDisplay');
        if (levelNumEl) levelNumEl.textContent = `LEVEL ${this.game.currentLevel}`;
        if (levelTitleEl && levelData) levelTitleEl.textContent = levelData.title;
    }

    _createTubeElement(tubeColors, index) {
        const wrapper = document.createElement('div');
        wrapper.className = 'tube-wrapper';
        wrapper.id = `tubeWrapper-${index}`;
        wrapper.dataset.index = index;

        // Check if tube is complete
        const isComplete = (tubeColors.length === TUBE_CAPACITY && tubeColors.every(c => c === tubeColors[0]));

        // Inner Glass Tube (clean hand-drawn outline, NO reflection sheen)
        const glass = document.createElement('div');
        glass.className = 'tube-glass';
        glass.id = `tubeGlass-${index}`;

        // Hand-drawn lip rim at top
        const rim = document.createElement('div');
        rim.className = 'tube-rim';
        glass.appendChild(rim);

        // Tick graduation marks (10ml, 20ml, 30ml)
        const ticks = document.createElement('div');
        ticks.className = 'tube-ticks';
        ticks.innerHTML = `
            <span class="tick tick-3"></span>
            <span class="tick tick-2"></span>
            <span class="tick tick-1"></span>
        `;
        glass.appendChild(ticks);

        // Liquid Layers Container
        const liquidContainer = document.createElement('div');
        liquidContainer.className = 'tube-liquid-container';
        liquidContainer.id = `liquidContainer-${index}`;

        // Render each color layer (bottom to top)
        tubeColors.forEach((colorId, layerIdx) => {
            const layerEl = this._createLiquidLayerElement(colorId, layerIdx, tubeColors.length);
            liquidContainer.appendChild(layerEl);
        });

        glass.appendChild(liquidContainer);

        // Clean Cork Stopper (visible if complete, NO emoji tags)
        const cork = document.createElement('div');
        cork.className = `tube-cork ${isComplete ? 'visible' : ''}`;
        cork.id = `tubeCork-${index}`;
        cork.innerHTML = `
            <div class="cork-body"></div>
        `;
        glass.appendChild(cork);

        wrapper.appendChild(glass);

        // Click event on tube
        wrapper.addEventListener('click', () => {
            this.game.onTubeClick(index);
        });

        return wrapper;
    }

    _createLiquidLayerElement(colorId, layerIdx, totalLayers) {
        const palette = WATERCOLOR_PALETTE[colorId] || WATERCOLOR_PALETTE.matcha;
        const layer = document.createElement('div');
        layer.className = 'liquid-layer';
        layer.dataset.color = colorId;
        // Pure flat solid color, NO gradient
        layer.style.backgroundColor = palette.color;
        layer.style.backgroundImage = 'none';

        return layer;
    }

    /**
     * Tube selection visual elevation
     */
    selectTube(index) {
        const wrapper = document.getElementById(`tubeWrapper-${index}`);
        if (wrapper) {
            wrapper.classList.add('selected');
        }
    }

    /**
     * Tube deselection
     */
    deselectTube(index) {
        const wrapper = document.getElementById(`tubeWrapper-${index}`);
        if (wrapper) {
            wrapper.classList.remove('selected');
        }
    }

    /**
     * Tube wobble animation when clicking a locked / invalid tube
     */
    wobbleTube(index) {
        const wrapper = document.getElementById(`tubeWrapper-${index}`);
        if (wrapper) {
            wrapper.classList.remove('wobble');
            void wrapper.offsetWidth; // Force reflow
            wrapper.classList.add('wobble');
        }
    }

    /**
     * Highlight source and target tubes for hints
     */
    highlightHint(fromIdx, toIdx) {
        const fromWrap = document.getElementById(`tubeWrapper-${fromIdx}`);
        const toWrap = document.getElementById(`tubeWrapper-${toIdx}`);

        if (fromWrap) {
            fromWrap.classList.add('hint-pulse');
            setTimeout(() => fromWrap.classList.remove('hint-pulse'), 1800);
        }
        if (toWrap) {
            toWrap.classList.add('hint-pulse-target');
            setTimeout(() => toWrap.classList.remove('hint-pulse-target'), 1800);
        }

        this.showNotification("已提示最佳傾倒路徑");
    }

    /**
     * Smooth pouring animation
     */
    async animatePour(fromIdx, toIdx, count, colorId, durationMs) {
        const fromWrap = document.getElementById(`tubeWrapper-${fromIdx}`);
        const toWrap = document.getElementById(`tubeWrapper-${toIdx}`);
        if (!fromWrap || !toWrap) return;

        const fromRect = fromWrap.getBoundingClientRect();
        const toRect = toWrap.getBoundingClientRect();

        const fromGlass = document.getElementById(`tubeGlass-${fromIdx}`);
        const toLiquidContainer = document.getElementById(`liquidContainer-${toIdx}`);
        const fromLiquidContainer = document.getElementById(`liquidContainer-${fromIdx}`);

        const isPouringRight = toRect.left >= fromRect.left;
        const tiltAngle = isPouringRight ? 72 : -72;

        // Position offset: place the mouth of fromTube over the mouth of toTube
        const deltaX = toRect.left - fromRect.left + (isPouringRight ? -28 : 28);
        const deltaY = toRect.top - fromRect.top - 54;

        // 1. Move and tilt source tube
        fromWrap.style.zIndex = '50';
        fromGlass.style.transition = 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)';
        fromGlass.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${tiltAngle}deg)`;

        await new Promise(r => setTimeout(r, 360));

        // 2. Draw dynamic watercolor pour stream (solid color)
        const palette = WATERCOLOR_PALETTE[colorId] || WATERCOLOR_PALETTE.matcha;
        this._startStream(fromRect, toRect, isPouringRight, palette.streamColor);

        // 3. Remove poured layers from fromLiquidContainer and add to toLiquidContainer smoothly
        const pourDuration = durationMs - 400;

        // Drain from source
        for (let i = 0; i < count; i++) {
            if (fromLiquidContainer.lastElementChild) {
                fromLiquidContainer.lastElementChild.classList.add('draining');
            }
        }

        // Fill target tube with flat solid liquid
        for (let i = 0; i < count; i++) {
            const currentTotal = toLiquidContainer.children.length;
            const newLayer = this._createLiquidLayerElement(colorId, currentTotal, currentTotal + 1);
            newLayer.classList.add('filling');
            toLiquidContainer.appendChild(newLayer);
            void newLayer.offsetWidth; // Reflow
            newLayer.classList.remove('filling');
            newLayer.classList.add('filled');
        }

        // Spawn gentle water bubbles in target tube
        this._spawnPourParticles(toRect, palette.color, count);

        await new Promise(r => setTimeout(r, pourDuration));

        // 4. End Stream
        this._stopStream();

        // 5. Remove drained elements from fromTube
        for (let i = 0; i < count; i++) {
            const draining = fromLiquidContainer.querySelector('.draining');
            if (draining) draining.remove();
        }

        // 6. Return source tube to rest position
        fromGlass.style.transition = 'transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1)';
        fromGlass.style.transform = 'translate(0px, 0px) rotate(0deg)';
        fromWrap.classList.remove('selected');

        await new Promise(r => setTimeout(r, 400));
        fromWrap.style.zIndex = '1';
        fromGlass.style.transition = '';
        fromGlass.style.transform = '';
    }

    _startStream(fromRect, toRect, isRight, color) {
        if (!this.pourStreamSvg || !this.streamPath) return;

        this.pourStreamSvg.style.display = 'block';

        // Coordinates relative to viewport
        const startX = fromRect.left + (isRight ? 60 : -10);
        const startY = toRect.top - 10;
        const targetX = toRect.left + toRect.width / 2;
        const targetY = toRect.top + 30;

        const pathData = `M ${startX} ${startY} Q ${startX + (isRight ? 15 : -15)} ${startY + 20}, ${targetX} ${targetY}`;
        this.streamPath.setAttribute('d', pathData);
        this.streamPath.setAttribute('stroke', color);
        this.streamPath.classList.add('active-stream');
    }

    _stopStream() {
        if (!this.pourStreamSvg || !this.streamPath) return;
        this.streamPath.classList.remove('active-stream');
        this.pourStreamSvg.style.display = 'none';
    }

    /**
     * Spawns watercolor micro-particles (flat solid circles, no glare)
     */
    _spawnPourParticles(rect, color, count) {
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height * 0.45;

        for (let i = 0; i < count * 5; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y + (Math.random() - 0.5) * 24,
                vx: (Math.random() - 0.5) * 1.6,
                vy: -(Math.random() * 2.2 + 1.0),
                radius: Math.random() * 2.5 + 1.5,
                color: color,
                alpha: 0.8,
                decay: 0.025 + Math.random() * 0.02
            });
        }

        if (!this.isParticleLoopRunning) {
            this._runParticleLoop();
        }
    }

    _runParticleLoop() {
        if (!this.particleCtx) return;
        this.isParticleLoopRunning = true;

        const step = () => {
            this.particleCtx.clearRect(0, 0, this.particleCanvas.width, this.particleCanvas.height);

            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= p.decay;

                if (p.alpha <= 0) {
                    this.particles.splice(i, 1);
                    continue;
                }

                this.particleCtx.save();
                this.particleCtx.globalAlpha = p.alpha;
                this.particleCtx.fillStyle = p.color;
                this.particleCtx.beginPath();
                this.particleCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.particleCtx.fill();
                this.particleCtx.restore();
            }

            if (this.particles.length > 0) {
                requestAnimationFrame(step);
            } else {
                this.isParticleLoopRunning = false;
            }
        };

        requestAnimationFrame(step);
    }

    /**
     * Cap tube with cork stopper when complete
     */
    sealTubeWithCork(tubeIndex, colorId) {
        const cork = document.getElementById(`tubeCork-${tubeIndex}`);
        const wrapper = document.getElementById(`tubeWrapper-${tubeIndex}`);
        if (cork && wrapper) {
            cork.classList.add('visible');
            wrapper.classList.add('tube-completed');

            // Gentle solid particle burst
            const rect = wrapper.getBoundingClientRect();
            for (let i = 0; i < 12; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 3.0 + 1.0;
                this.particles.push({
                    x: rect.left + rect.width / 2,
                    y: rect.top + 15,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    radius: Math.random() * 2.5 + 1.5,
                    color: '#BA8E5E', // Solid cork tone
                    alpha: 0.9,
                    decay: 0.025
                });
            }
            if (!this.isParticleLoopRunning) {
                this._runParticleLoop();
            }
        }
    }

    /**
     * Notification message toast
     */
    showNotification(msg) {
        const toast = document.getElementById('toastNotice');
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.remove('hidden');
        toast.classList.remove('fade-out');
        
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.classList.add('hidden'), 350);
        }, 2200);
    }

    /**
     * Update bottom control states
     */
    updateControls(state) {
        const undoBtn = document.getElementById('undoBtn');
        const addTubeBadge = document.getElementById('addTubeBadge');
        
        if (undoBtn) {
            undoBtn.disabled = !state.canUndo;
            undoBtn.style.opacity = state.canUndo ? '1' : '0.45';
        }

        if (addTubeBadge) {
            addTubeBadge.textContent = state.extraTubesLeft !== undefined ? state.extraTubesLeft : '2';
        }
    }

    /**
     * Show Victory Modal
     */
    async showVictoryModal(clearedLevel) {
        const modal = document.getElementById('victoryModal');
        const titleEl = document.getElementById('victoryLevelTitle');
        if (!modal) return;

        if (titleEl) {
            titleEl.textContent = `第 ${clearedLevel} 關 · ${CURATED_LEVELS[clearedLevel - 1].title}`;
        }

        // Gentle solid confetti particles
        const paletteList = ['#8FA87B', '#A898BA', '#E8A598', '#88B2C4', '#E5B869'];
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 1.5;
            this.particles.push({
                x: window.innerWidth / 2,
                y: window.innerHeight * 0.45,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.2,
                radius: Math.random() * 3 + 1.5,
                color: paletteList[Math.floor(Math.random() * paletteList.length)],
                alpha: 0.9,
                decay: 0.018
            });
        }
        if (!this.isParticleLoopRunning) {
            this._runParticleLoop();
        }

        await new Promise(r => setTimeout(r, 500));
        modal.classList.remove('hidden');
    }

    /**
     * Open Level Select Modal
     */
    openLevelSelectModal() {
        const modal = document.getElementById('levelSelectModal');
        const grid = document.getElementById('levelGrid');
        if (!modal || !grid) return;

        grid.innerHTML = '';

        CURATED_LEVELS.forEach(lvl => {
            const btn = document.createElement('button');
            const isCompleted = this.game.completedLevels.has(lvl.level);
            const isCurrent = (this.game.currentLevel === lvl.level);

            btn.className = `level-grid-btn ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`;
            btn.innerHTML = `
                <span class="lvl-num">${lvl.level}</span>
                <span class="lvl-name">${lvl.title}</span>
                ${isCompleted ? '<span class="lvl-star">✓</span>' : ''}
            `;

            btn.addEventListener('click', () => {
                this.game.loadLevel(lvl.level);
                modal.classList.add('hidden');
            });

            grid.appendChild(btn);
        });

        modal.classList.remove('hidden');
    }

    /**
     * Open Help / Rules Modal
     */
    openHelpModal() {
        const modal = document.getElementById('helpModal');
        if (modal) modal.classList.remove('hidden');
    }
}

window.WatercolorUI = WatercolorUI;
