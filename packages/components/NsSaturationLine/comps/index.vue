<template>
  <div :class="['canvas-view',`${_className}`]">
      <v-stage
          v-if="!noData"
          ref="stage"
          :config="stageSize"
          @dragstart="handleDragstart"
          @dragend="handleDragend"
      >
          <!-- 没有任何测压管数据时使用 -->
          <v-layer ref="layerWater">
              <v-shape v-if="waterLevel?.map?.length===0" :config="noWaterConfig" />
          </v-layer>
          <!-- 坝体 -->
          <v-layer ref="layerDom">
              <v-line :config="domBkConfig" />
              <v-line :config="damConfig" />
          </v-layer>
          <!-- 岩石 -->
          <v-layer ref="layerStone">
              <v-group>
                  <v-rect :config="stoneConfig" />
              </v-group>
          </v-layer>
          <!-- 坐标轴 -->
          <v-layer ref="layerTrack">
              <v-line :config="xTrackConfig" />
              <v-line :config="yTrackConfig" />
              <!-- x轴标签 -->
              <v-text v-for="(item, index) in xLabels" :key="`x-${index}`" :config="labelTextConfig(item)" />
              <!-- y轴标签 -->
              <v-text v-for="(item, index) in yLabels" :key="`y-${index}`" :config="labelTextConfig(item)" />
              <!-- 单位文字 -->
              <v-text :config="xUnitTextConfig" />
              <v-text :config="yUnitTextConfig" />
          </v-layer>
          <!-- 测压管 -->
          <v-layer ref="layerPipeline">
              <v-group v-for="(item) in pipeLines" :key="item?.pointCode" :config="pipeLineGroupConfig(item)" :ref="el => setPipelineGroupRef(el, item.pointCode)">
                  <v-rect :config="pipeLineBkConfig(item)" />
                  <v-rect :config="pipeLineBkConfig(item)" />
                  <v-text :config="pipeLineTextConfig(item)" />
                  <v-text :config="downLabelTextConfig(item)" />
              </v-group>
          </v-layer>
          <!-- 水位 -->
          <v-layer ref="layerWater">
              <template v-if="waterLevel?.map?.length">
                  <v-shape :config="waterStartConfig" />
                  <v-shape :config="waterConfig" />
              </template>
          </v-layer>
          <!-- 防渗墙 -->
          <v-layer>
              <v-rect v-if="data?.isWall+'' === '1'" ref="layerWallRef" :config="wallConfig" />
          </v-layer>
          <!-- 水位文字 -->
          <v-layer ref="layerPipeline">
              <v-group v-for="item in textGroup" :key="item?.textCode" :config="textGroupConfig(item)" :ref="el => setTextGroupRef(el, item?.textCode)">
                  <v-rect :config="textIconConfig(item)" />
                  <v-text :config="textConfig(item)" />
              </v-group>
          </v-layer>
          <!-- 其他图层 -->
          <v-layer ref="layerWater">
              <v-line :config="otherLinesConfig" />
          </v-layer>
      </v-stage>
      <template v-else>
          <slot>
            <NoData :noData="noData" height="100px"></NoData>
          </slot>
      </template>
      <slot name="custom-canvas"></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from "vue";

defineOptions({
  name: "NsSaturationLine"
});
import StoneIcon from '../../../assets/imgs/stoneIcon.png'
import DownFill from '../../../assets/imgs/canvas_down_fill.png'
const _className = `key_${parseInt(Math.random() * 1000000)}`
// 组件 props 定义
const props = defineProps({
  // 是否对x轴数据进行排序，默认true
  isSortX: {
    type: Boolean,
    default: true,
  },
  fullData: {
    type: Object,
    default: () => {},
  },
  data: {
      type: Object,
      default: () => {},
  },
  waterLevel: {
      type: Object,
      default: () => {},
  },
  config: {
      type: Object,
      default: ()=> ({
          stoneYOffset: 20,
          max_label_count: 100,
          x_right_percent: 1.15,
          y_right_percent: 1.25,
          wall_width: 5,
          xTrackOffset: 50,
          yTrackOffset: 20,
          yTrackTop: 50,
          pipeLineTextYoffset: 30,
          damLineColor: "#999999",
          damBkColor: "#f6e7cc",
          axisLineColor: "#A5BEDA",
          axisTextColor: '#666666',
          pipeLineColor: '#EEEEEE',
          waterLevelTextColor: '#212121',
          waterLevelStartColor: 'rgba(10, 123, 255, 0.7)',
          waterLevelEndColor: 'rgba(10, 123, 255, 0.2)',
          wallColor: '#999999',
          xyLabelFontSize: 12,
          pipeLineLabelFontSize: 12,
          pipeLineValueFontSize: 12,
          waterLabelFontSize: 12,
      })
  }
});

const data = ref(props.data)
const waterLevel = ref(props.waterLevel)
const noData = ref(false)

const stage = ref()
// 石头比大坝高出的距离
const stoneYOffset = props.config?.stoneYOffset || 20;
// 最大100个x轴分割
const max_label_count = props.config?.max_label_count || 100;
// x轴右侧放石头的占整个width的比例
const x_right_percent = ref(props.config?.x_right_percent || 1.15);
// y轴右侧放石头的占整个height的比例
const y_right_percent = ref(props.config?.y_right_percent || 1.25);
// 防渗墙和测压管宽度
const wall_width = ref(props.config?.wall_width || 5);
// 测压管文字向上偏移量
const pipeLineTextYoffset = ref(props.config?.pipeLineTextYoffset || 30);

const waterInfo = reactive({
  kssw: '',
  xxsw: '',
  sjsw: '',
  jhsw: '',
})

// x轴线左侧偏移量,类似padding-left
const xTrackOffset = ref(props.config?.xTrackOffset || 50);
// y轴线下方偏移量,类似padding-bottom
const yTrackOffset = ref(props.config?.yTrackOffset || 20);
// y轴线上方偏移量,类似padding-top
const yTrackTop = ref(props.config?.yTrackTop || 50);

