/**
 * Paper Tile Match 3 - Level Definitions & Solvable Level Generator
 * 全部採用 Suika Game 水果圖標系列：
 * 櫻桃 (cherry)、草莓 (strawberry)、葡萄 (grape)、凸頂柑 (dekopon)、
 * 柿子 (persimmon)、蘋果 (apple)、梨子 (pear)、桃子 (peach)、
 * 鳳梨 (pineapple)、哈密瓜 (melon)、大西瓜 (watermelon)。
 * 
 * Grid Coordinate Convention:
 * Center of desk is around (x: 4.5, y: 4.5).
 * Card unit width ~ 1.0 unit, height ~ 1.15 units.
 * Overlap threshold: |dx| < 0.82 && |dy| < 0.85
 * All card totals are guaranteed multiples of 3.
 */

const LEVELS = [
    {
        id: 1,
        name: '晨光果園',
        subtitle: '手繪水果入學 (18 張牌)',
        iconsCount: 4, // 4 types * [3, 3, 6, 6] = 18 cards
        icons: ['cherry', 'strawberry', 'grape', 'apple'],
        cardPositions: [
            // Layer 0 (Base Layer, 12 cards)
            { x: 2.0, y: 1.5, layer: 0 },
            { x: 3.2, y: 1.5, layer: 0 },
            { x: 4.4, y: 1.5, layer: 0 },
            { x: 5.6, y: 1.5, layer: 0 },

            { x: 2.0, y: 3.0, layer: 0 },
            { x: 3.2, y: 3.0, layer: 0 },
            { x: 4.4, y: 3.0, layer: 0 },
            { x: 5.6, y: 3.0, layer: 0 },

            { x: 2.0, y: 4.5, layer: 0 },
            { x: 3.2, y: 4.5, layer: 0 },
            { x: 4.4, y: 4.5, layer: 0 },
            { x: 5.6, y: 4.5, layer: 0 },

            // Layer 1 (Top Layer, 6 cards partially overlapping)
            { x: 2.6, y: 2.2, layer: 1 },
            { x: 3.8, y: 2.2, layer: 1 },
            { x: 5.0, y: 2.2, layer: 1 },

            { x: 2.6, y: 3.7, layer: 1 },
            { x: 3.8, y: 3.7, layer: 1 },
            { x: 5.0, y: 3.7, layer: 1 }
        ]
    },
    {
        id: 2,
        name: '午後甜心',
        subtitle: '經典愛心果盤 (36 張牌)',
        iconsCount: 6, // 6 types * 6 = 36 cards
        icons: ['cherry', 'strawberry', 'grape', 'dekopon', 'apple', 'peach'],
        cardPositions: [
            // Layer 0: Heart Outline (16 cards)
            { x: 2.0, y: 1.0, layer: 0 },
            { x: 3.2, y: 0.8, layer: 0 },
            { x: 4.4, y: 0.8, layer: 0 },
            { x: 5.6, y: 1.0, layer: 0 },

            { x: 1.5, y: 2.2, layer: 0 },
            { x: 2.7, y: 2.2, layer: 0 },
            { x: 4.9, y: 2.2, layer: 0 },
            { x: 6.1, y: 2.2, layer: 0 },

            { x: 2.0, y: 3.5, layer: 0 },
            { x: 3.2, y: 3.5, layer: 0 },
            { x: 4.4, y: 3.5, layer: 0 },
            { x: 5.6, y: 3.5, layer: 0 },

            { x: 2.6, y: 4.8, layer: 0 },
            { x: 3.8, y: 4.8, layer: 0 },
            { x: 5.0, y: 4.8, layer: 0 },
            { x: 3.8, y: 6.0, layer: 0 },

            // Layer 1: Intermediate stacks (14 cards)
            { x: 2.6, y: 1.5, layer: 1 },
            { x: 3.8, y: 1.5, layer: 1 },
            { x: 5.0, y: 1.5, layer: 1 },

            { x: 2.0, y: 2.8, layer: 1 },
            { x: 3.2, y: 2.8, layer: 1 },
            { x: 4.4, y: 2.8, layer: 1 },
            { x: 5.6, y: 2.8, layer: 1 },

            { x: 2.6, y: 4.0, layer: 1 },
            { x: 3.8, y: 4.0, layer: 1 },
            { x: 5.0, y: 4.0, layer: 1 },

            { x: 3.2, y: 5.2, layer: 1 },
            { x: 4.4, y: 5.2, layer: 1 },

            // Wing tabs
            { x: 0.9, y: 2.8, layer: 1 },
            { x: 6.7, y: 2.8, layer: 1 },

            // Layer 2: Topmost gems (6 cards)
            { x: 3.2, y: 2.1, layer: 2 },
            { x: 4.4, y: 2.1, layer: 2 },
            { x: 2.9, y: 3.4, layer: 2 },
            { x: 4.1, y: 3.4, layer: 2 },
            { x: 3.5, y: 4.6, layer: 2 },
            { x: 4.7, y: 4.6, layer: 2 }
        ]
    },
    {
        id: 3,
        name: '歡樂果物階梯',
        subtitle: '四重階梯水果疊層 (54 張牌)',
        iconsCount: 7, // 18 sets of 3 = 54
        icons: ['cherry', 'strawberry', 'grape', 'dekopon', 'persimmon', 'apple', 'pear'],
        cardPositions: [
            // Layer 0: Diamond Base (24 cards)
            { x: 3.8, y: 0.6, layer: 0 },
            { x: 3.0, y: 1.6, layer: 0 }, { x: 4.6, y: 1.6, layer: 0 },
            { x: 2.2, y: 2.6, layer: 0 }, { x: 3.8, y: 2.6, layer: 0 }, { x: 5.4, y: 2.6, layer: 0 },
            { x: 1.4, y: 3.6, layer: 0 }, { x: 3.0, y: 3.6, layer: 0 }, { x: 4.6, y: 3.6, layer: 0 }, { x: 6.2, y: 3.6, layer: 0 },
            { x: 0.6, y: 4.6, layer: 0 }, { x: 2.2, y: 4.6, layer: 0 }, { x: 3.8, y: 4.6, layer: 0 }, { x: 5.4, y: 4.6, layer: 0 }, { x: 7.0, y: 4.6, layer: 0 },
            { x: 1.4, y: 5.6, layer: 0 }, { x: 3.0, y: 5.6, layer: 0 }, { x: 4.6, y: 5.6, layer: 0 }, { x: 6.2, y: 5.6, layer: 0 },
            { x: 2.2, y: 6.6, layer: 0 }, { x: 3.8, y: 6.6, layer: 0 }, { x: 5.4, y: 6.6, layer: 0 },
            { x: 3.0, y: 7.4, layer: 0 }, { x: 4.6, y: 7.4, layer: 0 },

            // Layer 1: Inner diamond (16 cards)
            { x: 3.8, y: 1.6, layer: 1 },
            { x: 3.0, y: 2.6, layer: 1 }, { x: 4.6, y: 2.6, layer: 1 },
            { x: 2.2, y: 3.6, layer: 1 }, { x: 3.8, y: 3.6, layer: 1 }, { x: 5.4, y: 3.6, layer: 1 },
            { x: 1.4, y: 4.6, layer: 1 }, { x: 3.0, y: 4.6, layer: 1 }, { x: 4.6, y: 4.6, layer: 1 }, { x: 6.2, y: 4.6, layer: 1 },
            { x: 2.2, y: 5.6, layer: 1 }, { x: 3.8, y: 5.6, layer: 1 }, { x: 5.4, y: 5.6, layer: 1 },
            { x: 3.0, y: 6.6, layer: 1 }, { x: 4.6, y: 6.6, layer: 1 },
            { x: 3.8, y: 7.2, layer: 1 },

            // Layer 2: Core pyramid (10 cards)
            { x: 3.4, y: 2.3, layer: 2 }, { x: 4.2, y: 2.3, layer: 2 },
            { x: 2.6, y: 3.4, layer: 2 }, { x: 3.8, y: 3.4, layer: 2 }, { x: 5.0, y: 3.4, layer: 2 },
            { x: 2.6, y: 4.8, layer: 2 }, { x: 3.8, y: 4.8, layer: 2 }, { x: 5.0, y: 4.8, layer: 2 },
            { x: 3.4, y: 5.9, layer: 2 }, { x: 4.2, y: 5.9, layer: 2 },

            // Layer 3: Crown Peak (4 cards)
            { x: 3.8, y: 3.0, layer: 3 },
            { x: 3.2, y: 4.1, layer: 3 },
            { x: 4.4, y: 4.1, layer: 3 },
            { x: 3.8, y: 5.2, layer: 3 }
        ]
    },
    {
        id: 4,
        name: '繽紛果園派對',
        subtitle: '交錯水果筆記 (72 張牌)',
        iconsCount: 9,
        icons: ['cherry', 'strawberry', 'grape', 'dekopon', 'persimmon', 'apple', 'pear', 'peach', 'watermelon'],
        cardPositions: [
            // Layer 0: Quad-cluster desks (30 cards)
            // Cluster Top-Left
            { x: 1.2, y: 0.8, layer: 0 }, { x: 2.4, y: 0.8, layer: 0 }, { x: 3.6, y: 0.8, layer: 0 },
            { x: 1.2, y: 2.1, layer: 0 }, { x: 2.4, y: 2.1, layer: 0 }, { x: 3.6, y: 2.1, layer: 0 },
            // Cluster Top-Right
            { x: 4.8, y: 0.8, layer: 0 }, { x: 6.0, y: 0.8, layer: 0 }, { x: 7.2, y: 0.8, layer: 0 },
            { x: 4.8, y: 2.1, layer: 0 }, { x: 6.0, y: 2.1, layer: 0 }, { x: 7.2, y: 2.1, layer: 0 },
            // Center Belt
            { x: 2.4, y: 3.4, layer: 0 }, { x: 3.6, y: 3.4, layer: 0 }, { x: 4.8, y: 3.4, layer: 0 }, { x: 6.0, y: 3.4, layer: 0 },
            // Cluster Bottom-Left
            { x: 1.2, y: 4.7, layer: 0 }, { x: 2.4, y: 4.7, layer: 0 }, { x: 3.6, y: 4.7, layer: 0 },
            { x: 1.2, y: 6.0, layer: 0 }, { x: 2.4, y: 6.0, layer: 0 }, { x: 3.6, y: 6.0, layer: 0 },
            // Cluster Bottom-Right
            { x: 4.8, y: 4.7, layer: 0 }, { x: 6.0, y: 4.7, layer: 0 }, { x: 7.2, y: 4.7, layer: 0 },
            { x: 4.8, y: 6.0, layer: 0 }, { x: 6.0, y: 6.0, layer: 0 }, { x: 7.2, y: 6.0, layer: 0 },
            // Edge bookmarks
            { x: 0.5, y: 3.4, layer: 0 }, { x: 7.9, y: 3.4, layer: 0 },

            // Layer 1: Interlocking bridge (22 cards)
            { x: 1.8, y: 1.4, layer: 1 }, { x: 3.0, y: 1.4, layer: 1 }, { x: 5.4, y: 1.4, layer: 1 }, { x: 6.6, y: 1.4, layer: 1 },
            { x: 1.8, y: 2.7, layer: 1 }, { x: 3.0, y: 2.7, layer: 1 }, { x: 4.2, y: 2.7, layer: 1 }, { x: 5.4, y: 2.7, layer: 1 }, { x: 6.6, y: 2.7, layer: 1 },
            { x: 3.0, y: 4.0, layer: 1 }, { x: 4.2, y: 4.0, layer: 1 }, { x: 5.4, y: 4.0, layer: 1 },
            { x: 1.8, y: 5.3, layer: 1 }, { x: 3.0, y: 5.3, layer: 1 }, { x: 4.2, y: 5.3, layer: 1 }, { x: 5.4, y: 5.3, layer: 1 }, { x: 6.6, y: 5.3, layer: 1 },
            { x: 1.8, y: 6.5, layer: 1 }, { x: 3.0, y: 6.5, layer: 1 }, { x: 5.4, y: 6.5, layer: 1 }, { x: 6.6, y: 6.5, layer: 1 },

            // Layer 2: High overlap central pillar (14 cards)
            { x: 2.5, y: 2.0, layer: 2 }, { x: 3.7, y: 2.0, layer: 2 }, { x: 4.9, y: 2.0, layer: 2 }, { x: 6.1, y: 2.0, layer: 2 },
            { x: 3.1, y: 3.2, layer: 2 }, { x: 4.3, y: 3.2, layer: 2 }, { x: 5.5, y: 3.2, layer: 2 },
            { x: 3.1, y: 4.5, layer: 2 }, { x: 4.3, y: 4.5, layer: 2 }, { x: 5.5, y: 4.5, layer: 2 },
            { x: 2.5, y: 5.7, layer: 2 }, { x: 3.7, y: 5.7, layer: 2 }, { x: 4.9, y: 5.7, layer: 2 }, { x: 6.1, y: 5.7, layer: 2 },

            // Layer 3: Floating toppers (6 cards)
            { x: 3.7, y: 2.7, layer: 3 }, { x: 4.9, y: 2.7, layer: 3 },
            { x: 4.3, y: 3.8, layer: 3 },
            { x: 3.7, y: 4.9, layer: 3 }, { x: 4.9, y: 4.9, layer: 3 },
            { x: 4.3, y: 5.5, layer: 3 }
        ]
    },
    {
        id: 5,
        name: '大西瓜手帳大師',
        subtitle: '全屏千層果香宏大交錯 (90 張牌)',
        iconsCount: 10,
        icons: ['cherry', 'strawberry', 'grape', 'dekopon', 'persimmon', 'apple', 'pear', 'peach', 'pineapple', 'watermelon'],
        cardPositions: [
            // Generate dense concentric multi-tier pyramid with 90 cards
            // Layer 0: 36 cards
            { x: 1.0, y: 0.5, layer: 0 }, { x: 2.1, y: 0.5, layer: 0 }, { x: 3.2, y: 0.5, layer: 0 }, { x: 4.3, y: 0.5, layer: 0 }, { x: 5.4, y: 0.5, layer: 0 }, { x: 6.5, y: 0.5, layer: 0 }, { x: 7.6, y: 0.5, layer: 0 },
            { x: 1.0, y: 1.7, layer: 0 }, { x: 2.1, y: 1.7, layer: 0 }, { x: 3.2, y: 1.7, layer: 0 }, { x: 4.3, y: 1.7, layer: 0 }, { x: 5.4, y: 1.7, layer: 0 }, { x: 6.5, y: 1.7, layer: 0 }, { x: 7.6, y: 1.7, layer: 0 },
            { x: 1.0, y: 2.9, layer: 0 }, { x: 2.1, y: 2.9, layer: 0 }, { x: 3.2, y: 2.9, layer: 0 }, { x: 4.3, y: 2.9, layer: 0 }, { x: 5.4, y: 2.9, layer: 0 }, { x: 6.5, y: 2.9, layer: 0 }, { x: 7.6, y: 2.9, layer: 0 },
            { x: 1.0, y: 4.1, layer: 0 }, { x: 2.1, y: 4.1, layer: 0 }, { x: 3.2, y: 4.1, layer: 0 }, { x: 4.3, y: 4.1, layer: 0 }, { x: 5.4, y: 4.1, layer: 0 }, { x: 6.5, y: 4.1, layer: 0 }, { x: 7.6, y: 4.1, layer: 0 },
            { x: 1.0, y: 5.3, layer: 0 }, { x: 2.1, y: 5.3, layer: 0 }, { x: 3.2, y: 5.3, layer: 0 }, { x: 4.3, y: 5.3, layer: 0 }, { x: 5.4, y: 5.3, layer: 0 }, { x: 6.5, y: 5.3, layer: 0 }, { x: 7.6, y: 5.3, layer: 0 },
            { x: 4.3, y: 6.5, layer: 0 },

            // Layer 1: 26 cards
            { x: 1.6, y: 1.1, layer: 1 }, { x: 2.7, y: 1.1, layer: 1 }, { x: 3.8, y: 1.1, layer: 1 }, { x: 4.9, y: 1.1, layer: 1 }, { x: 6.0, y: 1.1, layer: 1 }, { x: 7.1, y: 1.1, layer: 1 },
            { x: 1.6, y: 2.3, layer: 1 }, { x: 2.7, y: 2.3, layer: 1 }, { x: 3.8, y: 2.3, layer: 1 }, { x: 4.9, y: 2.3, layer: 1 }, { x: 6.0, y: 2.3, layer: 1 }, { x: 7.1, y: 2.3, layer: 1 },
            { x: 1.6, y: 3.5, layer: 1 }, { x: 2.7, y: 3.5, layer: 1 }, { x: 3.8, y: 3.5, layer: 1 }, { x: 4.9, y: 3.5, layer: 1 }, { x: 6.0, y: 3.5, layer: 1 }, { x: 7.1, y: 3.5, layer: 1 },
            { x: 2.7, y: 4.7, layer: 1 }, { x: 3.8, y: 4.7, layer: 1 }, { x: 4.9, y: 4.7, layer: 1 }, { x: 6.0, y: 4.7, layer: 1 },
            { x: 3.3, y: 5.8, layer: 1 }, { x: 4.4, y: 5.8, layer: 1 }, { x: 5.5, y: 5.8, layer: 1 },
            { x: 4.4, y: 6.8, layer: 1 },

            // Layer 2: 18 cards
            { x: 2.2, y: 1.7, layer: 2 }, { x: 3.3, y: 1.7, layer: 2 }, { x: 4.4, y: 1.7, layer: 2 }, { x: 5.5, y: 1.7, layer: 2 }, { x: 6.6, y: 1.7, layer: 2 },
            { x: 2.2, y: 2.9, layer: 2 }, { x: 3.3, y: 2.9, layer: 2 }, { x: 4.4, y: 2.9, layer: 2 }, { x: 5.5, y: 2.9, layer: 2 }, { x: 6.6, y: 2.9, layer: 2 },
            { x: 2.7, y: 4.1, layer: 2 }, { x: 3.8, y: 4.1, layer: 2 }, { x: 4.9, y: 4.1, layer: 2 }, { x: 6.0, y: 4.1, layer: 2 },
            { x: 3.3, y: 5.1, layer: 2 }, { x: 4.4, y: 5.1, layer: 2 }, { x: 5.5, y: 5.1, layer: 2 },
            { x: 4.4, y: 6.1, layer: 2 },

            // Layer 3: 7 cards
            { x: 3.3, y: 2.3, layer: 3 }, { x: 4.4, y: 2.3, layer: 3 }, { x: 5.5, y: 2.3, layer: 3 },
            { x: 3.8, y: 3.5, layer: 3 }, { x: 4.9, y: 3.5, layer: 3 },
            { x: 4.4, y: 4.5, layer: 3 },
            { x: 4.4, y: 5.4, layer: 3 },

            // Layer 4: 3 crown cards
            { x: 3.9, y: 2.8, layer: 4 },
            { x: 4.9, y: 2.8, layer: 4 },
            { x: 4.4, y: 3.9, layer: 4 }
        ]
    }
];

