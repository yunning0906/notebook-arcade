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
    },
    block: {
        id: 'block',
        title: 'Block Puzzle',
        subtitle: '方塊拼圖',
        path: 'games/block-puzzle/index.html',
        instructions: [
            {
                titleEn: 'How to Play',
                titleZh: '玩法說明',
                textEn: 'Drag the 3 hand-drawn geometric pieces from the bottom tray and fit them onto the graph paper grid.',
                textZh: '將下方隨機給予的 3 個手繪幾何方塊拖曳填入方格紙棋盤中。'
            },
            {
                titleEn: 'Line Clear & Arpeggio',
                titleZh: '消除與木琴琶音',
                textEn: 'Fill any entire row or column to clear it with crisp xylophone arpeggios (C-D-E-F-G-A-B-C) and sparkle particles.',
                textZh: '湊滿整行或整列即可觸發消除，伴隨如同木琴琶音的連續清脆消除音與小火花紙屑。'
            },
            {
                titleEn: 'Modes & Game Over',
                titleZh: '模式與結束條件',
                textEn: 'Switch between 10×10 and 8×8 modes. The game ends when none of the remaining hand pieces can fit anywhere.',
                textZh: '可自由切換 10×10 經典與 8×8 緊湊模式；當底部的剩餘方塊皆無法放入棋盤時遊戲結束。'
            }
        ]
    },
    nonogram: {
        id: 'nonogram',
        title: 'Nonogram',
        subtitle: '數織·像素塗色',
        path: 'games/nonogram-puzzle/index.html',
        instructions: [
            {
                titleEn: 'Clue Deduction',
                titleZh: '線索邏輯推理',
                textEn: 'Use the numbers at the top and left headers. Numbers indicate consecutive runs of filled cells.',
                textZh: '根據每一行、每一列開頭的數字線索，數字代表該行列連續塗滿的格子數量。'
            },
            {
                titleEn: 'Pencil & Cross Tools',
                titleZh: '鉛筆塗色與標記',
                textEn: 'Use pencil [1] to shade squares with authentic graphite sounds. Use cross [2] or right-click to mark empty cells.',
                textZh: '使用鉛筆 [1] 塗黑格子並伴隨沙沙聲；使用叉叉 [2] 或滑鼠右鍵標記確定為空的方格。'
            },
            {
                titleEn: 'Pastel Blossom',
                titleZh: '通關粉彩綻放',
                textEn: 'Complete the puzzle to see the sketch magically bloom into a soft pastel colored-pencil illustration and collect it in your sketchbook!',
                textZh: '完成所有格子後，整幅鉛筆速寫將無縫綻放為柔和粉彩色插圖，並永久收藏於手繪畫廊！'
            }
        ]
    },
    snake: {
        id: 'snake',
        title: 'Doodle Snake',
        subtitle: '手繪毛毛蟲漫步',
        path: 'games/doodle-snake/index.html',
        instructions: [
            {
                titleEn: 'Paper Stroll',
                titleZh: '紙上漫步玩法',
                textEn: 'Guide the pastel caterpillar across the notebook grid peacefully.',
                textZh: '引導小毛毛蟲在溫暖的方格本上悠閒漫步，享受安靜舒心的紙上探索。'
            },
            {
                titleEn: 'Delicious Fruits & Growth',
                titleZh: '採集甜美果實',
                textEn: 'Eat randomly dropped hand-drawn cherries and strawberries to grow longer, trigger sparkling confetti, and hear crystal bell chimes.',
                textZh: '品嚐隨機出現的手繪櫻桃與草莓讓身體逐漸變長，觸發彩色鉛筆彩屑特效與清脆鈴鐺聲。'
            },
            {
                titleEn: 'Elastic Water Drop & Pacing',
                titleZh: '水滴噗嚕音與邊界規則',
                textEn: 'Turning emits elastic water droplet bloops! Freely choose between margin wrapping or wall collision.',
                textZh: '每一次轉動都有彈性的小小水滴噗嚕音，並可自由切換邊界穿牆或紙張邊界規則。'
            }
        ]
    },
    garden: {
        id: 'garden',
        title: 'Garden Sweeper',
        subtitle: '花園掃雷',
        path: 'games/garden-sweeper/index.html',
        instructions: [
            {
                titleEn: 'How to Play',
                titleZh: '玩法說明',
                textEn: 'Click unrevealed dirt patches to turn the soil. Numbers indicate how many flower seedlings are hidden in the 8 neighboring cells.',
                textZh: '點擊未翻開的泥土方格進行翻土。翻開後顯示的數字，代表其周圍相鄰 8 格中隱藏的花苗總數。'
            },
            {
                titleEn: 'Seedling Flags',
                titleZh: '標記花苗',
                textEn: 'Right-click or toggle the Seedling Marker tool to plant a seedling tag on suspected flowers.',
                textZh: '使用滑鼠右鍵或切換下方園藝工具，在確定埋有花苗的格子插上可愛的花苗標籤。'
            },
            {
                titleEn: 'Gentle Experience',
                titleZh: '溫馨無挫折體驗',
                textEn: 'Accidentally hit a weed? No frustration! Gently pull the weed to continue tending your blooming garden.',
                textZh: '點到雜草不會爆炸！可溫柔拔除雜草換上花苗籤繼續培育，直到整座花園綻放萬紫千紅！'
            }
        ]
    },
    tile: {
        id: 'tile',
        title: 'Paper Tiles',
        subtitle: '卡牌收納三消',
        path: 'games/tile-match-puzzle/index.html',
        instructions: [
            {
                titleEn: 'Layered Cards',
                titleZh: '紙牌疊層玩法',
                textEn: 'Click free paper cards on the desk to collect them into your bottom 7-slot storage tray.',
                textZh: '點選桌面上未被其他紙片壓住的自由卡牌，卡片會流暢飛入底部的 7 格收納托盤中。'
            },
            {
                titleEn: 'Match 3 Elimination',
                titleZh: '三消整齊收納',
                textEn: 'When 3 cards of the same hand-drawn icon gather in the tray, they cleanly eliminate with sparkle confetti!',
                textZh: '當托盤中集齊 3 張相同圖標的手繪卡牌時，將自動整齊消除並觸發彩色紙屑特效！'
            },
            {
                titleEn: 'Tray & Power-ups',
                titleZh: '托盤管理與文具道具',
                textEn: 'Do not let all 7 tray slots fill up! Use Undo, Shuffle, and Bookmark Extract power-ups to clear the desk.',
                textZh: '切記不要讓 7 格托盤完全塞滿！可善用回溯時光、重新整理與書籤暫存文具道具清空桌面。'
            }
        ]
    },
    watercolor: {
        id: 'watercolor',
        title: 'Watercolor Sort',
        subtitle: '水彩試管倒水',
        path: 'games/watercolor-sort/index.html',
        instructions: [
            {
                titleEn: 'Pouring Water',
                titleZh: '水彩傾倒規則',
                textEn: 'Tap a test tube to lift it, then tap another tube to pour. You can only pour if the top colors match and there is room.',
                textZh: '點擊試管提起動態傾倒，再點擊目標試管注入。只有頂層顏色相同且目標試管有足夠空間時才可倒水。'
            },
            {
                titleEn: 'Color Purity',
                titleZh: '色彩純粹收納',
                textEn: 'Sort all watercolor layers until each tube is filled with a single, pure Morandi watercolor.',
                textZh: '透過思考排列將所有混合的水彩色調歸類，直到每根試管都盛滿單一純淨的柔和水彩。'
            },
            {
                titleEn: 'Helpful Tools',
                titleZh: '提示與備用試管',
                textEn: 'Stuck on a tricky palette? Use Undo to rewind steps or add an extra empty hand-drawn tube!',
                textZh: '遇到難題時，可使用復原按鈕倒退步驟，或添置一根備用手繪試管增加調色空間！'
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
        // Lobby Card Clicks -> Direct Play
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // If user clicked the rules button, let btn-rules handler handle it
                if (e.target.closest('.btn-rules')) return;
                const gameKey = card.getAttribute('data-game');
                if (gameKey && GAME_DATA[gameKey]) {
                    window.location.hash = gameKey;
                }
            });
        });

        // Lobby Play Button Clicks -> Direct Play
        document.querySelectorAll('.btn-play').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const gameKey = btn.getAttribute('data-target');
                if (gameKey && GAME_DATA[gameKey]) {
                    window.location.hash = gameKey;
                }
            });
        });

        // Lobby Rules Button Clicks -> Show Chinese Instructions
        document.querySelectorAll('.btn-rules').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const gameKey = btn.getAttribute('data-target');
                if (gameKey && GAME_DATA[gameKey]) {
                    this.showInstructions(gameKey);
                }
            });
        });

        // Modal Action: Cancel / Close
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

        // Floating Dock: Switch Games directly
        this.dockTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const gameKey = btn.getAttribute('data-game');
                if (gameKey && GAME_DATA[gameKey] && gameKey !== this.currentGame) {
                    window.location.hash = gameKey;
                }
            });
        });

        // Floating Dock: Show Rules of current game (Pure Chinese)
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
        // Pure Traditional Chinese title
        this.modalGameTitle.textContent = `${game.subtitle || game.title} · 遊戲規則`;
        if (this.modalGameSubtitle) {
            this.modalGameSubtitle.textContent = '';
        }

        // Populate pure Chinese sections (NO English text)
        this.modalGameContent.innerHTML = game.instructions.map(item => `
            <div class="instruction-section">
                <div class="instruction-section-title">
                    <span class="sec-title-zh">${item.titleZh}</span>
                </div>
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
