import React, { useState, useRef, useEffect } from 'react';
import './ElementProperties.css';

function ElementProperties({ element, updateElement }) {
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);
  const fontDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(event.target)) {
        setIsFontDropdownOpen(false);
      }
    }
    
    if (isFontDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFontDropdownOpen]);

  const fonts = [
    { name: 'Arimo', value: 'Arimo, sans-serif' },
    { name: 'Canva Sans', value: 'Canva Sans, sans-serif' },
    { name: 'Montserrat', value: 'Montserrat, sans-serif' },
    { name: 'Open Sans', value: 'Open Sans, sans-serif' },
    { name: 'Poppins', value: 'Poppins, sans-serif' },
    { name: 'Glacial Indifference', value: 'Glacial Indifference, sans-serif' },
    { name: 'League Spartan', value: 'League Spartan, sans-serif' },
    { name: 'Anton', value: 'Anton, sans-serif' },
    { name: 'DM Sans', value: 'DM Sans, sans-serif' },
    { name: 'Archivo Black', value: 'Archivo Black, sans-serif' },
    { name: 'Roboto', value: 'Roboto, sans-serif' },
    { name: 'Garet', value: 'Garet, sans-serif' },
    { name: 'Alice', value: 'Alice, serif' },
    { name: 'Open Sauce', value: 'Open Sauce, sans-serif' },
    { name: 'Brittany', value: 'Brittany, cursive' },
    { name: 'Arial', value: 'Arial, sans-serif' }
  ];

  // Return early if no element is selected
  if (!element) return null;
  
  const handleContentChange = (e) => {
    updateElement(element.id, { content: e.target.value });
  };
  
  const handleStyleChange = (property, value) => {
    updateElement(element.id, { 
      style: { ...element.style, [property]: value } 
    });
  };

  const handleResetStyle = (property) => {
    const defaultValues = {
      fontSize: '16px',
      color: '#000000',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left',
      letterSpacing: '0px',
      lineHeight: '1.5'
    };
    
    handleStyleChange(property, defaultValues[property]);
  };
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateElement(element.id, { content: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size <= 50000000) { // Limit to 50MB
        const videoUrl = URL.createObjectURL(file);
        updateElement(element.id, { content: videoUrl });
      } else {
        alert('Video file is too large. Maximum size is 50MB.');
      }
    }
  };
  
  const renderShapeProperties = () => {
    // Only render shape properties for shape elements
    if (element.type !== 'shape') return null;
    
    const shapeType = element.shapeType || 'square';
    const fillColor = element.style.fill || '#4f46e5'; // Indigo color for modern look
    const opacity = element.style.opacity || 1;
    const boxShadow = element.style.boxShadow || 'none';
    
    // Parse box shadow into components for UI
    let shadowColor = '#000000';
    let shadowBlur = 0;
    let shadowOffsetX = 0;
    let shadowOffsetY = 0;
    
    if (boxShadow !== 'none') {
      const shadowParts = boxShadow.match(/([0-9]+px)\s([0-9]+px)\s([0-9]+px)\s(rgba?\(.*?\)|#[0-9a-fA-F]{3,8})/);
      if (shadowParts) {
        shadowOffsetX = parseInt(shadowParts[1]);
        shadowOffsetY = parseInt(shadowParts[2]);
        shadowBlur = parseInt(shadowParts[3]);
        shadowColor = shadowParts[4];
      }
    }
    
    return (
      <div className="shape-properties">
        <h3>Shape Properties</h3>
        
        <div className="property-row">
          <label>Shape Type</label>
          <div className="shape-type-selector">
            <button 
              className={`shape-btn ${shapeType === 'square' ? 'active' : ''}`}
              onClick={() => updateElement(element.id, { shapeType: 'square' })}
              title="Square"
            >
              <div className="shape-preview">
                <div className="shape-square"></div>
              </div>
            </button>
            <button 
              className={`shape-btn ${shapeType === 'circle' ? 'active' : ''}`}
              onClick={() => updateElement(element.id, { shapeType: 'circle' })}
              title="Circle"
            >
              <div className="shape-preview">
                <div className="shape-circle"></div>
              </div>
            </button>
            <button 
              className={`shape-btn ${shapeType === 'triangle' ? 'active' : ''}`}
              onClick={() => updateElement(element.id, { shapeType: 'triangle' })}
              title="Triangle"
            >
              <div className="shape-preview">
                <div className="shape-triangle"></div>
              </div>
            </button>
            <button 
              className={`shape-btn ${shapeType === 'line' ? 'active' : ''}`}
              onClick={() => updateElement(element.id, { shapeType: 'line' })}
              title="Line"
            >
              <div className="shape-preview">
                <div className="shape-line"></div>
              </div>
            </button>
            <button 
              className={`shape-btn ${shapeType === 'arrow' ? 'active' : ''}`}
              onClick={() => updateElement(element.id, { shapeType: 'arrow' })}
              title="Arrow"
            >
              <div className="shape-preview">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" fill="#5c5cff" />
                </svg>
              </div>
            </button>
            <button 
              className={`shape-btn ${shapeType === 'star' ? 'active' : ''}`}
              onClick={() => updateElement(element.id, { shapeType: 'star' })}
              title="Star"
            >
              <div className="shape-preview">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" fill="#5c5cff" />
                </svg>
              </div>
            </button>
          </div>
        </div>
        
        <div className="property-row">
          <label>Fill Color</label>
          <div className="color-picker">
            <input 
              type="color" 
              value={fillColor}
              onChange={(e) => handleStyleChange('fill', e.target.value)}
            />
            <input 
              type="text" 
              value={fillColor}
              onChange={(e) => handleStyleChange('fill', e.target.value)}
              className="color-text-input"
            />
          </div>
        </div>
        
        <div className="property-row property-slider">
          <label>Opacity</label>
          <div className="modern-slider-container">
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01"
              value={opacity}
              onChange={(e) => {
                const value = e.target.value;
                handleStyleChange('opacity', value);
                e.target.style.setProperty('--value-percent', `${value * 100}%`);
              }}
              className="modern-slider"
              style={{ '--value-percent': `${opacity * 100}%` }}
            />
            <div className="slider-value">{Math.round(opacity * 100)}%</div>
          </div>
        </div>
        
        <div className="property-row">
          <label>Shadow</label>
          <div className="shadow-controls">
            <div className="shadow-row">
              <label>Color</label>
              <input 
                type="color" 
                value={shadowColor}
                onChange={(e) => updateShadow(shadowOffsetX, shadowOffsetY, shadowBlur, e.target.value)}
              />
            </div>
            <div className="shadow-row property-slider">
              <label>Blur</label>
              <div className="modern-slider-container">
                <input 
                  type="range" 
                  min="0" 
                  max="20" 
                  value={shadowBlur}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    updateShadow(shadowOffsetX, shadowOffsetY, value, shadowColor);
                    e.target.style.setProperty('--value-percent', `${(value / 20) * 100}%`);
                  }}
                  className="modern-slider"
                  style={{ '--value-percent': `${(shadowBlur / 20) * 100}%` }}
                />
                <div className="slider-value">{shadowBlur}px</div>
              </div>
            </div>
            <div className="shadow-row property-slider">
              <label>Offset X</label>
              <div className="modern-slider-container">
                <input 
                  type="range" 
                  min="-10" 
                  max="10" 
                  value={shadowOffsetX}
                  onChange={(e) => updateShadow(parseInt(e.target.value), shadowOffsetY, shadowBlur, shadowColor)}
                  className="modern-slider"
                  style={{ '--value-percent': `${((shadowOffsetX + 10) / 20) * 100}%` }}
                />
                <div className="slider-value">{shadowOffsetX}px</div>
              </div>
            </div>
            <div className="shadow-row property-slider">
              <label>Offset Y</label>
              <div className="modern-slider-container">
                <input 
                  type="range" 
                  min="-10" 
                  max="10" 
                  value={shadowOffsetY}
                  onChange={(e) => updateShadow(shadowOffsetX, parseInt(e.target.value), shadowBlur, shadowColor)}
                  className="modern-slider"
                  style={{ '--value-percent': `${((shadowOffsetY + 10) / 20) * 100}%` }}
                />
                <div className="slider-value">{shadowOffsetY}px</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Helper function to update the shadow
  const updateShadow = (offsetX, offsetY, blur, color) => {
    const shadowValue = offsetX === 0 && offsetY === 0 && blur === 0 
      ? 'none' 
      : `${offsetX}px ${offsetY}px ${blur}px ${color}`;
    
    handleStyleChange('boxShadow', shadowValue);
  };

  return (
    <div className="element-properties">
      {element.type === 'text' && (
        <>
          <div className="property-header">
            <h3>TEXT EDITOR</h3>
            <button className="reset-btn" onClick={() => handleStyleChange('content', '')}>Clear</button>
          </div>
          
          <div className="property-group">
            <textarea 
              value={element.content} 
              onChange={handleContentChange}
              rows={6}
              placeholder="Enter your text here..."
            />
          </div>
          
          <div className="property-header">
            <h3>TEXT STYLE</h3>
            <button className="reset-btn" onClick={() => handleResetStyle('fontFamily')}>Reset</button>
          </div>
          
          <div className="property-group">
            <div className="font-dropdown-container" ref={fontDropdownRef}>
              <div 
                className="font-dropdown-header" 
                onClick={() => setIsFontDropdownOpen(!isFontDropdownOpen)}
              >
                <span style={{ fontFamily: element.style.fontFamily || 'Arial, sans-serif' }}>
                  {element.style.fontFamily ? 
                    fonts.find(f => f.value === element.style.fontFamily)?.name || 'Arial' 
                    : 'Arial'}
                </span>
                <span className="dropdown-arrow">▼</span>
              </div>
              
              {isFontDropdownOpen && (
                <div className="font-dropdown-list">
                  {fonts.map(font => (
                    <div
                      key={font.value}
                      className={`font-dropdown-item ${element.style.fontFamily === font.value ? 'selected' : ''}`}
                      style={{ fontFamily: font.value }}
                      onClick={() => {
                        handleStyleChange('fontFamily', font.value);
                        setIsFontDropdownOpen(false);
                      }}
                    >
                      {font.name === fonts.find(f => f.value === element.style.fontFamily)?.name && (
                        <span className="checkmark">✓</span>
                      )}
                      <span className="font-name">{font.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="property-header">
            <h3>TEXT SIZE</h3>
            <button className="reset-btn" onClick={() => handleResetStyle('fontSize')}>Reset</button>
          </div>
          
          <div className="property-group">
            <div className="number-input-container">
              <button
                className="number-btn decrease"
                onClick={() => {
                  const currentSize = parseInt(element.style.fontSize) || 16;
                  const newSize = Math.max(8, currentSize - 1);
                  handleStyleChange('fontSize', `${newSize}px`);
                }}
              >
                −
              </button>
              <input
                type="text"
                className="number-input"
                value={(element.style.fontSize || '16px').replace('px', '')}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d+$/.test(value)) {
                    handleStyleChange('fontSize', `${value}px`);
                  }
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  const size = parseInt(value) || 16;
                  const validSize = Math.max(8, Math.min(size, 72));
                  handleStyleChange('fontSize', `${validSize}px`);
                }}
              />
              <button
                className="number-btn increase"
                onClick={() => {
                  const currentSize = parseInt(element.style.fontSize) || 16;
                  const newSize = Math.min(72, currentSize + 1);
                  handleStyleChange('fontSize', `${newSize}px`);
                }}
              >
                +
              </button>
            </div>
          </div>
          
          <div className="property-header">
            <h3>TEXT COLOR</h3>
            <button className="reset-btn" onClick={() => handleResetStyle('color')}>Reset</button>
          </div>
          
          <div className="property-group">
            <div className="color-search">
              <input 
                type="text" 
                placeholder="Search for a color" 
                className="color-search-input"
              />
            </div>
            
            <div className="color-input-box">
              <div className="color-square" style={{ backgroundColor: element.style.color || '#333333' }}></div>
              <div className="hex-input-container">
                <span className="hash-symbol">#</span>
                <input 
                  type="text" 
                  value={(element.style.color || '#333333').replace('#', '')}
                  onChange={(e) => handleStyleChange('color', `#${e.target.value}`)}
                  className="hex-input"
                />
              </div>
              <div className="color-picker-icon">
                <input 
                  type="color" 
                  value={element.style.color || '#333333'} 
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  className="hidden-color-input"
                />
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgb(255, 0, 0)" />
                    <stop offset="16.67%" stopColor="rgb(255, 255, 0)" />
                    <stop offset="33.33%" stopColor="rgb(0, 255, 0)" />
                    <stop offset="50%" stopColor="rgb(0, 255, 255)" />
                    <stop offset="66.67%" stopColor="rgb(0, 0, 255)" />
                    <stop offset="83.33%" stopColor="rgb(255, 0, 255)" />
                    <stop offset="100%" stopColor="rgb(255, 0, 0)" />
                  </linearGradient>
                  <circle cx="12" cy="12" r="10" fill="url(#rainbow)" stroke="#ddd" strokeWidth="1" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="property-header">
            <h3>TEXT FORMAT</h3>
            <button className="reset-btn" onClick={() => {
              handleResetStyle('fontWeight');
              handleResetStyle('fontStyle');
              handleResetStyle('textAlign');
            }}>Reset</button>
          </div>
          
          <div className="property-group">
            <div className="format-options">
              <div className="case-options">
                <button 
                  className={`format-btn ${element.style.textTransform === 'uppercase' ? 'active' : ''}`}
                  onClick={() => handleStyleChange('textTransform', 'uppercase')}
                >
                  AA
                </button>
                <button 
                  className={`format-btn ${element.style.textTransform === 'lowercase' ? 'active' : ''}`}
                  onClick={() => handleStyleChange('textTransform', 'lowercase')}
                >
                  aa
                </button>
                <button 
                  className={`format-btn ${element.style.textTransform === 'capitalize' ? 'active' : ''}`}
                  onClick={() => handleStyleChange('textTransform', 'capitalize')}
                >
                  Aa
                </button>
              </div>
              <div className="style-options">
                <button 
                  className={`format-btn ${element.style.fontWeight === 'bold' ? 'active' : ''}`}
                  onClick={() => handleStyleChange('fontWeight', element.style.fontWeight === 'bold' ? 'normal' : 'bold')}
                >
                  B
                </button>
                <button 
                  className={`format-btn ${element.style.fontStyle === 'italic' ? 'active' : ''}`}
                  onClick={() => handleStyleChange('fontStyle', element.style.fontStyle === 'italic' ? 'normal' : 'italic')}
                >
                  I
                </button>
                <button 
                  className={`format-btn ${element.style.textDecoration === 'underline' ? 'active' : ''}`}
                  onClick={() => handleStyleChange('textDecoration', element.style.textDecoration === 'underline' ? 'none' : 'underline')}
                >
                  U
                </button>
              </div>
            </div>
            <div className="align-options">
              <button 
                className={`align-btn ${element.style.textAlign === 'left' ? 'active' : ''}`}
                onClick={() => handleStyleChange('textAlign', 'left')}
              >
                <div className="align-icon align-left">
                  <div className="align-line"></div>
                  <div className="align-line short"></div>
                  <div className="align-line medium"></div>
                </div>
              </button>
              <button 
                className={`align-btn ${element.style.textAlign === 'center' ? 'active' : ''}`}
                onClick={() => handleStyleChange('textAlign', 'center')}
              >
                <div className="align-icon align-center">
                  <div className="align-line"></div>
                  <div className="align-line short"></div>
                  <div className="align-line medium"></div>
                </div>
              </button>
              <button 
                className={`align-btn ${element.style.textAlign === 'right' ? 'active' : ''}`}
                onClick={() => handleStyleChange('textAlign', 'right')}
              >
                <div className="align-icon align-right">
                  <div className="align-line"></div>
                  <div className="align-line short"></div>
                  <div className="align-line medium"></div>
                </div>
              </button>
              <button 
                className={`align-btn ${element.style.textAlign === 'justify' ? 'active' : ''}`}
                onClick={() => handleStyleChange('textAlign', 'justify')}
              >
                <div className="align-icon align-justify">
                  <div className="align-line"></div>
                  <div className="align-line"></div>
                  <div className="align-line"></div>
                </div>
              </button>
            </div>
          </div>

          <div className="property-header">
            <h3>SPACING</h3>
            <button className="reset-btn" onClick={() => {
              handleResetStyle('letterSpacing');
              handleResetStyle('lineHeight');
            }}>Reset</button>
          </div>
          
          <div className="property-group">
            <div className="spacing-control">
              <label>LETTER SPACING</label>
              <div className="slider-container">
                <input 
                  type="range" 
                  min="-2" 
                  max="10" 
                  step="0.1"
                  value={parseFloat(element.style.letterSpacing) || 0} 
                  onChange={(e) => handleStyleChange('letterSpacing', `${e.target.value}px`)}
                  className="slider"
                />
                <div className="size-input-container">
                  <input 
                    type="text" 
                    value={`${parseInt((parseFloat(element.style.letterSpacing) || 0) * 100)}%`} 
                    readOnly
                    className="size-input"
                  />
                </div>
              </div>
            </div>
            
            <div className="spacing-control">
              <label>LINE HEIGHT</label>
              <div className="slider-container">
                <input 
                  type="range" 
                  min="0.5" 
                  max="3" 
                  step="0.01"
                  value={parseFloat(element.style.lineHeight) || 1.5} 
                  onChange={(e) => handleStyleChange('lineHeight', e.target.value)}
                  className="slider"
                />
                <div className="size-input-container">
                  <input 
                    type="text" 
                    value={parseFloat(element.style.lineHeight) || 1.5} 
                    readOnly
                    className="size-input"
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      
      {element.type === 'image' && (
        <>
          <div className="property-header">
            <h3>EDIT IMAGE</h3>
            <button className="reset-btn" onClick={() => handleResetStyle('all')}>Clear</button>
          </div>
          
          <div className="property-group">
            <div className="upload-container">
              <label htmlFor="image-upload" className="upload-btn">Upload Image</label>
              <input 
                id="image-upload" 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                style={{ display: 'none' }} 
              />
              <p className="or-divider">OR</p>
              <input 
                type="text" 
                value={element.content} 
                onChange={handleContentChange}
                placeholder="Image URL"
                className="full-width-input"
              />
            </div>
            
            <div className="image-preview">
              {element.content && (
                <img 
                  src={element.content} 
                  alt="Preview" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '150px',
                    objectFit: element.style.objectFit || 'contain',
                    borderRadius: element.style.borderRadius || '0px',
                    opacity: element.style.opacity || 1
                  }} 
                />
              )}
            </div>
          </div>
          
          <div className="property-header">
            <h3>IMAGE SETTINGS</h3>
            <button className="reset-btn" onClick={() => handleResetStyle('imageSettings')}>Reset</button>
          </div>
          
          <div className="property-group">
            <div className="property-row">
              <label>FIT</label>
              <select 
                value={element.style.objectFit || 'contain'} 
                onChange={(e) => handleStyleChange('objectFit', e.target.value)}
                className="style-select"
              >
                <option value="contain">Contain</option>
                <option value="cover">Cover</option>
                <option value="fill">Fill</option>
                <option value="none">None</option>
              </select>
            </div>
            
            <div className="property-row property-slider">
              <label>BORDER RADIUS</label>
              <div className="modern-slider-container">
                <input 
                  type="range" 
                  min="0" 
                  max="50" 
                  value={parseInt(element.style.borderRadius) || 0} 
                  onChange={(e) => {
                    const value = e.target.value;
                    e.target.style.setProperty('--value-percent', `${value * 2}%`);
                    handleStyleChange('borderRadius', `${value}px`);
                  }}
                  className="modern-slider"
                  style={{ '--value-percent': `${(parseInt(element.style.borderRadius) || 0) * 2}%` }}
                />
                <div className="slider-value">{parseInt(element.style.borderRadius) || 0}px</div>
              </div>
            </div>
            
            <div className="property-row property-slider">
              <label>OPACITY</label>
              <div className="modern-slider-container">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={Math.round((element.style.opacity || 1) * 100)} 
                  onChange={(e) => {
                    const value = e.target.value;
                    e.target.style.setProperty('--value-percent', `${value}%`);
                    handleStyleChange('opacity', value / 100);
                  }}
                  className="modern-slider"
                  style={{ '--value-percent': `${Math.round((element.style.opacity || 1) * 100)}%` }}
                />
                <div className="slider-value">{Math.round((element.style.opacity || 1) * 100)}%</div>
              </div>
            </div>
          </div>
        </>
      )}
      
      {element.type === 'video' && (
        <>
          <div className="property-header">
            <h3>EDIT VIDEO</h3>
            <button className="reset-btn" onClick={() => updateElement(element.id, { content: '' })}>Clear</button>
          </div>
          
          <div className="property-group">
            <div className="upload-container">
              <label htmlFor="video-upload" className="upload-btn">Upload Video</label>
              <input 
                id="video-upload" 
                type="file" 
                accept="video/*" 
                onChange={handleVideoUpload}
                style={{ display: 'none' }} 
              />
              <p className="or-divider">OR</p>
              <input 
                type="text" 
                value={element.content} 
                onChange={handleContentChange}
                placeholder="Video URL (YouTube or direct link)"
                className="full-width-input"
              />
            </div>
            
            {element.content && !element.content.includes('youtube') && !element.content.includes('youtu.be') && (
              <div className="video-preview">
                <video src={element.content} controls style={{ maxWidth: '100%', maxHeight: '150px' }}></video>
              </div>
            )}
            
            {element.content && (element.content.includes('youtube') || element.content.includes('youtu.be')) && (
              <div className="video-preview">
                <div>YouTube video will appear on canvas</div>
              </div>
            )}
          </div>
        </>
      )}
      
      {element.type === 'shape' && renderShapeProperties()}
    </div>
  );
}

export default ElementProperties; 