// 以下数据为计算出的, 不要修改
const originZeroX = ref(0);
// 计算 X 轴缩放比例：根据画布宽度和 X 轴数据范围
const xScale = ref(1);
// 计算 Y 轴缩放比例：根据画布高度和 Y 轴数据范围
const yScale = ref(1);
// 2个顶点
const damTops = ref([]);
// 画图偏移量(保留,暂无用)
const xOffset = ref(0);
// 画图偏移量(保留,暂无用)
const yOffset = ref(0);
// X坐标的最大最小值数组 [最小值, 最大值]
const xMaxMin = ref([]);
// Y坐标的最大最小值数组 [最小值, 最大值]
const yMaxMin = ref([]);
// x轴标签
const xLabels = ref([])
// x轴标签
const yLabels = ref([])
// 测压管数据
const pipeLines = ref([])
// 测压管组对象
const pipelineGroupRefs = ref(new Map())
// 防渗墙
const layerWallRef = ref()
// 文字数据
const textGroup = ref([])
// 文字组对象
const textGroupRefs = ref(new Map())
const textIconImage = ref()
const otherLinesPoint = ref([])
// 画布舞台尺寸配置
const stageSize = ref({
  width: 0, // 画布宽度
  height: 0, // 画布高度
});

// 大坝线配置
const damConfig = ref({
  points: [], // 大坝线条的坐标点数组
  fill: props.config?.damLineColor || "#999999", // 填充颜色
  stroke: props.config?.damLineColor || "#999999", // 边框颜色
  strokeWidth: 2, // 边框宽度
  closed: false, // 是否闭合路径
});

// 大坝背景配置
const domBkConfig = ref({
  points: [], // 大坝线条的坐标点数组
  fill: props.config?.damBkColor || "#f6e7cc",
  stroke: props.config?.damBkColor || "#f6e7cc",
  strokeWidth: 0,
  closed: true, // 是否闭合路径
});

// X轴配置
const xTrackConfig = ref({
  points: [],
  fill: props.config?.axisLineColor || "#A5BEDA",
  stroke: props.config?.axisLineColor || "#A5BEDA",
  strokeWidth: 1,
  closed: false,
});
// y轴配置
const yTrackConfig = ref({
  points: [],
  fill: props.config?.axisLineColor || "#A5BEDA",
  stroke: props.config?.axisLineColor || "#A5BEDA",
  strokeWidth: 1,
  closed: false,
});
// 轴文字
function labelTextConfig(item){
  return {
      fontSize: props.config?.xyLabelFontSize ?? 12,
      fill: props.config?.axisTextColor || '#666666',
      ...item
  }
};
// 测压管数值文字
function pipeLineTextConfig(item){
  return {
      fontSize: props.config?.pipeLineValueFontSize ?? 12,
      fill: props.config?.axisTextColor || '#666666',
      ...item
  }
};
// 测压管文字
function downLabelTextConfig(item) {
  return {
      fontSize: props.config?.pipeLineLabelFontSize ?? 12,
      fill: props.config?.axisTextColor || '#666666',
      x: -50,
      y: item.height + 8,
      text: item.pointName,
      align: 'center',
      width: wall_width.value + 100,
  }
}

// x轴单位文字
const xUnitTextConfig = ref({
  x: -9999,
  y: -9999,
  text: '单位：m',
  fontSize: props.config?.xyLabelFontSize ?? 12,
  fill: props.config?.axisTextColor || '#666666',
})
// y轴单位文字
const yUnitTextConfig = ref({
  x: -9999,
  y: -9999,
  text: '单位：m',
  fontSize: props.config?.xyLabelFontSize ?? 12,
  fill: props.config?.axisTextColor || '#666666',
})

// 测压管组
const pipeLineGroupConfig = function(item){
  return {
      id: item.pointCode,
      x: item.x,
      y: item.y,
      height: item.height,
  }
};

// 测压管配置
const pipeLineBkConfig = function(item){
  return {
      x: 0,
      y: 0,
      width: wall_width.value,
      height: item.height,
      fill: props.config?.pipeLineColor || '#EEEEEE',
      stroke: props.config?.damLineColor || '#999999',
      strokeWidth: 0.5,
      cornerRadius: 5,
  }
};

// 文字组
const textGroupConfig = function(item){
  if(!item){
      return {}
  }
  return {
      id: item.textCode,
      x: item.x,
      y: item.y,
      offsetY: pipeLineTextYoffset.value,
      height: item.height,
  }
};

// 文字图标配置
const textIconConfig = function(item){
  if(!item){
      return {}
  }
  if(!textIconImage.value) {
      const image = new Image();
      image.onload = () => {
          textIconImage.value = image
      };
      image.src = DownFill;
  }
  return {
      x: 0,
      y: 0,
      width: item.iconWidth,
      height: item.height,
      fillPatternRepeat: 'repeat',
      fillPatternImage: textIconImage.value,
      strokeWidth: 0,
  }
};

// 文字配置
function textConfig(item){
  if(!item){
      return {}
  }
  return {
      ...item,
      x: item.iconWidth + 5,
      y: 0,
      width: item.width,
      height: item.height,
      fontSize: props.config?.waterLabelFontSize ?? 12,
      fill: props.config?.waterLevelTextColor || '#212121',
      verticalAlign: 'middle',
  }
};

// 没有测压管数据时
const noWaterConfig = ref({
  points: [],
  fillLinearGradientStartPoint: { x: 0, y: 0 },
  fillLinearGradientEndPoint: { x: 0, y: 0 },
  fillLinearGradientColorStops: [0, props.config?.waterLevelStartColor || 'rgba(10, 123, 255, 0.7)', 1, props.config?.waterLevelEndColor || 'rgba(10, 123, 255, 0.2)'],
  stroke: "#0A7BFF",
  strokeWidth: 0,
})

// 水位起始配置
const waterStartConfig = ref({
  points: [],
  fillLinearGradientStartPoint: { x: 0, y: 0 },
  fillLinearGradientEndPoint: { x: 0, y: 0 },
  fillLinearGradientColorStops: [0, props.config?.waterLevelStartColor || 'rgba(10, 123, 255, 0.7)', 1, props.config?.waterLevelEndColor || 'rgba(10, 123, 255, 0.2)'],
  stroke: "#0A7BFF",
  strokeWidth: 0,
})

