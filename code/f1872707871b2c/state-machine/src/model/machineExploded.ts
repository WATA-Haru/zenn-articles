import { setup } from "xstate";

/**
 * 失敗2: 「入力パラメータから表示ページを xstate で一意に決める」版。
 *
 * pattern b（＝同じページでも入力済みパラメータで選択肢・文言が変わる）を
 * view の出し分けに逃がさず、xstate の state として一意に持とうとすると何が起きるか。
 *
 * 例: エビNG のとき
 *   - mainMeal は「エビ」を除いた選択肢になる  → `mainMeal` と `mainMealNoShrimp`
 *   - sideMenu は「ガーリックシュリンプ」を除く → `sideMenu` と `sideMenuNoShrimp`
 *
 * source of trueではないので、「state はデータを読めない」という制約がある。
 * sideMenu の変種を“状態だけ”で決めたいなら、エビNG かどうかを sideMenu 到達まで
 * 状態として運ぶしかない。＝ source / hot / vegetable まで NoShrimp 版に複製して
 * 別の path を通す必要がある（データを見て分岐するなら、それは失敗1＝guard注入に戻る）。
 *
 * 結果、たった1つの表示トグル（エビNG）で後続 path が丸ごと 2 倍になる。
 *
 * ── 状態数の内訳 ──
 *  choiceUser                                             … 1
 *  shrimp許可 path: mainMeal, vegetable,
 *                   source, hot, sideMenu                 … 5
 *  エビNG path:     mainMealNoShrimp, vegetableNoShrimp,
 *                   sourceNoShrimp, hotNoShrimp,
 *                   sideMenuNoShrimp                      … 5
 *  done                                                   … 1
 *  ------------------------------------------------------------
 *  合計 12 states（表示トグル “1つ” でこれ）
 *
 * さらに独立した表示トグルが増えるたびに path は倍々になる:
 *   もう1つ 2択の表示違いが加わる → ×2、その次 → ×2 …
 * 分岐軸が増えるほど、この乗算で states が増えていく。
 *
 * ※ back は省略（実装すると失敗1と同じ guard 二重管理がここにも乗り、さらに悪化する）。
 */
export const sandwichExplodedMachine = setup({
  types: {
    events: {} as
      | {
          type: "next";
          isVegetarian?: boolean;
          isNoShrimp?: boolean;
          isChili?: boolean;
        }
      | { type: "reset" },
  },
  guards: {
    isVegetarian: ({ event }) =>
      event.type === "next" && event.isVegetarian === true,
    isNoShrimp: ({ event }) =>
      event.type === "next" && event.isNoShrimp === true,
    isChili: ({ event }) => event.type === "next" && event.isChili === true,
  },
}).createMachine({
  id: "sandwichExploded",
  initial: "choiceUser",
  states: {
    // 入口で「どの path に入るか」を振り分ける。
    // ベジタリアン=具材スキップ / エビNG=NoShrimp path / それ以外=通常 path
    choiceUser: {
      on: {
        next: [
          { guard: "isVegetarian", target: "vegetable" },
          { guard: "isNoShrimp", target: "mainMealNoShrimp" },
          { target: "mainMeal" },
        ],
      },
    },

    // ── 通常 path（shrimp 許可） ──
    mainMeal: { on: { next: { target: "vegetable" } } },
    vegetable: { on: { next: { target: "source" } } },
    source: {
      on: {
        next: [{ guard: "isChili", target: "hot" }, { target: "sideMenu" }],
      },
    },
    hot: { on: { next: { target: "sideMenu" } } },
    sideMenu: { on: { next: { target: "done" } } },

    // ── エビNG path（通常 path の“丸ごと複製”。ここが倍々の正体） ──
    mainMealNoShrimp: { on: { next: { target: "vegetableNoShrimp" } } },
    vegetableNoShrimp: { on: { next: { target: "sourceNoShrimp" } } },
    sourceNoShrimp: {
      on: {
        next: [
          { guard: "isChili", target: "hotNoShrimp" },
          { target: "sideMenuNoShrimp" },
        ],
      },
    },
    hotNoShrimp: { on: { next: { target: "sideMenuNoShrimp" } } },
    sideMenuNoShrimp: { on: { next: { target: "done" } } },

    done: {
      on: { reset: { target: "choiceUser" } },
    },
  },
});
