import { setup } from "xstate";

/**
 * 失敗1: guard 注入方式（＝実プロジェクトの formMachine.ts と同じ）。
 *
 * 方針:
 * - 1ページ = 1状態 として、ページ遷移そのものを machine で表現する
 * - machine はフォームデータを持たない（source of truth は Pinia store）
 * - guard は event で注入された判定フラグだけを見る
 *
 * ここで露呈する「失敗」:
 *
 * 1. machine が遷移の source of truth になれない → xstate を入れる意味がなくなる
 *    どのページへ進む／戻るかは結局 formData 由来のフラグ（isVegetarian など）で決まる。
 *    分岐の真実はデータ側にあり、machine の状態グラフはそれを写経しているだけ。
 *
 * 2. 分岐ロジックの二重管理（next / back）
 *    「ベジタリアンなら mainMeal を飛ばす」等を、next（前進）と back（後退）の
 *    “両方”の guard に書く必要がある。条件が増えるたびに 2 箇所を同期させねばならない。
 *
 * この「失敗1」を嫌ってデータを読まず state だけで一意に決めようとすると、今度は
 * 組み合わせ爆発する（失敗2）。→ machineExploded.ts / explosion.md を参照。
 */
export const sandwichMachine = setup({
  types: {
    events: {} as
      // 「次へ」。分岐に必要な判定結果を container から注入する。
      | {
          type: "next";
          isVegetarian?: boolean;
          isChili?: boolean; // source が chili
        }
      // 「戻る」。← next と“同じ”分岐フラグをここでも要求する点が二重管理の証拠。
      | {
          type: "back";
          isVegetarian?: boolean;
          isChili?: boolean;
        }
      | { type: "reset" },
  },
  guards: {
    isVegetarian: ({ event }) =>
      (event.type === "next" || event.type === "back") &&
      event.isVegetarian === true,
    isChili: ({ event }) =>
      (event.type === "next" || event.type === "back") && event.isChili === true,
  },
}).createMachine({
  id: "sandwich",
  initial: "choiceUser",
  states: {
    choiceUser: {
      on: {
        // 前進の分岐（1箇所目）
        next: [
          { guard: "isVegetarian", target: "vegetable" },
          { target: "mainMeal" },
        ],
      },
    },
    mainMeal: {
      on: {
        next: { target: "vegetable" },
        back: { target: "choiceUser" },
      },
    },
    vegetable: {
      on: {
        next: { target: "source" },
        // 後退の分岐（前進の“写し”）。
        // choiceUser（ベジタリアン）/ mainMeal のどちらから来たかを state だけでは決められず、
        // next と同じ条件（isVegetarian）を guard で再度書く羽目になる。
        back: [
          { guard: "isVegetarian", target: "choiceUser" },
          { target: "mainMeal" },
        ],
      },
    },
    source: {
      on: {
        next: [
          { guard: "isChili", target: "hot" },
          { target: "sideMenu" },
        ],
        back: { target: "vegetable" },
      },
    },
    hot: {
      on: {
        next: { target: "sideMenu" },
        back: { target: "source" },
      },
    },
    sideMenu: {
      on: {
        next: { target: "done" },
        // ここも同じ二重管理。source が chili だったかを state だけでは思い出せない。
        back: [
          { guard: "isChili", target: "hot" },
          { target: "source" },
        ],
      },
    },
    done: {
      on: {
        back: { target: "sideMenu" },
        reset: { target: "choiceUser" },
      },
    },
  },
});
