/**
 * generate text outline path for text
 * @param {string} text - text to generate outline for
 * @param {object} options - outline generation options
 * @returns {object} - outline path data
 */
export const generateCloudPath = (text, options) => {
  if (!text || text.trim() === '') {
    return { paths: [] };
  }
  
  const { intensity = 30, layers = [] } = options;
  
  // create temporary canvas to measure and get text path
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // get actual font size from options or use default
  const fontSize = options.fontSize || 48; // use actual font size from options
  
  // 增加画布大小，不设置上限
  const canvasWidthMultiplier = fontSize > 200 ? 3.0 : (fontSize > 100 ? 2.0 : 1.5);
  const canvasHeightMultiplier = fontSize > 200 ? 4.0 : (fontSize > 100 ? 3.0 : 2.5);
  
  canvas.width = text.length * fontSize * canvasWidthMultiplier;
  canvas.height = fontSize * canvasHeightMultiplier;
  
  // set font for text rendering
  ctx.font = `${options.fontWeight || 400} ${fontSize}px ${options.fontFamily || 'Arial'}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // measure text
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const textHeight = fontSize;
  
  // calculate padding based on intensity and font size
  // scale padding proportionally to font size
  const fontSizeRatio = fontSize / 48; // ratio compared to base font size
  const padding = Math.max(5, Math.floor(intensity / 10)) * fontSizeRatio;
  
  // draw text to get its path
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  
  // create paths for each layer
  const paths = [];
  
  // calculate dimensions for the final rendering - 增加额外空间
  const width = textWidth + padding * 4; // 增加水平空间
  const height = textHeight + padding * 4; // 增加垂直空间
  
  // generate outer layer (text outline with offset)
  if (layers[0]) {
    // scale stroke width proportionally to font size
    const baseOuterStrokeWidth = layers[0].width;
    // 对于大字号，限制描边宽度的增长速度，避免过粗
    const scaleFactor = fontSize > 200 ? fontSizeRatio * 0.7 : fontSizeRatio;
    const outerStrokeWidth = Math.max(1, baseOuterStrokeWidth * scaleFactor);
    
    // 使用平滑的轮廓
    paths.push({
      type: 'text-outline',
      text: text,
      fontSize: fontSize,
      fontFamily: options.fontFamily || 'Arial',
      fontWeight: options.fontWeight || 400,
      color: layers[0].color,
      width: outerStrokeWidth,
      offset: outerStrokeWidth + (intensity / 10) * fontSizeRatio,
      intensity: intensity,
      smooth: true // 添加平滑标记
    });
  }
  
  // generate middle layer (smaller text outline)
  if (layers[1]) {
    // scale stroke width proportionally to font size
    const baseMiddleStrokeWidth = layers[1].width;
    // 对于大字号，限制描边宽度的增长速度，避免过粗
    const scaleFactor = fontSize > 200 ? fontSizeRatio * 0.7 : fontSizeRatio;
    const middleStrokeWidth = Math.max(1, baseMiddleStrokeWidth * scaleFactor);
    
    paths.push({
      type: 'text-outline',
      text: text,
      fontSize: fontSize,
      fontFamily: options.fontFamily || 'Arial',
      fontWeight: options.fontWeight || 400,
      color: layers[1].color,
      width: middleStrokeWidth,
      offset: middleStrokeWidth / 2 * fontSizeRatio,
      intensity: intensity / 2,
      smooth: true // 添加平滑标记
    });
  }
  
  return {
    paths,
    textPosition: {
      x: width / 2,
      y: height / 2
    },
    width,
    height
  };
};

/**
 * draw path on canvas
 * @param {CanvasRenderingContext2D} ctx - canvas context
 * @param {object} cloudPath - cloud path data
 */
export const drawPath = (ctx, cloudPath) => {
  if (!cloudPath || !cloudPath.paths || cloudPath.paths.length === 0) {
    return;
  }
  
  const { paths, width, height } = cloudPath;
  
  // center the text in the canvas
  const canvasWidth = ctx.canvas.width / (window.devicePixelRatio || 1);
  const canvasHeight = ctx.canvas.height / (window.devicePixelRatio || 1);
  
  // 确保文本在画布中居中显示
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  
  // draw each layer from outside to inside
  paths.forEach((path) => {
    if (path.type === 'text-outline') {
      drawTextOutline(
        ctx, 
        path.text, 
        centerX, 
        centerY, 
        path.fontSize, 
        path.fontFamily,
        path.fontWeight,
        path.color, 
        path.width,
        path.offset,
        path.intensity
      );
    }
  });
};

/**
 * draw text outline with smooth edges
 * @param {CanvasRenderingContext2D} ctx - canvas context
 * @param {string} text - text to draw
 * @param {number} x - x position
 * @param {number} y - y position
 * @param {number} fontSize - font size
 * @param {string} fontFamily - font family
 * @param {number} fontWeight - font weight
 * @param {string} color - outline color
 * @param {number} strokeWidth - outline width
 * @param {number} offset - offset from text
 * @param {number} intensity - jitter intensity
 */
const drawTextOutline = (ctx, text, x, y, fontSize, fontFamily, fontWeight, color, strokeWidth, offset, intensity) => {
  // save current context state
  ctx.save();
  
  // set text style
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // 使用更高质量的渲染设置
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // 设置更圆润的线条连接和端点
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  
  // 增加分段数量以获得更平滑的轮廓
  const segmentMultiplier = fontSize > 200 ? 2.0 : (fontSize > 100 ? 1.5 : 1.0);
  const segments = Math.max(32, Math.floor(intensity / 2) * segmentMultiplier);
  
  // 使用滑动平均来平滑轮廓点
  const points = [];
  
  // 生成初始点集
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    // 使用正弦函数代替随机值，创建更平滑的变化
    const variation = Math.sin(angle * 3) * (intensity / 100);
    
    const offsetWithVariation = offset * (1 + variation);
    const currentX = x + Math.cos(angle) * offsetWithVariation;
    const currentY = y + Math.sin(angle) * offsetWithVariation;
    
    points.push({ x: currentX, y: currentY });
  }
  
  // 确保闭合
  points.push({ ...points[0] });
  
  // 应用滑动平均平滑处理
  const smoothedPoints = [];
  const windowSize = 3; // 滑动窗口大小
  
  for (let i = 0; i < points.length; i++) {
    let sumX = 0;
    let sumY = 0;
    let count = 0;
    
    // 计算滑动窗口内的平均值
    for (let j = Math.max(0, i - windowSize); j <= Math.min(points.length - 1, i + windowSize); j++) {
      sumX += points[j].x;
      sumY += points[j].y;
      count++;
    }
    
    smoothedPoints.push({
      x: sumX / count,
      y: sumY / count
    });
  }
  
  // 绘制平滑的轮廓
  for (let i = 0; i < smoothedPoints.length; i++) {
    const point = smoothedPoints[i];
    ctx.save();
    
    // 使用抗锯齿设置
    ctx.shadowColor = color;
    ctx.shadowBlur = strokeWidth * 0.5;
    
    // 绘制文本
    ctx.fillText(text, point.x, point.y);
    ctx.strokeText(text, point.x, point.y);
    
    ctx.restore();
  }
  
  // 添加额外的平滑处理
  ctx.save();
  
  // 使用更细的线条进行边缘平滑
  ctx.lineWidth = strokeWidth * 0.3;
  ctx.globalAlpha = 0.7;
  
  // 在原始轮廓的基础上添加额外的平滑层
  for (let i = 0; i < smoothedPoints.length; i += 2) {
    const point = smoothedPoints[i];
    ctx.strokeText(text, point.x, point.y);
  }
  
  ctx.restore();
  
  // restore context
  ctx.restore();
};

/**
 * draw text on canvas
 * @param {CanvasRenderingContext2D} ctx - canvas context
 * @param {string} text - text to draw
 * @param {object} options - text drawing options
 */
export const drawText = (ctx, text, options) => {
  if (!text || text.trim() === '') {
    return;
  }
  
  const { font, color, underline, fontWeight } = options;
  
  // 确保使用正确的字体粗细
  let fontToUse = font;
  if (fontWeight && !font.includes(fontWeight.toString())) {
    // 如果font字符串中没有包含fontWeight，则重新构建font字符串
    const fontParts = font.split(' ');
    // 移除可能存在的旧的fontWeight
    const filteredParts = fontParts.filter(part => {
      const numValue = parseInt(part);
      return isNaN(numValue) || numValue < 100 || numValue > 900;
    });
    // 在字体大小前添加fontWeight
    const sizeIndex = filteredParts.findIndex(part => part.includes('px'));
    if (sizeIndex !== -1) {
      filteredParts.splice(sizeIndex, 0, fontWeight.toString());
      fontToUse = filteredParts.join(' ');
    } else {
      // 如果找不到字体大小，直接在前面添加fontWeight
      fontToUse = `${fontWeight} ${font}`;
    }
  }
  
  // set text styles with corrected font
  ctx.font = fontToUse;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // 使用高质量渲染设置
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // draw text in center of canvas
  const canvasWidth = ctx.canvas.width / (window.devicePixelRatio || 1);
  const canvasHeight = ctx.canvas.height / (window.devicePixelRatio || 1);
  const textX = canvasWidth / 2;
  const textY = canvasHeight / 2;
  
  // 使用阴影增强文本清晰度
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 0.5;
  ctx.fillText(text, textX, textY);
  ctx.restore();
  
  // draw underline if enabled
  if (underline) {
    // measure text width
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    
    // calculate underline position
    const lineY = textY + metrics.actualBoundingBoxDescent + 2; // 2px below text
    const lineStartX = textX - textWidth / 2;
    const lineEndX = textX + textWidth / 2;
    
    // draw underline
    ctx.beginPath();
    ctx.moveTo(lineStartX, lineY);
    ctx.lineTo(lineEndX, lineY);
    
    // 提取字体大小并相应调整下划线粗细
    const fontSizeMatch = fontToUse.match(/(\d+)px/);
    const fontSize = fontSizeMatch ? parseInt(fontSizeMatch[1]) : 48;
    
    // 对于大字号，限制下划线宽度的增长速度
    let lineWidth;
    if (fontSize <= 100) {
      lineWidth = Math.max(1, fontSize / 24);
    } else if (fontSize <= 200) {
      lineWidth = Math.max(1, 100/24 + (fontSize - 100) / 40);
    } else {
      lineWidth = Math.max(1, 100/24 + 100/40 + (fontSize - 200) / 60);
    }
    
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.lineCap = 'round'; // 使下划线端点圆润
    ctx.stroke();
  }
};

/**
 * adjust color brightness
 * @param {string} color - hex color
 * @param {number} amount - amount to adjust (-255 to 255)
 * @returns {string} - adjusted hex color
 */
const adjustColor = (color, amount) => {
  // validate input
  if (!color || typeof color !== 'string' || !color.startsWith('#')) {
    return color;
  }
  
  // remove hash and handle shorthand hex
  let hex = color.slice(1);
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  
  // convert to rgb
  const num = parseInt(hex, 16);
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0x00FF) + amount;
  let b = (num & 0x0000FF) + amount;
  
  // clamp values
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  
  // convert back to hex
  return `#${(b | (g << 8) | (r << 16)).toString(16).padStart(6, '0')}`;
}; 