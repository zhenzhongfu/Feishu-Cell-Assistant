import React, { useEffect, useState, useRef } from 'react';
import { bitable } from '@lark-base-open/js-sdk';
import 'github-markdown-css/github-markdown.css';
import MarkdownRenderer from './utils/MarkdownRenderer';
import { testMarkdown } from './test-markdown';
import './App.css';
import mermaid from 'mermaid';
// import MarkdownField from './MarkdownField';

// 定义主题样式
const themes = {
  notionLight: {
    name: 'GitHub 风格',
    containerStyle: {
      backgroundColor: '#ffffff',
      color: '#24292e'
    },
    preStyle: {
      backgroundColor: '#f6f8fa',
      borderRadius: '6px',
      padding: '16px',
      border: '1px solid #d0d7de'
    },
    markdownClass: 'markdown-body github-markdown-light',
    preBackground: '#f6f8fa'
  },
  notionStyle: {
    name: 'Notion 风格',
    containerStyle: {
      backgroundColor: '#ffffff',
      color: '#37352f'
    },
    preStyle: {
      backgroundColor: '#f7f6f3',
      borderRadius: '3px',
      padding: '16px'
    },
    markdownClass: 'markdown-body notion-style',
    preBackground: '#f7f6f3'
  }
};

// 添加全局样式
const globalStyles = `
/* 基本样式 */
.markdown-body {
  color-scheme: light dark;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
  font-size: 16px;
  line-height: 1.5;
  word-wrap: break-word;
}

.github-markdown-light {
  color: #24292e;
  background-color: transparent;
}

.notion-style {
  color: #37352f;
  background-color: transparent;
  font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji";
  letter-spacing: -0.02em;
}

/* Notion 风格标题 */
.notion-style h1 {
  font-weight: 600;
  font-size: 1.875em;
  line-height: 1.3;
  color: rgb(55, 53, 47);
  margin-top: 2em;
  margin-bottom: 0.5em;
}

.notion-style h2 {
  font-weight: 600;
  font-size: 1.5em;
  line-height: 1.3;
  color: rgb(55, 53, 47);
  margin-top: 1.4em;
  margin-bottom: 0.5em;
}

.notion-style h3 {
  font-weight: 600;
  font-size: 1.25em;
  line-height: 1.3;
  color: rgb(55, 53, 47);
  margin-top: 1.4em;
  margin-bottom: 0.5em;
}

/* Notion 风格段落和列表 */
.notion-style p {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  min-height: 1.5em;
  padding: 3px 2px;
}

.notion-style ul, .notion-style ol {
  margin: 0.5em 0;
  padding-left: 1.2em;
}

.notion-style li {
  padding: 3px 2px;
  min-height: 1.5em;
}

/* Notion 风格引用块 */
.notion-style blockquote {
  padding: 0.2em 0.9em;
  margin: 0.5em 0;
  font-size: 1em;
  border-left: 3px solid rgba(55, 53, 47, 0.16);
  color: rgb(120, 119, 116);
}

/* Notion 风格代码块 */
.notion-style pre {
  background: rgba(247, 246, 243, 0.7);
  border-radius: 6px;
  margin: 0.5em 0;
  overflow: hidden;
  font-family: SFMono-Regular, Menlo, Consolas, "PT Mono", "Liberation Mono", Courier, monospace;
  font-size: 0.9em;
  line-height: 1.5;
  border: 1px solid rgba(55, 53, 47, 0.16);
}

/* 代码块容器 */
.notion-style .markdown-code-wrapper {
  position: relative;
  margin: 1em 0;
}

/* 代码块头部 */
.notion-style .markdown-code-header {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #f6f8fa;
  border-bottom: 1px solid rgba(55, 53, 47, 0.16);
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  font-size: 12px;
  color: #57606a;
}

/* Mac 风格按钮容器 */
.notion-style .mac-buttons {
  display: flex;
  gap: 6px;
  margin-right: 12px;
}

/* Mac 风格按钮 */
.notion-style .mac-button {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
}

/* 红色关闭按钮 */
.notion-style .mac-button.close {
  background-color: #ff5f56;
}

/* 黄色最小化按钮 */
.notion-style .mac-button.minimize {
  background-color: #ffbd2e;
}

/* 绿色最大化按钮 */
.notion-style .mac-button.maximize {
  background-color: #27c93f;
}

/* 代码语言标签 */
.notion-style .markdown-code-lang {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
  color: #57606a;
  margin-left: auto;
}

/* 代码内容容器 */
.notion-style .markdown-code-content {
  padding: 16px;
  margin: 0;
  overflow-x: auto;
}

/* GitHub 风格代码块 */
.github-markdown-light pre {
  background-color: #f6f8fa;
  border-radius: 6px;
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  border: 1px solid #d0d7de;
}

.github-markdown-light .markdown-code-wrapper {
  position: relative;
  margin: 1em 0;
}

.github-markdown-light .markdown-code-header {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #f6f8fa;
  border-bottom: 1px solid #d0d7de;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  font-size: 12px;
  color: #57606a;
}

.github-markdown-light .mac-buttons {
  display: flex;
  gap: 6px;
  margin-right: 12px;
}

.github-markdown-light .mac-button {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
}

.github-markdown-light .mac-button.close {
  background-color: #ff5f56;
}

.github-markdown-light .mac-button.minimize {
  background-color: #ffbd2e;
}

.github-markdown-light .mac-button.maximize {
  background-color: #27c93f;
}

.github-markdown-light .markdown-code-lang {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
  color: #57606a;
  margin-left: auto;
}

.github-markdown-light .markdown-code-content {
  padding: 16px;
  margin: 0;
  overflow-x: auto;
}

.notion-style code {
  font-family: SFMono-Regular, Menlo, Consolas, "PT Mono", "Liberation Mono", Courier, monospace;
  font-size: 0.9em;
  padding: 0.2em 0.4em;
  background: rgba(135, 131, 120, 0.15);
  border-radius: 3px;
  color: #eb5757;
}

/* Notion 风格表格 */
.notion-style table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.notion-style th, .notion-style td {
  border: 1px solid rgba(55, 53, 47, 0.16);
  padding: 0.5em;
  color: rgb(55, 53, 47);
}

.notion-style th {
  font-weight: 600;
  background: rgba(247, 246, 243, 0.7);
}

/* Notion 风格链接 */
.notion-style a {
  color: rgb(35, 131, 226);
  text-decoration: underline;
  text-decoration-color: rgba(35, 131, 226, 0.4);
  transition: all 0.1s ease-in;
}

.notion-style a:hover {
  text-decoration-color: rgb(35, 131, 226);
}

/* Notion 风格分割线 */
.notion-style hr {
  border: none;
  border-top: 1px solid rgba(55, 53, 47, 0.16);
  margin: 2em 0;
}

/* Notion 风格图片 */
.notion-style img {
  max-width: 100%;
  border-radius: 3px;
  margin: 0.5em 0;
}

/* Notion 风格复选框 */
.notion-style input[type="checkbox"] {
  appearance: none;
  width: 16px;
  height: 16px;
  border: 2px solid rgb(55, 53, 47);
  border-radius: 3px;
  margin-right: 8px;
  position: relative;
  cursor: pointer;
}

.notion-style input[type="checkbox"]:checked {
  background-color: rgb(35, 131, 226);
  border-color: rgb(35, 131, 226);
}

.notion-style input[type="checkbox"]:checked::after {
  content: "";
  position: absolute;
  left: 4px;
  top: 1px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
`;