// 水位配置
const waterConfig = ref({
  points: [],
  fillLinearGradientStartPoint: { x: 0, y: 0 },
  fillLinearGradientEndPoint: { x: 0, y: 0 },
  fillLinearGradientColorStops: [0, props.config?.waterLevelStartColor || 'rgba(10, 123, 255, 0.7)', 1, props.config?.waterLevelEndColor || 'rgba(10, 123, 255, 0.2)'],
  stroke: "#0A7BFF",
  strokeWidth: 0,
})

// 其他线条
const otherLinesConfig = ref({
  points: [],
  stroke: "#9c9c9c",
  strokeWidth: 1,
  closed: false, // 是否闭合路径
});

// 防渗墙配置
const wallConfig = ref({
  x: 0,
  y: 0,
  width: wall_width.value,
  height: 0,
  fill: props.config?.wallColor || '#999999',
  stroke: props.config?.wallColor || '#999999',
  strokeWidth: 0.5,
});

// 岩石配置
const stoneConfig = ref({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  fillPatternRepeat: 'repeat',
  stroke: props.config?.wallColor || '#999999',
  strokeWidth: 1,
});

async function initChart() {
  // 初始化Y轴起始点
  yOffset.value = data.value?.yStart ? Number(data.value.yStart) : 0;    // 大坝 X 坐标点数组
  const dam_x_points = [];
  // 大坝 Y 坐标点数组
  const dam_y_points = [];
  // 临时存储 X 坐标值的数组，用于计算最大最小值
  const xPoints = [];
  // 临时存储 Y 坐标值的数组，用于计算最大最小值
  const yPoints = [];

  // 获取画布宽度和高度
  const _w = stageSize.value.width;
  const _h = stageSize.value.height;

  // 数据验证：检查是否存在截面表数据
  if (!data.value?.sectionTableList) {
      return;
  }

  // 遍历截面表数据，处理坐标点
  data.value.sectionTableList.forEach((item, index) => {
      // 第一个点作为 X 轴偏移量的基准点
      index === 0 ? (xOffset.value = item.xPoint) : null;
      // 计算相对 X 坐标（减去偏移量）
      const xValue = Number(item.xPoint) - Number(xOffset.value);
      // Y 坐标值
      const yValue = Number(item.yPoint) - Number(yOffset.value);

      // 存储处理后的坐标值
      dam_x_points.push(xValue);
      dam_y_points.push(yValue);

      // 为计算最大最小值而存储的原始坐标值
      xPoints.push(xValue);
      yPoints.push(yValue);

      if(item.isTop + '' === 'true') {
          damTops.value.push([xValue, yValue])
      }
  });

  // 计算并存储 X 和 Y 的最大最小值
  if (xPoints.length > 0) {
      xMaxMin.value = [Math.min(...xPoints), Math.max(...xPoints) * x_right_percent.value];
  }
  if (yPoints.length > 0) {
      yMaxMin.value = [Math.min(...yPoints), Math.max(...yPoints) * y_right_percent.value];
  }

  // Y 坐标反转：将 Y 坐标系统从传统的上向下转换为下向上
  dam_y_points?.forEach((item, index) => {
      dam_y_points[index] = yMaxMin.value[1] - item;
  });

  // 计算 X 轴缩放比例：根据画布宽度和 X 轴数据范围
  xScale.value = (_w - xTrackOffset.value) / xMaxMin.value[1];
  // 计算 Y 轴缩放比例：根据画布高度和 Y 轴数据范围
  yScale.value = (_h - yTrackOffset.value) / yMaxMin.value[1];

  // 应用 X 轴缩放比例
  dam_x_points.forEach((item, index) => {
      dam_x_points[index] = xTrackOffset.value + item * xScale.value;
  });
  // 应用 Y 轴缩放比例
  dam_y_points.forEach((item, index) => {
      dam_y_points[index] = item * yScale.value;
  });

  // 合并 X 和 Y 坐标数组为 Konva.js 所需的 points 数组格式 [x1, y1, x2, y2, ...]
  const dam_points = [];
  dam_x_points.map((item, index) => {
      dam_points.push(item); // X 坐标
      dam_points.push(dam_y_points[index]); // 对应的 Y 坐标
  });

  // 1. 更新大坝线条的坐标点数据
  damConfig.value.points = dam_points;
  // 背景图层（增加2个点）
  domBkConfig.value.points = [
      dam_points[0], yMaxMin.value[1] * yScale.value,
      ...dam_points,
      dam_points[dam_points.length-2], yMaxMin.value[1] * yScale.value
  ];
  // 2. 更新坐标轴
  const xTrackPoint = [
      xTrackOffset.value,
      yMaxMin.value[1] * yScale.value,
      _w,
      yMaxMin.value[1] * yScale.value,
  ];
  xTrackConfig.value.points = xTrackPoint;
  const yTrackPoint = [
      xTrackOffset.value,
      yTrackTop.value,
      xTrackOffset.value,
      yMaxMin.value[1] * yScale.value,
  ];
  yTrackConfig.value.points = yTrackPoint;

  // 3. 设置x轴标签
  {
      if(damTops.value.length === 2){
          originZeroX.value = (damTops.value[1][0] - damTops.value[0][0]) / 2 + damTops.value[0][0];
          const xTmp = {
              text: '',
              with: 50,
              x: 0,
              y: changeY(0), //yMaxMin.value[1] * yScale.value,
              align: 'center',
              offsetY: -10,
          }
          const middleX = changeX(originZeroX.value);
          xLabels.value.push({
              ...xTmp,
              x: middleX,
              text: '0',
          })
          for(let i=1; i<=max_label_count; i++){
              const _num = 0 - i * 10
              if(changeX(originZeroX.value + _num) < xTrackOffset.value){
                  break
              }
              const leftX = {
                  ...xTmp,
                  x: changeX(originZeroX.value + _num),
                  text: _num
              }
              xLabels.value.push(leftX)
          }
          for(let i=1; i<=max_label_count; i++){
              const _num = i * 10
              if(changeX(originZeroX.value + _num) > dam_x_points[dam_x_points.length - 1]){
                  break
              }
              const leftX = {
                  ...xTmp,
                  x: changeX(originZeroX.value + _num),
                  text: _num
              }
              xLabels.value.push(leftX)
          }
          xUnitTextConfig.value.x = _w - 50;
          xUnitTextConfig.value.y = changeY(0) + 8;
      }
  }
  // 4.设置y轴标签
  {
      const yTmp = {
          text: '',
          x: xTrackOffset,
          y: 0,
          align: 'right',
          offsetX: 30,
          offsetY: 5,
      }
      for( let i=0; i<max_label_count; i++ ) {
          const _num = i * ((yMaxMin.value[1] - yMaxMin.value[0]) / 5)
          if(yMaxMin.value[1] - _num < y_right_percent.value * 2) {
              break;
          }
          const tmp = {
              ...yTmp,
              text: Number(yOffset.value + _num).toFixed(0),
              y: changeY(_num)
          }
          yLabels.value.push(tmp)
      }

      yUnitTextConfig.value.x = xTrackOffset.value - 30;
      yUnitTextConfig.value.y = 10 * y_right_percent.value;
  }
  // 5. 绘制防渗墙
  {
      if(data.value.isWall + '' === '1' && damTops.value.length === 2) {
          wallConfig.value.x = changeX(originZeroX.value + Number(data.value.wallXpoint))
          wallConfig.value.y = changeY(damTops.value[0][1])
          wallConfig.value.height = damTops.value[0][1] * yScale.value
      }
  }

  // 6. 绘制测压管
  {
      if(data.value.pipelineTableList?.length) {
          pipeLines.value = data.value.pipelineTableList?.map((item)=>{
              const tmp = {
                  x: changeX(originZeroX.value + Number(item.xPoint)),
                  y: changeY(Number(item.yPoint), true),
                  height: item.height * yScale.value,
                  pointCode: item.pointCode || parseInt(Math.round(Math.random() * 1000000)),
                  pointName: item.pointName
              }
              return tmp
          })
      }
  }

  // 7. 绘制石头
  {
      stoneConfig.value.x = dam_x_points[dam_x_points.length - 1];
      stoneConfig.value.y = (dam_y_points[dam_y_points.length - 1]) - stoneYOffset;
      stoneConfig.value.width = _w - dam_x_points[dam_x_points.length - 1];
      stoneConfig.value.height = changeY(0) - dam_y_points[dam_y_points.length - 1] + stoneYOffset;
      stoneConfig.value.fillPatternScale = { x: 1, y: 1 };
      const image = new Image();
      image.onload = () => {
          stoneConfig.value.fillPatternImage = image;
      };
      image.src = StoneIcon;
  }

  // 8. 其他图层
  {
      if(data.value.cswlValList?.length) {

        const dam_points = [];
        data.value.cswlValList.map((item, index) => {
            dam_points.push(changeX(originZeroX.value + item.x)); // X 坐标
            dam_points.push(changeY(item.y, true)); // 对应的 Y 坐标
        });
        // 1. 更新大坝线条的坐标点数据
        otherLinesConfig.value.points = dam_points;
      }
  }


  // 8. 动态数据
  await nextTick();
  try {
       // 8.1 绘制水位线
      waterInfo.kssw = waterLevel.value?.kssw
      waterInfo.xxsw = waterLevel.value?.xxsw
      waterInfo.sjsw = waterLevel.value?.sjsw
      waterInfo.jhsw = waterLevel.value?.jhsw
      const oldSections = waterLevel.value?.map

      // 定义通用的数组排序函数
      const sortArrayByOrder = (targetArray, orderArray, targetKey, orderKey) => {
          // 创建一个映射，记录orderArray中每个元素的索引位置
          const orderMap = new Map();
          orderArray.forEach((item, index) => {
              orderMap.set(item[orderKey], index);
          });

          // 根据orderArray的顺序排序targetArray
          return targetArray.sort((a, b) => {
              const indexA = orderMap.get(a[targetKey]);
              const indexB = orderMap.get(b[targetKey]);

              // 如果某个元素在orderArray中找不到，则放到最后
              if (indexA === undefined) return 1;
              if (indexB === undefined) return -1;

              return indexA - indexB;
          });
      }

      // 处理实际的props数据，如果存在的话
      let sections = oldSections;
      if (oldSections && Array.isArray(oldSections) && data.value?.pipelineTableList && Array.isArray(data.value.pipelineTableList)) {
          sections = sortArrayByOrder(
              [...oldSections], // 使用浅拷贝避免修改原数组
              data.value.pipelineTableList,
              'pointCode',
              'pointCode'
          );
      }

      // 水位起始
      const waterStartPoints = [ xTrackOffset.value, changeY(waterInfo.kssw, true), 99999, changeY(waterInfo.kssw, true)];
      // 计算waterStartPoints与大坝的交叉点
      const intersections = calculateWaterDamIntersections(waterStartPoints, damConfig.value.points);
      // 绘制水位线，如果有防渗墙则使用2条线
      if(intersections?.length && intersections[0].canvasCoord) {
          const waterLine1 = [xTrackOffset.value, changeY(0), xTrackOffset.value, changeY(waterInfo.kssw, true), ...intersections[0].canvasCoord];
          const waterLine2 = [];
          let isAddWall = false;
          
          // 等待测压管组件完全渲染
          await nextTick();
          
          for(let i=0;i<sections.length;i++) {
              const { pointCode, waterLevel } = sections[i];
              const pipelineRect = getPipelineByPointCode(pointCode);
              if (!pipelineRect) {
                  console.warn(`测压管 ${pointCode} 未找到对应的图形元素，可能是nextTick()并没有完成渲染，考虑改成setTimeout`);
                  continue;
              }
              const children = pipelineRect.getNode().getChildren()
              const bkRect = children[0];
              const valueRect = children[1];
              const textRect = children[2];
              const pipeLine = data.value.pipelineTableList?.find(item=>item.pointCode === pointCode)
              if(pipeLine) {
                  const _y = (Number(pipeLine.yPoint) - Number(waterLevel)) * yScale.value
                  valueRect.setAttrs({
                      y: _y ,
                      height: bkRect.height() - _y < 0 ? 0 : bkRect.height() - _y,
                      fill: '#0A7BFF',
                  })
                  textRect.setAttrs({
                      x: 0,
                      y: _y,
                      text: `${ parseFloat(Number(waterLevel + '').toFixed(2))}m`,
                      align: 'center',
                      offsetX: 10,
                      offsetY: 15,
                  })
                  let afterWallNoWater = false;
                  if(!isAddWall && data.value?.isWall+'' === '1') {
                      if(layerWallRef.value.getNode().x() < pipelineRect.getNode().x()) {
                          isAddWall = true
                          const wall = layerWallRef.value.getNode();
                          waterLine1.push(wall.x())
                          waterLine1.push(waterLine1[waterLine1.length-2])
                          waterLine1.push(wall.x())
                          waterLine1.push(changeY(0))
                          // 第二条线
                          waterLine2.push(wall.x() + wall_width.value)
                          waterLine2.push(changeY(0))
                          waterLine2.push(wall.x() + wall_width.value)
                          waterLine2.push(valueRect.y() + pipelineRect.getNode().y())
                      }else if(i === sections.length - 1) {
                          isAddWall = true
                          afterWallNoWater = true;
                      }
                  }
                  if(waterLine2.length===0){
                      waterLine1.push(pipelineRect.getNode().x())
                      waterLine1.push(valueRect.y() + pipelineRect.getNode().y())
                  }else {
                      waterLine2.push(pipelineRect.getNode().x())
                      waterLine2.push(valueRect.y() + pipelineRect.getNode().y())
                  }
                  if(i === sections.length - 1) {
                      const waterEndY = changeY(0) - 20 < dam_y_points[dam_y_points.length-1] ? dam_y_points[dam_y_points.length-1] : changeY(0) - 20
                      if(waterLine2.length===0){
                          if(afterWallNoWater) {
                              const wall = layerWallRef.value.getNode();
                              waterLine1.push(wall.x())
                              waterLine1.push(waterLine1[waterLine1.length-2])
                              waterLine1.push(wall.x())
                              waterLine1.push(changeY(0))
                          }else {
                              waterLine1.push(dam_x_points[dam_x_points.length-1])
                              waterLine1.push(waterEndY)
                              waterLine1.push(dam_x_points[dam_x_points.length-1])
                              waterLine1.push(changeY(0))
                          }
                      }else {
                          waterLine2.push(dam_x_points[dam_x_points.length-1])
                          waterLine2.push(waterEndY)
                          waterLine2.push(dam_x_points[dam_x_points.length-1])
                          waterLine2.push(changeY(0))
                      }
                  }
              }
          }
          if(waterLevel.value?.map?.length===0) {
              noWaterConfig.value.sceneFunc = (context, shape) => {
                  context.beginPath();
                  // 将waterLine1转换为点对象数组
                  const points = [];
                  for (let i = 0; i < waterLine1.length; i += 2) {
                      if (waterLine1[i] !== undefined && waterLine1[i + 1] !== undefined) {
                          points.push({
                              x: waterLine1[i],
                              y: waterLine1[i + 1]
                          });
                      }
                  }
                  if (points.length > 2) {
                      points.push({
                          x: points[points.length-1].x,
                          y: points[0].y,
                      })
                  }
                  // 移动到起始点
                  context.moveTo(points[0].x, points[0].y);
                  for (let i = 0; i < points.length - 1; i++) {
                      const next = points[i + 1];
                      context.lineTo(next.x, next.y);
                  }
                  context.closePath();
                  context.fillStrokeShape(shape);
              }
              // 更新渐变终点坐标
              noWaterConfig.value.fillLinearGradientStartPoint = { x: xTrackOffset.value, y: changeY(waterInfo.kssw, true) };
              noWaterConfig.value.fillLinearGradientEndPoint = { x: xTrackOffset.value, y: yMaxMin.value[1] * yScale.value };
          }
          // 设置贝塞尔曲线
          waterStartConfig.value.sceneFunc = (context, shape) => {
              context.beginPath();

              // 将waterLine1转换为点对象数组
              const points = [];
              for (let i = 0; i < waterLine1.length; i += 2) {
                  if (waterLine1[i] !== undefined && waterLine1[i + 1] !== undefined) {
                      points.push({
                          x: waterLine1[i],
                          y: waterLine1[i + 1]
                      });
                  }
              }

              // 检查是否有足够的点进行绘制
              if (points.length < 2) {
                  context.fillStrokeShape(shape);
                  return;
              }

              // 移动到起始点
              context.moveTo(points[0].x, points[0].y);

              // 使用贝塞尔曲线连接各点
              for (let i = 0; i < points.length - 1; i++) {
                  const current = points[i];
                  const next = points[i + 1];

                  // 计算水平距离和高度差
                  const horizontalDist = Math.abs(next.x - current.x);
                  const heightDiff = Math.abs(next.y - current.y);

                  // 判断是否应该使用直线连接（当前后点y坐标相同或非常接近时）
                  if (Math.abs(next.y - current.y) < 0.1) {
                      // y坐标相同或非常接近，使用直线连接
                      context.lineTo(next.x, next.y);
                  } else {
                      // 根据高度差决定曲率，高度差越大曲率越大
                      const bendFactor = heightDiff * 0.01; // 曲率系数，可根据需要调整

                      // 计算控制点X坐标（线段中点）
                      const controlX = current.x + (next.x - current.x) * 0.5;

                      // 计算控制点Y坐标，确保曲线向下弯曲且最低点不超出端点范围
                      // 取两个端点中较低的y坐标作为基准，向下偏移（Y值增大表示向下）
                      const lowerY = Math.max(current.y, next.y); // y坐标系中，较大值表示较低位置
                      const controlY = lowerY + bendFactor;

                      // 使用二次贝塞尔曲线
                      context.quadraticCurveTo(controlX, controlY, next.x, next.y);
                  }
              }

              context.closePath();
              context.fillStrokeShape(shape);
          }
          // 更新渐变终点坐标
          waterStartConfig.value.fillLinearGradientStartPoint = { x: xTrackOffset.value, y: changeY(waterInfo.kssw, true) };
          waterStartConfig.value.fillLinearGradientEndPoint = { x: xTrackOffset.value, y: yMaxMin.value[1] * yScale.value };
          if(waterLine2.length===0){
              waterConfig.value.points = [];
          }else {
              // 第二条线设置贝塞尔曲线
              waterConfig.value.sceneFunc = (context, shape) => {
                  context.beginPath();

                  // 将waterLine2转换为点对象数组
                  const points = [];
                  for (let i = 0; i < waterLine2.length; i += 2) {
                      if (waterLine2[i] !== undefined && waterLine2[i + 1] !== undefined) {
                          points.push({
                              x: waterLine2[i],
                              y: waterLine2[i + 1]
                          });
                      }
                  }

                  // 检查是否有足够的点进行绘制
                  if (points.length < 2) {
                      context.fillStrokeShape(shape);
                      return;
                  }

                  // 移动到起始点
                  context.moveTo(points[0].x, points[0].y);

                  // 使用贝塞尔曲线连接各点
                  for (let i = 0; i < points.length - 1; i++) {
                      const current = points[i];
                      const next = points[i + 1];

                      // 计算水平距离和高度差
                      const horizontalDist = Math.abs(next.x - current.x);
                      const heightDiff = Math.abs(next.y - current.y);

                      // 判断是否应该使用直线连接（当前后点y坐标相同或非常接近时）
                      if (Math.abs(next.y - current.y) < 0.1) {
                          // y坐标相同或非常接近，使用直线连接
                          context.lineTo(next.x, next.y);
                      } else {
                          // 根据高度差决定曲率，高度差越大曲率越大
                          const bendFactor = heightDiff * 0.01; // 曲率系数，可根据需要调整

                          // 计算控制点X坐标（线段中点）
                          const controlX = current.x + (next.x - current.x) * 0.5;

                          // 计算控制点Y坐标，确保曲线向下弯曲且最低点不超出端点范围
                          // 取两个端点中较低的y坐标作为基准，向下偏移（Y值增大表示向下）
                          const lowerY = Math.max(current.y, next.y); // y坐标系中，较大值表示较低位置
                          const controlY = lowerY + bendFactor;

                          // 使用二次贝塞尔曲线
                          context.quadraticCurveTo(controlX, controlY, next.x, next.y);
                      }
                  }

                  context.closePath();
                  context.fillStrokeShape(shape);
              }
              // 更新渐变终点坐标
              waterConfig.value.fillLinearGradientStartPoint = { x: xTrackOffset.value, y: changeY(waterInfo.kssw, true) };
              waterConfig.value.fillLinearGradientEndPoint = { x: xTrackOffset.value, y: yMaxMin.value[1] * yScale.value };
          }
      }
      // 8.2 绘制水位文字
      textGroup.value = Object.keys(waterInfo)?.map((_k, index)=>{
          const _v = parseFloat(Number(waterInfo[_k] + '').toFixed(2));
          if(_v) {
              let _text = ''
              if(_k === 'kssw'){
                  _text = `库上水位：${_v}m`
              }else  if(_k === 'xxsw'){
                  _text = `汛限水位：${_v}m`
              }else  if(_k === 'sjsw'){
                  _text = `设计水位：${_v}m`
              }else  if(_k === 'jhsw'){
                  _text = `校核水位：${_v}m`
              }
              const tmp = {
                  x: xTrackOffset.value + 10,
                  y: changeY(_v, true),
                  textCode: _k || parseInt(Math.round(Math.random() * 1000000)),
                  width: 300,
                  iconWidth: 30,
                  height: 30,
                  text: _text
              }
              return tmp
          }
      })
  } catch (error) {
      console.error('浸润线数据绘制出错：',error)
  }
}

