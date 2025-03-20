import React, { useState, useRef, useEffect } from 'react';
import './Element.css';

function Element({ 
  element, 
  isSelected, 
  onSelect, 
  onUpdate, 
  onDelete,
  isPreviewMode,
  canvasBounds,
  id
}) {
  const elementRef = useRef(null);
  
  // Define default dimensions to ensure elements have a size
  useEffect(() => {
    // If the element doesn't have explicit width/height, set them
    if (!element.style.width || !element.style.height) {
      const el = elementRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        onUpdate(element.id, {
          style: {
            ...element.style,
            width: `${Math.max(rect.width, 100)}px`,
            height: `${Math.max(rect.height, 40)}px`
          }
        });
      }
    }
  }, [element.id, element.style, onUpdate]);
  
  // Handle element selection
  const handleClick = (e) => {
    if (isPreviewMode) return;
    e.stopPropagation();
    onSelect(element.id);
  };
  
  // Handle element deletion
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(element.id);
  };
  
  // Handle element duplication
  const handleDuplicate = (e) => {
    e.stopPropagation();
    const newElement = {
      ...element,
      id: `element-${Date.now()}`,
      position: {
        x: element.position.x + 20,
        y: element.position.y + 20
      }
    };
    onUpdate(element.id, newElement, true);
  };
  
  // DRAG FUNCTIONALITY
  const handleDragStart = (e) => {
    if (isPreviewMode) return;
    if (e.target.isContentEditable) return;
    
    e.stopPropagation();
    
    // Get initial mouse and element positions
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startElementX = element.position.x;
    const startElementY = element.position.y;
    
    // Get element dimensions for boundary checking
    const elWidth = elementRef.current.offsetWidth;
    const elHeight = elementRef.current.offsetHeight;
    
    const handleDragMove = (moveEvent) => {
      // Calculate new position
      const dx = moveEvent.clientX - startMouseX;
      const dy = moveEvent.clientY - startMouseY;
      
      // Calculate potential new position
      const newPosX = startElementX + dx;
      const newPosY = startElementY + dy;
      
      // Get current element dimensions
      const elWidth = elementRef.current.offsetWidth;
      
      // Apply horizontal boundary constraints only
      let constrainedX = newPosX;
      let constrainedY = newPosY; // No vertical constraint
      
      // Apply horizontal constraints to keep elements inside canvas
      if (canvasBounds) {
        // Calculate offset from canvas left edge
        const leftBoundary = 0; // Relative to canvas
        const rightBoundary = canvasBounds.width - elWidth; // Use canvas width
        
        // Apply constraints
        constrainedX = Math.max(leftBoundary, Math.min(constrainedX, rightBoundary));
      }
      
      onUpdate(element.id, {
        position: {
          x: constrainedX,
          y: constrainedY
        }
      });
      
      // Ensure the canvas grows as needed
      ensureCanvasSize(constrainedY + elementRef.current.offsetHeight);
    };
    
    const handleDragEnd = () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };
    
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
  };
  
  // Function to ensure the canvas expands as needed
  const ensureCanvasSize = (bottomPosition) => {
    const canvas = document.querySelector('.canvas');
    if (canvas) {
      const minHeight = bottomPosition + 100; // Add some extra space
      if (canvas.offsetHeight < minHeight) {
        canvas.style.minHeight = `${minHeight}px`;
      }
    }
  };
  
  // RESIZE FUNCTIONALITY
  const handleResizeStart = (e) => {
    if (isPreviewMode) return;
    
    e.stopPropagation();
    e.preventDefault();
    
    // Get starting dimensions and mouse position
    const startWidth = parseInt(element.style.width) || elementRef.current.offsetWidth;
    const startHeight = parseInt(element.style.height) || elementRef.current.offsetHeight;
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    
    const handleResizeMove = (moveEvent) => {
      // Calculate how much the mouse has moved
      const dx = moveEvent.clientX - startMouseX;
      const dy = moveEvent.clientY - startMouseY;
      
      // Calculate new dimensions (with minimums)
      const newWidth = Math.max(50, startWidth + dx);
      const newHeight = Math.max(50, startHeight + dy);
      
      // Update the element with new dimensions
      onUpdate(element.id, {
        style: {
          ...element.style,
          width: `${newWidth}px`,
          height: `${newHeight}px`
        }
      });
    };
    
    const handleResizeEnd = () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };
  
  // ROTATE FUNCTIONALITY
  const handleRotateStart = (e) => {
    if (isPreviewMode) return;
    
    e.stopPropagation();
    e.preventDefault();
    
    // Get element center
    const rect = elementRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate the initial angle
    const startAngle = Math.atan2(
      e.clientY - centerY,
      e.clientX - centerX
    ) * (180 / Math.PI);
    
    // Get the current rotation
    const currentRotation = element.rotate || 0;
    
    const handleRotateMove = (moveEvent) => {
      // Calculate the new angle
      const angle = Math.atan2(
        moveEvent.clientY - centerY,
        moveEvent.clientX - centerX
      ) * (180 / Math.PI);
      
      // Calculate the difference and update
      const rotation = currentRotation + (angle - startAngle);
      
      onUpdate(element.id, { rotate: rotation });
    };
    
    const handleRotateEnd = () => {
      document.removeEventListener('mousemove', handleRotateMove);
      document.removeEventListener('mouseup', handleRotateEnd);
    };
    
    document.addEventListener('mousemove', handleRotateMove);
    document.addEventListener('mouseup', handleRotateEnd);
  };
  
  // Render the appropriate content based on element type
  const renderContent = () => {
    switch(element.type) {
      case 'text':
        return (
          <div 
            style={{
              ...element.style,
              width: '100%',
              height: '100%',
              overflow: 'visible',
              wordBreak: 'break-word',
              boxSizing: 'border-box'
            }}
            contentEditable={!isPreviewMode}
            suppressContentEditableWarning={true}
            onBlur={(e) => {
              onUpdate(element.id, { content: e.target.innerText });
            }}
          >
            {element.content}
          </div>
        );
      case 'image':
        return (
          <img 
            src={element.content} 
            alt="User uploaded content"
            style={{
              width: '100%',
              height: '100%',
              objectFit: element.style.objectFit || 'contain',
              opacity: element.style.opacity || 1
            }}
          />
        );
      case 'video':
        if (element.content.includes('youtube')) {
          const youtubeId = getYoutubeId(element.content);
          return (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title="YouTube video"
              allowFullScreen
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          );
        } else {
          return (
            <video 
              src={element.content}
              controls={!isPreviewMode}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          );
        }
      case 'shape':
        const shapeType = element.shapeType || 'square';
        const shapeFill = element.style.fill || '#3f51b5';
        const shapeOpacity = element.style.opacity || 1;
        
        return (
          <div 
            className="shape-container"
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <RenderShape 
              type={shapeType} 
              fill={shapeFill}
              opacity={shapeOpacity}
              style={element.style}
            />
          </div>
        );
      default:
        return <div>Unknown element type</div>;
    }
  };
  
  const getYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  
  return (
    <div 
      ref={elementRef}
      id={id}
      className={`element ${isSelected && !isPreviewMode ? 'selected' : ''}`}
      style={{
        position: 'absolute',
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        width: element.style.width || 'auto',
        height: element.style.height || 'auto',
        transform: `rotate(${element.rotate || 0}deg)`,
        cursor: isPreviewMode ? 'default' : 'move',
        zIndex: isSelected ? 10 : 1
      }}
      onClick={handleClick}
      onMouseDown={isPreviewMode ? null : (e) => {
        // Only initiate drag if not clicking on a control or editable content
        if (!e.target.isContentEditable && 
           !e.target.closest('.resize-handle') && 
           !e.target.closest('.rotation-handle') &&
           !e.target.closest('.element-controls')) {
          handleDragStart(e);
        }
      }}
    >
      {renderContent()}
      
      {isSelected && !isPreviewMode && (
        <>
          <div 
            className="resize-handle" 
            onMouseDown={handleResizeStart}
            title="Drag to resize"
          ></div>
          
          <div 
            className="rotation-handle" 
            onMouseDown={handleRotateStart}
            title="Drag to rotate"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5C8.13 5 5 8.13 5 12H2L5.84 15.84L9.68 12H7C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17C10.43 17 9.03 16.17 8.3 14.97L6.7 16.57C7.84 18.13 9.78 19 12 19C15.87 19 19 15.87 19 12C19 8.13 15.87 5 12 5Z" fill="white"/>
            </svg>
          </div>
          
          <div className="element-controls">
            <button 
              className="control-btn duplicate" 
              onClick={handleDuplicate}
              title="Duplicate"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="white"/>
              </svg>
            </button>
            <button 
              className="control-btn delete" 
              onClick={handleDelete}
              title="Delete"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="white"/>
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const RenderShape = ({ type, fill, opacity, style }) => {
  const boxShadow = style.boxShadow || 'none';
  
  switch(type) {
    case 'square':
      return (
        <div style={{
          width: '100%',
          height: '100%',
          backgroundColor: fill,
          opacity: opacity,
          boxShadow: boxShadow
        }}></div>
      );
    case 'circle':
      return (
        <div style={{
          width: '100%',
          height: '100%',
          backgroundColor: fill,
          borderRadius: '50%',
          opacity: opacity,
          boxShadow: boxShadow
        }}></div>
      );
    case 'triangle':
      return (
        <div style={{
          width: 0,
          height: 0,
          borderLeft: 'calc(50% - 10px) solid transparent',
          borderRight: 'calc(50% - 10px) solid transparent',
          borderBottom: '100% solid ' + fill,
          opacity: opacity,
          filter: boxShadow !== 'none' ? `drop-shadow(${boxShadow.replace(/box-shadow:|;/g, '')})` : 'none'
        }}></div>
      );
    case 'line':
      return (
        <div style={{
          width: '100%',
          height: '4px',
          backgroundColor: fill,
          opacity: opacity,
          boxShadow: boxShadow,
          margin: 'auto'
        }}></div>
      );
    case 'arrow':
      return (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity }}>
          <path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" fill={fill} style={{ filter: boxShadow !== 'none' ? `drop-shadow(${boxShadow.replace(/box-shadow:|;/g, '')})` : 'none' }} />
        </svg>
      );
    case 'star':
      return (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity }}>
          <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" fill={fill} style={{ filter: boxShadow !== 'none' ? `drop-shadow(${boxShadow.replace(/box-shadow:|;/g, '')})` : 'none' }} />
        </svg>
      );
    default:
      return (
        <div style={{
          width: '100%',
          height: '100%',
          backgroundColor: fill,
          opacity: opacity,
          boxShadow: boxShadow
        }}></div>
      );
  }
};

export default Element; 