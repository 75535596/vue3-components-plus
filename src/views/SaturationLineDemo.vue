<template>
    <div class="saturation-line-view">
      <span>浸润线 - 自定义Canvas演示</span>
      <!-- 方案1（推荐，支持sort按照x坐标从小到大排序）：fullData -->
      <NsSaturationline ref="canvasRef" class="saturationline-canvas" :fullData="fullData" :isSortX="true" :config="config">
        <span>无数据</span>
        <template #custom-canvas>
            <canvas id="saturation-line-canvas" width="800" height="400"></canvas>
        </template>
      </NsSaturationline>
      
      <!-- 自定义Canvas操作区域 -->
      <div class="custom-canvas-controls">
        <h3>自定义Canvas功能演示</h3>
        <button @click="showCoordinateInfo">显示坐标系信息</button>
        <button @click="drawCustomShapes">在自定义Canvas上绘制图形</button>
        <button @click="addCustomMarkers">添加自定义标记</button>
        <button @click="drawCswlValListLine">绘制cswlValList线条</button>
        <button @click="drawArc">绘制圆弧</button>
      </div>
      <!-- 方案2（兼容老的调用方式） -->
      <!-- <NsSaturationline ref="canvasRef" class="saturationline-canvas" :data="state.damData" :waterLevel="state.waterLevel">
        <span>无数据</span>
      </NsSaturationline> -->
    </div>
</template>
<script setup lang="ts" name="">
import { ElMessageBox } from 'element-plus';
import { onMounted, reactive, ref, nextTick } from 'vue';

