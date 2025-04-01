/**
 * 代码区块格式化工具
 */

/**
 * 解析代码块中的语言和类名
 * @param info 代码块信息字符串，如 "javascript" 或 "js{1,3-5}"
 * @returns 包含语言和类名的对象
 */
export interface CodeBlockInfo {
  language: string;
  className: string;
  highlightLines?: number[];
}

/**
 * 解析代码块信息
 * @param info 代码块信息字符串
 * @returns 解析后的代码块信息
 */
export const parseCodeBlockInfo = (info: string): CodeBlockInfo => {
  if (!info) {
    return { language: '', className: '' };
  }

  // 移除前后空格
  const cleanInfo = info.trim();
  
  // 尝试匹配语言和类名 (例如 "javascript class-name")
  const parts = cleanInfo.split(/\s+/);
  const language = parts[0] || '';
  
  // 处理带有高亮行的情况 (例如 "js{1,3-5}")
  const lineHighlightMatch = language.match(/^([a-zA-Z0-9_+-]+)(\{.*\})$/);
  
  if (lineHighlightMatch) {
    const lang = lineHighlightMatch[1];
    const highlightInfo = lineHighlightMatch[2];
    const highlightLines = parseHighlightLines(highlightInfo);
    
    return {
      language: lang,
      className: parts.slice(1).join(' '),
      highlightLines
    };
  }
  
  // 常规处理
  return {
    language,
    className: parts.slice(1).join(' ')
  };
};

/**
 * 解析代码高亮行信息
 * @param highlightInfo 高亮信息字符串，如 "{1,3-5,7}"
 * @returns 高亮行数组，如 [1, 3, 4, 5, 7]
 */
const parseHighlightLines = (highlightInfo: string): number[] => {
  // 移除花括号
  const content = highlightInfo.replace(/^\{|\}$/g, '');
  const parts = content.split(',');
  const lines: number[] = [];
  
  parts.forEach(part => {
    // 处理单个行号 (例如 "1")
    if (/^\d+$/.test(part)) {
      lines.push(parseInt(part, 10));
    } 
    // 处理行范围 (例如 "3-5")
    else if (/^\d+-\d+$/.test(part)) {
      const [start, end] = part.split('-').map(n => parseInt(n, 10));
      for (let i = start; i <= end; i++) {
        lines.push(i);
      }
    }
  });
  
  // 排序并去重
  return [...new Set(lines)].sort((a, b) => a - b);
};

/**
 * 清理和规范化代码内容
 * @param code 代码内容
 * @returns 清理后的代码
 */
export const normalizeCodeContent = (code: string): string => {
  if (!code) return '';
  
  // 移除代码顶部和底部多余的空行
  let normalized = code.replace(/^\n+|\n+$/g, '');
  
  return normalized;
};

/**
 * 获取代码语言的显示名称
 * @param language 语言标识符
 * @returns 显示名称
 */
export const getLanguageDisplayName = (language: string): string => {
  const languageMap: Record<string, string> = {
    'js': 'JavaScript',
    'ts': 'TypeScript',
    'jsx': 'React JSX',
    'tsx': 'React TSX',
    'html': 'HTML',
    'xml': 'XML',
    'css': 'CSS',
    'scss': 'SCSS',
    'less': 'Less',
    'json': 'JSON',
    'py': 'Python',
    'rb': 'Ruby',
    'java': 'Java',
    'cpp': 'C++',
    'c': 'C',
    'cs': 'C#',
    'go': 'Go',
    'rust': 'Rust',
    'php': 'PHP',
    'sh': 'Shell',
    'bash': 'Bash',
    'powershell': 'PowerShell',
    'sql': 'SQL',
    'md': 'Markdown',
    'yaml': 'YAML',
    'yml': 'YAML',
    'toml': 'TOML',
    'diff': 'Diff',
    'graphql': 'GraphQL',
    'kotlin': 'Kotlin',
    'swift': 'Swift',
    'dart': 'Dart',
    'dockerfile': 'Dockerfile',
  };
  
  // 将语言标识符转为小写进行查找
  const lowerLang = language.toLowerCase();
  
  // 返回映射的语言名称或原始语言标识符
  return languageMap[lowerLang] || language;
};

/**
 * 代码块格式化工具函数
 */

/**
 * 规范化代码块格式
 * - 确保代码块前后有空行
 * - 确保代码块使用三个反引号
 * - 确保语言标记格式正确
 * @param markdown Markdown文本
 * @returns 处理后的Markdown文本
 */
export const normalizeCodeBlocks = (markdown: string): string => {
  if (typeof markdown !== 'string') {
    return String(markdown || '');
  }

  try {
    let result = markdown;
    
    // 处理缩进代码块，转换为围栏代码块
    result = result.replace(/(?:^|\n)((?:\s{4}|\t)[^\n]+(?:\n(?:\s{4}|\t)[^\n]+)*)/g, (_, code) => {
      const lines = code.split('\n').map((line: string) => line.replace(/^(?:\s{4}|\t)/, ''));
      return `\n\`\`\`\n${lines.join('\n')}\n\`\`\`\n`;
    });
    
    // 规范化围栏代码块
    result = result.replace(/(?:^|\n)(`{3,}|~{3,})([\s\S]*?)(?:\n\1|$)/g, (_match, _fence, content) => {
      // 提取语言标记（如果有）
      const firstLine = content.split('\n')[0];
      const lang = firstLine.trim();
      const code = firstLine === lang ? content.substring(firstLine.length + 1) : content;
      
      // 构建规范化的代码块
      return `\n\`\`\`${lang}\n${code.trim()}\n\`\`\`\n`;
    });
    
    // 确保代码块前后有空行
    result = result.replace(/([^\n])\n```/g, '$1\n\n```');
    result = result.replace(/```\n([^\n])/g, '```\n\n$1');
    
    return result;
  } catch (error) {
    return markdown;
  }
};

/**
 * 规范化行内代码格式
 * @param markdown Markdown文本
 * @returns 处理后的Markdown文本
 */
export const normalizeInlineCode = (markdown: string): string => {
  if (typeof markdown !== 'string') {
    return String(markdown || '');
  }

  try {
    let result = markdown;
    
    // 修复不配对的反引号
    result = result.replace(/(?<!`)`(?!`)(.*?)(?<!`)`(?!`)/g, (match, code) => {
      // 如果代码中包含反引号，使用双反引号
      if (code.includes('`')) {
        return `\`\`${code}\`\``;
      }
      return match;
    });
    
    // 确保反引号内部首尾没有多余空格
    result = result.replace(/`\s*(.*?)\s*`/g, (_, code) => `\`${code.trim()}\``);
    
    return result;
  } catch (error) {
    return markdown;
  }
}; 