function changeX(_x) {
  return Number(_x) * xScale.value + xTrackOffset.value
}

function changeY(_y, offset=false) {
  return (yMaxMin.value[1] - Number(_y) + (offset ? Number(yOffset.value) : 0)) * yScale.value
}

function handleDragstart() {
    console.log('预留：handleDragstart')
}

function handleDragend() {
    console.log('预留：handleDragend')
}

//------------------------------测压管相关方法 start---------------------------------------
// 设置测压管组ref引用
function setPipelineGroupRef(el, pointCode) {
  if (el && pointCode) {
      pipelineGroupRefs.value.set(pointCode, el);
  }
}

// 根据pointCode获取v-rect实例
function getPipelineByPointCode(pointCode) {
  return pipelineGroupRefs.value.get(pointCode);
}
//------------------------------测压管相关方法 end---------------------------------------

//------------------------------文字相关方法 start---------------------------------------
function setTextGroupRef(el, textCode) {
  if (el && textCode) {
      textGroupRefs.value.set(textCode, el);
  }
}

function getTextBygetTextByTextCode(textCode) {
  return textGroupRefs.value.get(textCode);
}
//------------------------------文字相关方法 end---------------------------------------

//------------------------------交叉点计算相关方法 start---------------------------------------

/**
* 计算水位线与大坝线的交接点（斜率计算）
*/
function calculateWaterDamIntersections(waterStartPoints, damPoints = null) {
  const intersections = [];

  // 使用传入的大坝数据或组件内部数据
  const actualDamPoints = damPoints || damConfig.value.points;

  // 参数验证
  if (!waterStartPoints || !actualDamPoints || waterStartPoints.length < 4 || actualDamPoints.length < 4) {
      return intersections;
  }

  // 将坐标点数组转换为点对象数组
  const waterPoints = [];
  for (let i = 0; i < waterStartPoints.length; i += 2) {
      if (waterStartPoints[i] !== undefined && waterStartPoints[i + 1] !== undefined) {
          waterPoints.push({
              x: waterStartPoints[i],
              y: waterStartPoints[i + 1]
          });
      }
  }

  const damPointsArray = [];
  for (let i = 0; i < actualDamPoints.length; i += 2) {
      if (actualDamPoints[i] !== undefined && actualDamPoints[i + 1] !== undefined) {
          damPointsArray.push({
              x: actualDamPoints[i],
              y: actualDamPoints[i + 1]
          });
      }
  }

  // 遍历水位线的每条线段
  for (let i = 0; i < waterPoints.length - 1; i++) {
      const waterSegment = {
          start: waterPoints[i],
          end: waterPoints[i + 1]
      };

      // 遍历大坝线的每条线段
      for (let j = 0; j < damPointsArray.length - 1; j++) {
          const damSegment = {
              start: damPointsArray[j],
              end: damPointsArray[j + 1]
          };

          // 使用基于斜率的方法计算交点
          const intersection = calculateIntersectionBySlope(waterSegment, damSegment);

          if (intersection) {
              // 将画布坐标转换为真实坐标
              const realCoord = canvasToRealCoord(intersection.x, intersection.y);

              intersections.push({
                  canvasCoord: [intersection.x, intersection.y],
                  realCoord: realCoord,
                  segmentIndex: j,
                  waterSegmentIndex: i
              });
          }
      }
  }
  return intersections;
}

