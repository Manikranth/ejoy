import React, { useCallback, useRef, useEffect, useState } from 'react';
import Element from './Element';
import './Canvas.css';

function Canvas({ elements, selectedElement, setSelectedElement, updateElement, deleteElement, isPreviewMode, addElement, getDefaultStyle, deviceView }) {
  const canvasRef = useRef(null);
  const [canvasBounds, setCanvasBounds] = useState({ left: 0, right: 0, top: null, bottom: null, width: 0 });
  
  // Calculate and update canvas boundaries when component mounts or window resizes
  useEffect(() => {
    const updateCanvasBounds = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        
        // Set bounds based on canvas container dimensions
        setCanvasBounds({
          left: rect.left,
          right: rect.right,
          // No vertical constraints for infinite scrolling
          top: null,
          bottom: null,
          // Add the width to help with calculations
          width: rect.width
        });
      }
    };
    
    updateCanvasBounds();
    window.addEventListener('resize', updateCanvasBounds);
    
    const observer = new MutationObserver(updateCanvasBounds);
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
    
    return () => {
      window.removeEventListener('resize', updateCanvasBounds);
      observer.disconnect();
    };
  }, []);
  
  // Adjust canvas height based on elements and mode
  useEffect(() => {
    if (!canvasRef.current) return;
    
    if (isPreviewMode) {
      canvasRef.current.style.paddingBottom = '0';
    } else {
      // In edit mode, ensure we have plenty of space at the bottom for adding new elements
      let maxBottom = 0;
      elements.forEach(element => {
        const el = document.getElementById(`element-${element.id}`);
        if (el) {
          const bottom = element.position.y + el.offsetHeight;
          maxBottom = Math.max(maxBottom, bottom);
        }
      });
      
      // Set minimum height to be greater of viewport height or content + padding
      const minHeight = Math.max(window.innerHeight, maxBottom + 300);
      canvasRef.current.style.minHeight = `${minHeight}px`;
      canvasRef.current.style.paddingBottom = '200px';
    }
  }, [elements, isPreviewMode]);
  
  // Add a useEffect to handle canvas resizing based on device view
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const container = canvasRef.current.parentElement;
    
    // Set width based on device type
    switch (deviceView) {
      case 'desktop':
        container.style.width = '100%';
        container.style.maxWidth = '1140px';
        break;
      case 'tablet':
        container.style.width = '768px';
        container.style.maxWidth = '768px';
        break;
      case 'mobile':
        container.style.width = '375px';
        container.style.maxWidth = '375px';
        break;
      default:
        container.style.width = '100%';
        container.style.maxWidth = '1140px';
    }
    
    // Rearrange elements if they don't fit
    if (deviceView !== 'desktop') {
      const containerWidth = container.offsetWidth;
      
      // Adjust elements that go beyond the new container width
      elements.forEach(element => {
        const el = document.getElementById(`element-${element.id}`);
        if (!el) return;
        
        const elementRight = element.position.x + el.offsetWidth;
        
        // If element overflows the container width
        if (elementRight > containerWidth) {
          // Calculate new x position to keep it within bounds
          const newX = Math.max(0, containerWidth - el.offsetWidth);
          
          // Update element position
          updateElement(element.id, {
            position: { ...element.position, x: newX }
          });
        }
      });
    }
  }, [deviceView, elements, updateElement]);
  
  const handleCanvasClick = (e) => {
    // Deselect when clicking on the canvas background
    if (e.target === e.currentTarget && !isPreviewMode) {
      setSelectedElement(null);
    }
  };
  
  // This function enforces element boundaries
  const enforceElementBoundaries = (id, newPosition, elementWidth, elementHeight) => {
    // Calculate max bounds to keep element within canvas
    const maxX = canvasBounds.right - canvasBounds.left - elementWidth;
    const maxY = canvasBounds.bottom - canvasBounds.top - elementHeight;
    
    // Apply constraints
    return {
      x: Math.max(0, Math.min(newPosition.x, maxX)),
      y: Math.max(0, Math.min(newPosition.y, maxY))
    };
  };
  
  const handleElementDrag = (id, position, elementWidth, elementHeight) => {
    if (!isPreviewMode) {
      // Get constrained position
      const constrainedPosition = enforceElementBoundaries(id, position, elementWidth, elementHeight);
      updateElement(id, { position: constrainedPosition });
    }
  };
  
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    if (isPreviewMode) return;
    
    // Get drop position
    const rect = e.currentTarget.getBoundingClientRect();
    const position = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    // Check if files were dropped
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      // Check if it's an image
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          // Create a new image element
          const newElement = {
            id: `element-${Date.now()}`,
            type: 'image',
            content: event.target.result,
            style: getDefaultStyle('image'),
            position: position
          };
          addElement(newElement);
        };
        reader.readAsDataURL(file);
      }
    }
  }, [isPreviewMode, addElement, getDefaultStyle]);
  
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);
  
  return (
    <div 
      ref={canvasRef}
      className={`canvas ${isPreviewMode ? 'preview-mode' : ''}`} 
      onClick={handleCanvasClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {elements.map(element => (
        <Element
          key={element.id}
          id={`element-${element.id}`}
          element={element}
          isSelected={element.id === selectedElement}
          onSelect={setSelectedElement}
          onUpdate={(id, updates, isNew = false) => {
            if (isNew) {
              // This is for adding a duplicated element
              addElement(updates);
            } else {
              // Normal update
              updateElement(id, updates);
            }
          }}
          onDelete={deleteElement}
          isPreviewMode={isPreviewMode}
          canvasBounds={canvasBounds}
        />
      ))}
    </div>
  );
}

export default Canvas; 