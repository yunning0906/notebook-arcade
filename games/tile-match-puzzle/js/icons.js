/**
 * Paper Tile Match 3 - Suika Game Fruit Icon Library
 * 全部水果圖案完全與《Suika Game》手繪風格一致：
 * 經典水果色鉛筆柔和色澤、橘子墨綠色葉片、棕色果梗、可愛小黑點雙眼與治癒笑臉。
 */

const SUIKA_ICONS = {
    // Tier 0: Cherry (櫻桃)
    cherry: {
        id: 'cherry',
        name: '櫻桃',
        color: '#FF6B7A',
        svg: `<svg viewBox="0 0 64 64" class="tile-svg" fill="none">
            <!-- 櫻桃果肉本體 (Suika Game 溫暖粉彩紅) -->
            <circle cx="32" cy="38" r="16" fill="#FF6B7A" />
            <!-- 柔和微光高光 -->
            <ellipse cx="26" cy="32" rx="4.5" ry="2.6" fill="rgba(255, 255, 255, 0.45)" transform="rotate(-30 26 32)" />
            <!-- 棕色手繪果梗 -->
            <path d="M32 24 Q38 12 36 9" stroke="#524338" stroke-width="2.5" stroke-linecap="round" />
            <!-- 橘子墨綠色葉片 -->
            <ellipse cx="40" cy="11" rx="6" ry="3.2" fill="#1E4D2B" transform="rotate(-20 40 11)" />
            <!-- Suika Game 經典可愛小黑點雙眼 -->
            <circle cx="27" cy="38" r="1.6" fill="#222222" />
            <circle cx="37" cy="38" r="1.6" fill="#222222" />
            <!-- 可愛微笑 -->
            <path d="M29 42 Q32 45.5 35 42" stroke="#222222" stroke-width="1.6" stroke-linecap="round" />
        </svg>`
    },

    // Tier 1: Strawberry (草莓)
    strawberry: {
        id: 'strawberry',
        name: '草莓',
        color: '#FF5E6C',
        svg: `<svg viewBox="0 0 64 64" class="tile-svg" fill="none">
            <!-- 草莓心形果肉 -->
            <path d="M32 54 C20 44 17 31 22 24 C26 19 38 19 42 24 C47 31 44 44 32 54 Z" fill="#FF5E6C" />
            <!-- 柔光高光 -->
            <ellipse cx="26" cy="30" rx="3.5" ry="6" fill="rgba(255, 255, 255, 0.35)" transform="rotate(-20 26 30)" />
            <!-- 頂部 3 片橘子墨綠色萼葉 -->
            <ellipse cx="32" cy="19" rx="5.5" ry="2.6" fill="#1E4D2B" />
            <ellipse cx="24" cy="21" rx="4.5" ry="2.2" fill="#1E4D2B" transform="rotate(-30 24 21)" />
            <ellipse cx="40" cy="21" rx="4.5" ry="2.2" fill="#1E4D2B" transform="rotate(30 40 21)" />
            <!-- 小黑點雙眼 -->
            <circle cx="27" cy="34" r="1.6" fill="#222222" />
            <circle cx="37" cy="34" r="1.6" fill="#222222" />
            <!-- 微笑 -->
            <path d="M29.5 38 Q32 41 34.5 38" stroke="#222222" stroke-width="1.6" stroke-linecap="round" />
        </svg>`
    },

    // Tier 2: Grape (葡萄)
    grape: {
        id: 'grape',
        name: '葡萄',
        color: '#A57BC9',
        svg: `<svg viewBox="0 0 64 64" class="tile-svg" fill="none">
            <!-- 葡萄果粒輪廓群 -->
            <circle cx="25" cy="30" r="9" fill="#956BB9" />
            <circle cx="39" cy="30" r="9" fill="#956BB9" />
            <circle cx="22" cy="42" r="8.5" fill="#A57BC9" />
            <circle cx="42" cy="42" r="8.5" fill="#A57BC9" />
            <circle cx="32" cy="37" r="12" fill="#A57BC9" />
            <circle cx="32" cy="49" r="7.5" fill="#B794D8" />
            <!-- 柔和微光高光 -->
            <ellipse cx="28" cy="32" rx="3.5" ry="2" fill="rgba(255, 255, 255, 0.4)" transform="rotate(-30 28 32)" />
            <!-- 棕色小蒂梗 -->
            <path d="M32 20 L32 14" stroke="#524338" stroke-width="2.5" stroke-linecap="round" />
            <!-- 橘子墨綠色葉子 -->
            <ellipse cx="38" cy="16" rx="6" ry="3" fill="#1E4D2B" transform="rotate(25 38 16)" />
            <!-- 小黑點雙眼 -->
            <circle cx="27" cy="38" r="1.6" fill="#222222" />
            <circle cx="37" cy="38" r="1.6" fill="#222222" />
            <!-- 微笑 -->
            <path d="M29.5 42 Q32 45 34.5 42" stroke="#222222" stroke-width="1.6" stroke-linecap="round" />
        </svg>`
    },

    // Tier 3: Dekopon (凸頂柑 / 椪柑)
    dekopon: {
        id: 'dekopon',
        name: '凸頂柑',
        color: '#FFA74F',
        svg: `<svg viewBox="0 0 64 64" class="tile-svg" fill="none">
            <!-- 頂部特徵凸起小包 -->
            <ellipse cx="32" cy="20" rx="6.5" ry="4.5" fill="#FFA74F" />
            <!-- 圓潤柑橘本體 -->
            <circle cx="32" cy="38" r="17.5" fill="#FFA74F" />
            <!-- 柔光高光 -->
            <ellipse cx="25" cy="31" rx="4.5" ry="2.5" fill="rgba(255, 255, 255, 0.4)" transform="rotate(-30 25 31)" />
            <!-- 橘子墨綠色嫩葉 -->
            <ellipse cx="38" cy="18" rx="6" ry="3.2" fill="#1E4D2B" transform="rotate(25 38 18)" />
            <!-- 小黑點雙眼 -->
            <circle cx="26" cy="38" r="1.7" fill="#222222" />
            <circle cx="38" cy="38" r="1.7" fill="#222222" />
            <!-- 微笑 -->
            <path d="M29 42.5 Q32 46.5 35 42.5" stroke="#222222" stroke-width="1.7" stroke-linecap="round" />
        </svg>`
    },

    // Tier 4: Persimmon (柿子)
    persimmon: {
        id: '柿子',
        name: '柿子',
        color: '#FF7657',
        svg: `<svg viewBox="0 0 64 64" class="tile-svg" fill="none">
            <!-- 柿子微扁橢圓本體 -->
            <path d="M32 19 C18 19 14 30 14 38 C14 48 22 53 32 53 C42 53 50 48 50 38 C50 30 46 19 32 19 Z" fill="#FF7657" />
            <!-- 柔光高光 -->
            <ellipse cx="24" cy="29" rx="4" ry="2.2" fill="rgba(255, 255, 255, 0.4)" transform="rotate(-25 24 29)" />
            <!-- 頂部 4 裂片墨綠色柿蒂萼片 -->
            <path d="M32 19 C30 14 23 15 25 19 C23 20 23 24 27 22 C30 24 34 24 37 22 C41 24 41 20 39 19 C41 15 34 14 32 19 Z" fill="#1E4D2B" />
            <!-- 小黑點雙眼 -->
            <circle cx="26" cy="38" r="1.7" fill="#222222" />
            <circle cx="38" cy="38" r="1.7" fill="#222222" />
            <!-- 微笑 -->
            <path d="M29 43 Q32 46.5 35 43" stroke="#222222" stroke-width="1.6" stroke-linecap="round" />
        </svg>`
    },

    // Tier 5: Apple (蘋果)
    apple: {
        id: 'apple',
        name: '蘋果',
        color: '#EE5A5A',
        svg: `<svg viewBox="0 0 64 64" class="tile-svg" fill="none">
            <!-- 蘋果雙弧心形果肉 (頂底微凹) -->
            <path d="M32 22 C22 16 13 22 13 36 C13 49 24 55 32 55 C40 55 51 49 51 36 C51 22 42 16 32 22 Z" fill="#EE5A5A" />
            <!-- 柔光高光 -->
            <ellipse cx="24" cy="30" rx="4.5" ry="2.5" fill="rgba(255, 255, 255, 0.4)" transform="rotate(-30 24 30)" />
            <!-- 棕色果梗 -->
            <path d="M32 20 Q34 13 38 11" stroke="#524338" stroke-width="2.5" stroke-linecap="round" />
            <!-- 橘子墨綠色葉子 -->
            <ellipse cx="39" cy="14" rx="5.5" ry="2.8" fill="#1E4D2B" transform="rotate(-25 39 14)" />
            <!-- 小黑點雙眼 -->
            <circle cx="26" cy="37" r="1.7" fill="#222222" />
            <circle cx="38" cy="37" r="1.7" fill="#222222" />
            <!-- 微笑 -->
            <path d="M29 42 Q32 46 35 42" stroke="#222222" stroke-width="1.7" stroke-linecap="round" />
        </svg>`
    },

    // Tier 6: Pear (西洋梨 / 梨子)
    pear: {
        id: 'pear',
        name: '梨子',
        color: '#C6E377',
        svg: `<svg viewBox="0 0 64 64" class="tile-svg" fill="none">
            <!-- 洋梨葫蘆形輪廓 -->
            <path d="M32 18 C26 18 24 25 24 31 C17 37 16 48 21 53 C26 57 38 57 43 53 C48 48 47 37 40 31 C40 25 38 18 32 18 Z" fill="#C6E377" />
            <!-- 柔光高光 -->
            <ellipse cx="25" cy="40" rx="4" ry="2.2" fill="rgba(255, 255, 255, 0.45)" transform="rotate(-25 25 40)" />
            <!-- 棕色小蒂梗 -->
            <path d="M32 18 L34 12" stroke="#524338" stroke-width="2.4" stroke-linecap="round" />
            <!-- 橘子墨綠色葉子 -->
            <ellipse cx="38" cy="14" rx="5" ry="2.6" fill="#1E4D2B" transform="rotate(30 38 14)" />
            <!-- 小黑點雙眼 -->
            <circle cx="27" cy="40" r="1.7" fill="#222222" />
            <circle cx="37" cy="40" r="1.7" fill="#222222" />
            <!-- 微笑 -->
            <path d="M29.5 45 Q32 48 34.5 45" stroke="#222222" stroke-width="1.6" stroke-linecap="round" />
        </svg>`
    },

    // Tier 7: Peach (水蜜桃)
    peach: {
        id: 'peach',
        name: '水蜜桃',
        color: '#FFB2C9',
        svg: `<svg viewBox="0 0 64 64" class="tile-svg" fill="none">
            <!-- 蜜桃粉彩本體 -->
            <path d="M32 20 C23 15 13 22 13 36 C13 49 24 55 32 55 C40 55 51 49 51 36 C51 22 41 15 32 20 Z" fill="#FFB2C9" />
            <!-- 蜜桃標誌性頂部中縫弧線 -->
            <path d="M32 20 Q32 28 32 32" stroke="rgba(163, 75, 105, 0.45)" stroke-width="2" stroke-linecap="round" />
            <!-- 橘子墨綠色葉子 -->
            <ellipse cx="38" cy="17" rx="6" ry="3" fill="#1E4D2B" transform="rotate(-28 38 17)" />
            <!-- 小黑點雙眼 -->
            <circle cx="26" cy="38" r="1.7" fill="#222222" />
            <circle cx="38" cy="38" r="1.7" fill="#222222" />
            <!-- 微笑 -->
            <path d="M29 43 Q32 46.5 35 43" stroke="#222222" stroke-width="1.7" stroke-linecap="round" />
        </svg>`
    },

    // Tier 8: Pineapple (鳳梨)
    pineapple: {
        id: 'pineapple',
        name: '鳳梨',
        color: '#FFA74F',
        svg: `<svg viewBox="0 0 64 64" class="tile-svg" fill="none">
            <!-- 鳳梨橢圓金黃身軀 -->
            <ellipse cx="32" cy="39" rx="16" ry="17" fill="#FFA74F" />
            <!-- 柔和菱格紋線 -->
            <path d="M22 30 L42 50 M42 30 L22 50 M20 40 L40 40 M32 23 L32 55" stroke="#FF8F00" stroke-width="1.2" opacity="0.35" />
            <!-- 頂部多片挺拔的墨綠冠芽 -->
            <polygon points="32,9 28,24 36,24" fill="#1E4D2B" />
            <polygon points="24,12 24,24 30,24" fill="#1E4D2B" />
            <polygon points="40,12 34,24 40,24" fill="#1E4D2B" />
            <!-- 小黑點雙眼 -->
            <circle cx="26" cy="39" r="1.7" fill="#222222" />
            <circle cx="38" cy="39" r="1.7" fill="#222222" />
            <!-- 微笑 -->
            <path d="M29.5 44 Q32 47.5 34.5 44" stroke="#222222" stroke-width="1.7" stroke-linecap="round" />
        </svg>`
    },

    // Tier 9: Melon (洋香瓜 / 哈密瓜)
    melon: {
        id: 'melon',
        name: '哈密瓜',
        color: '#A8E6CF',
        svg: `<svg viewBox="0 0 64 64" class="tile-svg" fill="none">
            <!-- 哈密瓜淺綠球體 -->
            <circle cx="32" cy="37" r="17.5" fill="#A8E6CF" />
            <!-- 柔和甜瓜網格紋路 -->
            <path d="M19 30 Q32 26 45 30 M15 37 Q32 33 49 37 M19 44 Q32 40 45 44" stroke="#72C6A3" stroke-width="1.4" opacity="0.55" />
            <!-- 棕色 T 型瓜蒂 -->
            <path d="M32 19.5 L32 14 M27 14 L37 14" stroke="#524338" stroke-width="2.2" stroke-linecap="round" />
            <!-- 小黑點雙眼 -->
            <circle cx="26" cy="37" r="1.7" fill="#222222" />
            <circle cx="38" cy="37" r="1.7" fill="#222222" />
            <!-- 微笑 -->
            <path d="M29 42 Q32 46 35 42" stroke="#222222" stroke-width="1.7" stroke-linecap="round" />
        </svg>`
    },

    // Tier 10: Watermelon (大西瓜)
    watermelon: {
        id: 'watermelon',
        name: '西瓜',
        color: '#2ECC71',
        svg: `<svg viewBox="0 0 64 64" class="tile-svg" fill="none">
            <!-- 大西瓜翡翠綠球體 -->
            <circle cx="32" cy="37" r="18" fill="#69D297" />
            <!-- 兩側自然對稱的深墨綠波浪西瓜條紋 (不遮擋面部) -->
            <path d="M21 23 Q25 36 21 49" stroke="#1A4D2E" stroke-width="2.8" stroke-linecap="round" />
            <path d="M43 23 Q39 36 43 49" stroke="#1A4D2E" stroke-width="2.8" stroke-linecap="round" />
            <path d="M16 32 Q18 37 16 42" stroke="#1A4D2E" stroke-width="2.4" stroke-linecap="round" />
            <path d="M48 32 Q46 37 48 42" stroke="#1A4D2E" stroke-width="2.4" stroke-linecap="round" />
            <!-- 頂部棕色捲曲小果梗 -->
            <path d="M32 19 Q33 13 37 12" stroke="#524338" stroke-width="2.5" stroke-linecap="round" />
            <!-- 小黑點雙眼 -->
            <circle cx="26" cy="36" r="1.8" fill="#222222" />
            <circle cx="38" cy="36" r="1.8" fill="#222222" />
            <!-- 微笑 -->
            <path d="M29 42 Q32 46.5 35 42" stroke="#222222" stroke-width="1.8" stroke-linecap="round" />
        </svg>`
    }
};

// 為了相容先前的舊關卡 Key，將別名全部映射至 Suika Game 對應水果
SUIKA_ICONS.lemon = SUIKA_ICONS.dekopon;
SUIKA_ICONS.avocado = SUIKA_ICONS.pear;
SUIKA_ICONS.toast = SUIKA_ICONS.pineapple;
SUIKA_ICONS.coffee = SUIKA_ICONS.grape;
SUIKA_ICONS.croissant = SUIKA_ICONS.persimmon;
SUIKA_ICONS.leaf = SUIKA_ICONS.melon;
SUIKA_ICONS.clover = SUIKA_ICONS.watermelon;
SUIKA_ICONS.acorn = SUIKA_ICONS.peach;
SUIKA_ICONS.tulip = SUIKA_ICONS.strawberry;
SUIKA_ICONS.sun = SUIKA_ICONS.dekopon;
SUIKA_ICONS.pencil = SUIKA_ICONS.apple;

window.TILE_ICONS = SUIKA_ICONS;