// 定义主题模式类型
enum ThemeModeType {
  Light = 'light',
  Dark = 'dark'
}

// 添加更完整的LaTeX到ASCII/Unicode的映射函数
const convertLatexToUnicode = (texCode: string): string => {
  // 常见的LaTeX符号及其Unicode或ASCII表示
  const replacements: [RegExp, string][] = [
    // 希腊字母
    [/\\alpha/g, 'α'], [/\\beta/g, 'β'], [/\\gamma/g, 'γ'], [/\\delta/g, 'δ'],
    [/\\epsilon/g, 'ε'], [/\\zeta/g, 'ζ'], [/\\eta/g, 'η'], [/\\theta/g, 'θ'],
    [/\\iota/g, 'ι'], [/\\kappa/g, 'κ'], [/\\lambda/g, 'λ'], [/\\mu/g, 'μ'],
    [/\\nu/g, 'ν'], [/\\xi/g, 'ξ'], [/\\pi/g, 'π'], [/\\rho/g, 'ρ'],
    [/\\sigma/g, 'σ'], [/\\tau/g, 'τ'], [/\\upsilon/g, 'υ'], [/\\phi/g, 'φ'],
    [/\\chi/g, 'χ'], [/\\psi/g, 'ψ'], [/\\omega/g, 'ω'],
    [/\\Gamma/g, 'Γ'], [/\\Delta/g, 'Δ'], [/\\Theta/g, 'Θ'], [/\\Lambda/g, 'Λ'],
    [/\\Xi/g, 'Ξ'], [/\\Pi/g, 'Π'], [/\\Sigma/g, 'Σ'], [/\\Phi/g, 'Φ'],
    [/\\Psi/g, 'Ψ'], [/\\Omega/g, 'Ω'],
    
    // 数学运算符
    [/\\times/g, '×'], [/\\div/g, '÷'], [/\\pm/g, '±'], [/\\mp/g, '∓'],
    [/\\cdot/g, '·'], [/\\cdots/g, '⋯'], [/\\ldots/g, '...'],
    [/\\leq/g, '≤'], [/\\geq/g, '≥'], [/\\neq/g, '≠'], [/\\approx/g, '≈'],
    [/\\equiv/g, '≡'], [/\\cong/g, '≅'], [/\\sim/g, '∼'],
    
    // 集合和逻辑
    [/\\in/g, '∈'], [/\\notin/g, '∉'], [/\\subset/g, '⊂'], [/\\supset/g, '⊃'],
    [/\\subseteq/g, '⊆'], [/\\supseteq/g, '⊇'], [/\\cup/g, '∪'], [/\\cap/g, '∩'],
    [/\\emptyset/g, '∅'], [/\\varnothing/g, '∅'],
    [/\\forall/g, '∀'], [/\\exists/g, '∃'], [/\\neg/g, '¬'],
    [/\\lor/g, '∨'], [/\\land/g, '∧'], [/\\Rightarrow/g, '⇒'], [/\\Leftarrow/g, '⇐'],
    [/\\Leftrightarrow/g, '⇔'], [/\\rightarrow/g, '→'], [/\\leftarrow/g, '←'],
    [/\\leftrightarrow/g, '↔'],
    
    // 微积分和分析
    [/\\infty/g, '∞'], [/\\partial/g, '∂'], [/\\nabla/g, '∇'],
    [/\\sum/g, '∑'], [/\\prod/g, '∏'], [/\\int/g, '∫'], [/\\oint/g, '∮'],
    
    // 括号和其他符号
    [/\\{/g, '{'], [/\\}/g, '}'], [/\\|/g, '|'],
    [/\\langle/g, '⟨'], [/\\rangle/g, '⟩'],
    [/\\lfloor/g, '⌊'], [/\\rfloor/g, '⌋'], [/\\lceil/g, '⌈'], [/\\rceil/g, '⌉'],
    
    // 分数和上下标
    [/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '$1/$2'], // 简单分数转换
    
    // 空格和换行
    [/\\\\/g, '\n'], [/\\quad/g, '    '], [/\\qquad/g, '        '],
    
    // 括号转换
    [/\\left\(/g, '('], [/\\right\)/g, ')'],
    [/\\left\[/g, '['], [/\\right\]/g, ']'],
    [/\\left\\{/g, '{'], [/\\right\\}/g, '}'],
    
    // 删除不支持的指令
    [/\\text\{([^{}]*)\}/g, '$1'], // 文本指令
    [/\\mathrm\{([^{}]*)\}/g, '$1'], // mathrm指令
    [/\\mathbf\{([^{}]*)\}/g, '$1'], // mathbf指令
    [/\\mathit\{([^{}]*)\}/g, '$1'], // mathit指令
    
    // 上标和下标
    [/\^(\d)/g, '^$1'], // 简单上标
    [/_(\d)/g, '_$1'], // 简单下标
    [/\^\{([^{}]*)\}/g, '^($1)'], // 复杂上标
    [/_\{([^{}]*)\}/g, '_($1)'], // 复杂下标
    
    // 清理剩余的命令
    [/\\[a-zA-Z]+/g, '?'] // 未知命令替换为问号
  ];
  
  // 应用所有替换
  let result = texCode;
  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }
  
  // 清理连续的空格
  result = result.replace(/\s+/g, ' ').trim();
  
  return result;
};

