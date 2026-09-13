/**
 * Notebook Arcade Portal - Main Logic & Controller
 * English interface with Bilingual (English & Chinese) Instructions.
 */

const GAME_DATA = {
    suika: {
        id: 'suika',
        title: 'Suika Game',
        subtitle: '西瓜遊戲',
        path: 'games/suika-game/index.html',
        instructions: [
            {
                titleEn: 'How to Play',
                titleZh: '玩法說明',
                textEn: 'Move mouse or finger horizontally to position the fruit. Click or tap to drop.',
                textZh: '滑動滑鼠或在螢幕上滑動手指調整水果位置，點擊即可投擲水果。'
            },
            {
                titleEn: 'Merging Rules',
                titleZh: '合成規則',
                textEn: 'When two matching fruits collide, they merge into the next larger fruit tier.',
                textZh: '兩個相同的水果互相碰撞時，會自動合成升級為下一個體積更大的水果。'
            },
            {
                titleEn: 'Game Over',
                titleZh: '結束條件',
                textEn: 'If fruits pile up and cross the top dashed danger line, the game ends.',
                textZh: '若水果堆疊超過頂部的虛線警戒線，遊戲即結束。'
            }
        ]
    },
    '2048': {
        id: '2048',
        title: '2048',
        subtitle: '2048',
        path: 'games/game-2048/index.html',
        instructions: [
            {
                titleEn: 'How to Play',
                titleZh: '玩法說明',
                textEn: 'Use arrow keys (Up, Down, Left, Right), drag with mouse, or swipe on screen to slide tiles.',
                textZh: '使用鍵盤方向鍵（上下左右）、滑鼠拖曳或觸控滑動來移動盤面所有方塊。'
            },
            {
                titleEn: 'Merging Rules',
                titleZh: '合併規則',
                textEn: 'Tiles with the same number merge into one when they collide (2+2=4, 4+4=8).',
                textZh: '相同數字的方塊碰撞時會相加合併（例：2+2=4，4+4=8），並在空格隨機生成新方塊。'
            },
            {
                titleEn: 'Objective',
                titleZh: '遊戲目標',
                textEn: 'Merge tiles continuously before the grid fills up. Challenge yourself to reach 2048!',
                textZh: '在盤面填滿且無法移動前，持續合併挑戰達到 2048 方塊與更高分數。'
            }
        ]
    },
    bubble: {
        id: 'bubble',
        title: 'Bubble Shooter',
        subtitle: '泡泡射擊',
        path: 'games/bubble-shooter/index.html',
        instructions: [
            {
                titleEn: 'How to Play',
                titleZh: '玩法說明',
                textEn: 'Move cursor to aim the trajectory line. Click or tap to shoot. Press [SWAP] or [C] to swap bubbles.',
                textZh: '移動游標調整射擊角度，點擊發射泡泡；可點擊 [SWAP] 或按鍵盤 [C] 切換手上的預備球。'
            },
            {
                titleEn: 'Popping Rules',
                titleZh: '消除規則',
                textEn: 'Connect 3 or more bubbles of the same color to pop them and clear the board.',
                textZh: '射出的泡泡與盤面上同色泡泡相連達到 3 個或以上時，即會連鎖爆破消除。'
            },
            {
                titleEn: 'Game Over',
                titleZh: '結束條件',
                textEn: 'The ceiling lowers after misses. The game ends if bubbles reach the bottom boundary line.',
                textZh: '未產生消除時天花板次數減少並會向下推擠，若泡泡碰觸到下方警戒線則遊戲結束。'
            }
        ]
    },
    oneline: {
        id: 'oneline',
        title: 'One Line',
        subtitle: '一筆畫',
        path: 'games/one-stroke-puzzle/index.html',
        instructions: [
            {
                titleEn: 'How to Play',
                titleZh: '玩法說明',
                textEn: 'Start from the initial node. Drag through all blocks in one continuous stroke without lifting.',
                textZh: '由起點圓圈開始，按住並拖動路徑連通方格，必須一筆到底將盤面所有格子填滿。'
            },
            {
                titleEn: 'Rules & Constraints',
                titleZh: '規則限制',
                textEn: 'You cannot overlap paths or retrace visited cells in a single run.',
                textZh: '路徑不能重複走過同一格子，也不可以在中途抬筆中斷。'
            },
            {
                titleEn: 'Assistance',
                titleZh: '輔助功能',
                textEn: 'Stuck? Tap [HINT] to reveal the next step or [UNDO] to backtrack.',
                textZh: '遇到卡關時可點選 [HINT] 查看下一步提示，或點選 [UNDO] 復原上一步。'
            }
        ]
    }
};

class PortalController {
    constructor() {
        this.currentGame = null;
        this.pendingGameKey = null;

        // Elements
        this.lobbyView = document.getElementById('lobbyView');
        this.gamePlayerView = document.getElementById('gamePlayerView');
        this.gameFrame = document.getElementById('gameFrame');

        this.instructionModal = document.getElementById('instructionModal');
        this.modalGameTitle = document.getElementById('modalGameTitle');
        this.modalGameSubtitle = document.getElementById('modalGameSubtitle');
        this.modalGameContent = document.getElementById('modalGameContent');
        this.btnCancelModal = document.getElementById('btnCancelModal');
        this.btnConfirmStart = document.getElementById('btnConfirmStart');

        this.btnBackToLobby = document.getElementById('btnBackToLobby');
        this.btnShowRulesInGame = document.getElementById('btnShowRulesInGame');
        this.btnFullscreen = document.getElementById('btnFullscreen');
        this.dockTabBtns = document.querySelectorAll('.dock-tab-btn[data-game]');

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.handleHashChange();
        window.addEventListener('hashchange', () => this.handleHashChange());
    }