/**
* 基于斜率计算两条线段的交点
*/
function calculateIntersectionBySlope(segment1, segment2) {
  const { start: p1, end: p2 } = segment1;
  const { start: p3, end: p4 } = segment2;

  // 计算线段1的斜率和截距
  let slope1, intercept1, isVertical1 = false;
  if (Math.abs(p2.x - p1.x) < 1e-10) {
      // 线段1垂直
      isVertical1 = true;
      slope1 = Infinity;
      intercept1 = p1.x; // 垂直线的x坐标
  } else {
      slope1 = (p2.y - p1.y) / (p2.x - p1.x);
      intercept1 = p1.y - slope1 * p1.x; // y = mx + b 中的 b
  }

  // 计算线段2的斜率和截距
  let slope2, intercept2, isVertical2 = false;
  if (Math.abs(p4.x - p3.x) < 1e-10) {
      // 线段2垂直
      isVertical2 = true;
      slope2 = Infinity;
      intercept2 = p3.x; // 垂直线的x坐标
  } else {
      slope2 = (p4.y - p3.y) / (p4.x - p3.x);
      intercept2 = p3.y - slope2 * p3.x; // y = mx + b 中的 b
  }

  let intersectionX, intersectionY;

  if (isVertical1 && isVertical2) {
      // 两条都是垂直线
      if (Math.abs(intercept1 - intercept2) < 1e-10) {
          // 重合，取任意点
          return null; // 无限个交点，返回null
      } else {
          // 平行，无交点
          return null;
      }
  } else if (isVertical1) {
      // 线段1垂直，线段2不垂直
      intersectionX = intercept1;
      intersectionY = slope2 * intersectionX + intercept2;
  } else if (isVertical2) {
      // 线段2垂直，线段1不垂直
      intersectionX = intercept2;
      intersectionY = slope1 * intersectionX + intercept1;
  } else {
      // 两条线段都不垂直
      if (Math.abs(slope1 - slope2) < 1e-10) {
          // 斜率相同，检查是否重合
          if (Math.abs(intercept1 - intercept2) < 1e-10) {
              // 重合
              return null;
          } else {
              // 平行
              return null;
          }
      } else {
          // 斜率不同，有唯一交点
          intersectionX = (intercept2 - intercept1) / (slope1 - slope2);
          intersectionY = slope1 * intersectionX + intercept1;
      }
  }

  // 检查交点是否在两条线段上
  const onSegment1 = isPointOnSegment(intersectionX, intersectionY, p1, p2);
  const onSegment2 = isPointOnSegment(intersectionX, intersectionY, p3, p4);

  if (onSegment1 && onSegment2) {
      return {
          x: intersectionX,
          y: intersectionY
      };
  }
  return null;
}

