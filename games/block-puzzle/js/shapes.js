/**
 * Notebook Block Puzzle - Shapes & Morandi Color System
 * Defines 20+ geometric shapes, their grid matrices, and authentic Morandi color assignments.
 */

const MORANDI_PALETTE = {
    vanilla: {
        name: '香草黃',
        bg: '#F6D887',
        sub: '#E6C673',
        highlight: '#FFF1B5'
    },
    pistachio: {
        name: '開心果綠',
        bg: '#95D5B2',
        sub: '#7DBF9C',
        highlight: '#BCEBD2'
    },
    rose: {
        name: '柔粉玫瑰',
        bg: '#F8B4B4',
        sub: '#E29E9E',
        highlight: '#FED7D7'
    },
    mistBlue: {
        name: '霧灰藍',
        bg: '#95B8D1',
        sub: '#7DA2BC',
        highlight: '#BFDBEE'
    },
    lavender: {
        name: '薰衣草紫',
        bg: '#CDB4DB',
        sub: '#B499C4',
        highlight: '#E8D6F2'
    },
    apricot: {
        name: '杏桃暖橘',
        bg: '#F7B267',
        sub: '#DE984F',
        highlight: '#FBD29E'
    },
    dustyRose: {
        name: '陶土杏粉',
        bg: '#E7A99E',
        sub: '#CE9085',
        highlight: '#F4CAC1'
    }
};

const COLOR_KEYS = Object.keys(MORANDI_PALETTE);

const SHAPE_DEFINITIONS = [
    // 1x1 Single Dot
    {
        id: 'dot_1',
        matrix: [[1]],
        colorKey: 'vanilla',
        weight: 12
    },

    // 1x2 and 2x1 Bars
    {
        id: 'bar_2_h',
        matrix: [[1, 1]],
        colorKey: 'pistachio',
        weight: 10
    },
    {
        id: 'bar_2_v',
        matrix: [[1], [1]],
        colorKey: 'pistachio',
        weight: 10
    },

    // 1x3 and 3x1 Bars
    {
        id: 'bar_3_h',
        matrix: [[1, 1, 1]],
        colorKey: 'mistBlue',
        weight: 9
    },
    {
        id: 'bar_3_v',
        matrix: [[1], [1], [1]],
        colorKey: 'mistBlue',
        weight: 9
    },

    // 1x4 and 4x1 Bars
    {
        id: 'bar_4_h',
        matrix: [[1, 1, 1, 1]],
        colorKey: 'rose',
        weight: 7
    },
    {
        id: 'bar_4_v',
        matrix: [[1], [1], [1], [1]],
        colorKey: 'rose',
        weight: 7
    },

    // 1x5 and 5x1 Bars
    {
        id: 'bar_5_h',
        matrix: [[1, 1, 1, 1, 1]],
        colorKey: 'lavender',
        weight: 5
    },
    {
        id: 'bar_5_v',
        matrix: [[1], [1], [1], [1], [1]],
        colorKey: 'lavender',
        weight: 5
    },

    // 2x2 Square
    {
        id: 'square_2',
        matrix: [
            [1, 1],
            [1, 1]
        ],
        colorKey: 'apricot',
        weight: 9
    },

    // 3x3 Square (Rare high-reward)
    {
        id: 'square_3',
        matrix: [
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1]
        ],
        colorKey: 'dustyRose',
        weight: 3
    },

    // Mini 2x2 Corner L (3 cells)
    {
        id: 'corner_3_tl',
        matrix: [
            [1, 1],
            [1, 0]
        ],
        colorKey: 'vanilla',
        weight: 8
    },
    {
        id: 'corner_3_tr',
        matrix: [
            [1, 1],
            [0, 1]
        ],
        colorKey: 'vanilla',
        weight: 8
    },
    {
        id: 'corner_3_bl',
        matrix: [
            [1, 0],
            [1, 1]
        ],
        colorKey: 'vanilla',
        weight: 8
    },
    {
        id: 'corner_3_br',
        matrix: [
            [0, 1],
            [1, 1]
        ],
        colorKey: 'vanilla',
        weight: 8
    },

    // Standard Tetris L-Shapes (4 cells)
    {
        id: 'L_4_0',
        matrix: [
            [1, 0],
            [1, 0],
            [1, 1]
        ],
        colorKey: 'mistBlue',
        weight: 7
    },
    {
        id: 'L_4_1',
        matrix: [
            [0, 1],
            [0, 1],
            [1, 1]
        ],
        colorKey: 'mistBlue',
        weight: 7
    },
    {
        id: 'L_4_2',
        matrix: [
            [1, 1, 1],
            [1, 0, 0]
        ],
        colorKey: 'mistBlue',
        weight: 7
    },
    {
        id: 'L_4_3',
        matrix: [
            [1, 1, 1],
            [0, 0, 1]
        ],
        colorKey: 'mistBlue',
        weight: 7
    },

    // Big 3x3 L-Shapes (5 cells)
    {
        id: 'big_L_tl',
        matrix: [
            [1, 1, 1],
            [1, 0, 0],
            [1, 0, 0]
        ],
        colorKey: 'lavender',
        weight: 4
    },
    {
        id: 'big_L_tr',
        matrix: [
            [1, 1, 1],
            [0, 0, 1],
            [0, 0, 1]
        ],
        colorKey: 'lavender',
        weight: 4
    },
    {
        id: 'big_L_bl',
        matrix: [
            [1, 0, 0],
            [1, 0, 0],
            [1, 1, 1]
        ],
        colorKey: 'lavender',
        weight: 4
    },
    {
        id: 'big_L_br',
        matrix: [
            [0, 0, 1],
            [0, 0, 1],
            [1, 1, 1]
        ],
        colorKey: 'lavender',
        weight: 4
    },

    // T-Shapes (4 cells)
    {
        id: 'T_up',
        matrix: [
            [0, 1, 0],
            [1, 1, 1]
        ],
        colorKey: 'rose',
        weight: 6
    },
    {
        id: 'T_down',
        matrix: [
            [1, 1, 1],
            [0, 1, 0]
        ],
        colorKey: 'rose',
        weight: 6
    },
    {
        id: 'T_left',
        matrix: [
            [1, 0],
            [1, 1],
            [1, 0]
        ],
        colorKey: 'rose',
        weight: 6
    },
    {
        id: 'T_right',
        matrix: [
            [0, 1],
            [1, 1],
            [0, 1]
        ],
        colorKey: 'rose',
        weight: 6
    },

    // Z and S Shapes
    {
        id: 'Z_h',
        matrix: [
            [1, 1, 0],
            [0, 1, 1]
        ],
        colorKey: 'pistachio',
        weight: 6
    },
    {
        id: 'S_h',
        matrix: [
            [0, 1, 1],
            [1, 1, 0]
        ],
        colorKey: 'pistachio',
        weight: 6
    },
    {
        id: 'Z_v',
        matrix: [
            [0, 1],
            [1, 1],
            [1, 0]
        ],
        colorKey: 'pistachio',
        weight: 6
    },
    {
        id: 'S_v',
        matrix: [
            [1, 0],
            [1, 1],
            [0, 1]
        ],
        colorKey: 'pistachio',
        weight: 6
    },

    // 2x3 and 3x2 Rectangles
    {
        id: 'rect_2x3',
        matrix: [
            [1, 1, 1],
            [1, 1, 1]
        ],
        colorKey: 'apricot',
        weight: 4
    },
    {
        id: 'rect_3x2',
        matrix: [
            [1, 1],
            [1, 1],
            [1, 1]
        ],
        colorKey: 'apricot',
        weight: 4
    }
];

