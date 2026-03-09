<template>
    <div class="dm">
      <NsMD class="dm-ui" :msg="msg"></NsMD>
    </div>
</template>
<script setup lang="ts" name="">
import { onMounted, ref } from 'vue';
const msg = ref()

onMounted(async () => {
  const readme = await fetch(`${import.meta.env.VITE_BASE_URL}README.md`)
  const txt = await readme.text();
  msg.value = txt
})
</script>
<style lang="scss" scoped>
.dm {
  width: 100%;
  height: 100%;
  .dm-ui {
    width: 100%;
    height: 100%;
  }
}
</style>