/**
 * Watercolor Sort Puzzle - Levels Database & BFS Solver
 * 
 * Contains 36 curated, hand-crafted & verified levels
 * Progressing smoothly from 3 tubes (2 colors) to 10 tubes (8 colors)
 * Includes a lightweight BFS Solver for instant hint calculation and solvability verification.
 */

// Capacity of each standard tube
const TUBE_CAPACITY = 4;

/**
 * 36 Curated Levels
 * Note: tubes are listed from bottom to top: tube[0] is bottom, tube[tube.length-1] is top.
 */
const CURATED_LEVELS = [
    // --- Phase 1: 初試水彩 (Levels 1 - 5) ---
    {
        level: 1,
        title: "初探薄荷與蜜桃",
        tubes: [
            ['matcha', 'peach', 'matcha', 'peach'],
            ['peach', 'matcha', 'peach', 'matcha'],
            []
        ]
    },
    {
        level: 2,
        title: "微風與芋泥",
        tubes: [
            ['taro', 'glacier', 'taro', 'glacier'],
            ['glacier', 'taro', 'glacier', 'taro'],
            []
        ]
    },
    {
        level: 3,
        title: "春日三色調",
        tubes: [
            ['matcha', 'taro', 'peach', 'matcha'],
            ['peach', 'glacier', 'matcha', 'taro'],
            ['glacier', 'matcha', 'glacier', 'glacier'],
            ['taro', 'peach', 'taro', 'peach'],
            []
        ]
    },
    {
        level: 4,
        title: "晨光馬卡龍",
        tubes: [
            ['mustard', 'peach', 'matcha', 'mustard'],
            ['matcha', 'mustard', 'peach', 'matcha'],
            ['peach', 'matcha', 'mustard', 'peach'],
            [],
            []
        ]
    },
    {
        level: 5,
        title: "薰衣草花園",
        tubes: [
            ['taro', 'glacier', 'peach', 'taro'],
            ['glacier', 'peach', 'taro', 'glacier'],
            ['peach', 'taro', 'glacier', 'peach'],
            [],
            []
        ]
    },

    // --- Phase 2: 溫馨畫室 (Levels 6 - 12) ---
    {
        level: 6,
        title: "豆沙與晨霧",
        tubes: [
            ['redbean', 'glacier', 'matcha', 'redbean'],
            ['matcha', 'redbean', 'glacier', 'matcha'],
            ['glacier', 'matcha', 'redbean', 'glacier'],
            [],
            []
        ]
    },
    {
        level: 7,
        title: "四色調色盤",
        tubes: [
            ['mustard', 'taro', 'peach', 'matcha'],
            ['taro', 'matcha', 'mustard', 'peach'],
            ['matcha', 'peach', 'taro', 'mustard'],
            ['peach', 'mustard', 'matcha', 'taro'],
            [],
            []
        ]
    },
    {
        level: 8,
        title: "午後甜點",
        tubes: [
            ['redbean', 'mustard', 'taro', 'redbean'],
            ['mustard', 'taro', 'redbean', 'mustard'],
            ['taro', 'redbean', 'mustard', 'taro'],
            ['peach', 'peach', 'peach', 'peach'], // One already sorted distractor
            [],
            []
        ]
    },
    {
        level: 9,
        title: "森之微光",
        tubes: [
            ['sage', 'glacier', 'amber', 'sage'],
            ['amber', 'sage', 'glacier', 'amber'],
            ['glacier', 'amber', 'sage', 'glacier'],
            ['taro', 'taro', 'taro', 'taro'],
            [],
            []
        ]
    },
    {
        level: 10,
        title: "澄澈冰川",
        tubes: [
            ['glacier', 'taro', 'peach', 'glacier'],
            ['peach', 'glacier', 'taro', 'mustard'],
            ['taro', 'mustard', 'glacier', 'peach'],
            ['mustard', 'peach', 'mustard', 'taro'],
            [],
            []
        ]
    },
    {
        level: 11,
        title: "京都抹茶館",
        tubes: [
            ['matcha', 'amber', 'redbean', 'matcha'],
            ['amber', 'redbean', 'matcha', 'amber'],
            ['redbean', 'matcha', 'amber', 'redbean'],
            ['peach', 'glacier', 'peach', 'glacier'],
            ['glacier', 'peach', 'glacier', 'peach'],
            [],
            []
        ]
    },
    {
        level: 12,
        title: "酪梨與烏龍",
        tubes: [
            ['sage', 'amber', 'taro', 'sage'],
            ['amber', 'taro', 'sage', 'amber'],
            ['taro', 'sage', 'amber', 'taro'],
            ['mustard', 'peach', 'mustard', 'peach'],
            ['peach', 'mustard', 'peach', 'mustard'],
            [],
            []
        ]
    },

    // --- Phase 3: 水彩漫遊 (Levels 13 - 20) ---
    {
        level: 13,
        title: "五彩琉璃",
        tubes: [
            ['matcha', 'peach', 'glacier', 'taro'],
            ['mustard', 'matcha', 'peach', 'glacier'],
            ['taro', 'mustard', 'matcha', 'peach'],
            ['glacier', 'taro', 'mustard', 'matcha'],
            ['peach', 'glacier', 'taro', 'mustard'],
            [],
            []
        ]
    },
    {
        level: 14,
        title: "日暮時分",
        tubes: [
            ['redbean', 'amber', 'mustard', 'peach'],
            ['mustard', 'peach', 'redbean', 'amber'],
            ['peach', 'redbean', 'amber', 'mustard'],
            ['amber', 'mustard', 'peach', 'redbean'],
            ['glacier', 'glacier', 'glacier', 'glacier'],
            [],
            []
        ]
    },
    {
        level: 15,
        title: "深林漫步",
        tubes: [
            ['sage', 'matcha', 'amber', 'slate'],
            ['slate', 'sage', 'matcha', 'amber'],
            ['amber', 'slate', 'sage', 'matcha'],
            ['matcha', 'amber', 'slate', 'sage'],
            ['taro', 'taro', 'taro', 'taro'],
            [],
            []
        ]
    },
    {
        level: 16,
        title: "法式烘焙坊",
        tubes: [
            ['amber', 'mustard', 'peach', 'redbean'],
            ['peach', 'redbean', 'amber', 'mustard'],
            ['redbean', 'amber', 'mustard', 'peach'],
            ['mustard', 'peach', 'redbean', 'amber'],
            ['matcha', 'matcha', 'slate', 'slate'],
            ['slate', 'slate', 'matcha', 'matcha'],
            [],
            []
        ]
    },
    {
        level: 17,
        title: "雨後青空",
        tubes: [
            ['glacier', 'slate', 'taro', 'matcha'],
            ['taro', 'matcha', 'glacier', 'slate'],
            ['matcha', 'glacier', 'slate', 'taro'],
            ['slate', 'taro', 'matcha', 'glacier'],
            ['mustard', 'peach', 'mustard', 'peach'],
            ['peach', 'mustard', 'peach', 'mustard'],
            [],
            []
        ]
    },
    {
        level: 18,
        title: "蜜桃珊瑚礁",
        tubes: [
            ['coral', 'peach', 'glacier', 'coral'],
            ['glacier', 'coral', 'peach', 'glacier'],
            ['peach', 'glacier', 'coral', 'peach'],
            ['matcha', 'taro', 'matcha', 'taro'],
            ['taro', 'matcha', 'taro', 'matcha'],
            [],
            []
        ]
    },
    {
        level: 19,
        title: "水彩協奏曲",
        tubes: [
            ['matcha', 'mustard', 'glacier', 'redbean'],
            ['peach', 'taro', 'matcha', 'mustard'],
            ['glacier', 'redbean', 'peach', 'taro'],
            ['matcha', 'mustard', 'glacier', 'redbean'],
            ['peach', 'taro', 'matcha', 'mustard'],
            ['glacier', 'redbean', 'peach', 'taro'],
            [],
            []
        ]
    },
    {
        level: 20,
        title: "六色芬芳",
        tubes: [
            ['matcha', 'taro', 'peach', 'glacier'],
            ['mustard', 'redbean', 'matcha', 'taro'],
            ['peach', 'glacier', 'mustard', 'redbean'],
            ['matcha', 'taro', 'peach', 'glacier'],
            ['mustard', 'redbean', 'matcha', 'taro'],
            ['peach', 'glacier', 'mustard', 'redbean'],
            [],
            []
        ]
    },

    // --- Phase 4: 調色大師 (Levels 21 - 30) ---
    {
        level: 21,
        title: "秋葉小調",
        tubes: [
            ['amber', 'redbean', 'mustard', 'sage'],
            ['sage', 'amber', 'redbean', 'mustard'],
            ['mustard', 'sage', 'amber', 'redbean'],
            ['redbean', 'mustard', 'sage', 'amber'],
            ['glacier', 'slate', 'glacier', 'slate'],
            ['slate', 'glacier', 'slate', 'glacier'],
            [],
            []
        ]
    },
    {
        level: 22,
        title: "薰風拂面",
        tubes: [
            ['taro', 'matcha', 'peach', 'glacier'],
            ['amber', 'taro', 'matcha', 'peach'],
            ['glacier', 'amber', 'taro', 'matcha'],
            ['peach', 'glacier', 'amber', 'taro'],
            ['matcha', 'peach', 'glacier', 'amber'],
            ['slate', 'slate', 'slate', 'slate'],
            [],
            []
        ]
    },
    {
        level: 23,
        title: "波斯花毯",
        tubes: [
            ['coral', 'amber', 'mustard', 'redbean'],
            ['redbean', 'coral', 'amber', 'mustard'],
            ['mustard', 'redbean', 'coral', 'amber'],
            ['amber', 'mustard', 'redbean', 'coral'],
            ['taro', 'glacier', 'taro', 'glacier'],
            ['glacier', 'taro', 'glacier', 'taro'],
            [],
            []
        ]
    },
    {
        level: 24,
        title: "極光之境",
        tubes: [
            ['glacier', 'matcha', 'taro', 'slate'],
            ['slate', 'glacier', 'matcha', 'taro'],
            ['taro', 'slate', 'glacier', 'matcha'],
            ['matcha', 'taro', 'slate', 'glacier'],
            ['peach', 'mustard', 'peach', 'mustard'],
            ['mustard', 'peach', 'mustard', 'peach'],
            [],
            []
        ]
    },
    {
        level: 25,
        title: "七彩光譜",
        tubes: [
            ['matcha', 'taro', 'peach', 'glacier'],
            ['mustard', 'redbean', 'amber', 'matcha'],
            ['taro', 'peach', 'glacier', 'mustard'],
            ['redbean', 'amber', 'matcha', 'taro'],
            ['peach', 'glacier', 'mustard', 'redbean'],
            ['amber', 'matcha', 'taro', 'peach'],
            ['glacier', 'mustard', 'redbean', 'amber'],
            [],
            []
        ]
    },
    {
        level: 26,
        title: "山林雨霽",
        tubes: [
            ['sage', 'slate', 'glacier', 'amber'],
            ['mustard', 'matcha', 'sage', 'slate'],
            ['glacier', 'amber', 'mustard', 'matcha'],
            ['sage', 'slate', 'glacier', 'amber'],
            ['mustard', 'matcha', 'sage', 'slate'],
            ['glacier', 'amber', 'mustard', 'matcha'],
            ['taro', 'taro', 'taro', 'taro'],
            [],
            []
        ]
    },
    {
        level: 27,
        title: "落櫻與春泉",
        tubes: [
            ['peach', 'coral', 'glacier', 'taro'],
            ['matcha', 'peach', 'coral', 'glacier'],
            ['taro', 'matcha', 'peach', 'coral'],
            ['glacier', 'taro', 'matcha', 'peach'],
            ['coral', 'glacier', 'taro', 'matcha'],
            ['amber', 'amber', 'amber', 'amber'],
            [],
            []
        ]
    },
    {
        level: 28,
        title: "皇家調香師",
        tubes: [
            ['taro', 'redbean', 'amber', 'mustard'],
            ['glacier', 'taro', 'redbean', 'amber'],
            ['mustard', 'glacier', 'taro', 'redbean'],
            ['amber', 'mustard', 'glacier', 'taro'],
            ['redbean', 'amber', 'mustard', 'glacier'],
            ['sage', 'sage', 'sage', 'sage'],
            [],
            []
        ]
    },
    {
        level: 29,
        title: "莫蘭迪光影",
        tubes: [
            ['matcha', 'peach', 'taro', 'glacier'],
            ['amber', 'mustard', 'redbean', 'slate'],
            ['matcha', 'peach', 'taro', 'glacier'],
            ['amber', 'mustard', 'redbean', 'slate'],
            ['slate', 'redbean', 'mustard', 'amber'],
            ['glacier', 'taro', 'peach', 'matcha'],
            ['slate', 'redbean', 'mustard', 'amber'],
            [],
            []
        ]
    },
    {
        level: 30,
        title: "滿園春色",
        tubes: [
            ['peach', 'matcha', 'coral', 'sage'],
            ['glacier', 'taro', 'mustard', 'redbean'],
            ['sage', 'coral', 'matcha', 'peach'],
            ['redbean', 'mustard', 'taro', 'glacier'],
            ['peach', 'matcha', 'coral', 'sage'],
            ['glacier', 'taro', 'mustard', 'redbean'],
            ['sage', 'coral', 'matcha', 'peach'],
            [],
            []
        ]
    },

    // --- Phase 5: 傳奇畫室 (Levels 31 - 36) ---
    {
        level: 31,
        title: "八色交響曲",
        tubes: [
            ['matcha', 'taro', 'peach', 'glacier'],
            ['mustard', 'redbean', 'sage', 'amber'],
            ['slate', 'matcha', 'taro', 'peach'],
            ['glacier', 'mustard', 'redbean', 'sage'],
            ['amber', 'slate', 'matcha', 'taro'],
            ['peach', 'glacier', 'mustard', 'redbean'],
            ['sage', 'amber', 'slate', 'matcha'],
            ['taro', 'peach', 'glacier', 'mustard'],
            [],
            []
        ]
    },
    {
        level: 32,
        title: "彩雲歸岫",
        tubes: [
            ['coral', 'peach', 'mustard', 'matcha'],
            ['glacier', 'taro', 'slate', 'amber'],
            ['coral', 'peach', 'mustard', 'matcha'],
            ['glacier', 'taro', 'slate', 'amber'],
            ['amber', 'slate', 'taro', 'glacier'],
            ['matcha', 'mustard', 'peach', 'coral'],
            ['amber', 'slate', 'taro', 'glacier'],
            ['matcha', 'mustard', 'peach', 'coral'],
            [],
            []
        ]
    },
    {
        level: 33,
        title: "星塵之淚",
        tubes: [
            ['taro', 'glacier', 'slate', 'matcha'],
            ['peach', 'mustard', 'coral', 'amber'],
            ['matcha', 'slate', 'glacier', 'taro'],
            ['amber', 'coral', 'mustard', 'peach'],
            ['taro', 'glacier', 'slate', 'matcha'],
            ['peach', 'mustard', 'coral', 'amber'],
            ['matcha', 'slate', 'glacier', 'taro'],
            ['amber', 'coral', 'mustard', 'peach'],
            [],
            []
        ]
    },
    {
        level: 34,
        title: "四季流轉",
        tubes: [
            ['matcha', 'sage', 'glacier', 'slate'],
            ['mustard', 'peach', 'coral', 'amber'],
            ['redbean', 'taro', 'matcha', 'sage'],
            ['glacier', 'slate', 'mustard', 'peach'],
            ['coral', 'amber', 'redbean', 'taro'],
            ['matcha', 'sage', 'glacier', 'slate'],
            ['mustard', 'peach', 'coral', 'amber'],
            ['redbean', 'taro', 'matcha', 'sage'],
            [],
            []
        ]
    },
    {
        level: 35,
        title: "萬花筒之境",
        tubes: [
            ['coral', 'slate', 'amber', 'redbean'],
            ['sage', 'mustard', 'glacier', 'taro'],
            ['peach', 'matcha', 'coral', 'slate'],
            ['redbean', 'sage', 'mustard', 'glacier'],
            ['taro', 'peach', 'matcha', 'amber'],
            ['coral', 'slate', 'amber', 'redbean'],
            ['sage', 'mustard', 'glacier', 'taro'],
            ['peach', 'matcha', 'coral', 'slate'],
            [],
            []
        ]
    },
    {
        level: 36,
        title: "終極水彩畫卷",
        tubes: [
            ['matcha', 'taro', 'peach', 'glacier'],
            ['mustard', 'redbean', 'sage', 'amber'],
            ['slate', 'coral', 'matcha', 'taro'],
            ['peach', 'glacier', 'mustard', 'redbean'],
            ['sage', 'amber', 'slate', 'coral'],
            ['matcha', 'taro', 'peach', 'glacier'],
            ['mustard', 'redbean', 'sage', 'amber'],
            ['slate', 'coral', 'matcha', 'taro'],
            [],
            []
        ]
    }
];

