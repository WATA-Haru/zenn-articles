# SandwichForm — solution

Zenn 記事「複雑な入力フォームの設計」で紹介する導出パターンの実装デモ。

xstate のようにページ遷移そのものを state として持たず、入力データ（`formData`）
から「表示すべきページ列」や「選べる選択肢」を computed で導出する構成をとる。

## 起動

```sh
npm ci
npm run dev
```
## ディレクトリ構造

```
src/
├── main.ts                          # Vue + Pinia を初期化してマウント
├── App.vue                          # ルート。ページを1つだけ描画
├── model/                           # ドメイン層
│   ├── types.ts                     # ドメイン型（SandwichFormData, InputStep 等）
│   ├── const.ts                     # 定数（各フィールドの選択可能な値・初期値）
│   ├── store/
│   │   └── useSandwichFormStore.ts  # ★source of truth：入力データ + setter
│   └── composables/                 # ★formData からの導出
│       ├── useInputStep.ts          #   表示すべきページ列と現在ページを導出
│       └── useFilteredOptions.ts    #   各ページで選べる値を導出（制約反映）
└── pages/
    └── SandwichForm/
        ├── container.vue            # store と composables を配線
        ├── index.vue                # 純粋な presentation（props と emit のみ）
        ├── sectionTitles.ts         # ページ見出しの表示辞書
        └── optionLabels.ts          # 各選択肢の表示ラベル辞書
```

### 設計の要点

- container / presentation を分離する。`container.vue` はロジック、`index.vue` は描画のみ。
- ドメイン制約は model 側に集約する
- `store` は入力データそのものとセッターを持つ。
- `composables/` が formData から「到達可能ステップ」や、「ユーザが選択可能な選択肢」を computed で導出する。

## 割愛している点

このコードは記事の主題（導出パターン）にフォーカスするため、実プロダクトなら必要な
以下を意図的に省いている:

- **submit 時 validation**: 実際にはフォームを送信する層で最終チェックが要る。
- **「次へ」押下時の入力チェック**: 未入力・不正値の場合にステップを進めないガード。
- **リロード時のデータ永続化**: sessionStorage などへの保存/復元。

validationと次へを押下したときの入力チェックを省いている変わりに、storeでsetterによるリセット処理を入れている。
本来はこのようにすべきではないが、不適切な組み合わせが発生しないようになっている。