/**
* 检查点是否在线段上
* @param {number} px - 点的x坐标
* @param {number} py - 点的y坐标
* @param {Object} start - 线段起点 {x, y}
* @param {Object} end - 线段终点 {x, y}
* @returns {boolean} 是否在线段上
*/
function isPointOnSegment(px, py, start, end) {
  const minX = Math.min(start.x, end.x) - 1e-10;
  const maxX = Math.max(start.x, end.x) + 1e-10;
  const minY = Math.min(start.y, end.y) - 1e-10;
  const maxY = Math.max(start.y, end.y) + 1e-10;

  const inRange = px >= minX && px <= maxX && py >= minY && py <= maxY;

  // 验证点是否真的在直线上（处理数值误差）
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  if (Math.abs(dx) < 1e-10 && Math.abs(dy) < 1e-10) {
      // 退化为一个点
      return Math.abs(px - start.x) < 1e-10 && Math.abs(py - start.y) < 1e-10;
  } else if (Math.abs(dx) < 1e-10) {
      // 垂直线段
      return Math.abs(px - start.x) < 1e-10 && inRange;
  } else if (Math.abs(dy) < 1e-10) {
      // 水平线段
      return Math.abs(py - start.y) < 1e-10 && inRange;
  } else {
      // 一般线段，使用叉积验证共线
      const cross = (px - start.x) * dy - (py - start.y) * dx;
      return Math.abs(cross) < 1e-8 && inRange;
  }
}