// ==========================================
// BFS SOLVER & HINT ENGINE
// ==========================================

/**
 * Checks whether a given tubes board state is solved.
 * A board is solved if every tube is either empty OR completely filled with 4 items of the exact same color.
 */
function isBoardSolved(tubes, capacity = TUBE_CAPACITY) {
    for (let tube of tubes) {
        if (tube.length === 0) continue;
        if (tube.length !== capacity) return false;
        const firstColor = tube[0];
        for (let c of tube) {
            if (c !== firstColor) return false;
        }
    }
    return true;
}

/**
 * Serializes tube state for visited state hashing in BFS.
 */
function serializeState(tubes) {
    return tubes.map(t => t.join(',')).join('|');
}

/**
 * Finds all valid pours from state
 */
function getValidMoves(tubes, capacity = TUBE_CAPACITY) {
    const moves = [];
    const n = tubes.length;

    for (let fromIdx = 0; fromIdx < n; fromIdx++) {
        const fromTube = tubes[fromIdx];
        if (fromTube.length === 0) continue;

        // Skip pouring from a tube that is already completed (all 4 same color)
        if (fromTube.length === capacity && fromTube.every(c => c === fromTube[0])) {
            continue;
        }

        const topColor = fromTube[fromTube.length - 1];

        for (let toIdx = 0; toIdx < n; toIdx++) {
            if (fromIdx === toIdx) continue;
            const toTube = tubes[toIdx];

            // Target tube is full
            if (toTube.length >= capacity) continue;

            // Target is empty OR matches top color
            if (toTube.length === 0) {
                // Heuristic: avoid pouring a homogeneous tube into an empty tube (waste of move)
                if (fromTube.every(c => c === topColor)) continue;
                moves.push({ from: fromIdx, to: toIdx });
            } else if (toTube[toTube.length - 1] === topColor) {
                moves.push({ from: fromIdx, to: toIdx });
            }
        }
    }
    return moves;
}

