/**
 * Multi-input Manager: Keyboard, Touch Swipe, and Mouse Drag
 */

class InputManager {
    constructor(targetElement, onMoveCallback) {
        this.target = targetElement;
        this.onMove = onMoveCallback;

        this.startX = 0;
        this.startY = 0;
        this.isMouseDown = false;
        this.minDistance = 22; // Pixels required to register swipe/drag

        this.bindEvents();
    }

    bindEvents() {
        // 1. Keyboard Events
        window.addEventListener('keydown', (e) => {
            const keyMap = {
                'ArrowUp': 'up',
                'KeyW': 'up',
                'ArrowDown': 'down',
                'KeyS': 'down',
                'ArrowLeft': 'left',
                'KeyA': 'left',
                'ArrowRight': 'right',
                'KeyD': 'right'
            };

            const direction = keyMap[e.code];
            if (direction) {
                e.preventDefault();
                this.onMove(direction);
            }
        });

        // 2. Touch Events for Mobile / Tablet Swipe
        this.target.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) return;
            this.startX = e.touches[0].clientX;
            this.startY = e.touches[0].clientY;
        }, { passive: true });

        this.target.addEventListener('touchmove', (e) => {
            // Prevent page scrolling while playing on the board
            if (e.cancelable) {
                e.preventDefault();
            }
        }, { passive: false });

        this.target.addEventListener('touchend', (e) => {
            if (e.changedTouches.length === 0) return;
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;

            const dx = endX - this.startX;
            const dy = endY - this.startY;
            this.handleDelta(dx, dy);
        }, { passive: true });

        // 3. Mouse Drag / Flick Events for Desktop
        this.target.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return; // Left click only
            this.isMouseDown = true;
            this.startX = e.clientX;
            this.startY = e.clientY;
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isMouseDown) return;
            // Optionally could provide drag visual feedback
        });

        window.addEventListener('mouseup', (e) => {
            if (!this.isMouseDown) return;
            this.isMouseDown = false;
            const dx = e.clientX - this.startX;
            const dy = e.clientY - this.startY;
            this.handleDelta(dx, dy);
        });
    }

    handleDelta(dx, dy) {
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);

        if (Math.max(absX, absY) < this.minDistance) {
            return; // Too short, consider it a tap or click
        }

        if (absX > absY) {
            // Horizontal move
            this.onMove(dx > 0 ? 'right' : 'left');
        } else {
            // Vertical move
            this.onMove(dy > 0 ? 'down' : 'up');
        }
    }
}