const App: React.FC = () => {
  const [content, setContent] = useState<string>(testMarkdown);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [currentTheme, setCurrentTheme] = useState<keyof typeof themes>('notionLight');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const formattedContentRef = useRef<HTMLDivElement>(null);
  const [bitableTheme, setBitableTheme] = useState<ThemeModeType>(ThemeModeType.Light);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showFormatted, setShowFormatted] = useState<boolean>(false);

  // 处理单元格值的函数，确保文本正确显示
  const processCellValue = (value: any): string => {
    // 创建HTML实体解码器
    const decodeHTML = (html: string) => {
      const textarea = document.createElement('textarea');
      textarea.innerHTML = html;
      return textarea.value;
    };

    // 处理不同类型的值
    if (!value) return '';
    let processedValue = '';
    
    if (typeof value === 'string') {
      processedValue = value;
    } else if (typeof value === 'object' && Array.isArray(value)) {
      processedValue = value.map(item => {
        if (item && typeof item === 'object' && item.text) {
          return item.text;
        }
        return '';
      }).join('');
    } else if (typeof value === 'object') {
      if (value.text) processedValue = value.text;
      else if (value.value) processedValue = value.value;
      else processedValue = JSON.stringify(value, null, 2);
    } else {
      processedValue = String(value);
    }

    // 先解码HTML实体
    const decodedValue = decodeHTML(processedValue);
    
    // 步骤1: 保护行内代码块
    const protectedCode = new Map<string, string>();
    let codeBlockId = 0;
    
    let processed = decodedValue.replace(/`([^`]+)`/g, (match, _) => {
      const placeholder = `__INLINE_CODE_${codeBlockId++}__`;
      protectedCode.set(placeholder, match);
      return placeholder;
    });
    
    // 步骤2: 保护GitHub风格的警告提示语法
    processed = processed.replace(/\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](.*?)(?=\n\[!|\n\n|$)/gs, (match) => {
      return `__GITHUB_ALERT__${match}__GITHUB_ALERT__`;
    });
    
    // 步骤3: 保护图片语法
    processed = processed.replace(/!\[(.*?)\]\((.*?)\)/g, (_, alt, url) => {
      return `__IMG_MD__${alt}__IMG_URL__${url}__IMG_END__`;
    });
    
    // 步骤4: 保护链接语法 [文本](URL) - 不再转换为HTML
    processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match) => {
      return `__LINK_MD__${match}__LINK_END__`;
    });
    
    // 步骤5: 恢复图片语法
    processed = processed.replace(/__IMG_MD__(.*?)__IMG_URL__(.*?)__IMG_END__/g, (_, alt, url) => {
      return `![${alt}](${url})`;
    });
    
    // 步骤6: 恢复链接语法
    processed = processed.replace(/__LINK_MD__(.*?)__LINK_END__/g, (_, linkContent) => {
      return linkContent;
    });
    
    // 步骤7: 恢复GitHub警告提示语法
    processed = processed.replace(/__GITHUB_ALERT__(.*?)__GITHUB_ALERT__/gs, (_, alertContent) => {
      return alertContent;
    });
    
    // 步骤8: 处理无序列表项
    processed = processed.replace(/^[-*]\s+(.*)/gm, (_match, content) => {
      return `• ${content}`;
    });
    
    // 步骤9: 处理有序列表项
    processed = processed.replace(/^\d+\.\s+(.*)/gm, (match) => {
      return match;
    });
    
    // 最后: 恢复所有行内代码
    for (const [placeholder, original] of protectedCode.entries()) {
      processed = processed.replace(placeholder, original);
    }
    
    return processed;
  };

  // 处理HTML，确保嵌套引用能够正确显示
  // const processNestedQuotes = (html: string): string => {
  //   // 使用正则表达式找到嵌套的引用
  //   return html.replace(
  //     /<blockquote[^>]*>(?:(?!<\/blockquote>)[\s\S])*?<blockquote[^>]*>([\s\S]*?)<\/blockquote>[\s\S]*?<\/blockquote>/g,
  //     (match) => {
  //       // 将嵌套引用用特殊标记替换
  //       return match.replace(
  //         /<blockquote([^>]*)>([\s\S]*?)(?=<\/blockquote>)/g, 
  //         (_m, attrs, content) => {
  //           // 给内部blockquote添加特殊标记
  //           if (content.includes('<blockquote')) {
  //             return `<blockquote${attrs} data-nested="true" style="padding:0 1em !important;color:#6a737d !important;border-left:0.25em solid #dfe2e5 !important;margin:8px 0 !important;display:block !important"><div class="nested-quote-marker" style="font-weight:bold;color:#6a737d;margin-bottom:4px">引用：</div>${content}`;
  //           }
  //           return `<blockquote${attrs}>${content}`;
  //         }
  //       );
  //     }
  //   );
  // };

  // 引用块处理
  const processBlockquotes = (containerEl: HTMLElement): void => {
    // 获取所有引用块
    const blockquotes = containerEl.querySelectorAll('blockquote');
    
    blockquotes.forEach(blockquote => {
      // 设置明确的样式，防止公众号丢失样式
      blockquote.setAttribute('style', 
        'padding: 0 1em !important; color: #6a737d !important; border-left: 0.25em solid #dfe2e5 !important; margin: 0 0 16px 0 !important; display: block !important; quotes: none !important;');
      
      // 检查是否有嵌套引用
      const isNested = blockquote.parentElement && blockquote.parentElement.nodeName.toLowerCase() === 'blockquote';
      
      if (isNested) {
        // 嵌套引用特殊处理
        blockquote.setAttribute('style', 
          'padding: 0 1em !important; color: #6a737d !important; border-left: 0.25em solid #dfe2e5 !important; margin: 8px 0 !important; display: block !important; quotes: none !important;');
        
        // 在第一个段落前添加"引用："前缀
        const firstP = blockquote.querySelector('p');
        if (firstP) {
          const originalContent = firstP.innerHTML;
          firstP.innerHTML = `<strong style="color: #6a737d !important;">引用：</strong> ${originalContent}`;
        }
        
        // 将嵌套引用用div包裹，避免公众号过度处理
        const wrapper = document.createElement('div');
        wrapper.setAttribute('style', 'margin: 8px 0 !important; display: block !important;');
        wrapper.setAttribute('data-type', 'nested-quote');
        
        // 将嵌套引用移到新的div中
        const parent = blockquote.parentNode;
        if (parent) {
          parent.insertBefore(wrapper, blockquote);
          wrapper.appendChild(blockquote);
        }
      }
    });
  };
  
  // 数学公式处理
  const processMathFormulas = (containerEl: HTMLElement): void => {
    // 寻找所有块级公式
    const katexDisplayElements = containerEl.querySelectorAll('.katex-display');
    
    katexDisplayElements.forEach((formula: Element) => {
      try {
        // 提取原始TeX代码
        const texAnnotation = formula.querySelector('.katex-html annotation[encoding="application/x-tex"]');
        if (!texAnnotation) return;
        
        const texCode = texAnnotation.textContent || '';
        if (!texCode) return;
        
        // 检查是否是对齐环境公式
        const alignedMatch = texCode.match(/\\begin\{aligned\}([\s\S]*?)\\end\{aligned\}/);
        if (alignedMatch) {
          const alignedContent = alignedMatch[1];
          // 按行分割
          const lines: string[] = alignedContent.split('\\\\').map((lineStr: string) => lineStr.trim());
          
          // 创建纯文本公式块 - 使用pre元素保持格式
          const preElement = document.createElement('pre');
          preElement.className = 'plain-text-formula';
          preElement.setAttribute('style', 'display:block;text-align:center;margin:1em 0;font-family:monospace;white-space:pre;background-color:#f8f8f8;padding:10px;border-radius:5px;');
          
          // 构建纯文本表示
          let textFormula = '【公式】\n';
          
          lines.forEach((lineStr: string) => {
            // 处理对齐符号&
            const parts = lineStr.split('&');
            if (parts.length > 1) {
              // 左侧部分（右对齐）并替换常见数学符号为Unicode表示
              let leftPart = convertLatexToUnicode(parts[0].trim());
              
              // 右侧部分（左对齐）并应用同样的替换
              let rightPart = convertLatexToUnicode(parts[1].trim());
              
              // 构建均衡的纯文本表示，使用空格对齐
              const padLength = 20; // 左侧最大长度
              const paddedLeft = leftPart.padStart(padLength, ' ');
              textFormula += `${paddedLeft} ${rightPart}\n`;
            } else {
              // 单列内容（居中）
              let plainText = convertLatexToUnicode(lineStr.trim());
              textFormula += `          ${plainText}\n`;
            }
          });
          
          textFormula += '【公式结束】';
          
          // 设置纯文本内容
          preElement.textContent = textFormula;
          
          // 替换原始公式
          const parentElement = formula.parentElement;
          if (parentElement) {
            parentElement.replaceChild(preElement, formula);
          }
        } else {
          // 非对齐环境，使用简单的纯文本表示
          const preElement = document.createElement('pre');
          preElement.className = 'plain-text-formula';
          preElement.setAttribute('style', 'display:block;text-align:center;margin:1em 0;font-family:monospace;white-space:pre;background-color:#f8f8f8;padding:10px;border-radius:5px;');
          
          // 使用转换函数处理LaTeX代码
          let plainText = convertLatexToUnicode(texCode);
          
          preElement.textContent = `【公式】\n${plainText}\n【公式结束】`;
          
          // 替换原始公式
          const parentElement = formula.parentElement;
          if (parentElement) {
            parentElement.replaceChild(preElement, formula);
          }
        }
      } catch (error) {
        console.error('处理数学公式出错:', error);
        // 保留原始内容
      }
    });
    
    // 处理行内公式
    const katexInlineElements = containerEl.querySelectorAll('.katex:not(.katex-display .katex)');
    
    katexInlineElements.forEach((formula: Element) => {
      try {
        // 提取原始TeX代码
        const texAnnotation = formula.querySelector('annotation[encoding="application/x-tex"]');
        if (!texAnnotation) return;
        
        const texCode = texAnnotation.textContent || '';
        if (!texCode) return;
        
        // 创建简化的行内公式 - 使用纯文本
        const inlineText = document.createElement('span');
        inlineText.className = 'plain-text-inline-formula';
        inlineText.setAttribute('style', 'font-family:monospace;white-space:nowrap;background-color:#f8f8f8;padding:0 3px;border-radius:2px;');
        
        // 使用转换函数处理LaTeX代码
        let plainText = convertLatexToUnicode(texCode);
        
        inlineText.textContent = `【${plainText}】`;
        
        // 替换原始公式
        const parentElement = formula.parentElement;
        if (parentElement) {
          parentElement.replaceChild(inlineText, formula);
        }
      } catch (error) {
        console.error('处理行内公式出错:', error);
        // 保留原始内容
      }
    });
  };
  
  // 处理Mermaid图表
  const processMermaidDiagrams = (containerEl: HTMLElement, forClipboard: boolean = false): void => {
    const mermaidWrappers = containerEl.querySelectorAll('.mermaid-wrapper, .mermaid-container');
    
    mermaidWrappers.forEach(wrapper => {
      const svgElement = wrapper.querySelector('svg');
      
      if (forClipboard && svgElement) {
        // 不做任何替换，保留原始SVG内容以便复制
        console.log('剪贴板模式：保留并增强SVG图表');
        // 为复制到剪贴板优化SVG元素
        try {
          // 获取SVG的实际尺寸
          const bbox = svgElement.getBBox();
          const width = svgElement.getAttribute('width') || bbox.width.toString();
          const height = svgElement.getAttribute('height') || bbox.height.toString();
          
          // 设置SVG尺寸，确保使用有效的数值
          svgElement.setAttribute('width', width);
          // 只有在有有效高度值时才设置height
          if (height && height !== 'auto') {
            svgElement.setAttribute('height', height);
          } else {
            // 如果没有有效的高度，使用宽度的一半作为默认高度
            const defaultHeight = parseFloat(width) * 0.5;
            svgElement.setAttribute('height', `${defaultHeight}px`);
          }
          
          // 使用CSS样式控制响应式布局
          const svgStyle = (svgElement as unknown as SVGElement).style;
          svgStyle.maxWidth = '100%';
          svgStyle.width = '100%';
          svgStyle.height = '100%';
          svgStyle.display = 'block';
          svgStyle.overflow = 'visible';
          
          // 添加特殊类名，标记为剪贴板准备的SVG
          svgElement.classList.add('clipboard-svg-ready');
          
          // 确保SVG容器也有正确的样式
          const parentStyle = (wrapper as HTMLElement).style;
          parentStyle.display = 'block';
          parentStyle.width = '100%';
          parentStyle.maxWidth = '100%';
          parentStyle.overflow = 'visible';
        } catch (e) {
          console.error('为剪贴板优化SVG失败:', e);
        }
        return;
      }
    });
  };

  // 准备要复制的格式化内容
  const prepareFormattedContent = (): string => {
    // 创建临时容器
    const container = document.createElement('div');
    container.className = 'mp-content';
    
    // 获取格式化内容
    if (formattedContentRef.current) {
      container.innerHTML = formattedContentRef.current.innerHTML;
      
      // 处理各种特殊内容
      processBlockquotes(container);
      processMathFormulas(container);
      processMermaidDiagrams(container, true); // 为剪贴板准备内容
      
      // 处理代码块的样式
      const codeBlocks = container.querySelectorAll('.markdown-code-wrapper');
      codeBlocks.forEach(block => {
        const header = block.querySelector('.markdown-code-header');
        const content = block.querySelector('.markdown-code-content');
        if (header && content) {
          // 确保代码块样式正确
          (block as HTMLElement).style.margin = '16px 0';
          (block as HTMLElement).style.borderRadius = '8px';
          (block as HTMLElement).style.overflow = 'hidden';
          (header as HTMLElement).style.padding = '12px 16px';
          (content as HTMLElement).style.margin = '0';
          (content as HTMLElement).style.padding = '16px';
        }
      });
    }
    
    return container.innerHTML;
  };

  // 复制内容到剪贴板
  const copyToClipboard = (content: string, isFormatted: boolean = false) => {
    try {
      if (isFormatted) {
        // 创建临时容器并设置内容
        const container = document.createElement('div');
        container.innerHTML = content;
        document.body.appendChild(container);
        
        // 创建选区
        const range = document.createRange();
        range.selectNodeContents(container);
        
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
          
          // 执行复制
          document.execCommand('copy');
          
          // 清理
          selection.removeAllRanges();
          document.body.removeChild(container);
        }
      } else {
        // 纯文本复制
        const textarea = document.createElement('textarea');
        textarea.value = content;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        document.body.appendChild(textarea);
        textarea.select();
        textarea.setSelectionRange(0, 99999);
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      
      // 更新复制成功状态
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
      setError('复制失败，请重试');
    }
  };

  // 处理复制按钮点击事件
  const handleCopyClick = () => {
    if (isEditing) {
      // 编辑模式下，复制排版后的内容
      const formattedContent = prepareFormattedContent();
      copyToClipboard(formattedContent, true);
    } else {
      // 非编辑模式
      if (showFormatted) {
        // 显示排版时，复制排版后的内容
        const formattedContent = prepareFormattedContent();
        copyToClipboard(formattedContent, true);
      } else {
        // 显示原文时，复制原始markdown
        copyToClipboard(content);
      }
    }
  };

  // 初始化插件
  useEffect(() => {
    const init = async () => {
      console.log('开始初始化插件...');
      setLoading(true);
      try {
        const selection = await bitable.base.getSelection();
        console.log('获取到当前选择:', selection);

        const { tableId, recordId, fieldId } = selection;
        if (tableId && recordId && fieldId) {
          const table = await bitable.base.getTableById(tableId);
          const cellValue = await table.getCellValue(fieldId, recordId);
          console.log('获取到初始单元格内容:', cellValue);
          const processedValue = processCellValue(cellValue);
          // 只有当获取到的内容不为空时，才更新content
          if (processedValue.trim()) {
            setContent(processedValue);
            
            // 给Markdown渲染一些时间，然后初始化Mermaid图表
            setTimeout(() => {
              initMermaid();
            }, 800); // 给足够时间渲染Markdown
          }
        }

        bitable.base.onSelectionChange(async (event) => {
          console.log('选择发生变化:', event);
          setLoading(true);
          try {
            const newSelection = await bitable.base.getSelection();
            const { tableId, recordId, fieldId } = newSelection;
            if (!tableId || !recordId || !fieldId) {
              // 如果没有选择单元格，不更改内容，保持测试内容
              setLoading(false);
          return;
        }
        
            const table = await bitable.base.getTableById(tableId);
            const cellValue = await table.getCellValue(fieldId, recordId);

            console.log('获取到单元格内容:', cellValue);
            const processedValue = processCellValue(cellValue);
            // 只有当获取到的内容不为空时，才更新content
            if (processedValue.trim()) {
              setContent(processedValue);
            }
            setError('');
          } catch (err) {
            console.error('获取单元格内容失败:', err);
            setError('获取内容失败，请重试');
          } finally {
            setLoading(false);
          }
        });
      } catch (err) {
        console.error('插件初始化失败:', err);
        setError('插件初始化失败，请检查控制台错误信息');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // 初始化主题
  useEffect(() => {
    const initTheme = async () => {
      try {
        // 获取当前主题
        if (bitable?.base) {
          const base = bitable.base;
          // 使用类型断言
          const baseWithTheme = base as unknown as {
            getTheme: () => Promise<string>;
            onThemeChange: (callback: (theme: string) => void) => void;
          };

          // 检查 getTheme 方法是否存在
          if (typeof baseWithTheme.getTheme === 'function') {
            const currentTheme = await baseWithTheme.getTheme();
            setBitableTheme(currentTheme as ThemeModeType);
            
            // 检查 onThemeChange 方法是否存在
            if (typeof baseWithTheme.onThemeChange === 'function') {
              baseWithTheme.onThemeChange((theme: string) => {
                setBitableTheme(theme as ThemeModeType);
              });
            }
          } else {
            // 如果没有 getTheme 方法，使用默认主题
            setBitableTheme(ThemeModeType.Light);
          }
        }
      } catch (error) {
        console.error('获取主题失败:', error);
        // 发生错误时使用默认主题
        setBitableTheme(ThemeModeType.Light);
      }
    };
    
    initTheme();
  }, [bitable]);

  // Mermaid图表初始化函数
  const initMermaid = () => {
    try {
      // 获取所有Mermaid容器
      const mermaidDivs = document.querySelectorAll('.mermaid');
      if (mermaidDivs.length > 0) {
        console.log('初始化Mermaid图表，数量:', mermaidDivs.length);
        
        // 初始化配置
        if (typeof mermaid !== 'undefined' && typeof mermaid.mermaidAPI !== 'undefined') {
          try {
            mermaid.mermaidAPI.reset();
          } catch (e) {
            console.warn('Mermaid重置失败:', e);
          }
          
          mermaid.initialize({
            startOnLoad: false,
            theme: bitableTheme === ThemeModeType.Dark ? 'dark' : 'default',
            securityLevel: 'loose',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
            flowchart: { htmlLabels: true, curve: 'basis' },
            sequence: { useMaxWidth: false, wrap: true },
            gantt: { useMaxWidth: false }
          });
          
          // 处理每个Mermaid容器
          mermaidDivs.forEach(div => {
            try {
              // 确保容器可见性
              (div as HTMLElement).style.visibility = 'visible';
              (div as HTMLElement).style.display = 'block';
              (div as HTMLElement).style.overflow = 'visible';
              
              // 获取父容器并设置样式
              const parent = div.parentElement;
              if (parent) {
                parent.style.overflow = 'visible';
                parent.style.textAlign = 'center';
              }
            } catch (err) {
              console.error('设置Mermaid容器样式失败:', err);
            }
          });
          
          // 初始化所有图表
          setTimeout(() => {
            try {
              mermaid.init(undefined, '.mermaid');
            } catch (err) {
              console.error('Mermaid初始化失败:', err);
              
              // 尝试逐个初始化
              mermaidDivs.forEach((div, index) => {
                try {
                  mermaid.init(undefined, div as HTMLElement);
                } catch (e) {
                  console.error(`Mermaid图表 #${index} 初始化失败:`, e);
                }
              });
            }
          }, 100);
        } else {
          console.error('无法访问mermaid对象，可能未正确加载');
        }
      }
    } catch (error) {
      console.error('初始化Mermaid失败:', error);
    }
  };
  
  // 监听内容更新
  useEffect(() => {
    if (content.trim()) {
      // 给Markdown渲染一点时间，然后初始化Mermaid图表
      const timer = setTimeout(() => {
        initMermaid();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [content]);

  const handleSave = async (value: string) => {
    try {
      const selection = await bitable.base.getSelection();
      if (selection.tableId && selection.recordId && selection.fieldId) {
        const table = await bitable.base.getTableById(selection.tableId);
        await table.setCellValue(selection.fieldId, selection.recordId, value);
        console.log('内容已保存');
      }
    } catch (error) {
      console.error('保存失败:', error);
      setError('保存失败，请重试');
    }
  };

  return (
    <div 
      className="markdown-content-container for-clipboard"
      style={{ 
        padding: '16px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        ...themes[currentTheme].containerStyle,
        transition: 'all 0.3s ease'
      }}
    >
      {/* 添加全局样式 */}
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      
      <div style={{
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        borderBottom: currentTheme === 'notionStyle' ? '1px solid #e3e2e0' : '1px solid #d0d7de',
        paddingBottom: '12px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsEditing(!isEditing)}
            style={{
              padding: '6px 12px',
              backgroundColor: isEditing ? 
                (currentTheme === 'notionStyle' ? '#f7f6f3' : '#f6f8fa') : 
                (currentTheme === 'notionStyle' ? '#2eaadc' : '#2da44e'),
              color: isEditing ? 
                (currentTheme === 'notionStyle' ? '#37352f' : '#24292e') : 
                '#ffffff',
              border: isEditing ? 
                (currentTheme === 'notionStyle' ? '1px solid #e3e2e0' : '1px solid #d0d7de') : 
                (currentTheme === 'notionStyle' ? '1px solid #2eaadc' : 'none'),
              borderRadius: currentTheme === 'notionStyle' ? '3px' : '3px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontWeight: currentTheme === 'notionStyle' ? 400 : 500,
              fontSize: '14px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
              boxShadow: currentTheme === 'notionStyle' ? (isEditing ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.1)') : 'none'
            }}
          >
            {isEditing ? '退出编辑' : '编辑模式'}
          </button>
          
          {!isEditing && (
            <button
              onClick={() => setShowFormatted(!showFormatted)}
              style={{
                padding: '6px 12px',
                backgroundColor: showFormatted ? 
                  (currentTheme === 'notionStyle' ? '#2eaadc' : '#2da44e') : 
                  (currentTheme === 'notionStyle' ? '#f7f6f3' : '#f6f8fa'),
                color: showFormatted ? 
                  '#ffffff' : 
                  (currentTheme === 'notionStyle' ? '#37352f' : '#24292e'),
                border: showFormatted ? 
                  'none' : 
                  (currentTheme === 'notionStyle' ? '1px solid #e3e2e0' : '1px solid #d0d7de'),
                borderRadius: '3px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontWeight: currentTheme === 'notionStyle' ? 400 : 500,
                fontSize: '14px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                boxShadow: currentTheme === 'notionStyle' ? (showFormatted ? '0 1px 2px rgba(0, 0, 0, 0.1)' : 'none') : 'none'
              }}
            >
              {showFormatted ? '显示原文' : '显示排版'}
            </button>
          )}

          {isEditing && (
            <button
              onClick={() => handleSave(content)}
              style={{
                padding: '6px 12px',
                backgroundColor: currentTheme === 'notionStyle' ? '#0f9d58' : '#2da44e',
                color: '#ffffff',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontWeight: currentTheme === 'notionStyle' ? 400 : 500,
                fontSize: '14px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                boxShadow: currentTheme === 'notionStyle' ? '0 1px 2px rgba(0, 0, 0, 0.1)' : 'none'
              }}
            >
              保存
            </button>
          )}
          
          <button
            onClick={handleCopyClick}
            style={{
              padding: '6px 12px',
              backgroundColor: copySuccess ? 
                (currentTheme === 'notionStyle' ? '#2eaadc' : '#2da44e') : 
                (currentTheme === 'notionStyle' ? '#f7f6f3' : '#f6f8fa'),
              color: copySuccess ? 
                '#ffffff' : 
                (currentTheme === 'notionStyle' ? '#37352f' : '#24292e'),
              border: copySuccess ? 
                (currentTheme === 'notionStyle' ? '1px solid #2eaadc' : 'none') : 
                (currentTheme === 'notionStyle' ? '1px solid #e3e2e0' : '1px solid #d0d7de'),
              borderRadius: '3px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontWeight: currentTheme === 'notionStyle' ? 400 : 500,
              fontSize: '14px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
              boxShadow: currentTheme === 'notionStyle' ? (copySuccess ? '0 1px 2px rgba(0, 0, 0, 0.1)' : 'none') : 'none'
            }}
          >
            {copySuccess ? '已复制' : '复制内容'}
          </button>
        </div>
        <select
          value={currentTheme}
          onChange={(e) => setCurrentTheme(e.target.value as keyof typeof themes)}
          style={{
            padding: '6px 12px',
            borderRadius: '3px',
            border: currentTheme === 'notionStyle' ? '1px solid #e3e2e0' : '1px solid #d0d7de',
            cursor: 'pointer',
            backgroundColor: currentTheme === 'notionStyle' ? '#f7f6f3' : '#f6f8fa',
            color: currentTheme === 'notionStyle' ? '#37352f' : '#24292e',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
            fontSize: '14px'
          }}
        >
          {Object.entries(themes).map(([key, theme]) => (
            <option key={key} value={key}>{theme.name}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div style={{ 
          marginBottom: '16px', 
          color: currentTheme === 'notionStyle' ? '#9b9a97' : '#6a737d',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
          flexShrink: 0
        }}>加载中...</div>
      )}
      {error && (
        <div style={{ 
          marginBottom: '16px', 
          color: currentTheme === 'notionStyle' ? '#eb5757' : '#cf222e',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
          flexShrink: 0
        }}>{error}</div>
      )}
      {!loading && content && (
        <div style={{ 
          width: '100%',
          display: 'flex',
          gap: '16px',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden'
        }}>
          {isEditing && (
            <div style={{ 
              flex: 1,
          border: currentTheme === 'notionStyle' ? '1px solid #e3e2e0' : '1px solid #d0d7de',
          borderRadius: '3px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
              style={{
                  width: '100%',
                  flex: 1,
                padding: '16px',
                  border: 'none',
                  resize: 'none',
                  fontFamily: currentTheme === 'notionStyle' 
                    ? 'SFMono-Regular, Monaco, Menlo, Consolas, "Liberation Mono", "Courier New", monospace'
                    : '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
                  fontSize: currentTheme === 'notionStyle' ? '15px' : '13px',
                lineHeight: currentTheme === 'notionStyle' ? '1.7' : '1.6',
                  backgroundColor: currentTheme === 'notionStyle' ? '#f7f6f3' : '#ffffff',
                  color: currentTheme === 'notionStyle' ? '#37352f' : '#24292e'
                }}
              />
            </div>
          )}
            <div 
              ref={formattedContentRef}
              style={{
              flex: 1,
              overflow: 'auto',
              backgroundColor: 'transparent',
              transition: 'all 0.3s ease'
            }}
          >
            {!isEditing && !showFormatted ? (
              <pre style={{
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                fontFamily: currentTheme === 'notionStyle' 
                  ? 'ui-monospace, SFMono-Regular, Monaco, Menlo, Consolas, "Liberation Mono", "Courier New", monospace'
                  : '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
                fontSize: currentTheme === 'notionStyle' ? '14px' : '13px',
                lineHeight: currentTheme === 'notionStyle' ? '1.7' : '1.5',
                color: currentTheme === 'notionStyle' ? 'rgb(55, 53, 47)' : '#24292e',
                backgroundColor: currentTheme === 'notionStyle' ? 'rgba(247, 246, 243, 0.7)' : '#f6f8fa',
                padding: '16px',
                borderRadius: '6px',
                border: '1px solid #d0d7de',
                minHeight: '100%',
                boxSizing: 'border-box',
                width: '100%'
              }}>
                {content}
              </pre>
            ) : (
              <MarkdownRenderer 
                content={content} 
                theme={currentTheme} 
                darkMode={bitableTheme === ThemeModeType.Dark}
              />
          )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App; 