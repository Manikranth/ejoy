import React from 'react';
import './Sidebar.css';

function Sidebar({ addElement, isPreviewMode }) {
  if (isPreviewMode) return null;
  
  return (
    <div className="sidebar right-sidebar">
      <div className="sidebar-elements">
        <div className="sidebar-section">
          <button 
            className="sidebar-button"
            onClick={() => addElement('text')}
            title="Add Text"
          >
            <div className="icon-container">
              <span className="icon">T</span>
            </div>
            <span className="button-label">Text</span>
          </button>
          
          <button 
            className="sidebar-button"
            onClick={() => addElement('image')}
            title="Add Image"
          >
            <div className="icon-container">
              <svg width="24" height="24" viewBox="0 0 24 24" stroke="#666" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM5 19V5H19V19H5Z" strokeWidth="1.5" />
                <path d="M14.5 11L11 15.5L8.5 12.5L5 17H19L14.5 11Z" strokeWidth="1.5" />
              </svg>
            </div>
            <span className="button-label">Image</span>
          </button>
          
          <button 
            className="sidebar-button"
            onClick={() => addElement('video')}
            title="Add Video"
          >
            <div className="icon-container">
              <svg width="24" height="24" viewBox="0 0 24 24" stroke="#666" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="3" strokeWidth="1.5" />
              </svg>
            </div>
            <span className="button-label">Uploads</span>
          </button>

          <button 
            className="sidebar-button"
            onClick={() => addElement('shape')}
            title="Add Shape"
          >
            <div className="icon-container">
              <svg width="24" height="24" viewBox="0 0 24 24" stroke="#666" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="6" height="6" rx="1" strokeWidth="1.5" />
                <rect x="15" y="3" width="6" height="6" rx="1" strokeWidth="1.5" />
                <rect x="15" y="15" width="6" height="6" rx="1" strokeWidth="1.5" />
                <path d="M9 15L3 21M3 15L9 21" strokeWidth="1.5" />
              </svg>
            </div>
            <span className="button-label">Shape</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar; 