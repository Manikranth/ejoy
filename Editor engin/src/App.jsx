import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import ElementProperties from './components/ElementProperties';
import './App.css';

function App() {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  // Add state history for undo/redo
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isHistoryChange = useRef(false);
  
  // Update history when elements change
  useEffect(() => {
    if (isHistoryChange.current) {
      isHistoryChange.current = false;
      return;
    }
    
    // Add current state to history, removing any future states
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...elements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [elements]);
  
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  
  const handleUndo = () => {
    if (!canUndo) return;
    
    isHistoryChange.current = true;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setElements([...history[newIndex]]);
  };
  
  const handleRedo = () => {
    if (!canRedo) return;
    
    isHistoryChange.current = true;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setElements([...history[newIndex]]);
  };
  
  const [scrollPosition, setScrollPosition] = useState(0);
  const mainContentRef = useRef(null);
  
  // Add scroll tracker
  useEffect(() => {
    const mainContent = mainContentRef.current;
    if (!mainContent) return;
    
    const handleScroll = () => {
      setScrollPosition(mainContent.scrollTop);
    };
    
    mainContent.addEventListener('scroll', handleScroll);
    return () => {
      mainContent.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const addElement = (elementType) => {
    // Calculate a y-position based on the current scroll view
    const yPosition = scrollPosition + 100; // Position it 100px from the top of current view
    
    const newElement = {
      id: `element-${Date.now()}`,
      type: elementType,
      content: getDefaultContent(elementType),
      style: getDefaultStyle(elementType),
      position: { x: 50, y: yPosition },
      shapeType: elementType === 'shape' ? 'square' : undefined // Set default shape type
    };
    
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };
  
  const updateElement = (id, updates) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };
  
  const deleteElement = (id) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement === id) setSelectedElement(null);
  };

  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode);
    if (!isPreviewMode) {
      // Entering preview mode, deselect any element
      setSelectedElement(null);
    }
  };
  
  const addCustomElement = (elementData) => {
    setElements([...elements, elementData]);
    setSelectedElement(elementData.id);
  };
  
  // Add this state to track current device view mode
  const [deviceView, setDeviceView] = useState('desktop'); // Options: desktop, tablet, mobile
  
  return (
    <div className="app-container">
      <div className="app-header">
        <div className="app-title">Page Builder</div>
        <div className="app-actions">
          <button 
            className={`action-btn ${!canUndo ? 'disabled' : ''}`} 
            onClick={handleUndo}
            disabled={!canUndo}
            title="Undo"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 8C9.85 8 7.45 8.99 5.6 10.6L2 7V16H11L7.38 12.38C8.77 11.22 10.54 10.5 12.5 10.5C16.04 10.5 19.05 12.81 20.1 16L22.47 15.22C21.08 11.03 17.15 8 12.5 8Z" fill="currentColor"/>
            </svg>
          </button>
          <button 
            className={`action-btn ${!canRedo ? 'disabled' : ''}`} 
            onClick={handleRedo}
            disabled={!canRedo}
            title="Redo"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8C6.85 8 2.92 11.03 1.54 15.22L3.9 16C4.95 12.81 7.95 10.5 11.5 10.5C13.45 10.5 15.23 11.22 16.62 12.38L13 16H22V7L18.4 10.6Z" fill="currentColor"/>
            </svg>
          </button>
          <div className="action-divider"></div>
          
          <div className="device-preview-selector">
            <button 
              className={`device-btn ${deviceView === 'desktop' ? 'active' : ''}`}
              onClick={() => setDeviceView('desktop')}
              title="Desktop View"
            >
              <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="18" height="12" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M6 15H14" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </button>
            
            <button 
              className={`device-btn ${deviceView === 'tablet' ? 'active' : ''}`}
              onClick={() => setDeviceView('tablet')}
              title="Tablet View"
            >
              <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="14" height="16" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M7 14H9" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </button>
            
            <button 
              className={`device-btn ${deviceView === 'mobile' ? 'active' : ''}`}
              onClick={() => setDeviceView('mobile')}
              title="Mobile View"
            >
              <svg width="12" height="18" viewBox="0 0 12 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="10" height="16" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M5 14H7" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </button>
          </div>
          
          <div className="action-divider"></div>
          
          <button 
            className={`preview-btn ${isPreviewMode ? 'active' : ''}`}
            onClick={togglePreviewMode}
          >
            Preview
          </button>
        </div>
      </div>
      
      <div className="app-content">
        <Sidebar
          addElement={addElement}
          isPreviewMode={isPreviewMode}
          setIsPreviewMode={setIsPreviewMode}
        />
        
        <div className="main-content" ref={mainContentRef}>
          <div className="canvas-container">
            <Canvas
              elements={elements}
              selectedElement={selectedElement}
              setSelectedElement={setSelectedElement}
              updateElement={updateElement}
              deleteElement={deleteElement}
              isPreviewMode={isPreviewMode}
              addElement={addElement}
              getDefaultStyle={getDefaultStyle}
              deviceView={deviceView}
            />
          </div>
        </div>
        
        {selectedElement && !isPreviewMode && (
          <ElementProperties
            element={elements.find(el => el.id === selectedElement)}
            updateElement={updateElement}
          />
        )}
      </div>
    </div>
  );
}

// Helper functions
function getDefaultContent(type) {
  switch(type) {
    case 'text': return 'Edit this text';
    case 'heading': return 'Heading';
    case 'button': return 'Click Me';
    default: return '';
  }
}

function getDefaultStyle(type) {
  // Default styling based on element type
  const baseStyle = { 
    width: '300px',
    height: 'auto'
  };
  
  switch(type) {
    case 'text': 
      return { 
        ...baseStyle,
        fontSize: '16px',
        color: '#333',
        fontFamily: 'Arial',
        lineHeight: '1.5',
        letterSpacing: '0px',
        textAlign: 'left'
      };
    case 'image':
      return {
        ...baseStyle,
        objectFit: 'contain'
      };
    case 'video':
      return {
        ...baseStyle,
        width: '320px',
        height: '240px'
      };
    case 'shape':
      return {
        ...baseStyle,
        width: '150px',
        height: '150px',
        fill: '#3f51b5',
        opacity: 1,
        boxShadow: 'none'
      };
    default: 
      return baseStyle;
  }
}

export default App; 