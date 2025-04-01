/**
 * Markdown格式化工具
 * 用于美化和标准化Markdown文本
 */

import { preprocessMarkdown, postprocessMarkdown } from './preprocessor';
import { normalizeCodeBlocks, normalizeInlineCode } from './codeFormatters';
import { normalizeInlineMath, normalizeBlockMath } from './mathFormatters';
import { normalizeTables } from './tableFormatters';
import { normalizeLinks, processNestedQuotes, fixHeadingHierarchy, normalizeHorizontalRules } from './textFormatters';

/**
 * 格式化Markdown文本
 * @param markdown 原始Markdown文本
 * @returns 格式化后的Markdown文本
 */
export const formatMarkdown = (markdown: string): string => {
  if (typeof markdown !== 'string') {
    return String(markdown || '');
  }

  try {
    // 预处理
    let result = preprocessMarkdown(markdown);
    
    // 格式化代码块和行内代码
    result = normalizeCodeBlocks(result);
    result = normalizeInlineCode(result);
    
    // 格式化数学公式
    result = normalizeInlineMath(result);
    result = normalizeBlockMath(result);
    
    // 格式化表格
    result = normalizeTables(result);
    
    // 格式化文本元素
    result = normalizeLinks(result);
    result = processNestedQuotes(result);
    result = fixHeadingHierarchy(result);
    result = normalizeHorizontalRules(result);
    
    // 后处理
    result = postprocessMarkdown(result);
    
    return result;
  } catch (error) {
    return markdown;
  }
};

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
    return text; // 出错时返回原文本
  }
}

export default {
  formatMarkdown,
  textToMarkdown
}; 