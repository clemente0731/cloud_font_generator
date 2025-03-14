import React, { useEffect, useRef } from 'react';

const PreviewCanvas = ({ canvasRef }) => {
  const containerRef = useRef(null);
  
  // handle resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        const container = containerRef.current;
        // 减小宽度，确保不会遮挡左侧菜单
        const containerWidth = container.clientWidth * 0.95;
        const containerHeight = container.parentElement.clientHeight || 400;
        
        // set canvas size
        canvasRef.current.width = containerWidth * (window.devicePixelRatio || 1);
        canvasRef.current.height = containerHeight * (window.devicePixelRatio || 1);
        
        // scale canvas
        canvasRef.current.style.width = `${containerWidth}px`;
        canvasRef.current.style.height = `${containerHeight}px`;
        
        // scale context
        const ctx = canvasRef.current.getContext('2d');
        ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
      }
    };
    
    // initial setup
    handleResize();
    
    // add resize listener
    window.addEventListener('resize', handleResize);
    
    // cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [canvasRef]);
  
  return (
    <div 
      ref={containerRef} 
      className="canvas-container"
      style={{ 
        width: '100%', 
        height: '100%',
        paddingLeft: '20px', // 增加左侧内边距，使画布向右移动
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
};

export default PreviewCanvas; 