/**
 * One-Stroke Line Puzzle Canvas & SVG Renderer
 * Renders smooth continuous pencil strokes, pastel tiles, particle effects, and hints.
 */

class PuzzleRenderer {
    constructor(boardElement, svgLineLayer, fxCanvas) {
        this.board = boardElement;
        this.svg = svgLineLayer;
        this.fxCanvas = fxCanvas;
        this.fxCtx = fxCanvas ? fxCanvas.getContext('2d') : null;
        this.particles = [];
        this.animFrame = null;

        // Level theme palettes (Rich Macaron pastel tones, clearly visible and cozy)
        this.palettes = [
            { path: '#C25B49', fill: '#EEAFA3', active: '#DE7F6F', name: 'Rose Macaron' },
            { path: '#629352', fill: '#B8DDB0', active: '#8EBE80', name: 'Pistachio Macaron' },
            { path: '#AE892E', fill: '#F5DE98', active: '#D6AE4D', name: 'Vanilla Buttercream' },
            { path: '#487CAB', fill: '#B2D3EE', active: '#72A1CF', name: 'Sea Salt Macaron' },
            { path: '#7554A8', fill: '#CDBAE8', active: '#9A7DCA', name: 'Lavender Macaron' },
            { path: '#BF6136', fill: '#F2B99D', active: '#DF845C', name: 'Peach Macaron' },
            { path: '#448F7F', fill: '#AEE0D4', active: '#6DB7A7', name: 'Mint Macaron' },
            { path: '#7A5E4B', fill: '#D2BEAE', active: '#A38772', name: 'Earl Grey Macaron' }
        ];

        this.currentPalette = this.palettes[0];
        this.resizeFxCanvas();
        window.addEventListener('resize', () => this.resizeFxCanvas());
        this.loopFx();
    }

    setTheme(levelId) {
        const idx = (levelId - 1) % this.palettes.length;
        this.currentPalette = this.palettes[idx];
    }

    resizeFxCanvas() {
        if (!this.fxCanvas) return;
        const rect = this.fxCanvas.parentElement.getBoundingClientRect();
        this.fxCanvas.width = rect.width * window.devicePixelRatio;
        this.fxCanvas.height = rect.height * window.devicePixelRatio;
        this.fxCanvas.style.width = `${rect.width}px`;
        this.fxCanvas.style.height = `${rect.height}px`;
        if (this.fxCtx) {
            this.fxCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
        }
    }

    /**
     * Re-draw the stroke line connecting visited tiles
     */
    renderPath(path, level, hintStep = null) {
        if (!this.svg) return;
        const cells = this.board.querySelectorAll('.cell');
        if (!cells || cells.length === 0) return;

        // Get coordinates for each cell
        const cellMap = new Map();
        cells.forEach(el => {
            const r = parseInt(el.dataset.row);
            const c = parseInt(el.dataset.col);
            cellMap.set(`${r},${c}`, el);
        });

        // Clear existing SVG paths
        this.svg.innerHTML = '';

        if (!path || path.length === 0) return;

        const boardRect = this.board.getBoundingClientRect();

        // Helper to get center point relative to board
        const getCenter = (r, c) => {
            const el = cellMap.get(`${r},${c}`);
            if (!el) return null;
            const rct = el.getBoundingClientRect();
            return {
                x: rct.left - boardRect.left + rct.width / 2,
                y: rct.top - boardRect.top + rct.height / 2,
                w: rct.width
            };
        };

        // Draw connected line segments (split across portal warps if any)
        const segments = [];
        let currentSegment = [];

        for (let i = 0; i < path.length; i++) {
            const curr = path[i];
            const pt = getCenter(curr[0], curr[1]);
            if (!pt) continue;

            if (i > 0) {
                const prev = path[i - 1];
                const dr = Math.abs(curr[0] - prev[0]);
                const dc = Math.abs(curr[1] - prev[1]);
                // If jumped more than 1 cell orthogonally, this was a portal warp
                if (dr + dc > 1) {
                    if (currentSegment.length > 0) {
                        segments.push(currentSegment);
                    }
                    currentSegment = [];
                }
            }
            currentSegment.push(pt);
        }
        if (currentSegment.length > 0) {
            segments.push(currentSegment);
        }

        // Create SVG Polyline for each continuous segment
        segments.forEach(seg => {
            if (seg.length > 1) {
                const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                let d = `M ${seg[0].x} ${seg[0].y}`;
                for (let i = 1; i < seg.length; i++) {
                    d += ` L ${seg[i].x} ${seg[i].y}`;
                }
                polyline.setAttribute('d', d);
                polyline.setAttribute('fill', 'none');
                polyline.setAttribute('stroke', this.currentPalette.path);
                polyline.setAttribute('stroke-width', Math.max(12, seg[0].w * 0.28));
                polyline.setAttribute('stroke-linecap', 'round');
                polyline.setAttribute('stroke-linejoin', 'round');
                polyline.setAttribute('opacity', '0.9');
                this.svg.appendChild(polyline);
            }
        });

        // Draw Hint Line if provided
        if (hintStep && path.length > 0) {
            const last = path[path.length - 1];
            const pt1 = getCenter(last[0], last[1]);
            const pt2 = getCenter(hintStep[0], hintStep[1]);
            if (pt1 && pt2) {
                const hintPath = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                hintPath.setAttribute('x1', pt1.x);
                hintPath.setAttribute('y1', pt1.y);
                hintPath.setAttribute('x2', pt2.x);
                hintPath.setAttribute('y2', pt2.y);
                hintPath.setAttribute('stroke', '#FFA94D');
                hintPath.setAttribute('stroke-width', Math.max(8, pt1.w * 0.22));
                hintPath.setAttribute('stroke-linecap', 'round');
                hintPath.setAttribute('stroke-dasharray', '8, 8');
                hintPath.setAttribute('class', 'hint-stroke-pulse');
                this.svg.appendChild(hintPath);
            }
        }

        // Draw Head Dot indicator at current stroke end
        const lastStep = path[path.length - 1];
        const lastPt = getCenter(lastStep[0], lastStep[1]);
        if (lastPt) {
            const headG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            headG.setAttribute('class', 'stroke-head-glow');

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', lastPt.x);
            circle.setAttribute('cy', lastPt.y);
            circle.setAttribute('r', Math.max(10, lastPt.w * 0.24));
            circle.setAttribute('fill', '#FFFFFF');
            circle.setAttribute('stroke', this.currentPalette.path);
            circle.setAttribute('stroke-width', '4');

            // Sweet inner dot
            const inner = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            inner.setAttribute('cx', lastPt.x);
            inner.setAttribute('cy', lastPt.y);
            inner.setAttribute('r', Math.max(4, lastPt.w * 0.1));
            inner.setAttribute('fill', this.currentPalette.path);

            headG.appendChild(circle);
            headG.appendChild(inner);
            this.svg.appendChild(headG);
        }
    }

