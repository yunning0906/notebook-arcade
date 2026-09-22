/**
 * Paper Tile Match 3 - Hand-Drawn SVG Icon Library
 * Warm, cozy notebook stationery aesthetics with soft pastel fills and hand-drawn pencil strokes.
 */

const TILE_ICONS = {
    apple: {
        id: 'apple',
        name: '脆紅蘋果',
        color: '#FF6B6B',
        bg: '#FFE8E8',
        svg: `<svg viewBox="0 0 64 64" class="tile-svg" fill="none" stroke="#4A3728" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
            <!-- Stem and Leaf -->
            <path d="M32 16 C32 10, 36 7, 40 6" stroke="#5D4037" stroke-width="3" />
            <path d="M33 13 C38 11, 44 14, 43 19 C38 21, 33 17, 33 13 Z" fill="#81C784" stroke="#4A3728" stroke-width="2" />
            <!-- Apple Body -->
            <path d="M32 20 C24 16, 12 18, 12 33 C12 47, 25 56, 32 56 C39 56, 52 47, 52 33 C52 18, 40 16, 32 20 Z" fill="#FF7B72" />
            <!-- Soft Highlight -->
            <path d="M19 28 C17 33, 18 39, 21 43" stroke="#FFF0F0" stroke-width="2.5" stroke-linecap="round" />
            <!-- Indent base -->
            <path d="M29 55 C32 54, 35 54, 35 55" stroke="#4A3728" stroke-width="2" />
        </svg>`
    },
    lemon: {
        id: 'lemon',
        name: '鮮黃檸檬',
        color: '#F9A825',
        bg: '#FFF9C4',
        svg: `<svg viewBox="0 0 64 64" class="tile-svg" fill="none" stroke="#4A3728" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
            <!-- Lemon Body with little tips -->
            <path d="M14 20 C23 11, 43 14, 52 28 C55 33, 56 38, 54 44 C53 47, 50 49, 46 51 C32 56, 16 48, 11 36 C9 31, 10 25, 14 20 Z" fill="#FFEE58" />
            <!-- Top Tip -->
            <path d="M52 27 C56 26, 58 29, 54 32" stroke="#4A3728" stroke-width="2" />
            <!-- Bottom Tip -->
            <path d="M12 35 C8 37, 7 34, 11 31" stroke="#4A3728" stroke-width="2" />
            <!-- Leaf -->
            <path d="M43 15 C47 9, 54 10, 56 14 C51 17, 46 17, 43 15 Z" fill="#A5D6A7" stroke="#4A3728" stroke-width="2" />
            <!-- Highlights & Dots -->
            <path d="M22 25 C28 20, 36 21, 41 26" stroke="#FFFFFE" stroke-width="2.5" />
            <circle cx="28" cy="38" r="1" fill="#4A3728" />
            <circle cx="36" cy="42" r="1" fill="#4A3728" />
            <circle cx="44" cy="36" r="1" fill="#4A3728" />
        </svg>`
    },
    strawberry: {
        id: 'strawberry',
        name: '粉甜草莓',
        color: '#E53935',
        bg: '#FFEBEE',
        svg: `<svg viewBox="0 0 64 64" class="tile-svg" fill="none" stroke="#4A3728" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
            <!-- Calyx (Leaves) -->
            <path d="M32 10 L32 6" stroke="#4A3728" stroke-width="2.5" />
            <path d="M22 17 C26 15, 30 19, 32 17 C34 19, 38 15, 42 17 C39 21, 35 21, 32 20 C29 21, 25 21, 22 17 Z" fill="#81C784" stroke="#4A3728" stroke-width="2" />
            <!-- Strawberry Body -->
            <path d="M20 20 C13 25, 14 39, 23 49 C28 54, 31 57, 32 57 C33 57, 36 54, 41 49 C50 39, 51 25, 44 20 C38 18, 26 18, 20 20 Z" fill="#EF5350" />
            <!-- Seeds -->
            <ellipse cx="25" cy="29" rx="1.2" ry="2" fill="#FFE082" />
            <ellipse cx="33" cy="27" rx="1.2" ry="2" fill="#FFE082" />
            <ellipse cx="40" cy="30" rx="1.2" ry="2" fill="#FFE082" />
            <ellipse cx="28" cy="39" rx="1.2" ry="2" fill="#FFE082" />
            <ellipse cx="36" cy="41" rx="1.2" ry="2" fill="#FFE082" />
            <ellipse cx="32" cy="49" rx="1" ry="1.6" fill="#FFE082" />
            <!-- Highlight -->
            <path d="M19 28 C17 33, 19 39, 21 42" stroke="#FFCDD2" stroke-width="2" />
        </svg>`
    },
    avocado: {
        id: 'avocado',
        name: '奶油酪梨',
        color: '#689F38',
        bg: '#F1F8E9',
        svg: `<svg viewBox="0 0 64 64" class="tile-svg" fill="none" stroke="#4A3728" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
            <!-- Outer skin -->
            <path d="M32 10 C24 10, 20 18, 20 28 C14 36, 14 47, 21 53 C27 58, 37 58, 43 53 C50 47, 50 36, 44 28 C44 18, 40 10, 32 10 Z" fill="#558B2F" />
            <!-- Inner pulp -->
            <path d="M32 14 C26 14, 23 21, 23 29 C18 36, 18 45, 23 50 C28 54, 36 54, 41 50 C46 45, 46 36, 41 29 C41 21, 38 14, 32 14 Z" fill="#C5E1A5" stroke="#4A3728" stroke-width="1.8" />
            <!-- Pit (Stone) -->
            <ellipse cx="32" cy="41" rx="8" ry="9" fill="#8D6E63" stroke="#4A3728" stroke-width="2" />
            <!-- Pit Highlight -->
            <path d="M28 38 C28 35, 33 35, 34 37" stroke="#D7CCC8" stroke-width="1.8" />
        </svg>`
    },
    cherry: {
        id: 'cherry',
        name: '雙子櫻桃',
        color: '#C2185B',
        bg: '#FCE4EC',
        svg: `<svg viewBox="0 0 64 64" class="tile-svg" fill="none" stroke="#4A3728" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
            <!-- Stem join & Leaf -->
            <path d="M34 11 C38 9, 44 11, 46 15 C41 16, 36 15, 34 11 Z" fill="#81C784" stroke="#4A3728" stroke-width="1.8" />
            <path d="M34 12 C29 20, 22 28, 20 38" stroke="#4A3728" stroke-width="2.5" />
            <path d="M34 12 C37 20, 42 27, 44 37" stroke="#4A3728" stroke-width="2.5" />
            <!-- Left Cherry -->
            <ellipse cx="20" cy="44" rx="9" ry="8.5" fill="#E91E63" />
            <path d="M15 41 C15 38, 19 38, 20 40" stroke="#F8BBD0" stroke-width="2" />
            <!-- Right Cherry -->
            <ellipse cx="44" cy="43" rx="9" ry="8.5" fill="#C2185B" />
            <path d="M39 40 C39 37, 43 37, 44 39" stroke="#F8BBD0" stroke-width="2" />
        </svg>`
    },
    coffee: {
        id: 'coffee',
        name: '手沖拿鐵',
        color: '#795548',
        bg: '#EFEBE9',
        svg: `<svg viewBox="0 0 64 64" class="tile-svg" fill="none" stroke="#4A3728" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
            <!-- Steam -->
            <path d="M26 12 C24 16, 28 17, 26 21" stroke="#A1887F" stroke-width="2" stroke-linecap="round" />
            <path d="M36 10 C34 14, 38 16, 36 21" stroke="#A1887F" stroke-width="2" stroke-linecap="round" />
            <!-- Mug Body -->
            <path d="M16 23 L44 23 C43 39, 41 47, 30 47 C19 47, 17 39, 16 23 Z" fill="#D7CCC8" />
            <!-- Handle -->
            <path d="M43 27 C49 27, 52 33, 49 40 C46 43, 42 42, 42 42" stroke="#4A3728" stroke-width="2.6" fill="none" />
            <!-- Saucer -->
            <path d="M12 51 C20 54, 40 54, 48 51" stroke="#4A3728" stroke-width="3" stroke-linecap="round" />
            <!-- Coffee Fill inside top -->
            <ellipse cx="30" cy="24" rx="13" ry="3" fill="#6D4C41" />
            <!-- Cute Latte Heart -->
            <path d="M30 26 C28 24, 26 24, 26 25 C26 26, 30 27, 30 27 C30 27, 34 26, 34 25 C34 24, 32 24, 30 26 Z" fill="#FFF8E1" />
        </svg>`
    },
    toast: {
        id: 'toast',
        name: '暖香吐司',
        color: '#D7A04B',
        bg: '#FFF8E1',
        svg: `<svg viewBox="0 0 64 64" class="tile-svg" fill="none" stroke="#4A3728" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
            <!-- Toast Crust -->
            <path d="M15 24 C13 15, 23 13, 32 15 C41 13, 51 15, 49 24 C51 34, 50 47, 47 51 C45 53, 19 53, 17 51 C14 47, 13 34, 15 24 Z" fill="#F5B041" />
            <!-- Toast Soft Center -->
            <path d="M18 25 C17 18, 25 17, 32 18 C39 17, 47 18, 46 25 C47 34, 46 44, 44 48 C41 50, 23 50, 20 48 C18 44, 17 34, 18 25 Z" fill="#FDF2E9" stroke="#E59866" stroke-width="1.8" />
            <!-- Butter Cube -->
            <rect x="27" y="28" width="10" height="9" rx="2" fill="#F9E79F" stroke="#4A3728" stroke-width="1.8" />
            <!-- Melting butter drop -->
            <path d="M32 37 C30 41, 35 42, 34 37" fill="#F9E79F" />
        </svg>`
    },
    croissant: {
        id: 'croissant',
        name: '金黃可頌',
        color: '#E67E22',
        bg: '#FDF2E9',
        svg: `<svg viewBox="0 0 64 64" class="tile-svg" fill="none" stroke="#4A3728" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
            <!-- Crescent Roll Shape -->
            <path d="M12 42 C10 35, 17 25, 28 20 C36 17, 45 20, 52 29 C56 35, 54 42, 50 43 C46 44, 43 37, 39 36 C35 35, 28 35, 24 38 C20 41, 16 45, 12 42 Z" fill="#F39C12" />
            <!-- Crust Stripes -->
            <path d="M26 21 C28 28, 27 34, 25 38" stroke="#D35400" stroke-width="2.2" />
            <path d="M36 19 C37 26, 36 32, 34 36" stroke="#D35400" stroke-width="2.2" />
            <path d="M45 23 C44 29, 42 34, 40 37" stroke="#D35400" stroke-width="2.2" />
            <!-- Highlight -->
            <path d="M30 19 C34 18, 38 19, 41 21" stroke="#FDEBD0" stroke-width="2" />
        </svg>`
    },
    leaf: {
        id: 'leaf',
        name: '清新鮮葉',
        color: '#4CAF50',
        bg: '#E8F5E9',
        svg: `<svg viewBox="0 0 64 64" class="tile-svg" fill="none" stroke="#4A3728" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
            <!-- Leaf Body -->
            <path d="M15 49 C14 36, 21 16, 49 14 C51 38, 36 51, 15 49 Z" fill="#66BB6A" />
            <!-- Center Vein -->
            <path d="M15 49 C26 40, 36 29, 49 14" stroke="#4A3728" stroke-width="2.4" />
            <!-- Stem base -->
            <path d="M15 49 L11 55" stroke="#4A3728" stroke-width="2.8" />
            <!-- Side Veins -->
            <path d="M25 41 C30 40, 34 42, 36 45" stroke="#388E3C" stroke-width="1.8" />
            <path d="M33 32 C38 31, 42 34, 45 37" stroke="#388E3C" stroke-width="1.8" />
            <path d="M27 38 C27 33, 24 30, 22 28" stroke="#388E3C" stroke-width="1.8" />
            <path d="M37 28 C37 23, 34 20, 31 18" stroke="#388E3C" stroke-width="1.8" />
        </svg>`
    },
    clover: {
        id: 'clover',
        name: '幸運四葉草',
        color: '#2E7D32',
        bg: '#E8F5E9',
        svg: `<svg viewBox="0 0 64 64" class="tile-svg" fill="none" stroke="#4A3728" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
            <!-- Stem -->
            <path d="M32 32 C34 44, 28 51, 23 56" stroke="#4A3728" stroke-width="2.5" />
            <!-- Top Leaf -->
            <path d="M32 32 C26 24, 25 14, 32 14 C39 14, 38 24, 32 32 Z" fill="#81C784" />
            <!-- Bottom Leaf -->
            <path d="M32 32 C26 40, 25 50, 32 50 C39 50, 38 40, 32 32 Z" fill="#81C784" />
            <!-- Left Leaf -->
            <path d="M32 32 C24 26, 14 25, 14 32 C14 39, 24 38, 32 32 Z" fill="#66BB6A" />
            <!-- Right Leaf -->
            <path d="M32 32 C40 26, 50 25, 50 32 C50 39, 40 38, 32 32 Z" fill="#66BB6A" />
            <!-- Center Dot -->
            <circle cx="32" cy="32" r="2.5" fill="#388E3C" />
        </svg>`
    },
    acorn: {
        id: 'acorn',
        name: '森林橡實',
        color: '#8D6E63',
        bg: '#EFEBE9',
        svg: `<svg viewBox="0 0 64 64" class="tile-svg" fill="none" stroke="#4A3728" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
            <!-- Stem -->
            <path d="M32 15 C33 9, 37 8, 38 7" stroke="#4A3728" stroke-width="2.8" />
            <!-- Cap -->
            <path d="M19 23 C22 17, 42 17, 45 23 C48 27, 46 30, 44 31 C36 32, 28 32, 20 31 C18 30, 16 27, 19 23 Z" fill="#8D6E63" />
            <!-- Cap Cross Hatch -->
            <path d="M24 21 L28 29" stroke="#5D4037" stroke-width="1.6" />
            <path d="M32 19 L33 30" stroke="#5D4037" stroke-width="1.6" />
            <path d="M40 21 L37 29" stroke="#5D4037" stroke-width="1.6" />
            <!-- Nut Body -->
            <path d="M21 31 C21 44, 30 53, 32 55 C34 53, 43 44, 43 31 C36 32, 28 32, 21 31 Z" fill="#D7CCC8" />
            <!-- Highlight -->
            <path d="M25 36 C25 42, 28 47, 30 49" stroke="#FFFFFF" stroke-width="2" />
        </svg>`
    },
    tulip: {
        id: 'tulip',
        name: '粉紅鬱金香',
        color: '#F06292',
        bg: '#FCE4EC',
        svg: `<svg viewBox="0 0 64 64" class="tile-svg" fill="none" stroke="#4A3728" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
            <!-- Stem & Leaf -->
            <path d="M32 38 L32 56" stroke="#4A3728" stroke-width="2.8" />
            <path d="M32 46 C39 42, 45 44, 46 51 C40 52, 35 50, 32 46 Z" fill="#81C784" stroke="#4A3728" stroke-width="2" />
            <!-- Center Petal -->
            <path d="M32 20 L28 30 L36 30 Z" fill="#EC407A" />
            <!-- Left Petal -->
            <path d="M19 24 C16 35, 25 40, 32 40 C31 32, 27 24, 19 24 Z" fill="#F48FB1" />
            <!-- Right Petal -->
            <path d="M45 24 C48 35, 39 40, 32 40 C33 32, 37 24, 45 24 Z" fill="#F06292" />
            <!-- Center Highlight -->
            <ellipse cx="32" cy="30" rx="3.5" ry="7" fill="#F8BBD0" />
        </svg>`
    },
    sun: {
        id: 'sun',
        name: '暖洋太陽',
        color: '#FFA726',
        bg: '#FFF3E0',
        svg: `<svg viewBox="0 0 64 64" class="tile-svg" fill="none" stroke="#4A3728" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
            <!-- Rays -->
            <path d="M32 8 L32 14" stroke="#FB8C00" stroke-width="2.6" />
            <path d="M32 50 L32 56" stroke="#FB8C00" stroke-width="2.6" />
            <path d="M8 32 L14 32" stroke="#FB8C00" stroke-width="2.6" />
            <path d="M50 32 L56 32" stroke="#FB8C00" stroke-width="2.6" />
            <path d="M15 15 L20 20" stroke="#FB8C00" stroke-width="2.4" />
            <path d="M44 44 L49 49" stroke="#FB8C00" stroke-width="2.4" />
            <path d="M15 49 L20 44" stroke="#FB8C00" stroke-width="2.4" />
            <path d="M44 20 L49 15" stroke="#FB8C00" stroke-width="2.4" />
            <!-- Sun Core -->
            <circle cx="32" cy="32" r="13" fill="#FFCA28" />
            <!-- Smile & Rosy Cheeks -->
            <path d="M28 34 C29 37, 35 37, 36 34" stroke="#4A3728" stroke-width="2" />
            <circle cx="26" cy="31" r="1.5" fill="#4A3728" />
            <circle cx="38" cy="31" r="1.5" fill="#4A3728" />
            <ellipse cx="23" cy="34" rx="2" ry="1.2" fill="#FF8A80" opacity="0.6" />
            <ellipse cx="41" cy="34" rx="2" ry="1.2" fill="#FF8A80" opacity="0.6" />
        </svg>`
    },
    pencil: {
        id: 'pencil',
        name: '彩繪鉛筆',
        color: '#42A5F5',
        bg: '#E3F2FD',
        svg: `<svg viewBox="0 0 64 64" class="tile-svg" fill="none" stroke="#4A3728" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
            <!-- Pencil Body (Tilted) -->
            <path d="M23 41 L43 21 L49 27 L29 47 Z" fill="#64B5F6" />
            <!-- Stripe on shaft -->
            <line x1="26" y1="44" x2="46" y2="24" stroke="#1E88E5" stroke-width="2" />
            <!-- Wooden Tip Cone -->
            <path d="M23 41 L29 47 L19 51 Z" fill="#FFE082" />
            <!-- Lead Tip -->
            <polygon points="19,51 22,48 20,46" fill="#4A3728" stroke="none" />
            <!-- Eraser & Ferrule -->
            <path d="M43 21 L49 27 L53 23 L47 17 Z" fill="#FF8A80" />
            <line x1="45" y1="19" x2="51" y2="25" stroke="#B0BEC5" stroke-width="2" />
        </svg>`
    }
};

window.TILE_ICONS = TILE_ICONS;