const config = reactive({
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

const fullData = ref({
    "isDelete": 0,
    "damCode": "dam_1996484649555202048",
    "updateTime": "2025-12-04 17:19:29",
    "sectionId": 41,
    "projectCodeDesc": "象山水库",
    "sjsw": null,
    "ksw": 47.85,
    "createBy": 1,
    "pointList": [
        {
            "pointCode": "xiangshanup1",
            "isDelete": 0,
            "pointName": "UP1",
            "damCode": "dam_1996484649555202048",
            "updateTime": "2025-12-04 17:19:29",
            "sectionId": 41,
            "createBy": 1,
            "createTime": "2025-12-04 16:16:41",
            "updateBy": 1,
            "x": "-2.5",
            "y": "52.8",
            "id": 77,
            "time": "2025-12-04 19:37:17",
            "value": 44.19,
            "height": "25"

        },
        {
            "pointCode": "xsUP2",
            "isDelete": 0,
            "pointName": "UP2",
            "damCode": "dam_1996484649555202048",
            "updateTime": "2025-12-04 17:19:29",
            "sectionId": 41,
            "createBy": 1,
            "createTime": "2025-12-04 16:16:41",
            "updateBy": 1,
            "x": "2.5",
            "y": "52.8",
            "id": 78,
            "time": "2025-12-04 19:37:17",
            "value": 41.8,
            "height": "25"
        },
        {
            "pointCode": "xsup3",
            "isDelete": 0,
            "pointName": "UP3",
            "damCode": "dam_1996484649555202048",
            "updateTime": "2025-12-04 17:19:29",
            "sectionId": 41,
            "createBy": 1,
            "createTime": "2025-12-04 16:16:41",
            "updateBy": 1,
            "x": "8",
            "y": "49.5",
            "id": 79,
            "time": "2025-12-04 19:37:17",
            "value": 41.14,
            "height": "22"
        },
    ],
    "cswlValList": [
        {
            "x": -13,
            "y": 21.3413
        },
        {
            "x": -12,
            "y": 21.2529
        },
        {
            "x": -11,
            "y": 21.1582
        },
        {
            "x": -10,
            "y": 21.0537
        },
        {
            "x": -9,
            "y": 20.9615
        },
        {
            "x": -8,
            "y": 20.9049
        },
        {
            "x": -7,
            "y": 20.7928
        },
        {
            "x": -6,
            "y": 20.721
        },
        {
            "x": -5,
            "y": 20.6487
        },
        {
            "x": -4,
            "y": 20.5797
        },
        {
            "x": -3,
            "y": 20.5365
        },
        {
            "x": -2,
            "y": 20.444
        },
        {
            "x": -1,
            "y": 20.3826
        },
        {
            "x": 0,
            "y": 20.3147
        },
        {
            "x": 1,
            "y": 20.2732
        },
        {
            "x": 2,
            "y": 20.2051
        },
        {
            "x": 3,
            "y": 20.1457
        },
        {
            "x": 4,
            "y": 20.1095
        },
        {
            "x": 5,
            "y": 20.0434
        },
        {
            "x": 6,
            "y": 19.9835
        },
        {
            "x": 7,
            "y": 19.9121
        },
        {
            "x": 8,
            "y": 19.8637
        },
        {
            "x": 9,
            "y": 19.7987
        },
        {
            "x": 10,
            "y": 19.7349
        },
        {
            "x": 11,
            "y": 19.6704
        },
        {
            "x": 12,
            "y": 19.6217
        },
        {
            "x": 13,
            "y": 19.5683
        },
        {
            "x": 14,
            "y": 19.4953
        },
        {
            "x": 15,
            "y": 19.4349
        },
        {
            "x": 16,
            "y": 19.3739
        },
        {
            "x": 17,
            "y": 19.3105
        },
        {
            "x": 18,
            "y": 19.2485
        },
        {
            "x": 19,
            "y": 19.1871
        },
        {
            "x": 20,
            "y": 19.1484
        },
        {
            "x": 21,
            "y": 19.0687
        },
        {
            "x": 22,
            "y": 19.0007
        },
        {
            "x": 23,
            "y": 18.9359
        },
        {
            "x": 24,
            "y": 18.8767
        },
        {
            "x": 25,
            "y": 18.8241
        },
        {
            "x": 26,
            "y": 18.7161
        },
        {
            "x": 27,
            "y": 18.6665
        },
        {
            "x": 28,
            "y": 18.6099
        },
        {
            "x": 29,
            "y": 18.5424
        },
        {
            "x": 30,
            "y": 18.4532
        },
        {
            "x": 31,
            "y": 18.3854
        },
        {
            "x": 32,
            "y": 18.3179
        },
        {
            "x": 33,
            "y": 18.2532
        },
        {
            "x": 34,
            "y": 18.1821
        },
        {
            "x": 35,
            "y": 18.1177
        },
        {
            "x": 36,
            "y": 18.0292
        },
        {
            "x": 37,
            "y": 17.9552
        },
        {
            "x": 38,
            "y": 17.8892
        },
        {
            "x": 39,
            "y": 17.7636
        },
        {
            "x": 40,
            "y": 17.6965
        },
        {
            "x": 41,
            "y": 17.6137
        },
        {
            "x": 42,
            "y": 17.5418
        },
        {
            "x": 43,
            "y": 17.4543
        },
        {
            "x": 44,
            "y": 17.3725
        },
        {
            "x": 45,
            "y": 17.2989
        },
        {
            "x": 46,
            "y": 17.2335
        },
        {
            "x": 47,
            "y": 17.1776
        },
        {
            "x": 48,
            "y": 17.0762
        },
        {
            "x": 49,
            "y": 16.9886
        },
        {
            "x": 50,
            "y": 16.911
        },
        {
            "x": 51,
            "y": 16.8367
        },
        {
            "x": 52,
            "y": 16.7509
        },
        {
            "x": 53,
            "y": 16.6716
        },
        {
            "x": 54,
            "y": 16.5844
        },
        {
            "x": 55,
            "y": 16.489
        },
        {
            "x": 56,
            "y": 16.4105
        },
        {
            "x": 57,
            "y": 16.3294
        },
        {
            "x": 58,
            "y": 16.2448
        },
        {
            "x": 59,
            "y": 16.1585
        },
        {
            "x": 60,
            "y": 16.072
        },
        {
            "x": 61,
            "y": 15.9886
        },
        {
            "x": 62,
            "y": 15.8869
        },
        {
            "x": 63,
            "y": 15.8009
        },
        {
            "x": 64,
            "y": 15.706
        },
        {
            "x": 65,
            "y": 15.6213
        },
        {
            "x": 66,
            "y": 15.5156
        },
        {
            "x": 67,
            "y": 15.4094
        },
        {
            "x": 68,
            "y": 15.3139
        },
        {
            "x": 69,
            "y": 15.2122
        },
        {
            "x": 70,
            "y": 15.1049
        },
    ],
    "jhsw": null,
    "createTime": "2025-12-04 16:50:00",
    "updateBy": 1,
    "projectCode": "reservoir_1996484060796555264",
    "x": "0",
    "y": "10",
    "id": 57,
    "sectionList": [
        {
            "createBy": 1,
            "createTime": "2025-12-04 16:50:00",
            "updateBy": 1,
            "isTop": false,
            "isDelete": 0,
            "damCode": "dam_1996484649555202048",
            "x": "-14.24",
            "y": "46",
            "updateTime": "2025-12-04 16:55:54",
            "id": 209,
            "sectionId": 41
        },
        {
            "createBy": 1,
            "createTime": "2025-12-04 16:50:00",
            "updateBy": 1,
            "isTop": false,
            "isDelete": 0,
            "damCode": "dam_1996484649555202048",
            "x": "-7.12",
            "y": "48",
            "updateTime": "2025-12-04 16:56:46",
            "id": 210,
            "sectionId": 41
        },
        {
            "createBy": 1,
            "createTime": "2025-12-04 16:50:00",
            "updateBy": 1,
            "isTop": true,
            "isDelete": 0,
            "damCode": "dam_1996484649555202048",
            "x": "-2.5",
            "y": "52.8",
            "updateTime": "2025-12-04 16:56:47",
            "id": 211,
            "sectionId": 41
        },
        {
            "createBy": 1,
            "createTime": "2025-12-04 16:50:00",
            "updateBy": 1,
            "isTop": true,
            "isDelete": 0,
            "damCode": "dam_1996484649555202048",
            "x": "2.5",
            "y": "52.8",
            "updateTime": "2025-12-04 16:57:18",
            "id": 212,
            "sectionId": 41
        },
        {
            "createBy": 1,
            "createTime": "2025-12-04 16:50:00",
            "updateBy": 1,
            "isTop": false,
            "isDelete": 0,
            "damCode": "dam_1996484649555202048",
            "x": "19",
            "y": "44",
            "updateTime": "2025-12-04 16:57:53",
            "id": 213,
            "sectionId": 41
        },
        {
            "createBy": 1,
            "createTime": "2025-12-04 17:16:46",
            "updateBy": 1,
            "isTop": false,
            "isDelete": 0,
            "damCode": "dam_1996484649555202048",
            "x": "22",
            "y": "44",
            "updateTime": "2025-12-04 16:57:51",
            "id": 214,
            "sectionId": 41
        },
        {
            "createBy": 1,
            "createTime": "2025-12-04 16:50:00",
            "updateBy": 1,
            "isTop": false,
            "isDelete": 0,
            "damCode": "dam_1996484649555202048",
            "x": "42.85",
            "y": "36",
            "updateTime": "2025-12-04 16:55:54",
            "id": 215,
            "sectionId": 41
        },
        {
            "createBy": 1,
            "createTime": "2025-12-04 16:50:00",
            "updateBy": 1,
            "isTop": false,
            "isDelete": 0,
            "damCode": "dam_1996484649555202048",
            "x": "51.45",
            "y": "36",
            "updateTime": "2025-12-04 16:55:54",
            "id": 216,
            "sectionId": 41
        },
        {
            "createBy": 1,
            "createTime": "2025-12-04 16:50:00",
            "updateBy": 1,
            "isTop": false,
            "isDelete": 0,
            "damCode": "dam_1996484649555202048",
            "x": "71.2",
            "y": "30",
            "updateTime": "2025-12-04 16:55:54",
            "id": 217,
            "sectionId": 41
        },
        {
            "createBy": 1,
            "createTime": "2025-12-04 16:50:00",
            "updateBy": 1,
            "isTop": false,
            "isDelete": 0,
            "damCode": "dam_1996484649555202048",
            "x": "78.67",
            "y": "30",
            "updateTime": "2025-12-04 16:55:54",
            "id": 218,
            "sectionId": 41
        }
    ],
    "xxsw": null,
    "isWall": false
})

const canvasRef = ref()

// 自定义Canvas功能
const drawCustomShapes = async () => {
  await nextTick()
  if (!canvasRef.value) return
  
  // 获取组件暴露的API
  const {
    getCoordinateSystem,
    convertToCanvasCoordinates,
    getDamData,
    getPipelineData
  } = canvasRef.value
  
  const coordinateSystem = getCoordinateSystem()
  const damData = getDamData()
  const pipelineData = getPipelineData()
  
  console.log('坐标系信息:', coordinateSystem)
  console.log('大坝数据:', damData)
  console.log('测压管数据:', pipelineData)
  
  // 获取自定义canvas元素
  const canvas = document.getElementById('saturation-line-canvas')
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // 绘制自定义图形
  ctx.fillStyle = 'rgba(255, 0, 0, 0.3)'
  ctx.fillRect(10, 10, 50, 50)
  
  // 使用坐标转换函数在特定位置绘制标记
  pipelineData.forEach(pipeline => {
    const { x, y } = pipeline
    
    // 在测压管位置绘制红色圆点
    ctx.beginPath()
    ctx.arc(x, y, 5, 0, 2 * Math.PI)
    ctx.fillStyle = 'red'
    ctx.fill()
    
    // 添加文字标注
    ctx.fillStyle = 'blue'
    ctx.font = '12px Arial'
    ctx.fillText(pipeline.pointName, x + 10, y - 10)
  })
  
  // 在大坝顶点位置绘制绿色标记
  damData.tops.forEach((top, index) => {
    const [realX, realY] = top
    const canvasCoords = convertToCanvasCoordinates(realX, realY)
    
    ctx.beginPath()
    ctx.arc(canvasCoords.x, canvasCoords.y, 8, 0, 2 * Math.PI)
    ctx.fillStyle = 'green'
    ctx.fill()
    
    ctx.fillStyle = 'green'
    ctx.font = '12px Arial'
    ctx.fillText(`顶点${index + 1}`, canvasCoords.x + 10, canvasCoords.y - 10)
  })
}

const showCoordinateInfo = async () => {
  await nextTick()
  if (!canvasRef.value) return
  
  const {
    getCoordinateSystem,
    convertToCanvasCoordinates,
    convertToRealCoordinates
  } = canvasRef.value
  
  const coordinateSystem = getCoordinateSystem()
  
  // 演示坐标转换
  const realCoords = [10, 20] // 真实坐标
  const canvasCoords = convertToCanvasCoordinates(realCoords[0], realCoords[1])
  const backToReal = convertToRealCoordinates(canvasCoords.x, canvasCoords.y)
  
  console.log('坐标转换演示:')
  console.log('真实坐标:', realCoords)
  console.log('转换为画布坐标:', canvasCoords)
  console.log('转换回真实坐标:', backToReal)
  
  ElMessageBox.alert(`坐标系信息：\n` +
    `画布尺寸: ${coordinateSystem.stageSize.width}x${coordinateSystem.stageSize.height}\n` +
    `X轴缩放: ${coordinateSystem.xScale.toFixed(4)}\n` +
    `Y轴缩放: ${coordinateSystem.yScale.toFixed(4)}\n` +
    `X轴偏移: ${coordinateSystem.xOffset}\n` +
    `Y轴偏移: ${coordinateSystem.yOffset}`)
}

const addCustomMarkers = async () => {
  await nextTick()
  if (!canvasRef.value) return
  
  // 获取组件暴露的API
  const {
    getCoordinateSystem,
    convertToCanvasCoordinates,
    getDamData,
    getPipelineData
  } = canvasRef.value
  
  const coordinateSystem = getCoordinateSystem()
  const damData = getDamData()
  const pipelineData = getPipelineData()
  
  console.log('添加自定义标记 - 坐标系:', coordinateSystem)
  console.log('添加自定义标记 - 大坝数据:', damData)
  console.log('添加自定义标记 - 测压管数据:', pipelineData)
  
  const canvas = document.getElementById('saturation-line-canvas')
  if (!canvas) {
    console.error('未找到自定义canvas元素')
    return
  }
  
  const ctx = canvas.getContext('2d')
  
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // 添加一些自定义标记，基于实际数据范围
  const customPoints = [
    { x: -10, y: 30, label: '自定义点1' },
    { x: 0, y: 28, label: '自定义点2' },
    { x: 10, y: 26, label: '自定义点3' },
    { x: 20, y: 24, label: '自定义点4' },
    { x: 30, y: 22, label: '自定义点5' }
  ]
  
  console.log('开始绘制自定义标记...')
  
  customPoints.forEach((point, index) => {
    try {
      const canvasCoords = convertToCanvasCoordinates(point.x, point.y)
      console.log(`点${index + 1}: 真实坐标(${point.x}, ${point.y}) -> 画布坐标(${canvasCoords.x}, ${canvasCoords.y})`)
      
      // 检查坐标是否在画布范围内
      if (canvasCoords.x < 0 || canvasCoords.x > canvas.width || 
          canvasCoords.y < 0 || canvasCoords.y > canvas.height) {
        console.warn(`点${index + 1}超出画布范围: (${canvasCoords.x}, ${canvasCoords.y})`)
        return
      }
      
      // 绘制黄色三角形标记
      ctx.beginPath()
      ctx.moveTo(canvasCoords.x, canvasCoords.y - 8)
      ctx.lineTo(canvasCoords.x - 6, canvasCoords.y + 4)
      ctx.lineTo(canvasCoords.x + 6, canvasCoords.y + 4)
      ctx.closePath()
      ctx.fillStyle = 'rgba(255, 255, 0, 0.8)'
      ctx.fill()
      ctx.strokeStyle = 'orange'
      ctx.lineWidth = 2
      ctx.stroke()
      
      // 添加文字
      ctx.fillStyle = 'purple'
      ctx.font = '12px Arial'
      ctx.fillText(point.label, canvasCoords.x + 10, canvasCoords.y + 5)
      
      console.log(`点${index + 1}绘制完成`)
    } catch (error) {
      console.error(`绘制点${index + 1}时出错:`, error)
    }
  })
  
  console.log('自定义标记绘制完成')
  
  // 同时在大坝顶点位置添加标记作为参考
  damData.tops.forEach((top, index) => {
    try {
      const [realX, realY] = top
      const canvasCoords = convertToCanvasCoordinates(realX, realY)
      
      // 绘制绿色圆点标记
      ctx.beginPath()
      ctx.arc(canvasCoords.x, canvasCoords.y, 6, 0, 2 * Math.PI)
      ctx.fillStyle = 'rgba(0, 255, 0, 0.6)'
      ctx.fill()
      ctx.strokeStyle = 'darkgreen'
      ctx.lineWidth = 1
      ctx.stroke()
      
      // 添加文字
      ctx.fillStyle = 'darkgreen'
      ctx.font = '10px Arial'
      ctx.fillText(`坝顶${index + 1}`, canvasCoords.x + 8, canvasCoords.y - 8)
    } catch (error) {
      console.error(`绘制大坝顶点${index + 1}时出错:`, error)
    }
  })
}

// 使用cswlValList数据绘制线条
const drawCswlValListLine = async () => {
  await nextTick()
  if (!canvasRef.value) return
  
  // 获取组件暴露的API
  const {
    getCoordinateSystem,
    convertToCanvasCoordinates
  } = canvasRef.value
  
  const coordinateSystem = getCoordinateSystem()
  
  console.log('开始绘制cswlValList线条...')
  console.log('cswlValList数据:', fullData.value.cswlValList)
  console.log('坐标系信息:', coordinateSystem)
  
  const canvas = document.getElementById('saturation-line-canvas')
  if (!canvas) {
    console.error('未找到自定义canvas元素')
    return
  }
  
  // 关键修改：根据Konva画布的尺寸调整自定义canvas
  const konvaWidth = coordinateSystem.stageSize.width
  const konvaHeight = coordinateSystem.stageSize.height
  
  // 设置自定义canvas尺寸与Konva画布一致
  canvas.width = konvaWidth
  canvas.height = konvaHeight
  
  const ctx = canvas.getContext('2d')
  
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // 检查是否有cswlValList数据
  if (!fullData.value.cswlValList || fullData.value.cswlValList.length === 0) {
    console.warn('没有cswlValList数据可绘制')
    return
  }
  
  console.log(`自定义Canvas尺寸: ${canvas.width}x${canvas.height}`)
  console.log(`Konva画布尺寸: ${konvaWidth}x${konvaHeight}`)
  
  // 关键修改：考虑X轴偏移和Y轴偏移
  // 获取偏移量信息
  const xOffset = coordinateSystem.xOffset
  const yOffset = coordinateSystem.yOffset
  const xTrackOffset = coordinateSystem.xTrackOffset
  const originZeroX = coordinateSystem.originZeroX
  
  console.log('偏移量信息:', { xOffset, yOffset, xTrackOffset, originZeroX })
  
  // 开始绘制线条
  ctx.beginPath()
  
  // 设置线条样式
  ctx.strokeStyle = '#ff6b6b'
  ctx.lineWidth = 3
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  
  // 绘制第一个点 - 关键修改：考虑originZeroX偏移
  const firstPoint = fullData.value.cswlValList[0]
  // 调整X坐标：考虑相对于originZeroX的偏移
  const adjustedFirstX = firstPoint.x + (originZeroX || 0)
  const firstCanvasCoords = convertToCanvasCoordinates(adjustedFirstX, firstPoint.y)
  ctx.moveTo(firstCanvasCoords.x, firstCanvasCoords.y)
  
  console.log(`开始点: 原始坐标(${firstPoint.x}, ${firstPoint.y}) -> 调整后坐标(${adjustedFirstX}, ${firstPoint.y}) -> 画布坐标(${firstCanvasCoords.x}, ${firstCanvasCoords.y})`)
  
  // 绘制后续点
  fullData.value.cswlValList.forEach((point, index) => {
    try {
      // 关键修改：考虑originZeroX偏移
      const adjustedX = point.x + (originZeroX || 0)
      const canvasCoords = convertToCanvasCoordinates(adjustedX, point.y)
      
      // 检查坐标是否在画布范围内
      if (canvasCoords.x < 0 || canvasCoords.x > canvas.width || 
          canvasCoords.y < 0 || canvasCoords.y > canvas.height) {
        console.warn(`点${index + 1}超出画布范围: (${canvasCoords.x}, ${canvasCoords.y})`)
        return
      }
      
      ctx.lineTo(canvasCoords.x, canvasCoords.y)
      console.log(`点${index + 1}: 原始坐标(${point.x}, ${point.y}) -> 调整后坐标(${adjustedX}, ${point.y}) -> 画布坐标(${canvasCoords.x}, ${canvasCoords.y})`)
      
    } catch (error) {
      console.error(`处理点${index + 1}时出错:`, error)
    }
  })
  
  // 描边线条
  ctx.stroke()
  
  // 在线条下方添加半透明填充
  ctx.beginPath()
  
  // 绘制第一个点
  const firstPointFill = fullData.value.cswlValList[0]
  const adjustedFirstXFill = firstPointFill.x + (originZeroX || 0)
  const firstCanvasCoordsFill = convertToCanvasCoordinates(adjustedFirstXFill, firstPointFill.y)
  ctx.moveTo(firstCanvasCoordsFill.x, firstCanvasCoordsFill.y)
  
  // 绘制后续点
  fullData.value.cswlValList.forEach((point, index) => {
    try {
      const adjustedX = point.x + (originZeroX || 0)
      const canvasCoords = convertToCanvasCoordinates(adjustedX, point.y)
      if (canvasCoords.x >= 0 && canvasCoords.x <= canvas.width && 
          canvasCoords.y >= 0 && canvasCoords.y <= canvas.height) {
        ctx.lineTo(canvasCoords.x, canvasCoords.y)
      }
    } catch (error) {
      console.error(`填充处理点${index + 1}时出错:`, error)
    }
  })
  
  // 闭合路径并填充
  const lastPoint = fullData.value.cswlValList[fullData.value.cswlValList.length - 1]
  const adjustedLastX = lastPoint.x + (originZeroX || 0)
  const lastCanvasCoords = convertToCanvasCoordinates(adjustedLastX, lastPoint.y)
  ctx.lineTo(lastCanvasCoords.x, canvas.height)
  ctx.lineTo(firstCanvasCoordsFill.x, canvas.height)
  ctx.closePath()
  
  // 创建渐变填充
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, 'rgba(255, 107, 107, 0.3)')
  gradient.addColorStop(1, 'rgba(255, 107, 107, 0.1)')
  ctx.fillStyle = gradient
  ctx.fill()
  
  // 在关键点添加标记
  fullData.value.cswlValList.forEach((point, index) => {
    if (index % 10 === 0) { // 每10个点添加一个标记
      try {
        const adjustedX = point.x + (originZeroX || 0)
        const canvasCoords = convertToCanvasCoordinates(adjustedX, point.y)
        
        // 检查坐标是否在画布范围内
        if (canvasCoords.x >= 0 && canvasCoords.x <= canvas.width && 
            canvasCoords.y >= 0 && canvasCoords.y <= canvas.height) {
          
          // 绘制蓝色圆点标记
          ctx.beginPath()
          ctx.arc(canvasCoords.x, canvasCoords.y, 4, 0, 2 * Math.PI)
          ctx.fillStyle = '#4ecdc4'
          ctx.fill()
          ctx.strokeStyle = '#2c3e50'
          ctx.lineWidth = 1
          ctx.stroke()
          
          // 添加坐标文字（显示原始坐标）
          ctx.fillStyle = '#2c3e50'
          ctx.font = '10px Arial'
          ctx.fillText(`(${point.x}, ${point.y.toFixed(1)})`, canvasCoords.x + 8, canvasCoords.y - 8)
        }
      } catch (error) {
        console.error(`添加标记点${index + 1}时出错:`, error)
      }
    }
  })
  
  console.log('cswlValList线条绘制完成')
}

// 绘制圆弧
const drawArc = async () => {
  await nextTick()
  if (!canvasRef.value) return
  
  const {
    getCoordinateSystem,
    convertToCanvasCoordinates
  } = canvasRef.value
  
  const coordinateSystem = getCoordinateSystem()
  
  // 圆弧数据
  const arcData = {
    jgName: "工况26（m）",
    circleCenterX: 16.7012,
    circleCenterY: 45.1894,
    circlePaX: -4.1,
    circlePaY: 29.1725,
    circlePbX: 29.0809,
    circlePbY: 22.0409,
    circleRadius: 26.2509,
    gk: 26.0,
    aqxs: 3.5838
  }
  
  console.log('开始绘制圆弧...')
  console.log('圆弧数据:', arcData)
  console.log('坐标系信息:', coordinateSystem)
  
  const canvas = document.getElementById('saturation-line-canvas') as HTMLCanvasElement
  if (!canvas) {
    console.error('未找到自定义canvas元素')
    return
  }
  
  // 设置canvas尺寸与Konva画布一致
  canvas.width = coordinateSystem.stageSize.width
  canvas.height = coordinateSystem.stageSize.height
  
  const ctx = canvas.getContext('2d')!
  
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // 转换圆心坐标（考虑originZeroX偏移）
  const centerCanvasCoords = convertToCanvasCoordinates(
    arcData.circleCenterX + coordinateSystem.originZeroX, 
    arcData.circleCenterY
  )
  
  // 转换起点和终点坐标
  const startCanvasCoords = convertToCanvasCoordinates(
    arcData.circlePaX + coordinateSystem.originZeroX,
    arcData.circlePaY
  )
  const endCanvasCoords = convertToCanvasCoordinates(
    arcData.circlePbX + coordinateSystem.originZeroX,
    arcData.circlePbY
  )
  
  // 计算画布上的实际半径（通过起点和圆心的距离）
  const canvasRadius = Math.sqrt(
    Math.pow(startCanvasCoords.x - centerCanvasCoords.x, 2) + 
    Math.pow(startCanvasCoords.y - centerCanvasCoords.y, 2)
  )
  
  console.log('圆心画布坐标:', centerCanvasCoords)
  console.log('起点画布坐标:', startCanvasCoords)
  console.log('终点画布坐标:', endCanvasCoords)
  console.log('画布半径:', canvasRadius)
  console.log('理论半径:', arcData.circleRadius, 'xScale:', coordinateSystem.xScale, 'yScale:', coordinateSystem.yScale)
  
  // 计算起始角度和结束角度
  const startAngle = Math.atan2(
    startCanvasCoords.y - centerCanvasCoords.y,
    startCanvasCoords.x - centerCanvasCoords.x
  )
  const endAngle = Math.atan2(
    endCanvasCoords.y - centerCanvasCoords.y,
    endCanvasCoords.x - centerCanvasCoords.x
  )
  
  // 计算角度差，确保显示最短的圆弧路径
  let angleDiff = endAngle - startAngle
  let drawStartAngle = startAngle
  let drawEndAngle = endAngle
  
  // 如果角度差大于π，则反向绘制以显示较短的圆弧
  if (Math.abs(angleDiff) > Math.PI) {
    if (angleDiff > 0) {
      drawStartAngle = endAngle
      drawEndAngle = startAngle
    }
  } else if (angleDiff < 0) {
    // 确保顺时针绘制
    drawStartAngle = endAngle
    drawEndAngle = startAngle
  }
  
  console.log('绘制起始角度:', drawStartAngle * 180 / Math.PI, '（度）')
  console.log('绘制结束角度:', drawEndAngle * 180 / Math.PI, '（度）')
  
  // 绘制起点到终点之间的圆弧（实线，突出显示）
  ctx.beginPath()
  ctx.arc(
    centerCanvasCoords.x,
    centerCanvasCoords.y,
    canvasRadius,
    drawStartAngle,
    drawEndAngle,
    false // 顺时针方向
  )
  ctx.strokeStyle = '#FF6B6B'
  ctx.lineWidth = 2
  ctx.stroke()
}

const state = reactive({
    damData: {
      // 坝体
      sectionTableList: [
          {
              xPoint: "-44",
              yPoint: "17",
              isTop: false,
          },
          {
              xPoint: "-26",
              yPoint: "24",
              isTop: false,
          },
          {
              xPoint: "-16",
              yPoint: "24",
              isTop: false,
          },
          {
              xPoint: "-8",
              yPoint: "29",
              isTop: true,
          },
          {
              xPoint: "8",
              yPoint: "29",
              isTop: true,
          },
          {
              xPoint: "22",
              yPoint: "25",
              isTop: false,
          },
          {
              xPoint: "40",
              yPoint: "22",
              isTop: false,
          },
          {
              xPoint: "47",
              yPoint: "22",
              isTop: false,
          },
          {
              xPoint: "62",
              yPoint: "17",
              isTop: false,
          },
          {
              xPoint: "70",
              yPoint: "17",
              isTop: false,
          },
      ],
      // 测压管
      pipelineTableList: [
          {
              xPoint: "-8",
              yPoint: "29",
              height: "15",
              pointCode: "UP1-1",
              pointName: "测试名字很长很长很长很长测试名字很长很长很长很长",
          },
          {
              xPoint: "8",
              yPoint: "29",
              height: "17",
              pointCode: "UP1-2",
              pointName: "-1-1-1--1-1----1",
          },
          {
              xPoint: "17",
              yPoint: "26.3",
              height: "15",
              pointCode: "UP1-3",
              pointName: "测试",
          },
      ],
      // y/x偏移
      isWall: "1",
      yStart: "10",
      wallXpoint: "-2",
    },
    waterLevel: {
      map: [
          {
              id: null,
              projectCode: null,
              transectName: "0+155",
              pointCode: "UP1-3",
              waterLevel: 14.8,
              date: "2025-05-20T05:00:00",
              createBy: null,
              createTime: null,
              updateBy: null,
              updateTime: null,
              isDelete: null,
              code: null,
          },
          {
              id: null,
              projectCode: null,
              transectName: "0+155",
              pointCode: "UP1-2",
              waterLevel: 16.0,
              date: "2025-05-20T05:00:00",
              createBy: null,
              createTime: null,
              updateBy: null,
              updateTime: null,
              isDelete: null,
              code: null,
          },
          {
              id: null,
              projectCode: null,
              transectName: "0+155",
              pointCode: "UP1-1",
              waterLevel: 18.3,
              date: "2025-05-20T00:00:00",
              createBy: null,
              createTime: null,
              updateBy: null,
              updateTime: null,
              isDelete: null,
              code: null,
          },
      ],
      kssw: 22,
      xxsw: 15,
      sjsw: 24,
      jhsw: 26,
    },
});

onMounted(()=>{
    return
    setTimeout(()=>{
        // 方案2修改数据
        /* state.damData = {}
        state.waterLevel = {}
        return  */
        // 方案1修改数据
        fullData.value = {
        "isDelete": 0,
        "damCode": "dam_1996484649555202048",
        "updateTime": "2025-12-04 17:19:29",
        "sectionId": 41,
        "projectCodeDesc": "象山水库",
        "sjsw": null,
        "ksw": 47.85,
        "createBy": 1,
        "pointList": [
            {
                "pointCode": "xsUP2",
                "isDelete": 0,
                "pointName": "UP2",
                "damCode": "dam_1996484649555202048",
                "updateTime": "2025-12-04 17:19:29",
                "sectionId": 41,
                "createBy": 1,
                "createTime": "2025-12-04 16:16:41",
                "updateBy": 1,
                "x": "2.5",
                "y": "52.8",
                "id": 78,
                "time": "2025-12-04 19:37:17",
                "value": 41.8,
                "height": "25",
                "xPoint": "2.5",
                "yPoint": "52.8"
            },
            {
                "pointCode": "xsup3",
                "isDelete": 0,
                "pointName": "UP3",
                "damCode": "dam_1996484649555202048",
                "updateTime": "2025-12-04 17:19:29",
                "sectionId": 41,
                "createBy": 1,
                "createTime": "2025-12-04 16:16:41",
                "updateBy": 1,
                "x": "8",
                "y": "49.5",
                "id": 79,
                "time": "2025-12-04 19:37:17",
                "value": 25.14,
                "height": "22",
                "xPoint": "8",
                "yPoint": "49.5"
            },
            {
                "pointCode": "xiangshanup1",
                "isDelete": 0,
                "pointName": "UP1",
                "damCode": "dam_1996484649555202048",
                "updateTime": "2025-12-04 17:19:29",
                "sectionId": 41,
                "createBy": 1,
                "createTime": "2025-12-04 16:16:41",
                "updateBy": 1,
                "x": "-2.5",
                "y": "52.8",
                "id": 77,
                "time": "2025-12-04 19:37:17",
                "value": 35.19,
                "height": "25",
                "xPoint": "-2.5",
                "yPoint": "52.8"
            }
        ],
        "jhsw": null,
        "createTime": "2025-12-04 16:50:00",
        "updateBy": 1,
        "projectCode": "reservoir_1996484060796555264",
        "x": "0",
        "y": "20",
        "id": 57,
        "sectionList": [
            {
                "createBy": 1,
                "createTime": "2025-12-04 16:50:00",
                "updateBy": 1,
                "isTop": false,
                "isDelete": 0,
                "damCode": "dam_1996484649555202048",
                "x": "-14.24",
                "y": "46",
                "updateTime": "2025-12-04 16:55:54",
                "id": 209,
                "sectionId": 41
            },
            {
                "createBy": 1,
                "createTime": "2025-12-04 16:50:00",
                "updateBy": 1,
                "isTop": false,
                "isDelete": 0,
                "damCode": "dam_1996484649555202048",
                "x": "-7.12",
                "y": "48",
                "updateTime": "2025-12-04 16:56:46",
                "id": 210,
                "sectionId": 41
            },
            {
                "createBy": 1,
                "createTime": "2025-12-04 16:50:00",
                "updateBy": 1,
                "isTop": true,
                "isDelete": 0,
                "damCode": "dam_1996484649555202048",
                "x": "-2.5",
                "y": "52.8",
                "updateTime": "2025-12-04 16:56:47",
                "id": 211,
                "sectionId": 41
            },
            {
                "createBy": 1,
                "createTime": "2025-12-04 16:50:00",
                "updateBy": 1,
                "isTop": true,
                "isDelete": 0,
                "damCode": "dam_1996484649555202048",
                "x": "2.5",
                "y": "52.8",
                "updateTime": "2025-12-04 16:57:18",
                "id": 212,
                "sectionId": 41
            },
            {
                "createBy": 1,
                "createTime": "2025-12-04 16:50:00",
                "updateBy": 1,
                "isTop": false,
                "isDelete": 0,
                "damCode": "dam_1996484649555202048",
                "x": "19",
                "y": "44",
                "updateTime": "2025-12-04 16:57:53",
                "id": 213,
                "sectionId": 41
            },
            {
                "createBy": 1,
                "createTime": "2025-12-04 17:16:46",
                "updateBy": 1,
                "isTop": false,
                "isDelete": 0,
                "damCode": "dam_1996484649555202048",
                "x": "22",
                "y": "44",
                "updateTime": "2025-12-04 16:57:51",
                "id": 214,
                "sectionId": 41
            },
            {
                "createBy": 1,
                "createTime": "2025-12-04 16:50:00",
                "updateBy": 1,
                "isTop": false,
                "isDelete": 0,
                "damCode": "dam_1996484649555202048",
                "x": "42.85",
                "y": "36",
                "updateTime": "2025-12-04 16:55:54",
                "id": 215,
                "sectionId": 41
            },
            {
                "createBy": 1,
                "createTime": "2025-12-04 16:50:00",
                "updateBy": 1,
                "isTop": false,
                "isDelete": 0,
                "damCode": "dam_1996484649555202048",
                "x": "51.45",
                "y": "36",
                "updateTime": "2025-12-04 16:55:54",
                "id": 216,
                "sectionId": 41
            },
            {
                "createBy": 1,
                "createTime": "2025-12-04 16:50:00",
                "updateBy": 1,
                "isTop": false,
                "isDelete": 0,
                "damCode": "dam_1996484649555202048",
                "x": "71.2",
                "y": "30",
                "updateTime": "2025-12-04 16:55:54",
                "id": 217,
                "sectionId": 41
            },
            {
                "createBy": 1,
                "createTime": "2025-12-04 16:50:00",
                "updateBy": 1,
                "isTop": false,
                "isDelete": 0,
                "damCode": "dam_1996484649555202048",
                "x": "78.67",
                "y": "30",
                "updateTime": "2025-12-04 16:55:54",
                "id": 218,
                "sectionId": 41
            }
        ],
        "xxsw": null,
        "isWall": false
    }
    }, 2000)
})

</script>
<style lang="scss" scoped>
.saturation-line-view {
  width: calc(100% - 40px);
  height: calc(100% - 20px);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  
  .saturationline-canvas {
    flex: 1;
    height: 60%;
    border: 1px solid #ddd;
    border-radius: 4px;
    position: relative;
    
    canvas {
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: auto;
      z-index: 10;
    }
  }
  
  .custom-canvas-controls {
    background: #f5f5f5;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #ddd;
    
    h3 {
      margin: 0 0 15px 0;
      color: #333;
    }
    
    button {
      margin-right: 10px;
      padding: 8px 16px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.3s;
      
      &:hover {
        background: #0056b3;
      }
      
      &:active {
        transform: translateY(1px);
      }
    }
  }
}
</style>