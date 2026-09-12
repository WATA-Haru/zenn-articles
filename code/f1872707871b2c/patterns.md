## ページ遷移パターン一覧

`designDocs.md` の要件から算出される、ページシーケンスのユニークなパターンを列挙する。

### 前提

- **常に表示されるページ**: `choiceUser` / `vegetable` / `source` / `sideMenu`
- **条件付きページ**:
  - `mainMeal`: `choiceUser !== ベジタリアン` のときのみ表示
  - `mealGrill`: `mainMeal ∈ {ビーフ, チキン}` のときのみ表示
  - `hot`: `source = チリソース` のときのみ表示
- **選択肢が変わるページ（ページ自体は表示される）**:
  - `mainMeal`: `choiceUser = エビNG` のとき「エビ」を除外
  - `sideMenu`: `choiceUser = エビNG` のとき「ガーリックシュリンプ」を除外

---

### ページシーケンスに影響する分岐要素

1. `choiceUser` が `ベジタリアン` かどうか → `mainMeal` ページの有無
2. `mainMeal` が `ビーフ / チキン` かどうか → `mealGrill` ページの有無
3. `source` が `チリソース` かどうか → `hot` ページの有無

これらの組み合わせでユニークなページシーケンスは **6パターン**。

---

### パターン A: フルシーケンス（mealGrill + hot 両方あり）

条件: `choiceUser ∈ {ノーマル, エビNG}` かつ `mainMeal ∈ {ビーフ, チキン}` かつ `source = チリソース`

```
choiceUser → mainMeal → mealGrill → vegetable → source → hot → sideMenu
```

### パターン B: mealGrill あり / hot なし

条件: `choiceUser ∈ {ノーマル, エビNG}` かつ `mainMeal ∈ {ビーフ, チキン}` かつ `source ∈ {チーズソース, バジルソース}`

```
choiceUser → mainMeal → mealGrill → vegetable → source → sideMenu
```

### パターン C: mealGrill なし / hot あり

条件: `choiceUser ∈ {ノーマル, エビNG}` かつ `mainMeal ∈ {エビ, 豆}` かつ `source = チリソース`
（`エビNG` のときは実質 `mainMeal = 豆` またはノーマル×{エビ, 豆}）

```
choiceUser → mainMeal → vegetable → source → hot → sideMenu
```

### パターン D: mealGrill なし / hot なし

条件: `choiceUser ∈ {ノーマル, エビNG}` かつ `mainMeal ∈ {エビ, 豆}` かつ `source ∈ {チーズソース, バジルソース}`

```
choiceUser → mainMeal → vegetable → source → sideMenu
```

### パターン E: ベジタリアン + hot あり

条件: `choiceUser = ベジタリアン` かつ `source = チリソース`

```
choiceUser → vegetable → source → hot → sideMenu
```

### パターン F: ベジタリアン + hot なし

条件: `choiceUser = ベジタリアン` かつ `source ∈ {チーズソース, バジルソース}`

```
choiceUser → vegetable → source → sideMenu
```

---

### 「入力の組み合わせ × ページ」で見た場合の状態爆発

ページシーケンスとしては6パターンだが、xstate で「1ページ = 1状態」としてモデリングすると、各ページで扱う選択肢の組み合わせも状態として持つ必要があり、状態数は乗算で膨らむ。

- `choiceUser`: 3
- `mainMeal`: 最大 4（choiceUser により 0〜4 に変動）
- `mealGrill`: 3（表示されるとき）
- `vegetable`: 2^3 = 8（複数選択）
- `source`: 3
- `hot`: 2（表示されるとき）
- `sideMenu`: 最大 2^3 = 8（choiceUser により 2^2 = 4 になる）

分岐ルート別の概算組み合わせ数を以下に示します。

| choiceUser | mainMeal | source | 概算組み合わせ数 |
|---|---|---|---|
| ノーマル | ビーフ or チキン | チリ | 2 × 3 × 8 × 1 × 2 × 8 = **768** |
| ノーマル | ビーフ or チキン | チリ以外 | 2 × 3 × 8 × 2 × 8 = **768** |
| ノーマル | エビ or 豆 | チリ | 2 × 8 × 1 × 2 × 8 = **256** |
| ノーマル | エビ or 豆 | チリ以外 | 2 × 8 × 2 × 8 = **256** |
| ベジタリアン | （なし） | チリ | 8 × 1 × 2 × 8 = **128** |
| ベジタリアン | （なし） | チリ以外 | 8 × 2 × 8 = **128** |
| エビNG | ビーフ or チキン | チリ | 2 × 3 × 8 × 1 × 2 × 4 = **384** |
| エビNG | ビーフ or チキン | チリ以外 | 2 × 3 × 8 × 2 × 4 = **384** |
| エビNG | 豆 | チリ | 1 × 8 × 1 × 2 × 4 = **64** |
| エビNG | 豆 | チリ以外 | 1 × 8 × 2 × 4 = **64** |

**合計 ≈ 3,200 状態**（粗い見積り）。

一方、ページシーケンスとしての分岐は **6 パターンのみ**。この乖離こそが「ページを状態として持つべきでない」という記事の主張の根拠になる。
