import { setup } from "xstate";

/**
 * 失敗2: guard 注入方式
 *
 * 方針:
 * - 1ページ = 1状態 として、ページ遷移そのものを machine で表現する
 * - machine はフォームデータを持たない（source of truth は Pinia store）
 * - guard は event で注入された判定フラグだけを見る
 *
 * 失敗の原因
 * 1. machine が遷移の source of truth になれない
 *    どのページへ進む／戻るかは結局 formData 由来のフラグ（isVegetarian など）で決まり、分岐の真実はデータ側にある。xstateを入れる意味が無い。
 *
 * 2. 分岐ロジックの二重管理（next / back）
 *    「ベジタリアンなら mainMeal を飛ばす」等を、next（前進）と back（後退）の
 *    両方の guard に書く必要がある。条件が増えるたびに 2 箇所を同期させねばならない。
 *
 * 補足: xstate に navigation を持たせる別方向として「data を一切参照せず state 名だけで分岐を一意化する」アプローチもあるが、これは path 複製による組み合わせ爆発を起こす（失敗1）。
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
      // 「戻る」next と同じ分岐フラグをここでも要求している。明らかにおかしい。
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
      (event.type === "next" || event.type === "back") &&
      event.isChili === true,
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5SwIYDsIHcCWBjAFgHQED2eYAqrGAE4DEaYAHgC4DaADALqKgAOJWNhbYSaXiCaIALAGYOhABwBWAJyzFAdgBs0gEza1sgDQgAnonmzCe5RwCMj2Zvn3bAX3enUGHAWL4ZLiU1PSMrGz2PEggAkIiYhJSCHIKKupaugZGphYIehx6NnYc0qr20hyy9hyqep7e6Fh4RAC2KNhoALJgKAA2DMzs3BJxwqLiMcl10oT2mvaqhZX2VibmlqraNoqydnqaSwUc2g0gPs3+7Z09-XQARii4ANac0fyC44lTiHUKS9o9OU9CoVCdcohFPZCCUqntFHpVsplLIzhc-EQAG5gGAsFD3PpgQYREYxMYJSagZLKbT-FFIvbIqoQlKlYoOFy05QLSrKNFNDGEbG4-GEh5PV6kj7xCZJGTyJRGTL6QzqFm2IqaEqKQo07Taeb83wtIU4sB4glEx4vSLvWKfClyhA6zSEE62RYImnSfQs2TSZSETS7aQLbQuRRlRRGy5EWAkACuNGCxOGdvJsp+KQV6Q0OhVOQ2zvmbo4utWWzU9hjgvjSZT4XYUVGDszVPlaSV+eyaqLukDWsKpU0egKumjXnOApNdeTVolbxbMu+7eznYy3dV6zye2sg4qemkinU2lkBxrJsCLFTi7JrZXkkhHFd7uUntsul9RZ02xKo8KOqHoUF7+Fe4o2lK9rLpSj4IMirraFoyiHkBHB2NILI-jCZb-iCyzAZO6IztgEBgD0aAJjekEZg+0yHnMCxHCsawsjUyiKNhAEekC0j2BOjTGv4QikeRlHWpK6b3jByS7NCbj7LI1R1AsigslCL44W+siVuUIFxiRZFgBR4GvM2d7QU6LpuoCb6qF6n56CyyGBmWDjHvYp6KMe0h6YQEBiPOEGSRZWYeaopZlm4nqIRUygsuorqDgY2iqMoob6j5hHTv4-mMHQNBwOat7Sl80mIGFEUOIidkxQG6qhoQlRlpoPL7PqmieJOaAkKR8AxERBBLqVToALTaCyY2Va501ltyvmkOQVC0ENjpZgY4VnlCilHuGJ71a6SzNa1hTtb51zdL0fQrW2sFseFfFav6yE1JoHCqUWGjWHo23qAGyGpZlAmxqaIqWtdtGIOGgZbJkmihshr3jR95Q2JFWSvTqx58llglxomc7g2V+S7IqCVpXIqgtSoLJZG6YbVM+b2U75V6E064YcQ4NLOMijgeZoamOIQ5QpW4WiMbpOPA8JhkUWzoVofdSFPYijPvXkNRyHMz7yEe3IGvqvm5WA8url+eSqJUQZ2Ipz4LKs1Sde4QA */
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
        // ここも同じ二重管理。source が chili だったかを state だけでは思い出せない。
        back: [{ guard: "isChili", target: "hot" }, { target: "source" }],
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
