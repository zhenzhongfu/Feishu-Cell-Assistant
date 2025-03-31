import React, { useEffect, useState } from 'react';

const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    // 直接找到所有可能滚动的元素
    const textarea = document.querySelector('textarea');
    const editorScrollable = document.querySelector('.editor-scrollable-container');
    const previewScrollable = document.querySelector('.preview-scrollable-container');
    
    // 通用查找所有可能的滚动容器
    const scrollContainers = document.querySelectorAll('.overflow-auto');
    
    // 最大滚动位置
    let maxScroll = 0;
    
    // 检查textarea元素 - 这是编辑模式下最关键的滚动元素
    if (textarea) {
      // 在编辑模式中，实际是textarea在滚动
      maxScroll = Math.max(maxScroll, textarea.scrollTop);
      console.log('TextArea scrollTop:', textarea.scrollTop);
    }
    
    // 检查其父容器
    if (textarea?.parentElement) {
      maxScroll = Math.max(maxScroll, textarea.parentElement.scrollTop);
    }
    
    // 检查所有.overflow-auto元素
    scrollContainers.forEach(container => {
      if (container instanceof HTMLElement) {
        maxScroll = Math.max(maxScroll, container.scrollTop);
      }
    });
    
    // 特别检查编辑器和预览的滚动容器
    if (editorScrollable instanceof HTMLElement) {
      maxScroll = Math.max(maxScroll, editorScrollable.scrollTop);
    }
    
    if (previewScrollable instanceof HTMLElement) {
      maxScroll = Math.max(maxScroll, previewScrollable.scrollTop);
    }

    // 降低阈值，使按钮更容易出现
    const threshold = 100;
    
    console.log('ScrollToTop - 最大滚动位置:', maxScroll, '阈值:', threshold);
    
    setIsVisible(maxScroll > threshold);
  };

  const scrollToTop = () => {
    // 同时滚动所有可能的容器
    const textarea = document.querySelector('textarea');
    const scrollContainers = document.querySelectorAll('.overflow-auto');
    
    // 首先尝试滚动textarea - 这是编辑模式的关键
    if (textarea) {
      // 改为使用scrollTo实现平滑滚动
      textarea.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      console.log('执行textarea平滑滚动到顶部');
    }
    
    // 滚动所有可能的容器
    scrollContainers.forEach(container => {
      if (container instanceof HTMLElement) {
        container.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    });
    
    // 特别处理特定类名的容器
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
    
    console.log('ScrollToTop - 执行平滑滚动到顶部');
  };

  useEffect(() => {
    // 添加滚动事件监听
    const addScrollListeners = () => {
      // 关键 - 直接监听textarea元素，这对编辑模式至关重要
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.addEventListener('scroll', toggleVisibility);
        console.log('添加textarea滚动监听');
      }
      
      // 监听所有.overflow-auto容器
      document.querySelectorAll('.overflow-auto').forEach(container => {
        container.addEventListener('scroll', toggleVisibility);
      });
      
      // 监听特定容器
      const editorScrollable = document.querySelector('.editor-scrollable-container');
      const previewScrollable = document.querySelector('.preview-scrollable-container');
      
      if (editorScrollable) {
        editorScrollable.addEventListener('scroll', toggleVisibility);
      }
      
      if (previewScrollable) {
        previewScrollable.addEventListener('scroll', toggleVisibility);
      }
    };
    
    // 移除滚动事件监听
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
    
    // 初始添加事件监听
    addScrollListeners();
    
    // 采用更高频率的检查
    const intervalId = setInterval(() => {
      removeScrollListeners();
      addScrollListeners();
      toggleVisibility(); // 主动检查滚动位置
    }, 200); // 更高频率检查DOM变化

    // 初始检查，并设置延迟检查保证DOM已加载
    toggleVisibility();
    setTimeout(toggleVisibility, 500);
    setTimeout(toggleVisibility, 1000);

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