/**
* 将画布坐标转换为真实坐标
* @param {number} canvasX - 画布X坐标
* @param {number} canvasY - 画布Y坐标
* @returns {Array} 真实坐标 [realX, realY]
*/
function canvasToRealCoord(canvasX, canvasY) {
  // 将画布坐标转换回原始坐标系统
  const realX = (canvasX - xTrackOffset.value) / xScale.value + xOffset.value;
  const realY = yOffset.value + (yMaxMin.value[1] - canvasY / yScale.value);

  return [realX, realY];
}
//------------------------------交叉点计算相关方法 end---------------------------------------
// 监听水位数据和画布数据变化，重置画布并重新初始化图表
// 方案2：兼容老的代码，转成新的数据格式
watch(
  [() => props.waterLevel, () => props.data],
  async (newValues) => {
      waterLevel.value = newValues[0]
      data.value = newValues[1]
  },
  { deep: true, immediate: true }
)

// 新老方案兼容处理，核心waterLevelOrDataChange
watch(
  [() => waterLevel.value, () => data.value],
  async (newValues) => {
      waterLevelOrDataChange(newValues)
  },
  { deep: true, immediate: true }
)

// 方案1：直接使用新的数据格式, 兼容老的代码，转成新的数据格式
watch(
    () => props.fullData, 
    (nv, ol)=>{
        if((!nv || Object.keys(nv).length === 0)){
            try{
                if(!!ol && Object.keys(ol).length){
                    data.value = {}
                    waterLevel.value = {}
                }
            }catch(e){
                console.log(e)
            }
            return
        }
        const res = JSON.parse(JSON.stringify(nv))
        const waterLevelData: any = {
            "map": [],
            "kssw": res?.ksw || '0',
            "xxsw": res?.xxsw || '0',
            "sjsw": res?.sjsw || '0',
            "jhsw": res?.jhsw || '0',
        }
        // 对pointList按照x坐标从小到大排序，避免因为数据导致绘制水面错位！
        if(props.isSortX){
            res?.pointList?.sort((a, b) => Number(a.x || 0) - Number(b.x || 0))
        }
        res?.pointList?.forEach(item => {
            item.xPoint = item.x
            item.yPoint = item.y
            if(item.value) {
                waterLevelData.map?.push({
                    id: item.id,
                    pointCode: item.pointCode,
                    waterLevel: item.value,
                    date: item.time,
                })
            }
        })
        // 对sectionList按照x坐标从小到大排序，避免因为数据导致绘制坝体错位！
        if(props.isSortX){
            res?.sectionList?.sort((a, b) => Number(a.x || 0) - Number(b.x || 0))
        }
        res?.sectionList?.forEach(item => {
            item.tmpId = parseInt(Math.random() * 999999 + '')
            item.xPoint = item.x
            item.yPoint = item.y
        })
        // 其他图层
        res?.cswlValList?.forEach(item => {
            item.tmpId = parseInt(Math.random() * 999999 + '')
            item.xPoint = item.x
            item.yPoint = item.y
        })
        data.value = {
            // 坝体
            "sectionTableList": res?.sectionList || [],
            // 测压管
            "pipelineTableList": res?.pointList || [],
            // y/x偏移
            "isWall": res?.isWall + '' === 'true' ? '1' : '0',
            "yStart": res?.y || '0',
            "wallXpoint": res?.x || '0',
            // 其他图层
            "cswlValList": res?.cswlValList || []
        }
        waterLevel.value = waterLevelData || {}
    }, 
    { immediate: true, deep: true }
)

