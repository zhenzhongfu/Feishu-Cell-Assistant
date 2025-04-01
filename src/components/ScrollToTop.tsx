import React, { useEffect, useState } from 'react';

const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    const textarea = document.querySelector('textarea');
    const editorScrollable = document.querySelector('.editor-scrollable-container');
    const previewScrollable = document.querySelector('.preview-scrollable-container');
    const scrollContainers = document.querySelectorAll('.overflow-auto');
    
    let maxScroll = 0;
    
    if (textarea) {
      maxScroll = Math.max(maxScroll, textarea.scrollTop);
    }
    
    if (textarea?.parentElement) {
      maxScroll = Math.max(maxScroll, textarea.parentElement.scrollTop);
    }
    
    scrollContainers.forEach(container => {
      if (container instanceof HTMLElement) {
        maxScroll = Math.max(maxScroll, container.scrollTop);
      }
    });
    
    if (editorScrollable instanceof HTMLElement) {
      maxScroll = Math.max(maxScroll, editorScrollable.scrollTop);
    }
    
    if (previewScrollable instanceof HTMLElement) {
      maxScroll = Math.max(maxScroll, previewScrollable.scrollTop);
    }

    const threshold = 100;
    setIsVisible(maxScroll > threshold);
  };

  const scrollToTop = () => {
    const textarea = document.querySelector('textarea');
    const scrollContainers = document.querySelectorAll('.overflow-auto');
    
    if (textarea) {
      textarea.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
    
    scrollContainers.forEach(container => {
      if (container instanceof HTMLElement) {
        container.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    });
    
    const editorScrollable = document.querySelector('.editor-scrollable-container');
    const previewScrollable = document.querySelector('.preview-scrollable-container');
    
    if (editorScrollable instanceof HTMLElement) {
      editorScrollable.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
    
    if (previewScrollable instanceof HTMLElement) {
      previewScrollable.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const addScrollListeners = () => {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.addEventListener('scroll', toggleVisibility);
      }
      
      document.querySelectorAll('.overflow-auto').forEach(container => {
        container.addEventListener('scroll', toggleVisibility);
      });
      
      const editorScrollable = document.querySelector('.editor-scrollable-container');
      const previewScrollable = document.querySelector('.preview-scrollable-container');
      
      if (editorScrollable) {
        editorScrollable.addEventListener('scroll', toggleVisibility);
      }
      
      if (previewScrollable) {
        previewScrollable.addEventListener('scroll', toggleVisibility);
      }
    };
    
    const removeScrollListeners = () => {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.removeEventListener('scroll', toggleVisibility);
      }
      
      document.querySelectorAll('.overflow-auto').forEach(container => {
        container.removeEventListener('scroll', toggleVisibility);
      });
      
      const editorScrollable = document.querySelector('.editor-scrollable-container');
      const previewScrollable = document.querySelector('.preview-scrollable-container');
      
      if (editorScrollable) {
        editorScrollable.removeEventListener('scroll', toggleVisibility);
      }
      
      if (previewScrollable) {
        previewScrollable.removeEventListener('scroll', toggleVisibility);
      }
    };
    
    addScrollListeners();
    
    const intervalId = setInterval(() => {
      removeScrollListeners();
      addScrollListeners();
      toggleVisibility();
    }, 1000);

    toggleVisibility();

    return () => {
      removeScrollListeners();
      clearInterval(intervalId);
    };
  }, []);

  return (
    <button
      onClick={scrollToTop}
      className={`fixed right-6 bottom-20 z-[9999] p-3
        bg-blue-50 hover:bg-blue-100
        border border-blue-200 hover:border-blue-300
        rounded-md shadow-lg
        transition-all duration-200 ease-in-out
        transform hover:scale-105 active:scale-95
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}
        group
      `}
      title="回到顶部"
    >
      <svg
        className="w-5 h-5 text-blue-600 group-hover:text-blue-700 transition-colors"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  );
};

export default ScrollToTop; 