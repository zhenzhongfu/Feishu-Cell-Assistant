/**
 * 文本格式化工具函数
 */

/**
 * 处理嵌套引用，确保多层引用被正确识别和格式化
 * @param markdown Markdown文本
 * @returns 处理后的Markdown文本
 */
export const processNestedQuotes = (markdown: string): string => {
  if (typeof markdown !== 'string') {
    console.warn('processNestedQuotes: 输入不是字符串类型');
    return String(markdown || '');
  }

  try {
    // 匹配所有引用段落（以>开头的段落）
    const quoteRegex = /((^|\n)>.*(\n>.*)*)/g;
    
    return markdown.replace(quoteRegex, (quoteBlock) => {
      // 分割为行
      const lines = quoteBlock.split('\n');
      
      // 处理每一行，规范化 > 符号的数量和位置
      const processedLines = lines.map(line => {
        // 跳过空行
        if (!line.trim()) return line;
        
        // 统计行首的 > 符号数量
        const match = line.match(/^(\s*>+\s*)/);
        
        if (match) {
          const prefix = match[1];
          const quoteLevel = (prefix.match(/>/g) || []).length;
          const content = line.substring(prefix.length);
          
          // 规范化引用符号格式：确保每个 > 后有一个空格
          return `${'> '.repeat(quoteLevel)}${content}`;
        }
        
        return line;
      });
      
      return processedLines.join('\n');
    });
  } catch (error) {
    console.error('处理嵌套引用时出错:', error);
    return markdown;
  }
};

/**
 * 处理链接格式，修复常见问题
 * @param markdown Markdown文本
 * @returns 处理后的Markdown文本
 */
export const normalizeLinks = (markdown: string): string => {
  if (typeof markdown !== 'string') {
    console.warn('normalizeLinks: 输入不是字符串类型');
    return String(markdown || '');
  }

  try {
    let result = markdown;
    
    // 修复没有括号的链接: [text]url -> [text](url)
    result = result.replace(/\[([^\]]+)\]([^(](?:(?!\[|\)).)+)(?!\()/g, (_, text, url) => {
      return `[${text}](${url.trim()})`;
    });
    
    // 修复格式错误的链接: [text](url不带括号 -> [text](url)
    result = result.replace(/\[([^\]]+)\]\(([^)]+)(?!\))/g, (_, text, url) => {
      return `[${text}](${url.trim()})`;
    });
    
    // 修复自动链接: <url> 确保正确格式
    result = result.replace(/<(https?:\/\/[^>]+)>/g, (_, url) => {
      return `<${url.trim()}>`;
    });
    
    // 修复引用链接格式: [text][ref]
    result = result.replace(/\[([^\]]+)\]\[([^\]]+)\]/g, (_, text, ref) => {
      return `[${text}][${ref.trim()}]`;
    });
    
    return result;
  } catch (error) {
    console.error('处理链接格式时出错:', error);
    return markdown;
  }
};

/**
 * 修复标题层级，确保标题层级合理
 * - 文档应该只有一个一级标题
 * - 标题应该按层级递增，不应跳级
 * @param markdown Markdown文本
 * @returns 处理后的Markdown文本
 */
export const fixHeadingHierarchy = (markdown: string): string => {
  if (typeof markdown !== 'string') {
    console.warn('fixHeadingHierarchy: 输入不是字符串类型');
    return String(markdown || '');
  }

  try {
    // 解析所有标题
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const headings: {level: number; text: string; pos: number}[] = [];
    let match;
    
    while ((match = headingRegex.exec(markdown)) !== null) {
      headings.push({
        level: match[1].length,
        text: match[2],
        pos: match.index
      });
    }
    
    // 如果没有标题，直接返回
    if (headings.length === 0) return markdown;
    
    // 分析标题层级
    const minLevel = Math.min(...headings.map(h => h.level));
    
    // 如果最小层级已经是1，则不需要调整
    if (minLevel === 1) return markdown;
    
    // 调整所有标题层级，使最小层级为1
    const levelAdjustment = minLevel - 1;
    let result = markdown;
    
    // 从后往前替换，避免位置变化
    for (let i = headings.length - 1; i >= 0; i--) {
      const heading = headings[i];
      const newLevel = heading.level - levelAdjustment;
      
      // 构建替换字符串
      const oldHeading = markdown.substring(
        heading.pos, 
        heading.pos + heading.level + heading.text.length + 1
      );
      const newHeading = `${'#'.repeat(newLevel)} ${heading.text}`;
      
      // 替换标题
      result = result.substring(0, heading.pos) + 
               newHeading + 
               result.substring(heading.pos + oldHeading.length);
    }
    
    return result;
  } catch (error) {
    console.error('修复标题层级时出错:', error);
    return markdown;
  }
};

/**
 * 规范化水平分隔线格式
 * @param markdown Markdown文本
 * @returns 处理后的Markdown文本
 */
export const normalizeHorizontalRules = (markdown: string): string => {
  if (typeof markdown !== 'string') {
    console.warn('normalizeHorizontalRules: 输入不是字符串类型');
    return String(markdown || '');
  }

  try {
    // 规范化各种水平分隔线的格式
    let result = markdown;
    
    // 将 --- 或 *** 或 ___ 形式的水平线统一为 ---
    result = result.replace(/^[ \t]*([-*_]{3,})[ \t]*$/gm, '---');
    
    // 确保水平线前后有空行
    result = result.replace(/([^\n])(\n---\n)/g, '$1\n\n---\n');
    result = result.replace(/(\n---)(\n[^\n])/g, '\n---\n\n$2');
    
    return result;
  } catch (error) {
    console.error('规范化水平分隔线时出错:', error);
    return markdown;
  }
}; 