import React, { useState } from 'react';
import { ChromePicker } from 'react-color';

const LayerController = ({ 
  layer, 
  title, 
  color, 
  width, 
  strength, 
  fontWeight,
  fontSize,
  underline,
  onColorChange, 
  onWidthChange, 
  onStrengthChange,
  onFontWeightChange,
  onFontSizeChange,
  onUnderlineChange
}) => {
  // state for color picker visibility
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  // toggle color picker
  const toggleColorPicker = () => {
    setShowColorPicker(!showColorPicker);
  };
  
  // handle color change
  const handleColorChange = (color) => {
    onColorChange(color.hex);
  };
  
  // handle width change
  const handleWidthChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      onWidthChange(value);
    }
  };
  
  // handle slider width change
  const handleSliderWidthChange = (e) => {
    onWidthChange(parseInt(e.target.value));
  };
  
  // handle strength change
  const handleStrengthChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      onStrengthChange(value);
    }
  };
  
  // handle slider strength change
  const handleSliderStrengthChange = (e) => {
    onStrengthChange(parseInt(e.target.value));
  };
  
  // handle font weight change
  const handleFontWeightChange = (e) => {
    onFontWeightChange(e.target.value);
  };
  
  // handle font size change
  const handleFontSizeChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= 360) {
      onFontSizeChange(value);
    }
  };
  
  // handle slider font size change
  const handleSliderFontSizeChange = (e) => {
    onFontSizeChange(parseInt(e.target.value));
  };
  
  // handle underline change
  const handleUnderlineChange = (e) => {
    onUnderlineChange(e.target.checked);
  };
  
  return (
    <div className="layer-control">
      <h3>{title}</h3>
      
      <div className="control-row">
        <label>颜色:</label>
        <div className="color-picker-container">
          <div 
            className="color-swatch" 
            style={{ backgroundColor: color }}
            onClick={toggleColorPicker}
          />
          {showColorPicker && (
            <div style={{ position: 'absolute', zIndex: 2 }}>
              <div 
                style={{ 
                  position: 'fixed', 
                  top: '0px', 
                  right: '0px', 
                  bottom: '0px', 
                  left: '0px' 
                }}
                onClick={toggleColorPicker}
              />
              <ChromePicker 
                color={color} 
                onChange={handleColorChange} 
              />
            </div>
          )}
        </div>
      </div>
      
      {(layer === 'outer' || layer === 'middle') && (
        <div className="control-row">
          <label>{layer === 'outer' ? '轮廓宽度:' : '空心层粗细:'}</label>
          <div className="slider-container">
            <input 
              type="range" 
              min="0" 
              max={layer === 'outer' ? '20' : '10'} 
              value={width} 
              onChange={handleSliderWidthChange}
            />
            <input 
              type="number" 
              value={width} 
              onChange={handleWidthChange}
              min="0"
              max={layer === 'outer' ? '20' : '10'}
            />
          </div>
        </div>
      )}
      
      {layer === 'outer' && strength !== undefined && (
        <div className="control-row">
          <label>形状变化:</label>
          <div className="slider-container">
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={strength} 
              onChange={handleSliderStrengthChange}
            />
            <input 
              type="number" 
              value={strength} 
              onChange={handleStrengthChange}
              min="0"
              max="100"
            />
          </div>
        </div>
      )}
      
      {layer === 'inner' && (
        <>
          <div className="control-row">
            <label>字体粗细:</label>
            <select value={fontWeight} onChange={handleFontWeightChange}>
              <option value="100">100 (极细)</option>
              <option value="200">200 (特细)</option>
              <option value="300">300 (细体)</option>
              <option value="400">400 (常规)</option>
              <option value="500">500 (中等)</option>
              <option value="600">600 (半粗)</option>
              <option value="700">700 (粗体)</option>
              <option value="800">800 (特粗)</option>
              <option value="900">900 (黑体)</option>
            </select>
          </div>
          
          {onFontSizeChange && (
            <div className="control-row">
              <label>字体大小:</label>
              <div className="slider-container">
                <input 
                  type="range" 
                  min="8" 
                  max="360" 
                  value={fontSize} 
                  onChange={handleSliderFontSizeChange}
                />
                <input 
                  type="number" 
                  value={fontSize} 
                  onChange={handleFontSizeChange}
                  min="8"
                  max="360"
                  step="1"
                />
              </div>
            </div>
          )}
          
          {onUnderlineChange && (
            <div className="control-row">
              <label>下划线:</label>
              <input 
                type="checkbox" 
                checked={underline} 
                onChange={handleUnderlineChange}
                className="checkbox-input"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LayerController; 