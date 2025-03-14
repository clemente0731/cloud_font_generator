import React from 'react';

const TextInput = ({ 
  text, 
  setText, 
  fontFamily, 
  setFontFamily, 
  fontSize, 
  setFontSize 
}) => {
  // 扩展字体列表
  const fontOptions = [
    { value: 'Arial', label: 'Arial' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Tahoma', label: 'Tahoma' },
    { value: 'Trebuchet MS', label: 'Trebuchet MS' },
    { value: 'Impact', label: 'Impact' },
    { value: 'Comic Sans MS', label: 'Comic Sans MS' },
    { value: 'Palatino Linotype', label: 'Palatino Linotype' },
    { value: 'Lucida Sans Unicode', label: 'Lucida Sans Unicode' },
    { value: 'Lucida Console', label: 'Lucida Console' },
    { value: 'Garamond', label: 'Garamond' },
    { value: 'Bookman', label: 'Bookman' },
    { value: 'Avant Garde', label: 'Avant Garde' },
    { value: '宋体', label: '宋体 (SimSun)' },
    { value: '黑体', label: '黑体 (SimHei)' },
    { value: '微软雅黑', label: '微软雅黑 (Microsoft YaHei)' },
    { value: '楷体', label: '楷体 (KaiTi)' },
    { value: '仿宋', label: '仿宋 (FangSong)' },
    { value: '华文细黑', label: '华文细黑 (STXihei)' },
    { value: '华文楷体', label: '华文楷体 (STKaiti)' },
    { value: '华文宋体', label: '华文宋体 (STSong)' },
    { value: '华文仿宋', label: '华文仿宋 (STFangsong)' },
    { value: '华文中宋', label: '华文中宋 (STZhongsong)' },
    { value: '华文琥珀', label: '华文琥珀 (STHupo)' },
    { value: '华文新魏', label: '华文新魏 (STXinwei)' },
    { value: '华文彩云', label: '华文彩云 (STCaiyun)' },
    { value: '方正舒体', label: '方正舒体 (FZShuTi)' },
    { value: '方正姚体', label: '方正姚体 (FZYaoti)' }
  ];
  
  // handle text change
  const handleTextChange = (e) => {
    setText(e.target.value);
  };
  
  // handle font family change
  const handleFontFamilyChange = (e) => {
    setFontFamily(e.target.value);
  };
  
  // handle font size change
  const handleFontSizeChange = (e) => {
    // validate input to ensure it's a number and within reasonable range
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= 360) {
      setFontSize(value);
    }
  };
  
  // handle font size slider change
  const handleSliderChange = (e) => {
    setFontSize(parseInt(e.target.value));
  };
  
  return (
    <div className="input-area">
      <textarea 
        value={text}
        onChange={handleTextChange}
        placeholder="请输入文字..."
        style={{ fontFamily }}
      />
      
      <div className="font-selector">
        <label>字体:</label>
        <select 
          value={fontFamily} 
          onChange={handleFontFamilyChange}
          style={{ fontFamily }}
        >
          {fontOptions.map(font => (
            <option key={font.value} value={font.value}>{font.label}</option>
          ))}
        </select>
      </div>
      
      <div className="font-selector">
        <label>字号:</label>
        <div className="slider-container">
          <input 
            type="range" 
            min="8" 
            max="360" 
            value={fontSize} 
            onChange={handleSliderChange}
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
    </div>
  );
};

export default TextInput; 