    /**
     * Spawn victory celebration particles
     */
    triggerVictoryCelebration() {
        if (!this.fxCanvas || !this.fxCanvas.parentElement) return;
        const rect = this.fxCanvas.parentElement.getBoundingClientRect();
        const colors = ['#EEAFA3', '#B8DDB0', '#F5DE98', '#B2D3EE', '#CDBAE8', '#F2B99D', '#AEE0D4', '#D2BEAE'];

        for (let i = 0; i < 70; i++) {
            this.particles.push({
                x: rect.width / 2 + (Math.random() - 0.5) * 120,
                y: rect.height / 2 + (Math.random() - 0.5) * 80,
                vx: (Math.random() - 0.5) * 9,
                vy: -Math.random() * 8 - 4,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.2,
                alpha: 1,
                decay: Math.random() * 0.012 + 0.01
            });
        }
    }

    loopFx() {
        if (this.fxCtx && this.fxCanvas) {
            const rect = this.fxCanvas.parentElement.getBoundingClientRect();
            this.fxCtx.clearRect(0, 0, rect.width, rect.height);

            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.25; // gravity
                p.vx *= 0.98;
                p.rotation += p.vRot;
                p.alpha -= p.decay;

                if (p.alpha <= 0) {
                    this.particles.splice(i, 1);
                    continue;
                }

                this.fxCtx.save();
                this.fxCtx.translate(p.x, p.y);
                this.fxCtx.rotate(p.rotation);
                this.fxCtx.globalAlpha = Math.max(0, p.alpha);
                this.fxCtx.fillStyle = p.color;

                // Alternate between square confetti, circles, and cute stars
                if (i % 3 === 0) {
                    this.fxCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                } else if (i % 3 === 1) {
                    this.fxCtx.beginPath();
                    this.fxCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    this.fxCtx.fill();
                } else {
                    // Small diamond
                    this.fxCtx.beginPath();
                    this.fxCtx.moveTo(0, -p.size / 2);
                    this.fxCtx.lineTo(p.size / 2, 0);
                    this.fxCtx.lineTo(0, p.size / 2);
                    this.fxCtx.lineTo(-p.size / 2, 0);
                    this.fxCtx.closePath();
                    this.fxCtx.fill();
                }

                this.fxCtx.restore();
            }
        }

        this.animFrame = requestAnimationFrame(() => this.loopFx());
    }
}

window.PuzzleRenderer = PuzzleRenderer;
