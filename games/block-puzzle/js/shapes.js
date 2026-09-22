/**
 * Notebook Block Puzzle - Shapes & Morandi Color System
 * Defines geometric shapes, matrices, and authentic Morandi color assignments
 * with hand-drawn stationery geometric icon patterns (no bitmaps/stickers).
 */

const MORANDI_PALETTE = {
    vanilla: {
        name: '香草黃',
        bg: '#F6D887',
        sub: '#E6C673',
        highlight: '#FFF1B5',
        symbolSvg: `<svg viewBox="0 0 24 24" width="13" height="13" class="block-icon"><path fill="rgba(82,67,56,0.36)" d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6Z"/></svg>`
    },
    pistachio: {
        name: '開心果綠',
        bg: '#95D5B2',
        sub: '#7DBF9C',
        highlight: '#BCEBD2',
        symbolSvg: `<svg viewBox="0 0 24 24" width="12" height="12" class="block-icon"><circle cx="12" cy="12" r="5.5" fill="rgba(82,67,56,0.34)"/></svg>`
    },
    rose: {
        name: '柔粉玫瑰',
        bg: '#F8B4B4',
        sub: '#E29E9E',
        highlight: '#FED7D7',
        symbolSvg: `<svg viewBox="0 0 24 24" width="12" height="12" class="block-icon"><polygon points="12,3 21,12 12,21 3,12" fill="rgba(82,67,56,0.34)"/></svg>`
    },
    mistBlue: {
        name: '霧灰藍',
        bg: '#95B8D1',
        sub: '#7DA2BC',
        highlight: '#BFDBEE',
        symbolSvg: `<svg viewBox="0 0 24 24" width="12" height="12" class="block-icon"><rect x="5.5" y="5.5" width="13" height="13" rx="2" fill="rgba(82,67,56,0.34)"/></svg>`
    },
    lavender: {
        name: '薰衣草紫',
        bg: '#CDB4DB',
        sub: '#B499C4',
        highlight: '#E8D6F2',
        symbolSvg: `<svg viewBox="0 0 24 24" width="13" height="13" class="block-icon"><circle cx="12" cy="12" r="7" fill="none" stroke="rgba(82,67,56,0.34)" stroke-width="2.5"/><circle cx="12" cy="12" r="2.5" fill="rgba(82,67,56,0.34)"/></svg>`
    },
    apricot: {
        name: '杏桃暖橘',
        bg: '#F7B267',
        sub: '#DE984F',
        highlight: '#FBD29E',
        symbolSvg: `<svg viewBox="0 0 24 24" width="13" height="13" class="block-icon"><polygon points="12,4 20.5,19 3.5,19" fill="rgba(82,67,56,0.34)"/></svg>`
    },
    dustyRose: {
        name: '陶土杏粉',
        bg: '#E7A99E',
        sub: '#CE9085',
        highlight: '#F4CAC1',
        symbolSvg: `<svg viewBox="0 0 24 24" width="12" height="12" class="block-icon"><path fill="rgba(82,67,56,0.34)" d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z"/></svg>`
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

    // 1x5 Bar
    {
        id: 'bar_5_h',
        matrix: [[1, 1, 1, 1, 1]],
        colorKey: 'lavender',
        weight: 4
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

    // 3x3 Square
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

    // Corner L (3 cells)
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

    // Standard L-Shapes (4 cells)
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
    }
];

class ShapeGenerator {
    constructor() {
        this.totalWeight = SHAPE_DEFINITIONS.reduce((sum, s) => sum + s.weight, 0);
    }

    getRandomShape() {
        let r = Math.random() * this.totalWeight;
        for (const shape of SHAPE_DEFINITIONS) {
            if (r < shape.weight) {
                const colorData = MORANDI_PALETTE[shape.colorKey];
                return {
                    id: shape.id + '_' + Math.random().toString(36).substr(2, 4),
                    matrix: shape.matrix.map(row => [...row]),
                    colorKey: shape.colorKey,
                    color: colorData.bg,
                    colorSub: colorData.sub,
                    colorHighlight: colorData.highlight,
                    symbolSvg: colorData.symbolSvg,
                    width: shape.matrix[0].length,
                    height: shape.matrix.length,
                    cellCount: shape.matrix.reduce((sum, row) => sum + row.reduce((a, b) => a + b, 0), 0)
                };
            }
            r -= shape.weight;
        }
        return this.getRandomShape();
    }

    getHandOfThree() {
        const hand = [];
        for (let i = 0; i < 3; i++) {
            hand.push(this.getRandomShape());
        }

        const hasSmall = hand.some(s => s.cellCount <= 3);
        if (!hasSmall) {
            const friendly = SHAPE_DEFINITIONS.filter(s => s.cellCount <= 3 || s.id.startsWith('dot') || s.id.startsWith('bar_2'));
            const pick = friendly[Math.floor(Math.random() * friendly.length)];
            const colorData = MORANDI_PALETTE[pick.colorKey];
            hand[0] = {
                id: pick.id + '_' + Math.random().toString(36).substr(2, 4),
                matrix: pick.matrix.map(row => [...row]),
                colorKey: pick.colorKey,
                color: colorData.bg,
                colorSub: colorData.sub,
                colorHighlight: colorData.highlight,
                symbolSvg: colorData.symbolSvg,
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
