import random
import json
import subprocess
import os

def solve_python(grid, rows, cols, start_pos):
    # Portals map
    portals = {}
    targets = [[0]*cols for _ in range(rows)]
    total_required = 0
    for r in range(rows):
        for c in range(cols):
            val = grid[r][c]
            if val == 1 or val >= 3:
                targets[r][c] = 1
                total_required += 1
                if val >= 3:
                    portals.setdefault(val, []).append((r, c))
            elif val == 2:
                targets[r][c] = 2
                total_required += 2
                
    visited = [[0]*cols for _ in range(rows)]
    sr, sc = start_pos
    visited[sr][sc] = 1
    path = [(sr, sc)]
    
    dirs = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    iterations = 0
    
    def count_deg(r, c):
        deg = 0
        for dr, dc in dirs:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols:
                if targets[nr][nc] > 0 and visited[nr][nc] < targets[nr][nc]:
                    deg += 1
        val = grid[r][c]
        if val >= 3 and val in portals:
            for pr, pc in portals[val]:
                if (pr != r or pc != c) and visited[pr][pc] < targets[pr][pc]:
                    deg += 1
        return deg

    def dfs(r, c, count):
        nonlocal iterations
        iterations += 1
        if iterations > 30000:
            return False
        if count == total_required:
            return True
            
        # Get neighbors
        nbrs = []
        for dr, dc in dirs:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols:
                if targets[nr][nc] > 0 and visited[nr][nc] < targets[nr][nc]:
                    nbrs.append((nr, nc))
        val = grid[r][c]
        if val >= 3 and val in portals:
            for pr, pc in portals[val]:
                if (pr != r or pc != c) and visited[pr][pc] < targets[pr][pc]:
                    nbrs.append((pr, pc))
                    
        # Warnsdorff heuristic
        nbrs.sort(key=lambda p: count_deg(p[0], p[1]))
        
        for nr, nc in nbrs:
            visited[nr][nc] += 1
            path.append((nr, nc))
            if dfs(nr, nc, count + 1):
                return True
            path.pop()
            visited[nr][nc] -= 1
        return False
        
    res = dfs(sr, sc, 1)
    return res

