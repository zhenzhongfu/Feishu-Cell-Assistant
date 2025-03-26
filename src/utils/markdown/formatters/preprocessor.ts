/**
 * Markdown 预处理器
 */
import { decodeHTML } from '../helpers/htmlHelpers';
import { normalizeOrderedLists } from './listFormatters';

/**
 * 预处理 Markdown 内容，确保各种格式特性能被正确解析
 * @param markdown 原始 Markdown 文本
 * @returns 预处理后的 Markdown 文本
 */
export const preprocessMarkdown = (markdown: string): string => {
  // 确保输入是字符串
  if (typeof markdown !== 'string') {
    console.warn('preprocessMarkdown: 输入不是字符串类型，尝试转换', markdown);
    return String(markdown || '');
  }

  try {
    // 先解码HTML实体
    const decodedMarkdown = decodeHTML(markdown);
    
    // 统一换行符
    let processedMarkdown = decodedMarkdown.replace(/\r\n/g, '\n');
    
    // 规范化有序列表格式
    processedMarkdown = normalizeOrderedLists(processedMarkdown);
    
    // 确保列表项被正确识别 - 针对可能的格式问题
    // 1. 检查每行开头，如果是 "• " 这样的圆点符号，替换为 Markdown 标准的 "- "
    processedMarkdown = processedMarkdown.replace(/^([ \t]*)([•●◦○])[ \t]+/gm, '$1- ');
    processedMarkdown = processedMarkdown.replace(/\n([ \t]*)([•●◦○])[ \t]+/g, '\n$1- ');
    
    // 确保文档开头的列表项有足够的空行
    if (/^[\s]*[-*+][\s]/.test(processedMarkdown)) {
      processedMarkdown = '\n\n' + processedMarkdown;
    }
    
    // 确保文档开头的有序列表项有足够的空行
    if (/^[\s]*\d+\.[\s]/.test(processedMarkdown)) {
      processedMarkdown = '\n\n' + processedMarkdown;
    }
    
    // 确保列表项之前有空行（针对无序列表）
    processedMarkdown = processedMarkdown.replace(
      /([^\n])\n([ \t]*)[-*+][ \t]+/g,
      '$1\n\n$2- '
    );
    
    // 确保有序列表项之前有空行，并保留列表编号
    processedMarkdown = processedMarkdown.replace(
      /([^\n])\n([ \t]*)(\d+)\.[ \t]+/g,
      '$1\n\n$2$3. '
    );
    
    // 处理无序列表项格式
    processedMarkdown = processedMarkdown.replace(
      /(\n\n)([ \t]*)[-*+][ \t]+([^\n]+)/g,
      '$1$2- $3'
    );
    
    // 处理有序列表项格式，确保格式正确
    processedMarkdown = processedMarkdown.replace(
      /(\n\n)([ \t]*)(\d+)\.[ \t]+([^\n]+)/g,
      '$1$2$3. $4'
    );
    
    // 确保连续的有序列表项被识别为一个列表
    processedMarkdown = processedMarkdown.replace(
      /(\n)([ \t]*)(\d+)\.[ \t]+([^\n]+)(\n+)([ \t]*)(\d+)\.[ \t]+/g,
      '$1$2$3. $4\n$6$7. '
    );
    
    // 确保连续的无序列表项被识别为一个列表
    processedMarkdown = processedMarkdown.replace(
      /(\n)([ \t]*)[-*+][ \t]+([^\n]+)(\n+)([ \t]*)[-*+][ \t]+/g,
      '$1$2- $3\n$5- '
    );
    
    // 确保代码块前后有空行
    processedMarkdown = processedMarkdown.replace(/([^\n])\n```/g, '$1\n\n```');
    processedMarkdown = processedMarkdown.replace(/```\n([^\n])/g, '```\n\n$1');
    
    // 处理GFM警告提示语法支持
    processedMarkdown = processedMarkdown.replace(
      /\n\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](.*?)(?=\n\[!|\n\n|$)/gs,
      (_match, type, content) => {
        return `\n\n[!${type}]${content.trim()}\n\n`;
      }
    );
    
    // 处理看起来像有序列表但没有正确格式化的内容
    // 例如：如果发现 "1. " 这样的内容但没有被识别为列表
    processedMarkdown = processedMarkdown.replace(
      /^([\s]*)(\d+)\.[\s]+([^\n]+)$/gm,
      (_, space, num, content) => {
        // 确保这一行前后有空行
        return `\n${space}${num}. ${content}\n`;
      }
    );
    
    return processedMarkdown;
  } catch (e) {
    console.error('preprocessMarkdown 处理错误:', e);
    return markdown; // 出错时返回原始输入
  }
}; 