class ShapeGenerator {
    constructor() {
        this.totalWeight = SHAPE_DEFINITIONS.reduce((sum, s) => sum + s.weight, 0);
    }

    // Pick a single random shape based on weights
    getRandomShape() {
        let r = Math.random() * this.totalWeight;
        for (const shape of SHAPE_DEFINITIONS) {
            if (r < shape.weight) {
                // Return a fresh clone
                const colorData = MORANDI_PALETTE[shape.colorKey];
                return {
                    id: shape.id + '_' + Math.random().toString(36).substr(2, 4),
                    matrix: shape.matrix.map(row => [...row]),
                    color: colorData.bg,
                    colorSub: colorData.sub,
                    colorHighlight: colorData.highlight,
                    width: shape.matrix[0].length,
                    height: shape.matrix.length,
                    cellCount: shape.matrix.reduce((sum, row) => sum + row.reduce((a, b) => a + b, 0), 0)
                };
            }
            r -= shape.weight;
        }
        return this.getRandomShape();
    }

    // Generate a set of 3 balanced shapes
    getHandOfThree() {
        const hand = [];
        for (let i = 0; i < 3; i++) {
            hand.push(this.getRandomShape());
        }

        // Safety guarantee: ensure at least one small/friendly shape (< 4 cells) is present
        const hasSmall = hand.some(s => s.cellCount <= 3);
        if (!hasSmall) {
            // Replace first shape with a friendly 1x1, 1x2, or 2x2
            const friendly = SHAPE_DEFINITIONS.filter(s => s.cellCount <= 3 || s.id.startsWith('dot') || s.id.startsWith('bar_2'));
            const pick = friendly[Math.floor(Math.random() * friendly.length)];
            const colorData = MORANDI_PALETTE[pick.colorKey];
            hand[0] = {
                id: pick.id + '_' + Math.random().toString(36).substr(2, 4),
                matrix: pick.matrix.map(row => [...row]),
                color: colorData.bg,
                colorSub: colorData.sub,
                colorHighlight: colorData.highlight,
                width: pick.matrix[0].length,
                height: pick.matrix.length,
                cellCount: pick.matrix.reduce((sum, row) => sum + row.reduce((a, b) => a + b, 0), 0)
            };
        }

        return hand;
    }
}

window.ShapeGenerator = ShapeGenerator;
window.MORANDI_PALETTE = MORANDI_PALETTE;
