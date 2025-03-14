/**
 * generate SVG from config
 * @param {object} config - cloud text configuration
 * @param {boolean} transparentBg - whether to use transparent background
 * @returns {string} - SVG markup
 */
export const generateSVG = (config, transparentBg = false) => {
  // create temporary canvas to generate paths
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  
  // set font for measurement
  ctx.font = `${config.fontWeight} ${config.fontSize}px ${config.fontFamily}`;
  
  // measure text
  const metrics = ctx.measureText(config.text);
  const textWidth = metrics.width;
  const textHeight = config.fontSize;
  
  // calculate cloud dimensions
  const cloudPadding = Math.max(20, Math.floor(config.cloudStrength / 3));
  const width = textWidth + cloudPadding * 4;
  const height = textHeight + cloudPadding * 4;
  
  // generate SVG with optional background
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
  
  // 如果不是透明背景，添加白色背景矩形
  if (!transparentBg) {
    svg += `<rect width="${width}" height="${height}" fill="#FFFFFF" />`;
  }
  
  // 增加分段数量以获得更平滑的轮廓
  const segmentMultiplier = config.fontSize > 200 ? 2.0 : (config.fontSize > 100 ? 1.5 : 1.0);
  const numPoints = Math.max(48, Math.floor(config.cloudStrength / 2) * segmentMultiplier);
  const points = [];
  
  // 使用正弦函数创建平滑变化的点
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    // 使用正弦函数代替随机值，创建更平滑的变化
    const variation = Math.sin(angle * 3) * (config.cloudStrength / 60);
    
    const x = width / 2 + Math.cos(angle) * (width / 3 + variation);
    const y = height / 2 + Math.sin(angle) * (height / 3 + variation);
    
    points.push({ x, y });
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
  
  // 使用三次贝塞尔曲线生成平滑的路径
  let pathData = '';
  
  for (let i = 0; i < smoothedPoints.length - 1; i++) {
    const current = smoothedPoints[i];
    const next = smoothedPoints[i + 1];
    const nextNext = smoothedPoints[(i + 2) % smoothedPoints.length];
    
    if (i === 0) {
      pathData += `M ${current.x.toFixed(2)} ${current.y.toFixed(2)} `;
    }
    
    // 计算控制点，使曲线更平滑
    const cp1x = current.x + (next.x - current.x) / 3;
    const cp1y = current.y + (next.y - current.y) / 3;
    
    const cp2x = next.x - (nextNext.x - current.x) / 6;
    const cp2y = next.y - (nextNext.y - current.y) / 6;
    
    pathData += `C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${next.x.toFixed(2)} ${next.y.toFixed(2)} `;
  }
  
  // 闭合路径
  pathData += 'Z';
  
  // add outer layer with smooth stroke
  svg += `<path d="${pathData}" fill="${config.outerColor}" stroke="${adjustColor(config.outerColor, -20)}" stroke-width="${config.outerWidth}" stroke-linejoin="round" />`;
  
  // add middle layer (smaller version of outer)
  const middlePoints = smoothedPoints.map(point => {
    const dx = point.x - width / 2;
    const dy = point.y - height / 2;
    const factor = 0.85; // scale factor
    
    return {
      x: width / 2 + dx * factor,
      y: height / 2 + dy * factor
    };
  });
  
  // 使用相同的平滑曲线方法生成中间层
  let middlePathData = '';
  
  for (let i = 0; i < middlePoints.length - 1; i++) {
    const current = middlePoints[i];
    const next = middlePoints[i + 1];
    const nextNext = middlePoints[(i + 2) % middlePoints.length];
    
    if (i === 0) {
      middlePathData += `M ${current.x.toFixed(2)} ${current.y.toFixed(2)} `;
    }
    
    // 计算控制点，使曲线更平滑
    const cp1x = current.x + (next.x - current.x) / 3;
    const cp1y = current.y + (next.y - current.y) / 3;
    
    const cp2x = next.x - (nextNext.x - current.x) / 6;
    const cp2y = next.y - (nextNext.y - current.y) / 6;
    
    middlePathData += `C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${next.x.toFixed(2)} ${next.y.toFixed(2)} `;
  }
  
  // 闭合路径
  middlePathData += 'Z';
  
  // add middle layer with smooth stroke
  svg += `<path d="${middlePathData}" fill="${config.middleColor}" stroke="${adjustColor(config.middleColor, -10)}" stroke-width="${config.middleWidth}" stroke-linejoin="round" />`;
  
  // add text with correct font weight
  const textElement = `<text x="${width / 2}" y="${height / 2}" font-family="${config.fontFamily}" font-size="${config.fontSize}" font-weight="${config.fontWeight}" fill="${config.innerColor}" text-anchor="middle" dominant-baseline="middle">${escapeXml(config.text)}</text>`;
  
  // add underline if enabled
  let underlineElement = '';
  if (config.underline) {
    const lineY = height / 2 + config.fontSize / 2 + 2; // 2px below text
    const lineWidth = textWidth;
    const lineStartX = width / 2 - lineWidth / 2;
    const lineEndX = width / 2 + lineWidth / 2;
    
    // calculate line width based on font size
    let strokeWidth;
    if (config.fontSize <= 100) {
      strokeWidth = Math.max(1, config.fontSize / 24);
    } else if (config.fontSize <= 200) {
      strokeWidth = Math.max(1, 100/24 + (config.fontSize - 100) / 40);
    } else {
      strokeWidth = Math.max(1, 100/24 + 100/40 + (config.fontSize - 200) / 60);
    }
    
    underlineElement = `<line x1="${lineStartX}" y1="${lineY}" x2="${lineEndX}" y2="${lineY}" stroke="${config.innerColor}" stroke-width="${strokeWidth}" stroke-linecap="round" />`;
  }
  
  svg += textElement + underlineElement;
  
  // close svg
  svg += '</svg>';
  
  return svg;
};

