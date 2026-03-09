// 视频画布绘图工具类
import { ref, onUnmounted } from 'vue';

export class VideoCanvasDrawer {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.points = []; // 存储所有点的坐标 [{x:1, y:1}, {x:2, y:2}, ...]
    this.isDrawing = false;
    this.isComplete = false;
    this.callbacks = {};
    this.container = null;
  }

  // 初始化画布
  initCanvas(canvasElement, containerElement) {
    if (!canvasElement || !containerElement) return;

    this.canvas = canvasElement;
    this.container = containerElement;
    this.canvas.width = containerElement.clientWidth;
    this.canvas.height = containerElement.clientHeight;
    this.ctx = this.canvas.getContext('2d');

    if (this.ctx) {
      this.ctx.strokeStyle = '#00ffea';
      this.ctx.fillStyle = 'rgba(0, 255, 234, 0.3)';
      this.ctx.lineWidth = 2;
    }

    // 绑定事件
    this.bindEvents();
  }

  // 绑定事件监听器
  bindEvents() {
    if (!this.canvas) return;

    // 点击事件（点选视频区域）
    this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));

    // 双击事件（围成环形）
    this.canvas.addEventListener('dblclick', this.handleCanvasDoubleClick.bind(this));

    // ESC键取消绘制
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  // 解除事件绑定
  unbindEvents() {
    if (!this.canvas) return;

    this.canvas.removeEventListener('click', this.handleCanvasClick.bind(this));
    this.canvas.removeEventListener('dblclick', this.handleCanvasDoubleClick.bind(this));
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }

  // 检测两条线段是否相交
  doLinesIntersect(p1, p2, p3, p4) {
    // 首先检查是否是完全相同的线段
    if ((p1.x === p3.x && p1.y === p3.y && p2.x === p4.x && p2.y === p4.y) ||
        (p1.x === p4.x && p1.y === p4.y && p2.x === p3.x && p2.y === p3.y)) {
      return false; // 相同线段不算相交
    }

    // 快速排斥实验 - 优化边界检查
    const rect1 = {
      minX: Math.min(p1.x, p2.x),
      maxX: Math.max(p1.x, p2.x),
      minY: Math.min(p1.y, p2.y),
      maxY: Math.max(p1.y, p2.y)
    };

    const rect2 = {
      minX: Math.min(p3.x, p4.x),
      maxX: Math.max(p3.x, p4.x),
      minY: Math.min(p3.y, p4.y),
      maxY: Math.max(p3.y, p4.y)
    };

    if (rect1.maxX < rect2.minX || rect2.maxX < rect1.minX ||
        rect1.maxY < rect2.minY || rect2.maxY < rect1.minY) {
      return false;
    }

    // 跨立实验 - 使用更精确的叉积计算
    const cross1 = (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
    const cross2 = (p2.x - p1.x) * (p4.y - p1.y) - (p2.y - p1.y) * (p4.x - p1.x);
    const cross3 = (p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x);
    const cross4 = (p4.x - p3.x) * (p2.y - p3.y) - (p4.y - p3.y) * (p2.x - p3.x);

    // 处理浮点数精度问题
    const tolerance = 1e-10;

    // 如果两条线段共线，检查是否有重叠
    if (Math.abs(cross1) < tolerance && Math.abs(cross2) < tolerance &&
        Math.abs(cross3) < tolerance && Math.abs(cross4) < tolerance) {
      // 共线情况，检查X轴和Y轴投影是否有重叠
      const overlapX = !(rect1.maxX < rect2.minX || rect2.maxX < rect1.minX);
      const overlapY = !(rect1.maxY < rect2.minY || rect2.maxY < rect1.minY);
      return overlapX && overlapY;
    }

    // 标准跨立实验，考虑端点相交的情况
    return (cross1 * cross2 <= tolerance && cross3 * cross4 <= tolerance);
  }

  // 检查新添加的线段是否与已有线段相交
  hasIntersection(newPoint) {
    if (this.points.length < 2) return false;

    const lastPoint = this.points[this.points.length - 1];

    // 检查相邻点重叠的情况（避免点击同一个点或非常接近的点）
    if (this.points.some(point =>
        Math.abs(point.x - newPoint.x) < 1 && Math.abs(point.y - newPoint.y) < 1)) {
      return true; // 点重叠也算相交
    }

    // 检查新线段与所有已有线段（除了相邻线段）是否相交
    for (let i = 0; i < this.points.length - 1; i++) {
      // 跳过相邻线段（从lastPoint到newPoint的前一条线段）
      if (i === this.points.length - 2) continue;

      const segmentStart = this.points[i];
      const segmentEnd = this.points[i + 1];

      // 检查线段是否相邻或共享端点
      const isAdjacent = (segmentStart === lastPoint) || (segmentEnd === lastPoint) ||
                        (segmentStart === newPoint) || (segmentEnd === newPoint);

      if (!isAdjacent && this.doLinesIntersect(segmentStart, segmentEnd, lastPoint, newPoint)) {
        return true;
      }
    }

    return false;
  }

  // 绘制画布
  drawCanvas() {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.points.length === 0) return;

    this.ctx.beginPath();
    this.ctx.moveTo(this.points[0].x, this.points[0].y);

    // 绘制路径
    for (let i = 1; i < this.points.length; i++) {
      this.ctx.lineTo(this.points[i].x, this.points[i].y);
    }

    // 如果已完成，闭合路径并填充
    if (this.isComplete) {
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
    } else {
      this.ctx.stroke();
    }

    // 绘制所有点
    this.points.forEach(point => {
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
      this.ctx.fillStyle = '#ff0000';
      this.ctx.fill();
      this.ctx.fillStyle = 'rgba(0, 255, 234, 0.3)';
    });
  }

  // 检查是否点击了第一个点（用于闭环检测）
  isClickingFirstPoint(newPoint) {
    if (this.points.length < 3) return false;

    const firstPoint = this.points[0];
    // 检查点击位置是否在第一个点的范围内（容差5像素）
    const distance = Math.sqrt(Math.pow(newPoint.x - firstPoint.x, 2) + Math.pow(newPoint.y - firstPoint.y, 2));
    return distance <= 10; // 10像素范围内的点击都算作点击第一个点
  }

  // 处理鼠标点击（点选视频区域）
  handleCanvasClick(event) {
    if (this.isComplete || !this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newPoint = { x, y };

    // 检查是否点击了第一个点（完成闭环）
    if (this.points.length >= 3 && this.isClickingFirstPoint(newPoint)) {
      this.completePolygon();
      return;
    }

    // 检查是否与已有线段相交（用户随意点击形成交叉线）
    if (this.points.length >= 2 && this.hasIntersection(newPoint)) {
      this.showAlert('绘制的线段不能相交，请重新选择点！');
      return;
    }

    this.points.push(newPoint);
    this.isDrawing = true;
    this.drawCanvas();

    // 触发点击回调
    if (this.callbacks.onPointAdd) {
      this.callbacks.onPointAdd(newPoint, this.points);
    }
  }

  // 处理鼠标双击（围成环形）
  handleCanvasDoubleClick(event) {
    event.preventDefault();
    event.stopPropagation();

    if (this.points.length < 3 || this.isComplete) return;

    // 检查闭合线段是否与已有线段相交
    const firstPoint = this.points[0];
    const lastPoint = this.points[this.points.length - 1];

    // 检查闭合线段是否与已有线段相交（除了相邻的线段）
    for (let i = 0; i < this.points.length - 1; i++) {
      // 跳过与闭合线段相邻的线段（第一条和最后一条线段）
      if (i === 0 || i === this.points.length - 2) continue;

      const segmentStart = this.points[i];
      const segmentEnd = this.points[i + 1];

      // 检查闭合线段（从lastPoint到firstPoint）是否与当前线段相交
      if (this.doLinesIntersect(segmentStart, segmentEnd, lastPoint, firstPoint)) {
        this.showAlert('闭合的线段不能与已有线段相交！');
        return;
      }
    }

    this.isComplete = true;
    this.drawCanvas();

    // 返回所有点的坐标
    const coordinates = this.getCoordinates();

    // 计算区域坐标
    const areaCoordinates = this.getAreaCoordinates();

    console.log('所有点的坐标：', coordinates);
    console.log('区域坐标：', areaCoordinates);

    // 触发完成回调
    if (this.callbacks.onComplete) {
      this.callbacks.onComplete(coordinates, areaCoordinates);
    }
  }

  // 完成多边形闭环（通过点击第一个点）
  completePolygon() {
    if (this.points.length < 3 || this.isComplete) return;

    const firstPoint = this.points[0];
    const lastPoint = this.points[this.points.length - 1];

    // 检查闭合线段是否与已有线段相交（除了相邻的线段）
    for (let i = 0; i < this.points.length - 1; i++) {
      // 跳过与闭合线段相邻的线段（第一条和最后一条线段）
      if (i === 0 || i === this.points.length - 2) continue;

      const segmentStart = this.points[i];
      const segmentEnd = this.points[i + 1];

      // 检查闭合线段（从lastPoint到firstPoint）是否与当前线段相交
      if (this.doLinesIntersect(segmentStart, segmentEnd, lastPoint, firstPoint)) {
        this.showAlert('闭合的线段不能与已有线段相交！');
        return;
      }
    }

    this.isComplete = true;
    this.drawCanvas();

    // 返回所有点的坐标
    const coordinates = this.getCoordinates();

    // 计算区域坐标
    const areaCoordinates = this.getAreaCoordinates();

    console.log('通过点击第一个点完成闭环，所有点的坐标：', coordinates);
    console.log('区域坐标：', areaCoordinates);

    // 触发完成回调
    if (this.callbacks.onComplete) {
      this.callbacks.onComplete(coordinates, areaCoordinates);
    }
  }

  // 获取所有点的坐标数组
  getCoordinates() {
    return [...this.points]; // 返回深拷贝
  }

  // 计算区域坐标（边界框）
  getAreaCoordinates() {
    if (this.points.length === 0) return null;

    const minX = Math.min(...this.points.map(p => p.x));
    const minY = Math.min(...this.points.map(p => p.y));
    const maxX = Math.max(...this.points.map(p => p.x));
    const maxY = Math.max(...this.points.map(p => p.y));

    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2
    };
  }

  // 清除画布（ESC取消所有绘制）
  clearCanvas() {
    this.points = [];
    this.isDrawing = false;
    this.isComplete = false;
    this.drawCanvas();

    // 触发清除回调
    if (this.callbacks.onClear) {
      this.callbacks.onClear();
    }
  }

  // 处理ESC键
  handleKeyDown(event) {
    if (event.key === 'Escape') {
      this.clearCanvas();
    }
  }

  // 显示提示信息
  showAlert(message) {
    if (this.callbacks.onAlert) {
      this.callbacks.onAlert(message);
    } else {
      alert(message);
    }
  }

  // 使用坐标回显绘制区域
  drawFromCoordinates(coordinates) {
    if (!Array.isArray(coordinates) || coordinates.length < 3) {
      console.warn('坐标数据无效，至少需要3个点');
      return;
    }

    this.points = coordinates.map(coord => ({
      x: coord.x || 0,
      y: coord.y || 0
    }));

    this.isComplete = true;
    this.drawCanvas();
  }

  // 设置回调函数
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // 销毁画布
  destroy() {
    this.unbindEvents();
    this.points = [];
    this.canvas = null;
    this.ctx = null;
    this.container = null;
    this.callbacks = {};
  }

  // 计算视频绘制区域尺寸
  calculateDrawSize(containerWidth, containerHeight, videoWidth, videoHeight) {
    let w = containerWidth;
    let h = containerHeight;

    if (videoWidth > videoHeight) {
      h = w * (videoHeight / videoWidth);
    } else {
      w = h * (videoWidth / videoHeight);
    }

    return {
      width: w + 'px',
      height: h + 'px'
    };
  }
}

