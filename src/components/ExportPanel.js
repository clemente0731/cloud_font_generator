import React, { useState } from 'react';
import { generateSVG, generateCSS } from '../utils/exportUtils';
const { ipcRenderer } = window.require('electron');

const ExportPanel = ({ canvasRef, config }) => {
  const [exportFormat, setExportFormat] = useState('png');
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [transparentBg, setTransparentBg] = useState(false);
  
  // handle export format change
  const handleFormatChange = (e) => {
    setExportFormat(e.target.value);
    setCopySuccess('');
  };
  
  // 处理背景透明选项变化
  const handleTransparentBgChange = (e) => {
    setTransparentBg(e.target.checked);
    setCopySuccess('');
  };
  
  // handle export button click
  const handleExport = () => {
    if (!canvasRef.current) {
      setExportMessage('Canvas not available');
      return;
    }
    
    setExporting(true);
    setExportMessage('');
    setCopySuccess('');
    
    try {
      let data;
      let filename;
      
      // generate export data based on format
      switch (exportFormat) {
        case 'png':
          // 处理透明背景的PNG导出
          if (transparentBg) {
            // 创建临时画布以生成透明背景的PNG
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvasRef.current.width;
            tempCanvas.height = canvasRef.current.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            // 获取原始画布内容
            const originalCanvas = canvasRef.current;
            const originalCtx = originalCanvas.getContext('2d');
            const originalImageData = originalCtx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
            
            // 绘制到临时画布（默认是透明背景）
            tempCtx.putImageData(originalImageData, 0, 0);
            
            // 导出透明背景的PNG
            data = tempCanvas.toDataURL('image/png');
          } else {
            // 使用原始画布（白色背景）
            data = canvasRef.current.toDataURL('image/png');
          }
          filename = 'cloud_text.png';
          break;
        case 'svg':
          // 传递透明背景选项到SVG生成函数
          data = generateSVG(config, transparentBg);
          filename = 'cloud_text.svg';
          break;
        case 'css':
          // 传递透明背景选项到CSS生成函数
          data = generateCSS(config, transparentBg);
          filename = 'cloud_text.css';
          break;
        case 'json':
          // 在JSON中包含透明背景设置
          const configWithBgOption = {
            ...config,
            transparentBackground: transparentBg
          };
          data = configWithBgOption;
          filename = 'cloud_text.json';
          break;
        default:
          throw new Error('Unsupported export format');
      }
      
      // send to main process for saving
      ipcRenderer.send('export-file', { data, format: exportFormat, filename });
      
      // listen for export completion
      ipcRenderer.once('export-complete', (event, result) => {
        setExporting(false);
        
        if (result.success) {
          setExportMessage(`已导出到: ${result.path}`);
        } else {
          setExportMessage(`导出失败: ${result.error}`);
        }
      });
    } catch (error) {
      setExporting(false);
      setExportMessage(`导出错误: ${error.message}`);
    }
  };
  
  // handle copy to clipboard
  const handleCopy = async () => {
    if (!canvasRef.current) {
      setCopySuccess('无法获取画布内容');
      return;
    }
    
    try {
      let data;
      
      // generate data based on format
      switch (exportFormat) {
        case 'png':
          // 处理透明背景的PNG复制
          let dataUrl;
          if (transparentBg) {
            // 创建临时画布以生成透明背景的PNG
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvasRef.current.width;
            tempCanvas.height = canvasRef.current.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            // 获取原始画布内容
            const originalCanvas = canvasRef.current;
            const originalCtx = originalCanvas.getContext('2d');
            const originalImageData = originalCtx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
            
            // 绘制到临时画布（默认是透明背景）
            tempCtx.putImageData(originalImageData, 0, 0);
            
            // 导出透明背景的PNG
            dataUrl = tempCanvas.toDataURL('image/png');
          } else {
            // 使用原始画布（白色背景）
            dataUrl = canvasRef.current.toDataURL('image/png');
          }
          
          // Create a temporary image element
          const img = document.createElement('img');
          img.src = dataUrl;
          
          // Create a temporary canvas to draw the image
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvasRef.current.width;
          tempCanvas.height = canvasRef.current.height;
          
          // Wait for the image to load
          await new Promise(resolve => {
            img.onload = resolve;
          });
          
          // Draw the image to the temporary canvas
          const tempCtx = tempCanvas.getContext('2d');
          tempCtx.drawImage(img, 0, 0);
          
          // Copy the image to clipboard
          tempCanvas.toBlob(async (blob) => {
            try {
              // Use the clipboard API to write the blob
              const item = new ClipboardItem({ 'image/png': blob });
              await navigator.clipboard.write([item]);
              setCopySuccess('图片已复制到剪贴板');
            } catch (err) {
              setCopySuccess('复制图片失败: ' + err.message);
            }
          });
          break;
          
        case 'svg':
          // 传递透明背景选项到SVG生成函数
          data = generateSVG(config, transparentBg);
          await navigator.clipboard.writeText(data);
          setCopySuccess('SVG代码已复制到剪贴板');
          break;
          
        case 'css':
          // 传递透明背景选项到CSS生成函数
          data = generateCSS(config, transparentBg);
          await navigator.clipboard.writeText(data);
          setCopySuccess('CSS代码已复制到剪贴板');
          break;
          
        case 'json':
          // 在JSON中包含透明背景设置
          const configWithBgOption = {
            ...config,
            transparentBackground: transparentBg
          };
          data = JSON.stringify(configWithBgOption, null, 2);
          await navigator.clipboard.writeText(data);
          setCopySuccess('JSON配置已复制到剪贴板');
          break;
          
        default:
          throw new Error('不支持的导出格式');
      }
    } catch (error) {
      setCopySuccess(`复制失败: ${error.message}`);
    }
  };
  
  return (
    <div className="export-panel">
      <div className="export-options">
        <select value={exportFormat} onChange={handleFormatChange}>
          <option value="png">PNG图片</option>
          <option value="svg">SVG矢量</option>
          <option value="css">CSS代码</option>
          <option value="json">配置JSON</option>
        </select>
        
        <div className="transparent-bg-option">
          <input
            type="checkbox"
            id="transparent-bg"
            checked={transparentBg}
            onChange={handleTransparentBgChange}
            className="checkbox-input"
          />
          <label htmlFor="transparent-bg">透明背景</label>
        </div>
        
        <button 
          onClick={handleExport}
          disabled={exporting}
          className="export-button"
        >
          {exporting ? '导出中...' : '导出'}
        </button>
        
        <button 
          onClick={handleCopy}
          className="copy-button"
        >
          复制
        </button>
      </div>
      
      {exportMessage && (
        <div className="export-message">
          {exportMessage}
        </div>
      )}
      
      {copySuccess && (
        <div className="copy-message">
          {copySuccess}
        </div>
      )}
    </div>
  );
};

export default ExportPanel; 