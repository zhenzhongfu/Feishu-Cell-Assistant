/**
 * HTML 相关的辅助函数
 */

/**
 * 解码 HTML 实体
 * @param html 包含 HTML 实体的字符串
 * @returns 解码后的字符串
 */
export const decodeHTML = (html: string): string => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = html;
  return textarea.value;
};

/**
 * 清理和验证图片 URL
 * @param url 原始图片 URL
 * @returns 清理后的有效 URL 或空字符串
 */
export const cleanImageUrl = (url: string): string => {
  if (!url) return '';

  // 去除可能的引号和HTML实体
  let cleanUrl = url.trim().replace(/^['"]|['"]$/g, '');
  cleanUrl = decodeHTML(cleanUrl);
  
  // 修复常见URL问题
  if (cleanUrl.indexOf('placeholder.c') > 0 && !/placeholder\.com/.test(cleanUrl)) {
    cleanUrl = cleanUrl.replace('placeholder.c', 'placeholder.com');
  }
  
  // 确保URL是有效的
  try {
    // 尝试构造URL对象检查有效性
    new URL(cleanUrl);
    return cleanUrl;
  } catch (e) {
    // URL无效，检查是否是相对路径
    if (!cleanUrl.startsWith('http') && !cleanUrl.startsWith('data:')) {
      // 可能是相对URL，返回原样
      return cleanUrl;
    }
    console.error('无效的图片URL:', cleanUrl, e);
    return '';
  }
}; 