    setupEventListeners() {
        // Lobby Card Clicks
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', () => {
                const gameKey = card.getAttribute('data-game');
                if (gameKey && GAME_DATA[gameKey]) {
                    this.showInstructions(gameKey);
                }
            });
        });

        // Lobby Play Button Clicks
        document.querySelectorAll('.btn-play').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const gameKey = btn.getAttribute('data-target');
                if (gameKey && GAME_DATA[gameKey]) {
                    this.showInstructions(gameKey);
                }
            });
        });

        // Modal Action: Cancel
        if (this.btnCancelModal) {
            this.btnCancelModal.addEventListener('click', () => {
                this.hideInstructions();
            });
        }

        // Modal Action: Confirm & Start Play
        if (this.btnConfirmStart) {
            this.btnConfirmStart.addEventListener('click', () => {
                const targetKey = this.pendingGameKey;
                this.hideInstructions();
                if (targetKey && GAME_DATA[targetKey]) {
                    window.location.hash = targetKey;
                }
            });
        }

        // Close modal on clicking backdrop
        if (this.instructionModal) {
            this.instructionModal.addEventListener('click', (e) => {
                if (e.target === this.instructionModal) {
                    this.hideInstructions();
                }
            });
        }

        // Floating Dock: Back to Lobby
        if (this.btnBackToLobby) {
            this.btnBackToLobby.addEventListener('click', () => {
                window.location.hash = 'lobby';
            });
        }

        // Floating Dock: Switch Games (shows instruction first)
        this.dockTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const gameKey = btn.getAttribute('data-game');
                if (gameKey && GAME_DATA[gameKey] && gameKey !== this.currentGame) {
                    this.showInstructions(gameKey);
                }
            });
        });

        // Floating Dock: Show Rules of current game
        if (this.btnShowRulesInGame) {
            this.btnShowRulesInGame.addEventListener('click', () => {
                if (this.currentGame && GAME_DATA[this.currentGame]) {
                    this.showInstructions(this.currentGame);
                }
            });
        }

        // Floating Dock: Fullscreen
        if (this.btnFullscreen) {
            this.btnFullscreen.addEventListener('click', () => {
                this.toggleFullscreen();
            });
        }

        // Keyboard navigation
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (!this.instructionModal.classList.contains('hidden')) {
                    this.hideInstructions();
                } else if (this.currentGame) {
                    window.location.hash = 'lobby';
                }
            } else if (e.key === 'Enter') {
                if (!this.instructionModal.classList.contains('hidden') && this.pendingGameKey) {
                    const targetKey = this.pendingGameKey;
                    this.hideInstructions();
                    window.location.hash = targetKey;
                }
            }
        });

        document.addEventListener('fullscreenchange', () => {
            this.updateFullscreenIcon();
        });
    }

    showInstructions(gameKey) {
        const game = GAME_DATA[gameKey];
        if (!game) return;

        this.pendingGameKey = gameKey;
        this.modalGameTitle.textContent = game.title.toUpperCase();
        if (this.modalGameSubtitle) {
            this.modalGameSubtitle.textContent = game.subtitle;
        }

        // Populate bilingual sections
        this.modalGameContent.innerHTML = game.instructions.map(item => `
            <div class="instruction-section">
                <div class="instruction-section-title">
                    <span class="sec-title-en">${item.titleEn}</span>
                    <span class="sec-title-divider">/</span>
                    <span class="sec-title-zh">${item.titleZh}</span>
                </div>
                <p class="instruction-section-text-en">${item.textEn}</p>
                <p class="instruction-section-text-zh">${item.textZh}</p>
            </div>
        `).join('');

        this.instructionModal.classList.remove('hidden');
    }

    hideInstructions() {
        this.pendingGameKey = null;
        this.instructionModal.classList.add('hidden');
    }

    handleHashChange() {
        const rawHash = window.location.hash.replace('#', '').trim().toLowerCase();

        if (GAME_DATA[rawHash]) {
            this.openGame(rawHash);
        } else {
            this.openLobby();
        }
    }

    openGame(gameKey) {
        const game = GAME_DATA[gameKey];
        if (!game) return;

        this.currentGame = gameKey;
        document.title = `${game.title} - Notebook Arcade`;

        // Set iframe source
        if (!this.gameFrame.src.endsWith(game.path)) {
            this.gameFrame.src = game.path;
        }

        // Show game view, hide lobby
        this.lobbyView.classList.add('hidden');
        this.gamePlayerView.classList.remove('hidden');

        // Update active tab in floating dock
        this.dockTabBtns.forEach(btn => {
            if (btn.getAttribute('data-game') === gameKey) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Auto focus iframe for keyboard input
        setTimeout(() => {
            try {
                this.gameFrame.contentWindow?.focus();
            } catch (err) {}
        }, 200);
    }

    openLobby() {
        this.currentGame = null;
        document.title = 'Notebook Arcade';

        // Stop background game loops and audio
        if (this.gameFrame.src !== 'about:blank') {
            this.gameFrame.src = 'about:blank';
        }

        this.gamePlayerView.classList.add('hidden');
        this.lobbyView.classList.remove('hidden');
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            }
        }
    }

    updateFullscreenIcon() {
        const isFull = !!document.fullscreenElement;
        const iconExpand = document.querySelector('.icon-expand');
        const iconCompress = document.querySelector('.icon-compress');

        if (iconExpand && iconCompress) {
            if (isFull) {
                iconExpand.classList.add('hidden');
                iconCompress.classList.remove('hidden');
            } else {
                iconExpand.classList.remove('hidden');
                iconCompress.classList.add('hidden');
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.portal = new PortalController();
});
