import React, { useState, useRef, useEffect } from 'react';
import TextInput from './components/TextInput';
import LayerController from './components/LayerController';
import PreviewCanvas from './components/PreviewCanvas';
import ExportPanel from './components/ExportPanel';
import { generateCloudPath, drawPath, drawText } from './utils/renderUtils';

const App = () => {
  // state for text input
  const [text, setText] = useState('云朵字体');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState(48);
  
  // state for outer layer
  const [outerColor, setOuterColor] = useState('#F0F0F0');
  const [outerWidth, setOuterWidth] = useState(8);
  const [cloudStrength, setCloudStrength] = useState(30);
  
  // state for middle layer
  const [middleColor, setMiddleColor] = useState('#FFFFFF');
  const [middleWidth, setMiddleWidth] = useState(2);
  
  // state for inner layer (text)
  const [innerColor, setInnerColor] = useState('#333333');
  const [fontWeight, setFontWeight] = useState(400);
  const [innerFontSize, setInnerFontSize] = useState(48); // 内层字体大小
  const [underline, setUnderline] = useState(false); // 下划线状态
  
  // 添加窗口大小状态
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  // canvas ref
  const canvasRef = useRef(null);
  
  // config object for rendering
  const config = {
    text,
    fontFamily,
    fontSize: innerFontSize, // 使用内层字体大小
    outerColor,
    outerWidth,
    cloudStrength,
    middleColor,
    middleWidth,
    innerColor,
    fontWeight,
    underline // 添加下划线状态
  };
  
  // 当外层字体大小变化时，同步更新内层字体大小
  useEffect(() => {
    setInnerFontSize(fontSize);
  }, [fontSize]);
  
  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // update canvas when config changes or window size changes
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // render cloud text
      renderCloudText(canvas, config);
    }
  }, [config, windowSize]); // 添加windowSize依赖，窗口大小变化时重新渲染
  
  // render cloud text function
  const renderCloudText = (canvas, config) => {
    const ctx = canvas.getContext('2d');
    
    // generate cloud path
    const cloudPath = generateCloudPath(config.text, {
      intensity: config.cloudStrength,
      fontSize: config.fontSize,
      fontFamily: config.fontFamily,
      fontWeight: config.fontWeight,
      layers: [
        {width: config.outerWidth, color: config.outerColor},
        {width: config.middleWidth, color: config.middleColor}
      ]
    });
    
    // clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // draw cloud path
    drawPath(ctx, cloudPath);
    
    // draw text
    drawText(ctx, config.text, {
      font: `${config.fontWeight} ${config.fontSize}px ${config.fontFamily}`,
      color: config.innerColor,
      underline: config.underline,
      fontWeight: config.fontWeight
    });
  };
  
  // update style function
  const updateStyle = (property, value) => {
    switch(property) {
      case 'outerColor':
        setOuterColor(value);
        break;
      case 'outerWidth':
        setOuterWidth(value);
        break;
      case 'cloudStrength':
        setCloudStrength(value);
        break;
      case 'middleColor':
        setMiddleColor(value);
        break;
      case 'middleWidth':
        setMiddleWidth(value);
        break;
      case 'innerColor':
        setInnerColor(value);
        break;
      case 'fontWeight':
        setFontWeight(value);
        break;
      case 'fontFamily':
        setFontFamily(value);
        break;
      case 'fontSize':
        setFontSize(value);
        break;
      case 'innerFontSize':
        setInnerFontSize(value);
        break;
      case 'underline':
        setUnderline(value);
        break;
      default:
        console.warn('Unknown property:', property);
    }
  };
  
  return (
    <div className="app-container">
      <header className="header">
        <h1>云朵字体生成器 <span className="custom-version">蔡老师定制版</span></h1>
        <div className="app-logo">
          <img src="./yunduo_m.png" alt="云朵字体生成器" height="40" />
        </div>
      </header>
      
      <div className="main-content">
        <div className="control-panel">
          <TextInput 
            text={text} 
            setText={setText}
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
            fontSize={fontSize}
            setFontSize={setFontSize}
          />
          
          <LayerController 
            layer="outer"
            title="外层轮廓控制"
            color={outerColor}
            width={outerWidth}
            strength={cloudStrength}
            onColorChange={(hex) => updateStyle('outerColor', hex)}
            onWidthChange={(v) => updateStyle('outerWidth', v)}
            onStrengthChange={(v) => updateStyle('cloudStrength', v)}
          />
          
          <LayerController 
            layer="middle"
            title="中间空心层控制"
            color={middleColor}
            width={middleWidth}
            onColorChange={(hex) => updateStyle('middleColor', hex)}
            onWidthChange={(v) => updateStyle('middleWidth', v)}
          />
          
          <LayerController 
            layer="inner"
            title="内层字体控制"
            color={innerColor}
            fontWeight={fontWeight}
            fontSize={innerFontSize}
            underline={underline}
            onColorChange={(hex) => updateStyle('innerColor', hex)}
            onFontWeightChange={(v) => updateStyle('fontWeight', v)}
            onFontSizeChange={(v) => updateStyle('innerFontSize', v)}
            onUnderlineChange={(v) => updateStyle('underline', v)}
          />
        </div>
        
        <div className="preview-area-wrapper">
          <div className="preview-area">
            <PreviewCanvas 
              canvasRef={canvasRef}
            />
          </div>
        </div>
      </div>
      
      <footer className="footer">
        <div className="export-options">
          <ExportPanel canvasRef={canvasRef} config={config} />
        </div>
      </footer>
    </div>
  );
};

export default App; 