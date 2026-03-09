<template>
	<NsImage :src="src" :apiUrl="apiUrl" :hasPreview="hasPreview">
    <img
      :src="errorSrc"
      style="width: 100%; height: 100%"
      @click.stop
    />
  </NsImage>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import src from '@/assets/a.jpg'
import errorSrc from '@/assets/b.jpg'
const hasPreview = ref(true)
const apiUrl = reactive( {
    type: Object,
    default: ()=>({
      method: 'get',
      url: '/tool/file/getFileDetail',
      paramkey: 'fileIds',
      params: {},
    }),
  })

</script>
<style lang="scss" scoped>
</style>