// Vue 3 Composition API Hook
export function useVideoDraw() {
  const drawer = ref(null);
  const points = ref([]);
  const areaCoordinates = ref(null);
  const isDrawing = ref(false);
  const isComplete = ref(false);

  // 初始化画布
  const initCanvas = (canvasElement, containerElement) => {
    if (!canvasElement || !containerElement) return;

    drawer.value = new VideoCanvasDrawer();

    // 设置回调
    drawer.value.setCallbacks({
      onPointAdd: (newPoint, allPoints) => {
        points.value = allPoints;
        isDrawing.value = true;
      },
      onComplete: (coords, area) => {
        points.value = coords;
        areaCoordinates.value = area;
        isComplete.value = true;
        isDrawing.value = false;
        console.log('绘图完成，坐标：', coords, '区域：', area);
      },
      onClear: () => {
        points.value = [];
        areaCoordinates.value = null;
        isDrawing.value = false;
        isComplete.value = false;
      },
      onAlert: (message) => {
        ElMessage.warning(message);
      }
    });

    drawer.value.initCanvas(canvasElement, containerElement);
  };

  // 清除画布
  const clearCanvas = () => {
    if (drawer.value) {
      drawer.value.clearCanvas();
    }
  };

  // 使用坐标回显绘制
  const drawFromCoordinates = (coordinates) => {
    if (drawer.value) {
      drawer.value.drawFromCoordinates(coordinates);
      points.value = coordinates;
      areaCoordinates.value = drawer.value.getAreaCoordinates();
      isComplete.value = true;
    }
  };

  // 获取当前状态
  const getState = () => ({
    points: points.value,
    areaCoordinates: areaCoordinates.value,
    isDrawing: isDrawing.value,
    isComplete: isComplete.value
  });

  // 销毁
  const destroy = () => {
    if (drawer.value) {
      drawer.value.destroy();
      drawer.value = null;
    }
  };

  onUnmounted(() => {
    destroy();
  });

  return {
    initCanvas,
    clearCanvas,
    drawFromCoordinates,
    getState,
    destroy,
    points,
    areaCoordinates,
    isDrawing,
    isComplete
  };
}
