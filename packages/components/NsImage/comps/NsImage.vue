<template>
	<el-image
		class="preview-image-view"
		fit="fill"
		:preview-teleported="true"
		:preview-src-list="hasPreview ? [_url] : []"
		v-bind="$attrs"
		:src="_url"
		show-progress
	>
		<template #error>
      <div class="error-view" @click.stop>
        <slot>
          <img
            :src="EmptyPng"
            class="error-img"
            @click.stop
          />
        </slot>
      </div>
		</template>
	</el-image>
</template>

<script setup lang="ts">
import { ElImage } from 'element-plus';
import { getCurrentInstance, ref, watch } from 'vue';
import { get, ImageBaseUrl, post } from '../../../api/http';
import EmptyPng from '../../../assets/imgs/office-empty.png';
import { isNotNull } from '../../../utils';
const instance = getCurrentInstance();

const props = defineProps({
	src: {
		type: String,
		default: '',
	},
	url: {
		type: String,
		default: '',
	},
  // 传入api接口用户获取图片地址
  apiUrl: {
    type: Object,
    default: ()=>({
      method: 'get',
      url: '',
      paramkey: '',
      params: {},
      headers: {},
    }),
  },
	hasPreview: {
		type: Boolean || String,
		default: true,
	},
});

const showPreview = ref(false);


function getImageBaseUrl() {
  return instance?.appContext?.app?.config?.globalProperties?.$ImageBaseUrl || ImageBaseUrl();
}

const _url = ref('');
watch(
	[() => props.src, () => props.url],
	async ([new1, new2]) => {
		const nv = new1 || new2;
		if (nv) {
			if (nv.startsWith(getImageBaseUrl())) {
				let _tmp = nv.split('/') as any;
				_tmp = _tmp[_tmp.length - 1];
				if (isNotNull(_tmp)) {
					if (_tmp.indexOf('.') !== -1) {
						_url.value = nv;
					} else {
						const res = (await getFilePathByIds(_tmp)) || '';
						if (res?.length && res[0]?.filePath) {
							const path = res[0].filePath;
							_url.value = path.startsWith(getImageBaseUrl())
								? path
								: getImageBaseUrl() + path;
						}
					}
				} else {
					_url.value = '';
				}
			} else if (nv.startsWith(import.meta.env.VITE_BASE_URL) || nv.startsWith('http')) {
				_url.value = nv;
			} else {
        let _tmp = nv.split('/') as any;
				_tmp = _tmp[_tmp.length - 1];
				if (isNotNull(_tmp)) {
					if (_tmp.indexOf('.') !== -1) {
						_url.value = getImageBaseUrl() + nv;
					} else {
						const res = (await getFilePathByIds(_tmp)) || '';
						if (res?.length && res[0]?.filePath) {
							const path = res[0].filePath;
							_url.value = path.startsWith(getImageBaseUrl())
								? path
								: getImageBaseUrl() + path;
						}
					}
				} else {
					_url.value = '';
				}
			}
		} else {
			_url.value = '';
		}
	},
	{ immediate: true },
);

async function getFilePathByIds(id) {
  if(props.apiUrl.method === 'get') {
    return await get(props.apiUrl.url, { ...props.apiUrl.params, [props.apiUrl.paramkey]: id });
  }else if(props.apiUrl.method === 'post') {
    return await post(props.apiUrl.url, { ...props.apiUrl.params, [props.apiUrl.paramkey]: id });
  }
}

</script>
<style lang="scss" scoped>
.preview-image-view {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 100%;
	overflow: hidden;
	&.preivew-img {
		width: unset;
		height: unset;
	}
  .error-view {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .error-img {
      max-width: 100%;
      height: auto;
    }
  }
}
</style>
