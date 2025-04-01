/**
 * 数学公式处理工具函数
 */

/**
 * 处理 TeX 数学公式，确保格式正确
 * @param markdown Markdown文本
 * @returns 处理后的Markdown文本
 */
export const normalizeTeXMath = (markdown: string): string => {
  if (typeof markdown !== 'string') {
    return String(markdown || '');
  }

  try {
    let result = markdown;
    
    // 处理行内公式 $formula$
    // 确保 $ 符号前后有正确的空格
    result = result.replace(/([^\s$])\$([^$\n]+?)\$([^\s$])/g, '$1 $$$2$$ $3');
    
    // 处理行间公式 $$formula$$
    // 确保行间公式前后有空行
    result = result.replace(/([^\n])\n\$\$/g, '$1\n\n$$');
    result = result.replace(/\$\$\n([^\n])/g, '$$\n\n$1');
    
    // 修复错误嵌套的公式
    result = result.replace(/\$(\$[^$]*\$)\$/g, '$$$1$$');
    
    // 处理可能缺少配对符号的情况
    let inlineCount = (result.match(/\$/g) || []).length;
    let displayCount = (result.match(/\$\$/g) || []).length * 2;
    
    // 如果 $ 符号总数是奇数，尝试检测并修复
    if ((inlineCount - displayCount) % 2 !== 0) {
      // 尝试查找可能缺少闭合符号的行内公式
      result = result.replace(/(\$[^$\n]+)(\n|$)/g, (match, formula, end) => {
        // 如果公式部分没有闭合，添加闭合符号
        if ((formula.match(/\$/g) || []).length === 1) {
          return `${formula}$${end}`;
        }
        return match;
      });
    }
    
    return result;
  } catch (error) {
    return markdown;
  }
};

/**
 * 检测内容中是否包含数学公式
 * @param content Markdown文本
 * @returns 是否包含数学公式
 */
export const containsMathFormula = (content: string): boolean => {
  if (typeof content !== 'string') return false;
  
  // 检测行内公式 $formula$（避免检测到货币符号）
  const inlinePattern = /(?<!\$)\$(?!\$)([^\$\n]+?)(?<!\$)\$(?!\$)/;
  
  // 检测行间公式 $$formula$$
  const displayPattern = /\$\$([^$]*?)\$\$/;
  
  return inlinePattern.test(content) || displayPattern.test(content);
};

/**
 * 从内容中提取所有数学公式
 * @param content Markdown文本
 * @returns 提取的公式数组，每项包含公式类型和内容
 */
export const extractMathFormulas = (
  content: string
): Array<{ type: 'inline' | 'display'; formula: string }> => {
  if (typeof content !== 'string') return [];
  
  const formulas: Array<{ type: 'inline' | 'display'; formula: string }> = [];
  
  try {
    // 提取行内公式
    const inlinePattern = /(?<!\$)\$(?!\$)([^\$\n]+?)(?<!\$)\$(?!\$)/g;
    let inlineMatch;
    
    while ((inlineMatch = inlinePattern.exec(content)) !== null) {
      formulas.push({
        type: 'inline',
        formula: inlineMatch[1]
      });
    }
    
    // 提取行间公式
    const displayPattern = /\$\$([^$]*?)\$\$/g;
    let displayMatch;
    
    while ((displayMatch = displayPattern.exec(content)) !== null) {
      formulas.push({
        type: 'display',
        formula: displayMatch[1]
      });
    }
    
    return formulas;
  } catch (error) {
    return formulas;
  }
};

/**
 * 修复常见的数学公式错误
 * @param formula 数学公式内容（不包含分隔符 $ 或 $$）
 * @returns 修复后的公式
 */
export const fixCommonMathErrors = (formula: string): string => {
  if (typeof formula !== 'string') return String(formula || '');
  
  try {
    let fixed = formula;
    
    // 修复常见错误: \left 和 \right 不配对
    const leftCount = (fixed.match(/\\left/g) || []).length;
    const rightCount = (fixed.match(/\\right/g) || []).length;
    
    if (leftCount > rightCount) {
      // 缺少 \right，添加适当的 \right.
      fixed += ' \\right.'.repeat(leftCount - rightCount);
    } else if (rightCount > leftCount) {
      // 缺少 \left，添加适当的 \left.
      fixed = '\\left. '.repeat(rightCount - leftCount) + fixed;
    }
    
    // 修复大括号配对
    const openBraceCount = (fixed.match(/\{/g) || []).length;
    const closeBraceCount = (fixed.match(/\}/g) || []).length;
    
    if (openBraceCount > closeBraceCount) {
      // 缺少闭合括号
      fixed += '}'.repeat(openBraceCount - closeBraceCount);
    } else if (closeBraceCount > openBraceCount) {
      // 缺少开括号
      fixed = '{'.repeat(closeBraceCount - openBraceCount) + fixed;
    }
    
    // 修复其他常见错误
    // 修复缺少花括号的上下标
    fixed = fixed.replace(/\_([a-zA-Z0-9])([^a-zA-Z0-9]|$)/g, '_{$1}$2');
    fixed = fixed.replace(/\^([a-zA-Z0-9])([^a-zA-Z0-9]|$)/g, '^{$1}$2');
    
    // 修复空格问题
    fixed = fixed.replace(/\\frac\s+{/g, '\\frac{');
    
    return fixed;
  } catch (error) {
    return formula;
  }
};

/**
 * 数学公式格式化工具函数
 */

/**
 * 规范化行内数学公式格式
 * @param markdown Markdown文本
 * @returns 处理后的Markdown文本
 */
export const normalizeInlineMath = (markdown: string): string => {
  if (typeof markdown !== 'string') {
    return String(markdown || '');
  }

  try {
    let result = markdown;
    
    // 修复单个$符号的情况
    result = result.replace(/(?<!\$)\$(?!\$)([^$\n]+?)(?<!\$)\$(?!\$)/g, (_, math) => {
      return `$${math.trim()}$`;
    });
    
    // 修复不配对的$符号
    result = result.replace(/(?<!\$)\$(?!\$)([^$\n]+?)(?!\$)/g, (_, math) => {
      return `$${math.trim()}$`;
    });
    result = result.replace(/(?<!\$)([^$\n]+?)\$(?!\$)/g, (_, math) => {
      return `$${math.trim()}$`;
    });
    
    return result;
  } catch (error) {
    return markdown;
  }
};

/**
 * 规范化块级数学公式格式
 * @param markdown Markdown文本
 * @returns 处理后的Markdown文本
 */
export const normalizeBlockMath = (markdown: string): string => {
  if (typeof markdown !== 'string') {
    return String(markdown || '');
  }

  try {
    let result = markdown;
    
    // 修复块级数学公式格式
    result = result.replace(/(?<!\$)\$\$([\s\S]*?)\$\$(?!\$)/g, (_, math) => {
      const trimmedMath = math.trim();
      return `\n\$\$\n${trimmedMath}\n\$\$\n`;
    });
    
    // 确保块级公式前后有空行
    result = result.replace(/([^\n])\n\$\$/g, '$1\n\n$$');
    result = result.replace(/\$\$\n([^\n])/g, '$$\n\n$1');
    
    return result;
  } catch (error) {
    return markdown;
  }
}; 