/**
 * Generate a random solvable level layout using only the 11 official Suika Game fruits
 * @param {number} totalCards Multiple of 3, e.g. 48, 60, 75
 */
function generateRandomSolvableLevel(totalCards = 48) {
    // Ensure multiple of 3
    totalCards = Math.floor(totalCards / 3) * 3;
    const suikaFruitKeys = ['cherry', 'strawberry', 'grape', 'dekopon', 'persimmon', 'apple', 'pear', 'peach', 'pineapple', 'melon', 'watermelon'];
    const numTypes = Math.min(Math.max(4, Math.floor(totalCards / 9)), 10);
    const chosenIcons = suikaFruitKeys.sort(() => Math.random() - 0.5).slice(0, numTypes);

    // Build positions procedurally in overlapping layers
    const cardPositions = [];
    const maxLayers = 4;
    const cardsPerLayer = [
        Math.floor(totalCards * 0.44),
        Math.floor(totalCards * 0.30),
        Math.floor(totalCards * 0.18),
        totalCards - Math.floor(totalCards * 0.44) - Math.floor(totalCards * 0.30) - Math.floor(totalCards * 0.18)
    ];

    cardsPerLayer.forEach((count, layer) => {
        const offset = layer * 0.28;
        const cols = Math.min(7, Math.ceil(Math.sqrt(count * 1.3)));
        let placed = 0;
        for (let r = 0; placed < count; r++) {
            for (let c = 0; c < cols && placed < count; c++) {
                cardPositions.push({
                    x: 1.4 + c * 0.95 + offset + (Math.random() - 0.5) * 0.16,
                    y: 1.0 + r * 1.18 + offset + (Math.random() - 0.5) * 0.16,
                    layer: layer
                });
                placed++;
            }
        }
    });

    return {
        id: 999,
        name: '無盡果園挑戰',
        subtitle: `隨機桌布 (${totalCards} 張牌)`,
        iconsCount: chosenIcons.length,
        icons: chosenIcons,
        cardPositions: cardPositions
    };
}

window.GAME_LEVELS = LEVELS;
window.generateRandomSolvableLevel = generateRandomSolvableLevel;
