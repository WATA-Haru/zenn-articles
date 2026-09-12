変えたい部分を列挙してみる

選択肢

- [ ] ベジタリアンの乳製品NG -> 管理が面倒になりそうなのでこの制約をなくしたい
- [ ] mainMealの豆の選択肢 -> いらない
- [ ] チーズソース -> いらない。ややこしくなる

機能改善

- [ ] リロード時のデータ永続化 vue-useとか使えばいい？
- [ ] テストコード -> 結構サンプルコードの域を超えているのとxstate版と動作を等価にしたいので
- [x] linter
- [x] formatter

リファクタ

- [ ] ディレクトリ構造を変える
- [ ] コードを見に来た人が構造を簡単に追えるようにREADMEに簡単に書いておく
- [ ] **index.vue側で項目の出し分けを管理してcontainer側に処理を持たせない(表示ロジックだから)**

まず私がコードを理解したい

エントリ

- src/main.ts — Vue アプリを作って Pinia を差し込み、#app にマウント。
- src/App.vue — ルートコンポーネント。見出しとリード文を出して SandwichForm/container.vue を表示するだけ。

モデル層（src/model/store/）

ファイル: const.ts
役割: ページ一覧（InputStepList）、初期値（initialFormData）、各ページの見出しと選択肢を定義。**「ここに並べた順序 ≠ 表示順序」**が要点。
────────────────────────────────────────
ファイル: types.ts
役割: InputStep/OptionInput/SandwichFormData 等の型。InputStep は InputStepList から導出。
────────────────────────────────────────
ファイル: useSandwichFormStore.ts
役割: ★ 主役1 ★ Pinia store。formData（入力データ = source of truth）と reset / toggleArrayValue だけ持つ。「現在ページ」「表示ページ列」等の導出できる状態は持たないのがポイント。
────────────────────────────────────────
ファイル: useInputStep.ts
役割: ★ 主役2（この記事の肝）★ formData から inputStepList を computed で導出。currentInputStep（現在ページ）、visitedInputSteps、goNextInputStep/goPreviousInputStep/isFirstStep/isInputFinished
などページ遷移の操作を提供。
────────────────────────────────────────
ファイル: isInputStep.ts
役割: 型ガード。値が InputStep かを判定（現状 container/index からは未使用）。
────────────────────────────────────────
ファイル: useSandwichForm.ts
役割: ⚠ 未使用の重複ファイル。Pinia を使わない古い版のようで、container.vue は useSandwichFormStore の方をインポートしている。削除候補。

ページ層（src/pages/SandwichForm/）

- container.vue — ロジック集約。store と useInputStep を配線し、
  - 制約に基づく選択肢の絞り込み（filteredMainMealOptions / filteredSideMenuOptions：エビNG のときエビ/ガーリックシュリンプを除外）
  - ステッパー用に steps を整形
  - 上流の選択が変わったときの整合性リセット（例：ベジタリアン化で mainMeal クリア、チリ以外で hot クリア）を担当。
    props と events だけを Presentation に渡す。
- index.vue — Presentation。props で受け取った inputStep を見て、該当ページの radio/checkbox を出す。ステッパー、完了画面、戻る/次へボタン、CSS。emit で container に通知。
  - memo.md の**「index.vue 側で項目の出し分けを管理して container 側に処理を持たせない」**は、まさにこの v-if="inputStep === 'xxx'" の分岐を index.vue が担っていることを指しています（表示ロジックなので Presentation
    側が持つのが妥当、という主張）。

データフロー

formData (Pinia)
│
├─► useInputStep が inputStepList を導出
│ │
│ └─► currentInputStep / visited / isFirstStep / isInputFinished
│
└─► container が制約付きの options を computed
│
└─► index.vue が inputStep に応じて描画、emit で container のハンドラ経由で formData 更新

- 各ステップはconstで持っていてもいいけど、formのtitleは
