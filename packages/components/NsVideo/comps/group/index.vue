<template>
  <div class="split-box">
    <span class="split-text">分屏：</span>
    <template v-if="!videoSplitUseIcon">
      <SplitIcon
        v-for="item in splitIconCount"
        :type="item"
        :key="item"
        v-model:activeIndex="activeIndex"
      ></SplitIcon>
    </template>
    <template v-else>
      <template v-for="(_, index) in 3" :key="index">
        <!-- <el-tooltip :content="index === 0 ? '单屏' : index === 1 ? '四屏' : '九屏'" placement="top"> -->
        <i :class="['martrix_iconfont', getIconClass(index, activeIndex)]" @click="activeIndex = (index + 1)" ></i>
        <!-- </el-tooltip> -->
      </template>
    </template>
  </div>
</template>
<script setup lang="ts">
import SplitIcon from './SplitIcon.vue'
import { inject, ref } from 'vue'

const getIconClass = (index: number, activeIndex) => {
  let iconClass = '';
  if(index == 0) {
    iconClass = 'icon-yiping'
  }else if(index == 1) {
    iconClass = 'icon-siping'
  }else if(index == 2) {
    iconClass = 'icon-jiuping'
  }
  if(activeIndex != (index + 1)) {
    iconClass += '-moren'
  }
  return iconClass
}


const splitIconCount = ref(3)
const activeIndex = inject('activeIndex')

defineProps({
  videoSplitUseIcon: {
    type: Boolean,
    default: false,
  },
})

</script>
<style lang="scss" scoped>
.split-box {
  overflow: hidden;
  margin-left: 20px;
  margin-bottom: 5px;
  display: flex;
  height: 30px;
  align-items: center;
  .martrix_iconfont {
    cursor: pointer;
    margin-right: 5px;
    font-size: 16px;
    color: var(--matrix-video-split-iconfont-color);
  }
}
</style>