async function waterLevelOrDataChange(newValues) {
    // 重置画布状态变量
    resetCanvasState();
    if (!!newValues[0] && !!newValues[1]?.sectionTableList?.length) {
        await nextTick();
        stageSize.value = {
            width: document.querySelector(`.${_className}`).clientWidth,
            height: document.querySelector(`.${_className}`).clientHeight,
        };
        await nextTick();
        initChart();
        noData.value = false;
    }else {
        noData.value = true
    }
}


/**
* 重置画布状态
*/
function resetCanvasState() {
  // 重置坐标系相关变量
  xOffset.value = 0;
  yOffset.value = 0;
  xMaxMin.value = [];
  yMaxMin.value = [];
  xScale.value = 1;
  yScale.value = 1;
  damTops.value = [];
  originZeroX.value = 0;
  
  // 重置画布尺寸
  stageSize.value = {
    width: 0,
    height: 0
  };

  // 重置坐标轴标签
  xLabels.value = [];
  yLabels.value = [];

  // 重置测压管数据和引用
  pipeLines.value = [];
  pipelineGroupRefs.value.clear();

  // 重置文字数据和引用
  textGroup.value = [];
  textGroupRefs.value.clear();
  textIconImage.value = null;

  // 重置大坝配置
  damConfig.value.points = [];
  domBkConfig.value.points = [];

  // 重置坐标轴配置
  xTrackConfig.value.points = [];
  yTrackConfig.value.points = [];

  // 重置水位配置
  waterStartConfig.value.points = [];
  waterStartConfig.value.fillLinearGradientStartPoint = { x: 0, y: 0 };
  waterStartConfig.value.fillLinearGradientEndPoint = { x: 0, y: 0 };
  delete waterStartConfig.value.sceneFunc;
  
  waterConfig.value.points = [];
  waterConfig.value.fillLinearGradientStartPoint = { x: 0, y: 0 };
  waterConfig.value.fillLinearGradientEndPoint = { x: 0, y: 0 };
  delete waterConfig.value.sceneFunc;
  
  noWaterConfig.value.points = [];
  noWaterConfig.value.fillLinearGradientStartPoint = { x: 0, y: 0 };
  noWaterConfig.value.fillLinearGradientEndPoint = { x: 0, y: 0 };
  delete noWaterConfig.value.sceneFunc;

  // 重置防渗墙配置
  wallConfig.value.x = 0;
  wallConfig.value.y = 0;
  wallConfig.value.height = 0;

  // 重置岩石配置
  stoneConfig.value.x = 0;
  stoneConfig.value.y = 0;
  stoneConfig.value.width = 0;
  stoneConfig.value.height = 0;
  delete stoneConfig.value.fillPatternImage;
  delete stoneConfig.value.fillPatternScale;

  // 重置单位文字配置
  xUnitTextConfig.value.x = -9999;
  xUnitTextConfig.value.y = -9999;
  yUnitTextConfig.value.x = -9999;
  yUnitTextConfig.value.y = -9999;

  // 重置水位信息
  waterInfo.kssw = '';
  waterInfo.xxsw = '';
  waterInfo.sjsw = '';
  waterInfo.jhsw = '';
}
// 暴露给外部使用的API
const getCoordinateSystem = () => ({
  xScale: xScale.value,
  yScale: yScale.value,
  xOffset: xOffset.value,
  yOffset: yOffset.value,
  xTrackOffset: xTrackOffset.value,
  originZeroX: originZeroX.value,
  xMaxMin: xMaxMin.value,
  yMaxMin: yMaxMin.value,
  stageSize: { ...stageSize.value }
})

// 暴露坐标转换函数给外部使用
const convertToCanvasCoordinates = (realX, realY) => {
  return {
    x: changeX(realX),
    y: changeY(realY, true)
  }
}

// 暴露从画布坐标转换回真实坐标的函数
const convertToRealCoordinates = (canvasX, canvasY) => {
  return canvasToRealCoord(canvasX, canvasY)
}

// 暴露大坝数据
const getDamData = () => ({
  points: damConfig.value.points,
  tops: damTops.value
})

// 暴露测压管数据
const getPipelineData = () => ([...pipeLines.value])

// 暴露水位数据
const getWaterLevelData = () => ({ ...waterInfo })

// 暴露重置画布函数
const resetCanvas = () => {
  resetCanvasState()
}

defineExpose({ 
  resetCanvasState,
  getCoordinateSystem,
  convertToCanvasCoordinates,
  convertToRealCoordinates,
  getDamData,
  getPipelineData,
  getWaterLevelData,
  resetCanvas
})
</script>
<style scoped lang="scss">
.canvas-view {
  width: 100%;
  height: 100%;
}
</style>
