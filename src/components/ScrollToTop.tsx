import React, { useEffect, useState } from 'react';

const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    const textarea = document.querySelector('textarea');
    const previewContainer = document.querySelector('.overflow-auto');
    
    const scrollY = Math.max(
      window.scrollY,
      textarea?.scrollTop || 0,
      previewContainer?.scrollTop || 0
    );

    setIsVisible(scrollY > 300);
  };

  const scrollToTop = () => {
    // 滚动窗口
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    // 滚动编辑器
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }

    // 滚动预览区域
    const previewContainer = document.querySelector('.overflow-auto');
    if (previewContainer) {
      previewContainer.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    
    // 监听编辑器和预览容器的滚动
    const textarea = document.querySelector('textarea');
    const previewContainer = document.querySelector('.overflow-auto');
    
    textarea?.addEventListener('scroll', toggleVisibility);
    previewContainer?.addEventListener('scroll', toggleVisibility);

    // 定期检查并重新绑定事件（因为编辑器容器可能会重新创建）
    const intervalId = setInterval(() => {
      const newTextarea = document.querySelector('textarea');
      if (newTextarea && newTextarea !== textarea) {
        textarea?.removeEventListener('scroll', toggleVisibility);
        newTextarea.addEventListener('scroll', toggleVisibility);
      }
    }, 1000);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      textarea?.removeEventListener('scroll', toggleVisibility);
      previewContainer?.removeEventListener('scroll', toggleVisibility);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <button
      onClick={scrollToTop}
      className={`fixed right-6 bottom-20 z-[2000] p-2
        bg-blue-50 hover:bg-blue-100
        border border-blue-200 hover:border-blue-300
        rounded-md shadow-sm
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
        strokeWidth="1.5"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  );
};

export default ScrollToTop; 