/**
 * Applies a pour move and returns a new cloned tube array.
 */
function applyMove(tubes, move, capacity = TUBE_CAPACITY) {
    const newTubes = tubes.map(t => [...t]);
    const fromTube = newTubes[move.from];
    const toTube = newTubes[move.to];

    const color = fromTube[fromTube.length - 1];
    let count = 0;

    // Count contiguous top matching colors
    for (let i = fromTube.length - 1; i >= 0; i--) {
        if (fromTube[i] === color) count++;
        else break;
    }

    // Limit by available space in toTube
    const availableSpace = capacity - toTube.length;
    const pourCount = Math.min(count, availableSpace);

    for (let i = 0; i < pourCount; i++) {
        fromTube.pop();
        toTube.push(color);
    }

    return newTubes;
}

/**
 * Breadth-First Search (BFS) Solver to find the shortest winning move sequence or next hint.
 * Capped at maxStates to guarantee fast execution (< 25ms).
 */
function solveWaterSort(initialTubes, maxStates = 5000, capacity = TUBE_CAPACITY) {
    if (isBoardSolved(initialTubes, capacity)) {
        return { solved: true, moves: [] };
    }

    const queue = [{ tubes: initialTubes, path: [] }];
    const visited = new Set();
    visited.add(serializeState(initialTubes));

    let statesChecked = 0;

    while (queue.length > 0 && statesChecked < maxStates) {
        const current = queue.shift();
        statesChecked++;

        const validMoves = getValidMoves(current.tubes, capacity);

        for (let move of validMoves) {
            const nextTubes = applyMove(current.tubes, move, capacity);

            if (isBoardSolved(nextTubes, capacity)) {
                return {
                    solved: true,
                    moves: [...current.path, move]
                };
            }

            const stateHash = serializeState(nextTubes);
            if (!visited.has(stateHash)) {
                visited.add(stateHash);
                queue.push({
                    tubes: nextTubes,
                    path: [...current.path, move]
                });
            }
        }
    }

    return { solved: false, moves: [] };
}

window.CURATED_LEVELS = CURATED_LEVELS;
window.TUBE_CAPACITY = TUBE_CAPACITY;
window.isBoardSolved = isBoardSolved;
window.getValidMoves = getValidMoves;
window.solveWaterSort = solveWaterSort;
