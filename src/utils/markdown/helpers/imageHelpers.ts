/**
 * 图片处理工具函数
 */
import { cleanImageUrl } from './htmlHelpers';

/**
 * 检查URL是否为图片URL
 * @param url 要检查的URL
 * @returns 是否为图片URL
 */
export const isImageUrl = (url: string): boolean => {
  if (!url) return false;
  
  // 清理URL
  const cleanedUrl = cleanImageUrl(url);
  if (!cleanedUrl) return false;
  
  // 检查是否有图片扩展名
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
  const urlLower = cleanedUrl.toLowerCase();
  
  // 检查URL是否以图片扩展名结尾
  const hasImageExtension = imageExtensions.some(ext => urlLower.endsWith(ext));
  
  // 检查URL是否包含图片mime类型
  const hasImageMime = /image\/(jpeg|png|gif|bmp|webp|svg\+xml)/.test(urlLower);
  
  return hasImageExtension || hasImageMime;
};

/**
 * 从Markdown文本中提取图片URL
 * @param markdown Markdown文本
 * @returns 图片URL数组
 */
export const extractImagesFromMarkdown = (markdown: string): string[] => {
  if (!markdown || typeof markdown !== 'string') {
    return [];
  }
  
  const images: string[] = [];
  
  try {
    // 匹配Markdown图片语法 ![alt](url)
    const mdImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    
    while ((match = mdImageRegex.exec(markdown)) !== null) {
      const url = match[2].trim();
      if (url && isImageUrl(url)) {
        images.push(cleanImageUrl(url));
      }
    }
    
    // 匹配HTML图片标签 <img src="url" />
    const htmlImageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    
    while ((match = htmlImageRegex.exec(markdown)) !== null) {
      const url = match[1].trim();
      if (url && isImageUrl(url)) {
        images.push(cleanImageUrl(url));
      }
    }
    
    // 去重
    return [...new Set(images)];
  } catch (error) {
    console.error('提取图片时出错:', error);
    return images;
  }
};

/**
 * 替换Markdown中的图片URL
 * @param markdown Markdown文本
 * @param urlMap 图片URL映射 {旧URL: 新URL}
 * @returns 更新后的Markdown文本
 */
export const replaceImageUrls = (
  markdown: string,
  urlMap: Record<string, string>
): string => {
  if (!markdown || typeof markdown !== 'string' || !urlMap) {
    return markdown;
  }
  
  let updatedMarkdown = markdown;
  
  try {
    // 替换Markdown图片语法中的URL
    const mdImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    updatedMarkdown = updatedMarkdown.replace(mdImageRegex, (_match, alt, url) => {
      const cleanUrl = cleanImageUrl(url);
      const newUrl = urlMap[cleanUrl] || url;
      return `![${alt}](${newUrl})`;
    });
    
    // 替换HTML图片标签中的URL
    const htmlImageRegex = /(<img[^>]+src=)["']([^"']+)["']([^>]*>)/gi;
    updatedMarkdown = updatedMarkdown.replace(htmlImageRegex, (_match, prefix, url, suffix) => {
      const cleanUrl = cleanImageUrl(url);
      const newUrl = urlMap[cleanUrl] || url;
      return `${prefix}"${newUrl}"${suffix}`;
    });
    
    return updatedMarkdown;
  } catch (error) {
    console.error('替换图片URL时出错:', error);
    return markdown;
  }
}; 