def generate_level(pack_name, level_id, name, rows, cols, target_active, num_doubles=0, num_portals=0):
    for attempt in range(10000):
        grid = [[0]*cols for _ in range(rows)]
        visited_counts = {}
        
        starts = [(0, 0), (0, cols-1), (rows-1, 0), (rows-1, cols-1), (0, cols//2), (rows-1, cols//2)]
        start_pos = random.choice(starts)
        
        path = [start_pos]
        grid[start_pos[0]][start_pos[1]] = 1
        visited_counts[start_pos] = 1
        
        doubles_used = 0
        portals_used = 0
        
        stuck_counter = 0
        while len(path) < target_active and stuck_counter < 100:
            curr = path[-1]
            dirs = [(-1, 0), (1, 0), (0, -1), (0, 1)]
            random.shuffle(dirs)
            
            moved = False
            for dr, dc in dirs:
                nr, nc = curr[0] + dr, curr[1] + dc
                if 0 <= nr < rows and 0 <= nc < cols:
                    if grid[nr][nc] == 0:
                        grid[nr][nc] = 1
                        visited_counts[(nr, nc)] = 1
                        path.append((nr, nc))
                        moved = True
                        break
            
            if not moved and doubles_used < num_doubles:
                for dr, dc in dirs:
                    nr, nc = curr[0] + dr, curr[1] + dc
                    if 0 <= nr < rows and 0 <= nc < cols:
                        if grid[nr][nc] == 1 and visited_counts.get((nr, nc), 0) == 1 and (nr, nc) != curr:
                            grid[nr][nc] = 2
                            visited_counts[(nr, nc)] = 2
                            path.append((nr, nc))
                            doubles_used += 1
                            moved = True
                            break
                                
            if not moved and portals_used < num_portals:
                unvisited = [(r, c) for r in range(rows) for c in range(cols) if grid[r][c] == 0]
                distant = [c for c in unvisited if abs(c[0]-curr[0]) + abs(c[1]-curr[1]) >= 3]
                if distant:
                    target_portal = random.choice(distant)
                    portal_val = 3 + portals_used
                    grid[curr[0]][curr[1]] = portal_val
                    grid[target_portal[0]][target_portal[1]] = portal_val
                    visited_counts[target_portal] = 1
                    path.append(target_portal)
                    portals_used += 1
                    moved = True
            
            if not moved:
                stuck_counter += 1
            else:
                stuck_counter = 0
                
        active_cells = sum(1 for r in range(rows) for c in range(cols) if grid[r][c] > 0)
        if active_cells >= target_active - 4 and doubles_used == num_doubles and portals_used == num_portals:
            # Verify with solver
            if solve_python(grid, rows, cols, start_pos):
                return {
                    "id": level_id,
                    "pack": pack_name,
                    "name": name,
                    "cols": cols,
                    "rows": rows,
                    "startPos": list(start_pos),
                    "grid": grid
                }
            
    print(f"Failed to generate level {level_id}: {name}")
    return None

specs = [
    # Pack 1: 進階迷宮 (Levels 1 - 9)
    ("進階迷宮", 1, "十字迴廊", 5, 5, 20, 0, 0),
    ("進階迷宮", 2, "蛇行盤繞", 5, 5, 22, 0, 0),
    ("進階迷宮", 3, "雙柱夾角", 5, 5, 23, 0, 0),
    ("進階迷宮", 4, "風車轉角", 5, 5, 24, 0, 0),
    ("進階迷宮", 5, "羅馬拱廊", 6, 6, 28, 0, 0),
    ("進階迷宮", 6, "階梯城堡", 6, 6, 30, 0, 0),
    ("進階迷宮", 7, "鑽石晶格", 6, 6, 31, 0, 0),
    ("進階迷宮", 8, "螺旋王宮", 6, 6, 32, 0, 0),
    ("進階迷宮", 9, "迷宮神殿", 6, 6, 34, 0, 0),
    
    # Pack 2: 雙通交錯 (Levels 10 - 18)
    ("雙通交錯", 10, "立交十字", 5, 5, 22, 1, 0),
    ("雙通交錯", 11, "蝴蝶雙飛", 5, 5, 24, 1, 0),
    ("雙通交錯", 12, "高架立交", 6, 6, 28, 2, 0),
    ("雙通交錯", 13, "太極八卦", 6, 6, 30, 2, 0),
    ("雙通交錯", 14, "棋盤立交", 6, 6, 32, 2, 0),
    ("雙通交錯", 15, "雙翼高飛", 6, 6, 33, 2, 0),
    ("雙通交錯", 16, "莫比烏斯", 7, 7, 36, 2, 0),
    ("雙通交錯", 17, "千層立體", 7, 7, 38, 2, 0),
    ("雙通交錯", 18, "星宿連環", 7, 7, 40, 2, 0),
    
    # Pack 3: 蟲洞星門 (Levels 19 - 27)
    ("蟲洞星門", 19, "雙島跳躍", 6, 6, 28, 0, 1),
    ("蟲洞星門", 20, "四方星門", 6, 6, 30, 0, 1),
    ("蟲洞星門", 21, "跨海長橋", 6, 6, 32, 0, 1),
    ("蟲洞星門", 22, "雙蟲洞交錯", 7, 7, 36, 0, 2),
    ("蟲洞星門", 23, "鏡像雙生", 7, 7, 38, 0, 2),
    ("蟲洞星門", 24, "星系躍遷", 7, 7, 40, 1, 1),
    ("蟲洞星門", 25, "迷宮星門", 7, 7, 40, 1, 1),
    ("蟲洞星門", 26, "浮空碎島", 7, 7, 40, 0, 2),
    ("蟲洞星門", 27, "時空樞紐", 7, 7, 42, 1, 2),
    
    # Pack 4: 大師殿堂 (Levels 28 - 36)
    ("大師殿堂", 28, "皇家迷陣", 7, 7, 42, 1, 0),
    ("大師殿堂", 29, "萬象曼陀羅", 8, 8, 46, 0, 0),
    ("大師殿堂", 30, "智慧金字塔", 8, 8, 48, 1, 0),
    ("大師殿堂", 31, "巨神迷宮", 8, 8, 50, 1, 0),
    ("大師殿堂", 32, "八卦九宮", 8, 8, 50, 1, 1),
    ("大師殿堂", 33, "時空迷霧", 8, 8, 52, 0, 2),
    ("大師殿堂", 34, "終極立交", 8, 8, 52, 2, 0),
    ("大師殿堂", 35, "混沌迴旋", 8, 8, 54, 1, 1),
    ("大師殿堂", 36, "一筆天成", 8, 8, 56, 1, 2),
]

levels = []
for spec in specs:
    lvl = generate_level(*spec)
    assert lvl is not None, f"Failed on {spec}"
    print(f"Verified Lvl {lvl['id']}: {lvl['name']} ({lvl['cols']}x{lvl['rows']})")
    levels.append(lvl)

with open("/Users/yunning/.gemini/antigravity-ide/scratch/one-stroke-puzzle/js/levels_data.json", "w") as f:
    json.dump(levels, f, ensure_ascii=False, indent=4)

print(f"All {len(levels)} levels successfully generated & verified!")
