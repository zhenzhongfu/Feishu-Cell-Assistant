/**
 * Markdown格式化工具
 * 用于美化和标准化Markdown文本
 */

/**
 * 格式化Markdown文本
 * @param markdown 原始Markdown文本
 * @returns 格式化后的Markdown文本
 */
export function formatMarkdown(markdown: string): string {
  if (!markdown) return '';
  
  try {
    let formatted = markdown;
    
    // 1. 规范化标题(确保#后有空格)
    formatted = formatted.replace(/^(#{1,6})([^#\s])/gm, '$1 $2');
    
    // 2. 规范化列表(确保-和*后有空格)
    formatted = formatted.replace(/^(\s*)([-*+])([^\s])/gm, '$1$2 $3');
    
    // 3. 规范化有序列表(确保数字.后有空格)
    formatted = formatted.replace(/^(\s*)(\d+\.)([^\s])/gm, '$1$2 $3');
    
    // 4. 在代码块前后添加空行
    formatted = formatted.replace(/([^\n])(\n```[^\n]*)/g, '$1\n$2');
    formatted = formatted.replace(/(```\n)([^\n])/g, '$1\n$2');
    
    // 5. 在标题前添加空行(除了文档开头)
    formatted = formatted.replace(/([^\n])\n(#{1,6}\s)/g, '$1\n\n$2');
    
    // 6. 确保段落之间有空行
    formatted = formatted.replace(/([^\n])\n([^\s#\-*>0-9\n])/g, '$1\n\n$2');
    
    // 7. 移除多余的空行(超过两个连续空行变为两个)
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    
    // 8. 规范化引用块(确保>后有空格)
    formatted = formatted.replace(/^(\s*)(>)([^\s])/gm, '$1$2 $3');
    
    // 9. 规范化表格分隔行，确保分隔符长度一致
    formatted = formatted.replace(
      /\|(\s*[-:]+\s*)\|(\s*[-:]+\s*)\|/g,
      (_match, p1, p2) => {
        const len1 = p1.trim().length;
        const len2 = p2.trim().length;
        const maxLen = Math.max(len1, len2);
        const newP1 = p1.trim().padEnd(maxLen, '-');
        const newP2 = p2.trim().padEnd(maxLen, '-');
        return `| ${newP1} | ${newP2} |`;
      }
    );
    
    // 10. 移除每行末尾的空格
    formatted = formatted.replace(/[ \t]+$/gm, '');
    
    return formatted;
  } catch (error) {
    console.error('格式化Markdown出错:', error);
    return markdown; // 出错时返回原文本
  }
}

/**
 * 将普通文本转换为Markdown文本
 * @param text 普通文本
 * @returns Markdown格式的文本
 */
export function textToMarkdown(text: string): string {
  if (!text) return '';
  
  try {
    // 将普通文本转换为基本的Markdown
    // 1. 转义特殊字符
    let markdown = text
      .replace(/([*_`~])/g, '\\$1')
      
      // 2. 将URL转换为链接
      .replace(/(https?:\/\/[^\s]+)/g, '[$1]($1)');
      
    return markdown;
  } catch (error) {
    console.error('将文本转换为Markdown出错:', error);
    return text; // 出错时返回原文本
  }
}

export default {
  formatMarkdown,
  textToMarkdown
}; 