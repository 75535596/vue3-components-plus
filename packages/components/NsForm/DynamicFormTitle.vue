<template>
    <div class="title-image-view">
        <div class="content-model-title">
            <!-- <img :src="ThemeVar.VARS['--matrix-form-title-icon']" alt="" /> -->
            <div class="title-icon"></div>
            <slot name="title">
                <span class="title-text">{{ title }}</span>
            </slot>
        </div>
        <div class="content-ui">
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ThemeVar } from '../../utils/loadCssVars'
defineProps({
    title: {
        type: String,
        default: "",
    },
});
</script>

<style scoped lang="scss">
.title-image-view {
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-bottom: var(--matrix-form-title-margin-bottom);
    .content-model-title {
        flex: none;
        display: flex;
        width: 100%;
        align-items: center;
        padding: var(--matrix-form-title-content-padding);
        margin-bottom:  var(--matrix-form-title-margin-bottom);
        gap: var(--matrix-form-title-gap);
        box-sizing: border-box;
        .title-text {
            font-weight: 400;
            font-size: 18px;
            color: var(--matrix-form-title-color);
        }
        .title-icon {
          width: var(--matrix-form-title-width);
          height: var(--matrix-form-title-height);
          background: var(--matrix-form-title-icon) no-repeat center center / 100% auto;
        }
    }
    .content-ui {
        flex: 1;
        width: 100%;
        padding: var(--matrix-form-title-content-padding);
        box-sizing: border-box;
    }
}
</style>
