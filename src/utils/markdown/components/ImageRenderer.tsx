import React, { useState } from 'react';
import { cleanImageUrl } from '../helpers/htmlHelpers';

interface ImageRendererProps {
  src: string;
  alt?: string;
  title?: string;
  className?: string;
  onError?: (error: Error) => void;
}

/**
 * 增强的Markdown图片渲染组件
 * 提供图片放大、错误处理等功能
 */
const ImageRenderer: React.FC<ImageRendererProps> = ({
  src,
  alt = '',
  title = '',
  className = '',
  onError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  
  // 清理图片URL
  const cleanedSrc = cleanImageUrl(src);
  
  // 处理图片加载完成
  const handleImageLoaded = () => {
    setIsLoading(false);
  };
  
  // 处理图片加载错误
  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
    
    if (onError) {
      onError(new Error(`图片加载失败: ${src}`));
    }
  };
  
  // 切换图片缩放状态
  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };
  
  if (hasError) {
    return (
      <div className={`inline-block max-w-full p-2 border border-dashed border-gray-300 rounded text-red-600 text-sm ${className}`}>
        <span role="img" aria-label="error" className="mr-2">⚠️</span>
        图片加载失败: {alt || src}
      </div>
    );
  }
  
  return (
    <div
      className={`${
        isZoomed
          ? 'fixed inset-0 flex items-center justify-center bg-black/80 z-50 p-8'
          : 'inline-block overflow-hidden max-w-full my-2'
      } ${className}`}
      onClick={toggleZoom}
    >
      {isLoading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-600">
          加载中...
        </div>
      )}
      
      <img
        src={cleanedSrc}
        alt={alt}
        title={title || alt}
        className={`${
          isZoomed
            ? 'max-w-[90vw] max-h-[90vh] object-contain cursor-zoom-out'
            : 'max-w-full h-auto cursor-zoom-in'
        } transition-all duration-300`}
        onLoad={handleImageLoaded}
        onError={handleImageError}
        loading="lazy"
      />
      
      {isZoomed && (
        <div className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded text-sm">
          点击退出全屏
        </div>
      )}
      
      {alt && !isZoomed && (
        <div className="text-sm text-center text-gray-600 mt-1 max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
          {alt}
        </div>
      )}
    </div>
  );
};

export default ImageRenderer; 