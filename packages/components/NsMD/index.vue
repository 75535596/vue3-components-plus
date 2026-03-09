<template>
  <VMarkdownView
    class="markdown-view"
    :mode="props.mode"
    :content="props.msg || props.content"
  ></VMarkdownView>
</template>
<script setup lang="ts">
import { VMarkdownView } from 'vue3-markdown';
import 'vue3-markdown/dist/vue3-markdown.css';

const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  msg: {
    type: String,
    default: ''
  },
  mode: {
    type: String,
    default: 'light'
  }
})
</script>
<style lang="scss" scoped>
.markdown-view {
  width: 100%;
  height: 100%;
}
</style>