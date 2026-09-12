<script setup lang="ts">
import SandwichForm from "./pages/SandwichForm/container.vue";
</script>

<template>
  <main class="app">
    <h1 class="app__title">🥪 サンドウィッチフォーム (solution)</h1>
    <p class="app__lead">
      入力データ（data）は Pinia store が持ち、ページ構成は「状態」ではなく
      「そのデータからの導出」として扱う実装です。
    </p>
    <SandwichForm />
  </main>
</template>

<style>
body {
  margin: 0;
  background: #f9fafb;
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
  max-width: 480px;
  margin: 0 auto 32px;
  text-align: center;
  color: #6b7280;
  font-family: system-ui, sans-serif;
}
</style>
