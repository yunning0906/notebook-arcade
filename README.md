# NOTEBOOK ARCADE (遊戲合輯門戶)

集結 4 款經典益智遊戲的入口網站。以原生 HTML5、CSS3 與 JavaScript 開發，支援手機與電腦操作。

---

## 收錄遊戲與即時連動架構

本專案之 `games/` 目錄直接以**符號連結 (Symbolic Link)** 連結至原始遊戲專案：

- `games/suika-game` -> `../../suika-game`
- `games/game-2048` -> `../../game-2048`
- `games/bubble-shooter` -> `../../bubble-shooter`
- `games/one-stroke-puzzle` -> `../../one-stroke-puzzle`

> **重要特性**：任何在個別遊戲目錄（如 `suika-game/`、`one-stroke-puzzle/` 等）中進行的程式碼、樣式、關卡或邏輯修改，皆會**即時、自動同步**反映至此遊戲大廳網站，無須重新複製或手動搬移檔案。

---

## 收錄遊戲清單

| 遊戲名稱 | 英文名稱 | 類型 | 說明 |
| :--- | :--- | :--- | :--- |
| **西瓜遊戲** | Suika Game | 物理掉落合成 | 投擲並合併相同水果以升級 |
| **2048** | 2048 | 數字滑動消除 | 滑動方塊碰撞相同數字進行合併 |
| **泡泡射擊** | Bubble Shooter | 瞄準反射射擊 | 連接 3 個以上同色泡泡消除 |
| **一筆畫** | One Line | 一筆連線路徑 | 一筆到底連通棋盤所有格子 |

---

## 工具腳本

若遊戲視覺外觀大幅修改並需要更新大廳截圖，可直接執行：

```bash
./scripts/update-previews.sh
```
即可自動截取最新遊玩畫面並裁切更新。
