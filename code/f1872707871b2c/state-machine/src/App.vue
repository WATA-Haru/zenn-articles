<script setup lang="ts">
import SandwichForm from "./pages/SandwichForm/container.vue";
</script>

<template>
  <main class="app">
    <h1 class="app__title">🥪 サンドウィッチフォーム (state-machine)</h1>
    <p class="app__lead">
      「1ページ = 1状態」で xstate にページ遷移を持たせた<strong>失敗パターン</strong>。<br />
      入力データ（data）は Pinia store が持ち、machine はそこから算出したフラグを guard で読み直すだけ。<br />
      画面で動くのは<strong>失敗1（machine が store の影絵になり、xstate の意味がなくなる）</strong>。
      もう一方の<strong>失敗2（組み合わせ爆発）</strong>は
      <code>machineExploded.ts</code> / <code>explosion.md</code> を参照。
    </p>
    <SandwichForm />
  </main>
</template>

<style>
body {
  margin: 0;
  background: #fef2f2;
}
</style>

<style scoped>
.app {
  padding: 40px 20px;
}

.app__title {
  text-align: center;
  font-family: system-ui, sans-serif;
}

.app__lead {
  max-width: 520px;
  margin: 0 auto 32px;
  text-align: center;
  color: #6b7280;
  font-family: system-ui, sans-serif;
  line-height: 1.6;
}
</style>
