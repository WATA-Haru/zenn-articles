import { setup } from "xstate";

/**
 * ※実装で使っているものは`machine.ts`で、これは例である。
 *
 * 失敗1: 「入力パラメータから表示ページと選択肢を xstate で一意に決める」版
 * 入力パラメータから算出される値をすべて xstate の state として一意に持とうとすると何が起きるか
 *
 * 例: エビNG のとき
 *   - mainMeal は「エビ」を除いた選択肢になる  → `mainMeal` と `mainMealNoShrimp`
 *   - sideMenu は「ガーリックシュリンプ」を除く → `sideMenu` と `sideMenuNoShrimp`
 *
 * 直前の状態からしか遷移できないので、エビNG かどうかを sideMenu 到達まで状態として運ぶしかない。
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
 *  合計 12 states
 *
 * 結果的に、入力するパラメータが増えるほどstates が増えて組み合わせ爆発を起こす。
 *
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
      | {
          type: "back";
          isVegetarian?: boolean;
          isNoShrimp?: boolean;
          isChili?: boolean;
        }
      | { type: "reset" },
  },
  guards: {
    isVegetarian: ({ event }) =>
      (event.type === "next" || event.type === "back") &&
      event.isVegetarian === true,
    isNoShrimp: ({ event }) =>
      (event.type === "next" || event.type === "back") &&
      event.isNoShrimp === true,
    isChili: ({ event }) =>
      (event.type === "next" || event.type === "back") &&
      event.isChili === true,
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5SwIYDsIHcCWBjAFgKIAeADgDYD2EkAdAZXmAKqxgBOAxGmMQC4BtAAwBdRKFKVY2PtkppxIYogBMATgAstNQFYAzAEYVBw0IBsFgBxmANCACeiS0KG1jFs8Y2a11gL5+dqgYOAQkFNR0DEysHNy8ggZiSCCS0rLyisoI6lq6hsamHtZ2jgh6embaHhoGGkL6OhqWAUHoWHhEZFQ0EPT4jLgsbFw8-AIqyRJSMnIKKdm52vpGJgbmVrYOiOtmarTeakcqAOy6ZkZmrSDBHWHdkX0AtijYaACyYCjk8eOiimlZpkFk5NLQdGo9Cc9E0KmcDKVQZY3IdIcdLBiroEbu1Ql0Ir1aC83p9vpwAEYoXAAa2EU1SMwy81A2UsagMtD0KksBnWOiEdU0KkRCE0yJOqMMmhOQg0WLaIU64R6dAAbmAYHwUOTyGBfoJ-ilAUysogTntaNCNJU9EIVCo9Dy1CKzicUUddDo2SodGYNNdbnjlY9aOrNdrdRSqbTDdN0nNTeUDMizEJITLLCo7SoNMLtggJfsTgYPLlzZmdAHcUqHoSw2AtTq9ZSaQIkgDGQmQQWLVabdnHQZnfnLBo3YWjmP2UITj6q4r7gS6LBKABXdhDfV0jvx4EsnbGDnFyzQoSmR0VEWWHQ6A6WCrcme8yHynEL-Eqvor9ebsaJenGl2+4IKsR7Jqe573noV6ytoUHctY6YnJW2KBjWS5fmuG7NtG25Gp2e5KKCHJcjyfICt4uYunKlqomYjoSvUejzncH4hgMfBbrGDK7syREgWY5raFCY7Jg0MqziKgkcioHieBm9rQixQa1nQHFRq23GAYR2QltCtDSaOZgnnotQNCKlHukcx6+jmObKehn60NINCfGgq5cQBBF8bppG0JmPJ2hiOZmF6Uk+toHpqIJ1j6A6DmLk5LlgG5HktjGXm8YmBheno-lqA0vhWshvjha45oeDC5i1EYCVsYSyWpRptLtvhWXdqBlrgbakGXvmyFaM0D7RYJvp1HVwaEsSHxfOQABylAAMr4Ow2BPKQnk7kCPmIBozSWmevI8g6vK1CKDq3iNFgVHKJwSsxqHVolIbTaS81LSta0beleFxttiZ7be1qFlKQg8rOGjndYBw1PaZ76CeE2qX09aNrqC3Lat62bW1-3dks+SrEUmwiiYeRyZRhi5vFj3vpNaoag2EZgBjn3Yz9WneYmBMrIUuwk-myZAxTdTeF6slIxhzlYUMrNYxtf6-TxePAeaRamf29qDsOZRZioVlFU6ahZihCqsfTmE-izH3y1urV-Sa3Zq5aGv0QOToilyt7QhUhjXXavKm2+5vI9LVty19zVK9pO0IIDBwiZCQ5gwYENXoNck6BKJiyTlktORxEfY4rnPtcBOfIgF6wISFYX5lCeWomoyGjsWnj5+xlB8EX324aXKv8Tnt62WOZz8iWGJXhyTfsoFo4Ch3DXYK5YDuT3OMO0B-FsloEIN7CULshZsku77LgePoUKL8uy8pavq7rxzmUD7ph5dSZh1nlBnv2pFHr3pmAqC9aYhylo1e+j9cL22Vo7VWd07zWk8NYVOYMdDnR0PrCczdfCOhTg9M2KkpYQHkDhTSz9YH8Wdn2N2WsPb1yEg6M+1ghpKRAYQpyxCeBR2gTHRMVDXa2loUOEU-Jbw5g9DZTwuZ-RsMciGThep2BwAbNHLm3Y9p5T0AVC4mYHwrE9myS0UFbSeARlmLE2I0CRHgCkNCz1ehbQodkAAtFsMorjaAuC8d4nxJxr59GiEMWI7BHFb10meA4xgTKzlCr4OuZRbTT1lHUZOuYhx+NkfYugr1ZqhJ0ogD0Bk0wwjZJmLWbiCkCnBFFLRJgZx2n8aGRmaMwB5NjhCKoUUCoyh0HUywLovRuCihcKc14VCNO-NhNp2VZT7GMopOU6w7oVILDeTkvt1BejutaRpHFpkdRODyZYtp8hNBMKVfMngqgXEqrmWJ3IJm31Svs8ue1XB7VkqOCE3JjLhX2KZD0glzDFi0Y0nJ3we4vP4jePKx5s7SSaIJc6WjOQlgsEYLkGh+QSkaajZmkLcZON2nmMo0VPFotCuPE8aYMkELkQ1GW1tMZfShdkX0WhzDiJMCeY4JwRSQk8aiHeJYEL4ODuwzu3cbYssJWEnY1o8qjihLJa0YNfAktUGDTxUVqXGGhKFR5K817SvWqygpRwimQi9Oq8pntDDgmMTle8esWiZPqnQBRZqECpmREnHMsprS6DtJ7AqbhjGcrMeYAIAQgA */
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
    mainMeal: {
      on: {
        next: { target: "vegetable" },
        back: { target: "choiceUser" },
      },
    },
    vegetable: {
      on: {
        next: { target: "source" },
        // 前進と同じ isVegetarian 判定を back でも書く（失敗2 の症状）
        back: [
          { guard: "isVegetarian", target: "choiceUser" },
          { target: "mainMeal" },
        ],
      },
    },
    source: {
      on: {
        next: [{ guard: "isChili", target: "hot" }, { target: "sideMenu" }],
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
        // 前進と同じ isChili 判定を back でも書く（失敗2 の症状）
        back: [{ guard: "isChili", target: "hot" }, { target: "source" }],
      },
    },

    // ── エビNG path（通常 path の“丸ごと複製”。ここが倍々の正体） ──
    mainMealNoShrimp: {
      on: {
        next: { target: "vegetableNoShrimp" },
        back: { target: "choiceUser" },
      },
    },
    vegetableNoShrimp: {
      on: {
        next: { target: "sourceNoShrimp" },
        // NoShrimp path では vegetarian は来ないので単純に戻れる
        back: { target: "mainMealNoShrimp" },
      },
    },
    sourceNoShrimp: {
      on: {
        next: [
          { guard: "isChili", target: "hotNoShrimp" },
          { target: "sideMenuNoShrimp" },
        ],
        back: { target: "vegetableNoShrimp" },
      },
    },
    hotNoShrimp: {
      on: {
        next: { target: "sideMenuNoShrimp" },
        back: { target: "sourceNoShrimp" },
      },
    },
    sideMenuNoShrimp: {
      on: {
        next: { target: "done" },
        // NoShrimp path でも isChili の再判定（失敗2 の症状が複製された path 側にも生えている）
        back: [
          { guard: "isChili", target: "hotNoShrimp" },
          { target: "sourceNoShrimp" },
        ],
      },
    },

    // done は最終ページがどちらの path だったか状態からは分からない。
    // 追加で isNoShrimp を再度 guard する必要がある（失敗1 と失敗2 の合わせ技）。
    done: {
      on: {
        back: [
          { guard: "isNoShrimp", target: "sideMenuNoShrimp" },
          { target: "sideMenu" },
        ],
        reset: { target: "choiceUser" },
      },
    },
  },
});
