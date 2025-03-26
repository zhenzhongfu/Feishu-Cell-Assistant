/**
 * Markdown 列表格式化工具
 */

/**
 * 规范化有序列表格式
 * @param markdown 原始 Markdown 文本
 * @returns 格式化后的 Markdown
 */
export const normalizeOrderedLists = (markdown: string): string => {
  // 确保输入是字符串
  if (typeof markdown !== 'string') {
    console.warn('normalizeOrderedLists: 输入不是字符串类型', markdown);
    return '';
  }

  try {
    let result = markdown;
    
    // 识别可能的有序列表模式
    const orderedListPatterns = [
      // 匹配标准的有序列表：1. 项目
      /^(\s*)(\d+)\.(\s+)(.+)$/gm,
      // 匹配没有空格的有序列表：1.项目
      /^(\s*)(\d+)\.(\S+.*)$/gm,
      // 匹配使用括号的有序列表：1) 项目
      /^(\s*)(\d+)\)(\s+)(.+)$/gm,
      // 匹配没有空格的括号列表：1)项目
      /^(\s*)(\d+)\)(\S+.*)$/gm
    ];
    
    // 应用每个模式，转换为标准Markdown有序列表格式
    orderedListPatterns.forEach(pattern => {
      result = result.replace(pattern, (match, space, num, separator, content) => {
        try {
          if (!separator || typeof separator !== 'string') {
            separator = ' ';
          }
          const safeContent = typeof content === 'string' ? content.trim() : '';
          const safeSpace = typeof space === 'string' ? space : '';
          const safeNum = typeof num === 'string' ? num : '1';
          
          return `${safeSpace}${safeNum}. ${safeContent}`;
        } catch (e) {
          console.error('列表项处理错误:', e);
          return match; // 出错时返回原始匹配内容
        }
      });
    });
    
    // 确保连续的有序列表项之间不会有多余的空行
    result = result.replace(
      /^(\s*)(\d+)\.(\s+)(.+)(\n+)(\s*)(\d+)\.(\s+)/gm,
      (_match, space1, num1, _sep1, content, newlines, space2, num2) => {
        try {
          const safeNewlines = typeof newlines === 'string' && newlines.length > 1 ? '\n' : newlines;
          return `${space1}${num1}. ${content}${safeNewlines}${space2}${num2}. `;
        } catch (e) {
          console.error('列表间距处理错误:', e);
          return _match;
        }
      }
    );
    
    return result;
  } catch (e) {
    console.error('normalizeOrderedLists 处理错误:', e);
    return markdown; // 出错时返回原始输入
  }
}; 