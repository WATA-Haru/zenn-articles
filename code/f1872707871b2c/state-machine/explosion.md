# なぜ「1ページ = 1状態」が失敗するのか（xstate の2つの失敗モード）

このフォームを xstate でページ管理しようとすると、次の **2つの失敗モード** のどちらかに落ちる。
どちらも「ページ列（＝データから導出できるもの）を state として持とうとした」ことが原因。

---

## 失敗1: guard 注入方式 → xstate を入れる意味がなくなる

`machine.ts`（このデモが動かしている machine）がこれ。

- machine はフォームデータを持たない（source of truth は Pinia store）
- 「ベジタリアンか」「チリソースか」等の分岐判定は、`next` / `back` の event に
  **フラグとして注入**して guard で見る

一見きれいだが、2つの問題が出る。

1. **分岐の真実が machine の外に漏れる**
   進む先を決めるフラグ（`isVegetarian` / `isChili`）は結局 `formData` から算出している。
   つまり分岐の source of truth はデータ側にあり、machine の状態グラフはそれを写経しているだけ。
   → xstate が「遷移の制約を宣言的に持つ」という旨みを一切発揮しない。

2. **分岐の二重管理（next / back）**
   `vegetable` 状態は「choiceUser（ベジタリアン）/ mainMeal のどちらから来たか」を
   状態だけでは判別できない。だから戻り先を決めるのに、前進と同じ判定を back の guard に
   もう一度書く。条件が増えるたびに 2 箇所を同期させる必要があり、片方だけ直すと壊れる。

```ts
// choiceUser の前進
next: [
  { guard: "isVegetarian", target: "vegetable" },
  { target: "mainMeal" },
]
// vegetable の後退（← 同じ条件をもう一度書く羽目になる）
back: [
  { guard: "isVegetarian", target: "choiceUser" },
  { target: "mainMeal" },
]
```

→ 「これなら素直な導出関数でよい」＝ xstate を導入する意味が薄れる。

---

## 失敗2: state で一意に決める方式 → 組み合わせ爆発

`machineExploded.ts` + `exploded-diagram.md` がこれ。

失敗1の「データ依存」を嫌って、**表示ページを state だけで一意に決めよう** とすると、
今度は **pattern b（同じページでも入力済みパラメータで選択肢・文言が変わる）も別 state** にする必要が出る。

- 例: エビNG のとき mainMeal から「エビ」、sideMenu から「ガーリックシュリンプ」が消える
  → `mainMeal` / `mainMealNoShrimp`、`sideMenu` / `sideMenuNoShrimp`

しかも state はデータを読めないので、「エビNG かどうか」を sideMenu 到達まで **状態として運ぶ**しかない。
＝ 後続 path（vegetable / source / hot / sideMenu）を丸ごと NoShrimp 版に複製することになる
（`machineExploded.ts` 参照。表示トグル1つで 12 states）。

分岐点は **掛け算** で効く。独立した2択トグルが増えるたびに path 集合が倍々になる。

| 独立トグル | 例 | 取りうる path 数 |
|---|---|---|
| 1つ | エビNG | 2 |
| 2つ | + パンの種類で具材候補が変わる | 4 |
| 3つ | + チーズの有無で選択肢が変わる | 8 |
| 4つ | + ソースの種類で選択肢が変わる | 16 |
| 5つ | + サイドメニューの有無で選択肢が変わる | 32 |

さらに各ページの選択肢の組み合わせまで state に含めると、状態数は急速に増える。
全パターンを machine オブジェクトに書き下すため、保守も難しくなる。

---

## 教訓: state と data を分け、data を xstate で管理しない

- **state**（xstate 向き）= システムが取りうる動作モードを有限・固定で数え上げたもの。
  例: 信号「赤・青・黄」、通信「切断・接続中・接続済」、フォーム「入力中・完了」。
- **data** = 値・入力・入力から計算されうる値。**ページ列はこちら**。

ページ列は「入力パラメータの掛け算」で形が決まる＝ data。これを state 化すると、
独立分岐が1つ増えるたびに管理対象が倍々に増えて破綻する。

→ machine はライフサイクルだけを持ち、ページ列は入力データから導出する。
ステートマシンが悪いのではなく、「data を state にする」モデリングが問題になる。
