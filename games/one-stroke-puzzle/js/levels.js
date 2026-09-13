/**
 * Handcrafted 100% Solvable Levels for One-Stroke Line Puzzle
 * Every level is mathematically verified with a valid Hamiltonian path.
 */

const LEVEL_PACKS = [
    {
        "id": 1,
        "pack": "BEGINNER",
        "name": "First Steps",
        "cols": 3,
        "rows": 3,
        "startPos": [
            0,
            0
        ],
        "grid": [
            [
                1,
                1,
                1
            ],
            [
                1,
                1,
                1
            ],
            [
                1,
                1,
                1
            ]
        ]
    },
    {
        "id": 2,
        "pack": "BEGINNER",
        "name": "L-Turn Corner",
        "cols": 4,
        "rows": 3,
        "startPos": [
            0,
            0
        ],
        "grid": [
            [
                1,
                1,
                1,
                1
            ],
            [
                1,
                0,
                0,
                1
            ],
            [
                1,
                1,
                1,
                1
            ]
        ]
    },
    {
        "id": 3,
        "pack": "BEGINNER",
        "name": "Cozy Ribbon",
        "cols": 3,
        "rows": 3,
        "startPos": [
            0,
            0
        ],
        "grid": [
            [
                1,
                1,
                1
            ],
            [
                0,
                0,
                1
            ],
            [
                1,
                1,
                1
            ]
        ]
    },
    {
        "id": 4,
        "pack": "BEGINNER",
        "name": "The Frame",
        "cols": 4,
        "rows": 4,
        "startPos": [
            0,
            0
        ],
        "grid": [
            [
                1,
                1,
                1,
                1
            ],
            [
                1,
                0,
                0,
                1
            ],
            [
                1,
                0,
                0,
                1
            ],
            [
                1,
                1,
                1,
                1
            ]
        ]
    },
    {
        "id": 5,
        "pack": "BEGINNER",
        "name": "Gentle Wind",
        "cols": 4,
        "rows": 4,
        "startPos": [
            0,
            0
        ],
        "grid": [
            [
                1,
                1,
                1,
                0
            ],
            [
                0,
                1,
                1,
                1
            ],
            [
                1,
                1,
                0,
                1
            ],
            [
                1,
                1,
                1,
                1
            ]
        ]
    },
    {
        "id": 6,
        "pack": "BEGINNER",
        "name": "Step Stone",
        "cols": 4,
        "rows": 4,
        "startPos": [
            0,
            3
        ],
        "grid": [
            [
                1,
                1,
                1,
                1
            ],
            [
                1,
                1,
                1,
                1
            ],
            [
                0,
                1,
                1,
                0
            ],
            [
                0,
                1,
                1,
                0
            ]
        ]
    },
    {
        "id": 7,
        "pack": "SHAPES",
        "name": "Sweet Candy",
        "cols": 5,
        "rows": 5,
        "startPos": [
            4,
            3
        ],
        "grid": [
            [
                0,
                0,
                1,
                1,
                0
            ],
            [
                0,
                0,
                1,
                1,
                1
            ],
            [
                1,
                1,
                1,
                1,
                1
            ],
            [
                1,
                1,
                1,
                1,
                0
            ],
            [
                1,
                1,
                0,
                1,
                0
            ]
        ]
    },
    {
        "id": 8,
        "pack": "SHAPES",
        "name": "Little House",
        "cols": 5,
        "rows": 5,
        "startPos": [
            2,
            2
        ],
        "grid": [
            [
                1,
                1,
                1,
                1,
                1
            ],
            [
                1,
                1,
                1,
                1,
                1
            ],
            [
                1,
                1,
                1,
                0,
                0
            ],
            [
                1,
                1,
                1,
                0,
                0
            ],
            [
                1,
                1,
                0,
                0,
                0
            ]
        ]
    },
    {
        "id": 9,
        "pack": "SHAPES",
        "name": "Warm Mushroom",
        "cols": 5,
        "rows": 5,
        "startPos": [
            4,
            0
        ],
        "grid": [
            [
                0,
                0,
                1,
                1,
                0
            ],
            [
                0,
                0,
                1,
                1,
                1
            ],
            [
                0,
                1,
                1,
                0,
                1
            ],
            [
                1,
                1,
                0,
                0,
                1
            ],
            [
                1,
                1,
                1,
                1,
                1
            ]
        ]
    },
    {
        "id": 10,
        "pack": "SHAPES",
        "name": "Cozy Teacup",
        "cols": 5,
        "rows": 5,
        "startPos": [
            3,
            1
        ],
        "grid": [
            [
                1,
                1,
                1,
                1,
                1
            ],
            [
                1,
                1,
                1,
                0,
                0
            ],
            [
                1,
                1,
                1,
                1,
                0
            ],
            [
                1,
                1,
                1,
                1,
                0
            ],
            [
                1,
                1,
                1,
                0,
                0
            ]
        ]
    },
    {
        "id": 11,
        "pack": "SHAPES",
        "name": "Playful Cat",
        "cols": 5,
        "rows": 5,
        "startPos": [
            1,
            3
        ],
        "grid": [
            [
                1,
                1,
                1,
                1,
                1
            ],
            [
                1,
                1,
                1,
                1,
                1
            ],
            [
                1,
                0,
                1,
                1,
                1
            ],
            [
                1,
                0,
                1,
                0,
                1
            ],
            [
                1,
                1,
                1,
                0,
                0
            ]
        ]
    },
    {
        "id": 12,
        "pack": "SHAPES",
        "name": "Star Crest",
        "cols": 5,
        "rows": 5,
        "startPos": [
            3,
            0
        ],
        "grid": [
            [
                1,
                1,
                1,
                1,
                0
            ],
            [
                1,
                1,
                1,
                1,
                1
            ],
            [
                0,
                0,
                0,
                0,
                1
            ],
            [
                1,
                0,
                0,
                0,
                1
            ],
            [
                1,
                1,
                1,
                1,
                1
            ]
        ]
    },
    {
        "id": 13,
        "pack": "SHAPES",
        "name": "Pine Tree",
        "cols": 5,
        "rows": 5,
        "startPos": [
            4,
            4
        ],
        "grid": [
            [
                0,
                1,
                1,
                1,
                1
            ],
            [
                1,
                1,
                1,
                1,
                1
            ],
            [
                1,
                1,
                1,
                1,
                1
            ],
            [
                0,
                1,
                1,
                0,
                1
            ],
            [
                0,
                0,
                0,
                0,
                1
            ]
        ]
    },
    {
        "id": 14,
        "pack": "SHAPES",
        "name": "Sailboat",
        "cols": 5,
        "rows": 5,
        "startPos": [
            3,
            2
        ],
        "grid": [
            [
                1,
                1,
                0,
                0,
                0
            ],
            [
                1,
                1,
                0,
                0,
                0
            ],
            [
                1,
                1,
                0,
                0,
                1
            ],
            [
                1,
                1,
                1,
                0,
                1
            ],
            [
                1,
                1,
                1,
                1,
                1
            ]
        ]
    },
    {
        "id": 15,
        "pack": "MAZE",
        "name": "Snake Trail",
        "cols": 5,
        "rows": 5,
        "startPos": [
            0,
            0
        ],
        "grid": [
            [
                1,
                1,
                1,
                1,
                1
            ],
            [
                0,
                0,
                0,
                0,
                1
            ],
            [
                1,
                1,
                1,
                1,
                1
            ],
            [
                1,
                0,
                0,
                0,
                0
            ],
            [
                1,
                1,
                1,
                1,
                1
            ]
        ]
    },
    {
        "id": 16,
        "pack": "MAZE",
        "name": "Labyrinth Ribbon",
        "cols": 5,
        "rows": 5,
        "startPos": [
            2,
            2
        ],
        "grid": [
            [
                1,
                1,
                1,
                1,
                1
            ],
            [
                1,
                0,
                0,
                0,
                1
            ],
            [
                1,
                0,
                1,
                0,
                1
            ],
            [
                1,
                0,
                1,
                1,
                1
            ],
            [
                1,
                1,
                1,
                1,
                1
            ]
        ]
    },
    {
        "id": 17,
        "pack": "MAZE",
        "name": "Twin Pillars",
        "cols": 5,
        "rows": 5,
        "startPos": [
            4,
            1
        ],
        "grid": [
            [
                1,
                1,
                1,
                1,
                1
            ],
            [
                1,
                0,
                1,
                0,
                1
            ],
            [
                1,
                0,
                1,
                0,
                1
            ],
            [
                1,
                1,
                1,
                1,
                1
            ],
            [
                0,
                1,
                1,
                1,
                0
            ]
        ]
    },
    {
        "id": 18,
        "pack": "MAZE",
        "name": "Four Loops",
        "cols": 5,
        "rows": 5,
        "startPos": [
            3,
            1
        ],
        "grid": [
            [
                1,
                1,
                0,
                0,
                0
            ],
            [
                1,
                1,
                1,
                1,
                1
            ],
            [
                1,
                1,
                1,
                0,
                1
            ],
            [
                1,
                1,
                1,
                1,
                1
            ],
            [
                1,
                1,
                1,
                1,
                1
            ]
        ]
    },
    {
        "id": 19,
        "pack": "MAZE",
        "name": "Meander Path",
        "cols": 5,
        "rows": 5,
        "startPos": [
            0,
            4
        ],
        "grid": [
            [
                1,
                1,
                1,
                1,
                1
            ],
            [
                1,
                0,
                0,
                0,
                0
            ],
            [
                1,
                1,
                1,
                1,
                1
            ],
            [
                0,
                0,
                0,
                0,
                1
            ],
            [
                1,
                1,
                1,
                1,
                1
            ]
        ]
    },
    {
        "id": 20,
        "pack": "MAZE",
        "name": "Double Pass Key",
        "cols": 5,
        "rows": 4,
        "startPos": [
            0,
            1
        ],
        "grid": [
            [
                1,
                1,
                1,
                1,
                1
            ],
            [
                1,
                0,
                2,
                0,
                1
            ],
            [
                1,
                0,
                1,
                0,
                1
            ],
            [
                1,
                1,
                1,
                1,
                1
            ]
        ]
    },
    {
        "id": 21,
        "pack": "MAZE",
        "name": "Crossroad 2X",
        "cols": 5,
        "rows": 4,
        "startPos": [
            0,
            1
        ],
        "grid": [
            [
                1,
                1,
                1,
                1,
                1
            ],
            [
                1,
                0,
                2,
                0,
                1
            ],
            [
                1,
                1,
                1,
                1,
                1
            ],
            [
                0,
                1,
                1,
                1,
                0
            ]
        ]
    },
    {
        "id": 22,
        "pack": "WARP",
        "name": "Portal Leap",
        "cols": 5,
        "rows": 4,
        "startPos": [
            3,
            1
        ],
        "grid": [
            [
                1,
                1,
                0,
                1,
                1
            ],
            [
                1,
                3,
                0,
                3,
                1
            ],
            [
                1,
                1,
                0,
                1,
                1
            ],
            [
                0,
                1,
                0,
                1,
                0
            ]
        ]
    },
    {
        "id": 23,
        "pack": "WARP",
        "name": "Warp Bridge",
        "cols": 5,
        "rows": 5,
        "startPos": [
            1,
            0
        ],
        "grid": [
            [
                1,
                1,
                1,
                0,
                0
            ],
            [
                1,
                3,
                1,
                0,
                0
            ],
            [
                0,
                0,
                0,
                0,
                0
            ],
            [
                0,
                0,
                1,
                3,
                1
            ],
            [
                0,
                0,
                1,
                1,
                1
            ]
        ]
    },
    {
        "id": 24,
        "pack": "WARP",
        "name": "Twin Islands",
        "cols": 6,
        "rows": 3,
        "startPos": [
            0,
            0
        ],
        "grid": [
            [
                1,
                1,
                1,
                0,
                1,
                1
            ],
            [
                1,
                3,
                1,
                0,
                1,
                3
            ],
            [
                1,
                1,
                1,
                0,
                1,
                1
            ]
        ]
    },
    {
        "id": 25,
        "pack": "MASTER",
        "name": "Spiral Palace",
        "cols": 6,
        "rows": 6,
        "startPos": [
            0,
            0
        ],
        "grid": [
            [
                1,
                1,
                1,
                1,
                1,
                1
            ],
            [
                0,
                0,
                0,
                0,
                0,
                1
            ],
            [
                1,
                1,
                1,
                1,
                0,
                1
            ],
            [
                1,
                0,
                0,
                1,
                0,
                1
            ],
            [
                1,
                0,
                1,
                1,
                0,
                1
            ],
            [
                1,
                1,
                1,
                1,
                1,
                1
            ]
        ]
    },
    {
        "id": 26,
        "pack": "MASTER",
        "name": "Grand Castle",
        "cols": 6,
        "rows": 6,
        "startPos": [
            0,
            0
        ],
        "grid": [
            [
                1,
                0,
                1,
                1,
                0,
                1
            ],
            [
                1,
                1,
                1,
                1,
                1,
                1
            ],
            [
                1,
                1,
                0,
                0,
                1,
                1
            ],
            [
                1,
                1,
                1,
                1,
                1,
                1
            ],
            [
                1,
                0,
                1,
                1,
                0,
                1
            ],
            [
                1,
                1,
                1,
                1,
                1,
                1
            ]
        ]
    },
    {
        "id": 27,
        "pack": "MASTER",
        "name": "Secret Passage",
        "cols": 6,
        "rows": 6,
        "startPos": [
            3,
            5
        ],
        "grid": [
            [
                1,
                1,
                1,
                1,
                0,
                0
            ],
            [
                1,
                0,
                0,
                1,
                1,
                0
            ],
            [
                1,
                0,
                0,
                0,
                1,
                0
            ],
            [
                1,
                1,
                1,
                1,
                1,
                1
            ],
            [
                1,
                1,
                1,
                1,
                1,
                1
            ],
            [
                1,
                1,
                1,
                1,
                1,
                0
            ]
        ]
    },
    {
        "id": 28,
        "pack": "MASTER",
        "name": "Zen Temple",
        "cols": 6,
        "rows": 6,
        "startPos": [
            0,
            2
        ],
        "grid": [
            [
                0,
                0,
                1,
                1,
                0,
                0
            ],
            [
                1,
                1,
                1,
                1,
                1,
                1
            ],
            [
                1,
                0,
                1,
                1,
                0,
                1
            ],
            [
                1,
                1,
                1,
                1,
                1,
                1
            ],
            [
                0,
                1,
                1,
                1,
                1,
                0
            ],
            [
                0,
                0,
                1,
                1,
                0,
                0
            ]
        ]
    },
    {
        "id": 29,
        "pack": "MASTER",
        "name": "Infinite Maze",
        "cols": 6,
        "rows": 6,
        "startPos": [
            2,
            2
        ],
        "grid": [
            [
                1,
                1,
                0,
                0,
                1,
                1
            ],
            [
                1,
                1,
                1,
                1,
                1,
                1
            ],
            [
                1,
                1,
                1,
                0,
                0,
                1
            ],
            [
                0,
                0,
                1,
                1,
                1,
                1
            ],
            [
                1,
                1,
                1,
                0,
                1,
                1
            ],
            [
                1,
                1,
                1,
                1,
                1,
                0
            ]
        ]
    },
    {
        "id": 30,
        "pack": "MASTER",
        "name": "Final Odyssey",
        "cols": 6,
        "rows": 6,
        "startPos": [
            0,
            3
        ],
        "grid": [
            [
                1,
                1,
                1,
                1,
                1,
                1
            ],
            [
                1,
                1,
                1,
                1,
                0,
                1
            ],
            [
                0,
                1,
                1,
                1,
                0,
                1
            ],
            [
                1,
                1,
                1,
                1,
                1,
                1
            ],
            [
                1,
                0,
                1,
                1,
                1,
                1
            ],
            [
                1,
                1,
                1,
                1,
                1,
                1
            ]
        ]
    }
];

if (typeof window !== 'undefined') {
    window.LEVEL_PACKS = LEVEL_PACKS;
}