/**
 * generate CSS from config
 * @param {object} config - cloud text configuration
 * @param {boolean} transparentBg - whether to use transparent background
 * @returns {string} - CSS code
 */
export const generateCSS = (config, transparentBg = false) => {
  // calculate dimensions
  const fontSize = config.fontSize || 48;
  const padding = Math.max(20, Math.floor(config.cloudStrength / 3));
  
  // generate box shadow for cloud effect
  const generateShadows = () => {
    const shadows = [];
    const count = Math.max(20, Math.floor(config.cloudStrength / 2));
    
    // 使用正弦函数创建平滑变化的阴影
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const variation = Math.sin(angle * 3) * 0.2;
      const distance = config.outerWidth * (0.8 + variation);
      
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const blur = config.outerWidth * (1.0 + variation);
      
      shadows.push(`${x.toFixed(1)}px ${y.toFixed(1)}px ${blur.toFixed(1)}px ${config.outerColor}`);
    }
    
    // add middle layer shadows
    const middleCount = Math.max(10, Math.floor(config.cloudStrength / 3));
    for (let i = 0; i < middleCount; i++) {
      const angle = (i / middleCount) * Math.PI * 2;
      const variation = Math.sin(angle * 3) * 0.1;
      const distance = config.middleWidth * (0.5 + variation);
      
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const blur = config.middleWidth * (0.8 + variation);
      
      shadows.push(`${x.toFixed(1)}px ${y.toFixed(1)}px ${blur.toFixed(1)}px ${config.middleColor}`);
    }
    
    return shadows.join(', ');
  };
  
  // 背景颜色设置
  const backgroundColor = transparentBg ? 'transparent' : '#FFFFFF';
  
  // generate CSS
  const css = `/* Cloud Text CSS */
.cloud-text {
  position: relative;
  display: inline-block;
  padding: ${padding}px;
  font-family: ${config.fontFamily};
  font-size: ${fontSize}px;
  font-weight: ${config.fontWeight};
  color: ${config.innerColor};
  text-align: center;
  line-height: 1.2;
  background-color: ${backgroundColor};
}

.cloud-text::before {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  text-shadow: ${generateShadows()};
}

/* 下划线样式 */
${config.underline ? `
.cloud-text::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: ${fontSize * 0.1}px;
  width: 90%;
  height: ${Math.max(1, fontSize / 24)}px;
  background-color: ${config.innerColor};
  transform: translateX(-50%);
  border-radius: ${Math.max(1, fontSize / 48)}px;
}
` : ''}

/* HTML Usage Example */
/*
<div class="cloud-text" data-text="${escapeHtml(config.text)}">
  ${escapeHtml(config.text)}
</div>
*/
`;
  
  return css;
};

/**
 * escape XML special characters
 * @param {string} text - text to escape
 * @returns {string} - escaped text
 */
const escapeXml = (text) => {
  if (!text) return '';
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

/**
 * escape HTML special characters
 * @param {string} text - text to escape
 * @returns {string} - escaped text
 */
const escapeHtml = (text) => {
  if (!text) return '';
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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