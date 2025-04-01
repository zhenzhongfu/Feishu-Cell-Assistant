/**
 * Markdown 预处理器
 */
// import { decodeHTML } from '../helpers/htmlHelpers';
// import { normalizeOrderedLists } from './listFormatters';

/**
 * 预处理 Markdown 内容，确保各种格式特性能被正确解析
 * @param markdown 原始 Markdown 文本
 * @returns 预处理后的 Markdown 文本
 */
export const preprocessMarkdown = (markdown: string): string => {
  if (typeof markdown !== 'string') {
    return String(markdown || '');
  }

  try {
    let result = markdown;
    
    // 统一换行符
    result = result.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // 移除文件开头的空行
    result = result.replace(/^\n+/, '');
    
    // 移除文件结尾的空行
    result = result.replace(/\n+$/, '');
    
    // 将连续的多个空行替换为两个空行
    result = result.replace(/\n{3,}/g, '\n\n');
    
    // 处理特殊字符
    result = result
      // 处理Windows特殊字符
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      // 处理制表符
      .replace(/\t/g, '    ')
      // 处理行尾空格（保留代码块和表格中的空格）
      .split('\n')
      .map(line => {
        // 如果是代码块或表格行，保持不变
        if (line.startsWith('    ') || line.startsWith('```') || line.includes('|')) {
          return line;
        }
        // 否则移除行尾空格
        return line.replace(/\s+$/, '');
      })
      .join('\n');
    
    return result;
  } catch (error) {
    return markdown;
  }
};

/**
 * 后处理 Markdown 文本
 * - 确保文件以换行符结尾
 * - 规范化空行
 * @param markdown Markdown 文本
 * @returns 处理后的 Markdown 文本
 */
export const postprocessMarkdown = (markdown: string): string => {
  if (typeof markdown !== 'string') {
    return String(markdown || '');
  }

  try {
    let result = markdown;
    
    // 确保文件以单个换行符结尾
    result = result.replace(/\n*$/, '\n');
    
    // 规范化空行：确保块级元素之间有且仅有一个空行
    result = result
      .split('\n')
      .reduce((lines: string[], line: string, index: number, array: string[]) => {
        const currentLine = line.trim();
        const nextLine = array[index + 1]?.trim() || '';
        
        // 添加当前行
        lines.push(line);
        
        // 如果当前行和下一行都不为空，且其中一个是块级元素的开始
        if (currentLine && nextLine && (
          currentLine.startsWith('#') ||
          currentLine.startsWith('>') ||
          currentLine.startsWith('```') ||
          currentLine.startsWith('---') ||
          currentLine.startsWith('- ') ||
          currentLine.startsWith('* ') ||
          currentLine.startsWith('1. ') ||
          nextLine.startsWith('#') ||
          nextLine.startsWith('>') ||
          nextLine.startsWith('```') ||
          nextLine.startsWith('---') ||
          nextLine.startsWith('- ') ||
          nextLine.startsWith('* ') ||
          nextLine.startsWith('1. ')
        )) {
          // 添加一个空行
          lines.push('');
        }
        
        return lines;
      }, [])
      .join('\n');
    
    return result;
  } catch (error) {
    return markdown;
  }
}; 