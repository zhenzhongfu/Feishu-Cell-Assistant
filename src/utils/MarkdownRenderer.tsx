import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import mermaid from 'mermaid';
import 'katex/dist/katex.min.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { 
  oneLight,
  tomorrow
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import MermaidRenderer from './markdown/components/MermaidRenderer';

// 创建HTML实体解码器
const decodeHTML = (html: string): string => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = html;
  return textarea.value;
};

// 修复和清理图片URL
const cleanImageUrl = (url: string): string => {
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

// 规范化有序列表格式
const normalizeOrderedLists = (markdown: string): string => {
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

// 预处理Markdown内容
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

// 在操作DOM前添加安全检查
// const safeClosest = (element: any, selector: string): Element | null => {
//   if (!element || typeof element.closest !== 'function') {
//     return null;
//   }
//   return element.closest(selector);
// };

// // 安全的getAttribute函数
// const safeGetAttribute = (element: any, attr: string): string | null => {
//   if (!element || typeof element.getAttribute !== 'function') {
//     return null;
//   }
//   return element.getAttribute(attr);
// };

// 添加警告图标SVG组件
const AlertIcons = {
  note: (theme: string, darkMode: boolean) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" style={{marginRight: '8px'}}>
      <path fill={darkMode 
          ? (theme === 'notionStyle' ? '#58a6ff' : '#58a6ff') 
          : (theme === 'notionStyle' ? '#2eaadc' : '#0969da')} 
        d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
    </svg>
  ),
  tip: (theme: string, darkMode: boolean) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" style={{marginRight: '8px'}}>
      <path fill={darkMode 
          ? (theme === 'notionStyle' ? '#3fb950' : '#3fb950') 
          : (theme === 'notionStyle' ? '#0f9d58' : '#1a7f37')} 
        d="M8 1.5c-2.363 0-4 1.69-4 3.75 0 .984.424 1.625.984 2.304l.214.253c.223.264.47.556.673.848.284.411.537.896.621 1.49a.75.75 0 0 1-1.484.211c-.04-.282-.163-.547-.37-.847a8.456 8.456 0 0 0-.542-.68c-.084-.1-.173-.205-.268-.32C3.201 7.75 2.5 6.766 2.5 5.25 2.5 2.31 4.863 0 8 0s5.5 2.31 5.5 5.25c0 1.516-.701 2.5-1.328 3.259-.095.115-.184.22-.268.319-.207.245-.383.453-.541.681-.208.3-.33.565-.37.847a.751.751 0 0 1-1.485-.212c.084-.593.337-1.078.621-1.489.203-.292.45-.584.673-.848.075-.088.147-.173.213-.253.561-.679.985-1.32.985-2.304 0-2.06-1.637-3.75-4-3.75ZM5.75 14.5a2.25 2.25 0 0 1 4.5 0 .75.75 0 0 1-1.5 0 .75.75 0 0 0-1.5 0 .75.75 0 0 1-1.5 0Z" />
    </svg>
  ),
  important: (theme: string, darkMode: boolean) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" style={{marginRight: '8px'}}>
      <path fill={darkMode 
          ? (theme === 'notionStyle' ? '#d29922' : '#d29922') 
          : (theme === 'notionStyle' ? '#f5b400' : '#9a6700')} 
        d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v9.5A1.75 1.75 0 0 1 14.25 13H8.06l-2.573 2.573A1.458 1.458 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25Zm1.75-.25a.25.25 0 0 0-.25.25v9.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h6.5a.25.25 0 0 0 .25-.25v-9.5a.25.25 0 0 0-.25-.25Zm7 2.25v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
    </svg>
  ),
  warning: (theme: string, darkMode: boolean) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" style={{marginRight: '8px'}}>
      <path fill={darkMode 
          ? (theme === 'notionStyle' ? '#e3b341' : '#e3b341') 
          : (theme === 'notionStyle' ? '#f5a623' : '#d4a72c')} 
        d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
    </svg>
  ),
  caution: (theme: string, darkMode: boolean) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" style={{marginRight: '8px'}}>
      <path fill={darkMode 
          ? (theme === 'notionStyle' ? '#f85149' : '#f85149') 
          : (theme === 'notionStyle' ? '#eb5757' : '#cf222e')} 
        d="M4.47.22A.749.749 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.749.749 0 0 1-.22.53l-4.25 4.25A.749.749 0 0 1 11 16H5a.749.749 0 0 1-.53-.22L.22 11.53A.749.749 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
    </svg>
  )
};

// 渲染器组件
interface MarkdownRendererProps {
  content: string;
  theme?: 'notionLight' | 'notionStyle';
  darkMode?: boolean;
}

// 在组件顶部添加错误边界组件
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('组件渲染错误:', error, info);
  }
  
  render() {
    if (this.state.hasError) {
      return <div>内容渲染出错，请检查Markdown格式</div>;
    }
    return this.props.children;
  }
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, theme = 'notionStyle', darkMode = false }) => {
  // 确保 content 是字符串类型
  const safeContent = typeof content === 'string' ? content : String(content || '');
  const processedContent = preprocessMarkdown(safeContent);
  
  // 初始化mermaid
  useEffect(() => {
    // 确保DOM已经完全准备好
    setTimeout(() => {
      try {
        // 手动运行mermaid
        const mermaidDivs = document.querySelectorAll('.mermaid');
        if (mermaidDivs.length > 0) {
          // 检查是否有需要渲染的图表（未渲染的）
          const needsRendering = Array.from(mermaidDivs).some(div => !div.querySelector('svg'));
          
          if (needsRendering) {
            // 重置mermaid以避免多次初始化冲突
            if (typeof mermaid.mermaidAPI !== 'undefined') {
              try {
                mermaid.mermaidAPI.reset();
              } catch (e) {
                console.warn('Mermaid重置失败:', e);
              }
            }
            
            // 初始化配置
            mermaid.initialize({
              startOnLoad: false,  // 手动控制初始化
              theme: darkMode ? 'dark' : 'default',
              securityLevel: 'loose',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
              flowchart: {
                htmlLabels: true,
                curve: 'basis'
              },
              sequence: {
                useMaxWidth: false,
                wrap: true
              },
              gantt: {
                useMaxWidth: false
              }
            });
            
            // 逐个处理Mermaid容器
            mermaidDivs.forEach(div => {
              try {
                // 跳过已经渲染的图表
                if (div.querySelector('svg')) {
                  return;
                }
                
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
                
                // 尝试渲染这个特定的图表
                try {
                  mermaid.init(undefined, div as HTMLElement);
                } catch (e) {
                  console.error(`Mermaid图表渲染失败:`, e);
                }
              } catch (err) {
                console.error('设置Mermaid容器样式失败:', err);
              }
            });
          }
        }
      } catch (error) {
        console.error('Mermaid 初始化错误:', error);
      }
    }, 300);
  }, [content, theme, darkMode]);
  
  return (
    <ErrorBoundary>
      <article 
        className={`markdown-body ${theme === 'notionStyle' ? 'notion-style' : 'github-markdown-light'} ${darkMode ? 'dark-mode' : ''}`} 
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
          fontSize: '16px',
          lineHeight: '1.5',
          wordWrap: 'break-word',
          boxSizing: 'border-box',
          maxWidth: '100%',
          margin: 0,
          padding: 0,
          backgroundColor: 'transparent',
          overflow: 'auto',
          color: darkMode 
            ? (theme === 'notionStyle' ? '#e6e6e6' : '#c9d1d9')
            : (theme === 'notionStyle' ? '#37352f' : '#24292e')
        }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeRaw, rehypeKatex]}
          skipHtml={false}
          unwrapDisallowed={false}
          components={{
            // 处理链接
            a: ({...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="markdown-link" />,
            
            // 处理段落
            p: ({children, node, ...props}: any) => {
              // 检查段落文本是否包含GitHub风格警告的标记
              if (node?.children?.[0] && typeof node.children[0] === 'object' && 'value' in node.children[0]) {
                const textContent = node.children[0].value as string;
                const alertMatch = textContent.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*)/i);
                
                if (alertMatch) {
                  const alertType = alertMatch[1].toLowerCase();
                  const alertContent = alertMatch[2];
                  
                  // 获取对应的图标
                  const AlertIcon = AlertIcons[alertType as keyof typeof AlertIcons];
                  
                  // 返回GitHub风格的警告提示框
                  return (
                    <div className={`markdown-alert markdown-alert-${alertType}`}
                      style={{
                        backgroundColor: darkMode 
                          ? 'rgba(255, 255, 255, 0.05)'
                          : (theme === 'notionStyle' 
                            ? (alertType === 'note' ? 'rgba(46, 170, 220, 0.1)' 
                              : alertType === 'tip' ? 'rgba(15, 157, 88, 0.1)' 
                              : alertType === 'important' ? 'rgba(245, 180, 0, 0.1)' 
                              : alertType === 'warning' ? 'rgba(245, 166, 35, 0.1)' 
                              : 'rgba(235, 87, 87, 0.1)')
                            : (alertType === 'note' ? 'rgba(221, 244, 255, 0.5)' 
                              : alertType === 'tip' ? 'rgba(222, 248, 222, 0.5)' 
                              : alertType === 'important' ? 'rgba(255, 242, 204, 0.5)' 
                              : alertType === 'warning' ? 'rgba(255, 237, 213, 0.5)' 
                              : 'rgba(255, 223, 235, 0.5)')),
                        borderLeftColor: darkMode
                          ? (alertType === 'note' ? '#58a6ff' 
                            : alertType === 'tip' ? '#3fb950' 
                            : alertType === 'important' ? '#d29922' 
                            : alertType === 'warning' ? '#e3b341' 
                            : '#f85149')
                          : (theme === 'notionStyle'
                            ? (alertType === 'note' ? '#2eaadc' 
                              : alertType === 'tip' ? '#0f9d58' 
                              : alertType === 'important' ? '#f5b400' 
                              : alertType === 'warning' ? '#f5a623' 
                              : '#eb5757')
                            : (alertType === 'note' ? '#58a6ff' 
                              : alertType === 'tip' ? '#2da44e' 
                              : alertType === 'important' ? '#bf8700' 
                              : alertType === 'warning' ? '#fd8c73' 
                              : '#d73a49')),
                        borderLeftWidth: '0.25em',
                        borderLeftStyle: 'solid',
                        borderRadius: theme === 'notionStyle' ? '3px' : '6px',
                        padding: '1em',
                        marginBottom: '16px'
                      }}
                    >
                      <p className="markdown-alert-title" style={{
                        fontWeight: 600,
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        lineHeight: 1
                      }}>
                        {AlertIcon && AlertIcon(theme, darkMode)}
                        <strong style={{ 
                          textTransform: 'uppercase', 
                          fontSize: '0.85em',
                          color: darkMode 
                            ? (theme === 'notionStyle' ? '#e6e6e6' : '#c9d1d9')
                            : (theme === 'notionStyle' ? '#37352f' : '#24292e')
                        }}>
                          {alertType.toUpperCase()}
                        </strong>
                      </p>
                      <p style={{
                        marginTop: 0,
                        marginBottom: '8px',
                        color: darkMode 
                          ? (theme === 'notionStyle' ? '#e6e6e6' : '#c9d1d9')
                          : (theme === 'notionStyle' ? '#37352f' : '#24292e')
                      }}>{alertContent}</p>
                    </div>
                  );
                }
              }
              
              // 检查是否在列表项中的段落
              const isInListItem = (node: any): boolean => {
                if (!node || !node.parentNode) return false;
                if (node.parentNode.tagName === 'LI') return true;
                return isInListItem(node.parentNode);
              };
              
              // 使用useEffect和useRef来在组件挂载后检查DOM结构
              const paragraphRef = React.useRef<HTMLParagraphElement>(null);
              const [isInList, setIsInList] = React.useState(false);
              
              React.useEffect(() => {
                if (paragraphRef.current) {
                  setIsInList(isInListItem(paragraphRef.current));
                }
              }, []);
              
              // 检查是否是列表项中的第一个段落
              const isFirstParagraph = React.useRef<boolean>(true);
              
              // 列表项中的段落样式处理
              if (isInList) {
                return (
                  <p 
                    {...props} 
                    ref={paragraphRef}
                    className="markdown-p-in-list"
                    style={{
                      marginTop: isFirstParagraph.current ? '0' : '16px',
                      marginBottom: '0',
                      display: 'block',
                      lineHeight: '1.5'
                    }}
                  >
                    {children}
                  </p>
                );
              }
              
              return (
                <p 
                  {...props} 
                  ref={paragraphRef}
                  className="markdown-p"
                  style={{
                    marginTop: '0',
                    marginBottom: '16px',
                    display: 'block',
                    lineHeight: '1.5'
                  }}
                >
                  {children}
                </p>
              );
            },
            
            // 处理标题
            h1: ({...props}) => <h1 {...props} />,
            h2: ({...props}) => <h2 {...props} />,
            h3: ({...props}) => <h3 {...props} />,
            h4: ({...props}) => <h4 {...props} />,
            h5: ({...props}) => <h5 {...props} />,
            h6: ({...props}) => <h6 {...props} />,
            
            // 处理列表
            ul: ({...props}) => <ul {...props} className="markdown-ul" style={{
              listStyleType: 'disc',
              paddingLeft: '2em',
              marginTop: '0',
              marginBottom: '16px'
            }} />,
            ol: ({...props}) => <ol {...props} className="markdown-ol" style={{
              listStyleType: 'decimal',
              paddingLeft: '2em',
              marginTop: '0',
              marginBottom: '16px'
            }} />,
            li: ({...props}) => <li {...props} className="markdown-li" style={{
              marginTop: '0.25em',
              marginBottom: '0.25em'
            }} />,
            
            // 处理引用
            blockquote: ({children, node, ...props}: any) => {
              // 检查引用块内容是否是GitHub风格警告
              if (node?.children && node.children.length > 0) {
                let isAlertBlock = false;
                let alertType = '';
                let alertContent: React.ReactNode[] = [];
                
                // 尝试从blockquote的内容中识别警告类型
                for (let i = 0; i < node.children.length; i++) {
                  const child = node.children[i] as any;
                  if (child?.type === 'paragraph' && child?.children?.[0] && 
                      typeof child.children[0] === 'object' && 'value' in child.children[0]) {
                    const text = child.children[0].value as string;
                    const match = text.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
                    if (match) {
                      isAlertBlock = true;
                      alertType = match[1].toLowerCase();
                      
                      // 获取对应的图标
                      const AlertIcon = AlertIcons[alertType as keyof typeof AlertIcons];
                      
                      // 提取该段落的剩余内容作为标题
                      const titleContent = text.replace(match[0], '').trim();
                      if (titleContent) {
                        alertContent.push(
                          <p key="title" className="markdown-alert-title" style={{
                            fontWeight: 600,
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            lineHeight: 1
                          }}>
                            {AlertIcon && AlertIcon(theme, darkMode)}
                            <strong style={{ 
                              textTransform: 'uppercase', 
                              fontSize: '0.85em',
                              color: darkMode 
                                ? (theme === 'notionStyle' ? '#e6e6e6' : '#c9d1d9')
                                : (theme === 'notionStyle' ? '#37352f' : '#24292e')
                            }}>
                              {alertType.toUpperCase()}
                            </strong>
                          </p>
                        );
                        alertContent.push(
                          <p key="content" style={{
                            marginTop: 0,
                            marginBottom: '8px',
                            color: darkMode 
                              ? (theme === 'notionStyle' ? '#e6e6e6' : '#c9d1d9')
                              : (theme === 'notionStyle' ? '#37352f' : '#24292e')
                          }}>{titleContent}</p>
                        );
                      } else {
                        alertContent.push(
                          <p key="title" className="markdown-alert-title" style={{
                            fontWeight: 600,
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            lineHeight: 1
                          }}>
                            {AlertIcon && AlertIcon(theme, darkMode)}
                            <strong style={{ 
                              textTransform: 'uppercase', 
                              fontSize: '0.85em',
                              color: darkMode 
                                ? (theme === 'notionStyle' ? '#e6e6e6' : '#c9d1d9')
                                : (theme === 'notionStyle' ? '#37352f' : '#24292e')
                            }}>
                              {alertType.toUpperCase()}
                            </strong>
                          </p>
                        );
                      }
                      // 跳过已处理的元素
                      continue;
                    }
                  }
                  // 添加其他内容
                  if (isAlertBlock) {
                    const childArray = React.Children.toArray(children);
                    if (i < childArray.length) {
                      alertContent.push(React.cloneElement(childArray[i] as React.ReactElement, { key: `alert-${i}` }));
                    }
                  }
                }
                
                if (isAlertBlock) {
                  return (
                    <div className={`markdown-alert markdown-alert-${alertType}`}
                      style={{
                        backgroundColor: darkMode 
                          ? 'rgba(255, 255, 255, 0.05)'
                          : (theme === 'notionStyle' 
                            ? (alertType === 'note' ? 'rgba(46, 170, 220, 0.1)' 
                              : alertType === 'tip' ? 'rgba(15, 157, 88, 0.1)' 
                              : alertType === 'important' ? 'rgba(245, 180, 0, 0.1)' 
                              : alertType === 'warning' ? 'rgba(245, 166, 35, 0.1)' 
                              : 'rgba(235, 87, 87, 0.1)')
                            : (alertType === 'note' ? 'rgba(221, 244, 255, 0.5)' 
                              : alertType === 'tip' ? 'rgba(222, 248, 222, 0.5)' 
                              : alertType === 'important' ? 'rgba(255, 242, 204, 0.5)' 
                              : alertType === 'warning' ? 'rgba(255, 237, 213, 0.5)' 
                              : 'rgba(255, 223, 235, 0.5)')),
                        borderLeftColor: darkMode
                          ? (alertType === 'note' ? '#58a6ff' 
                            : alertType === 'tip' ? '#3fb950' 
                            : alertType === 'important' ? '#d29922' 
                            : alertType === 'warning' ? '#e3b341' 
                            : '#f85149')
                          : (theme === 'notionStyle'
                            ? (alertType === 'note' ? '#2eaadc' 
                              : alertType === 'tip' ? '#0f9d58' 
                              : alertType === 'important' ? '#f5b400' 
                              : alertType === 'warning' ? '#f5a623' 
                              : '#eb5757')
                            : (alertType === 'note' ? '#58a6ff' 
                              : alertType === 'tip' ? '#2da44e' 
                              : alertType === 'important' ? '#bf8700' 
                              : alertType === 'warning' ? '#fd8c73' 
                              : '#d73a49')),
                        borderLeftWidth: '0.25em',
                        borderLeftStyle: 'solid',
                        borderRadius: theme === 'notionStyle' ? '3px' : '6px',
                        padding: '1em',
                        marginBottom: '16px'
                      }}
                    >
                      {alertContent}
                    </div>
                  );
                }
              }
              
              // 添加更多内联样式来确保引用块在复制到其他平台时保持正确的样式
              return (
                <blockquote 
                  {...props} 
                  className="markdown-blockquote" 
                  style={{
                    padding: '0 1em',
                    color: darkMode ? '#a1a1a1' : (theme === 'notionStyle' ? '#6a6a6a' : '#6a737d'),
                    borderLeft: `0.25em solid ${darkMode ? '#30363d' : (theme === 'notionStyle' ? '#e3e2e0' : '#dfe2e5')}`,
                    margin: '0 0 16px 0',
                    display: 'block',
                    quotes: 'none'
                  }}
                  data-type="blockquote"
                >
                  {children}
                </blockquote>
              );
            },
            
            // 处理代码（行内代码和代码块）
            code: ({ inline, className, children, ...props }: any) => {
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : '';
              const value = String(children).replace(/\n$/, '');

              if (language === 'mermaid') {
                return <MermaidRenderer code={value} />;
              }

              if (!inline) {
                return (
                  <SyntaxHighlighter
                    style={theme === 'notionStyle' ? tomorrow : oneLight}
                    language={language}
                    PreTag="div"
                    {...props}
                  >
                    {value}
                  </SyntaxHighlighter>
                );
              }

              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            
            // 处理pre标签（代码块的容器）
            pre: ({ children, className, ...props }: any) => {
              if (!children || !children.props) {
                return <pre {...props}>{children}</pre>;
              }
              
              // 获取语言信息
              const language = children.props.className
                ? children.props.className.replace('language-', '')
                : '';

              // 代码块的标题（显示语言）
              let languageLabel = language ? language.toUpperCase() : 'CODE';
              
              // Mermaid图表特殊处理
              if (language === 'mermaid') {
                return (
                  <div className="mermaid-container" style={{
                    backgroundColor: darkMode
                      ? 'rgba(255, 255, 255, 0.05)'
                      : (theme === 'notionStyle' ? '#f7f6f3' : '#f6f8fa'),
                    borderRadius: theme === 'notionStyle' ? '3px' : '6px',
                    padding: '16px',
                    marginBottom: '16px',
                    overflow: 'visible !important',
                    textAlign: 'center',
                    maxWidth: '100%',
                    border: darkMode
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : (theme === 'notionStyle' ? '1px solid #e3e2e0' : 'none'),
                    position: 'relative'
                  }}>
                    {children}
                  </div>
                );
              }

              return (
                <div className="markdown-code-wrapper">
                  <div className="markdown-code-header" style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: theme === 'notionStyle' ? '8px 12px' : '12px 16px',
                    background: darkMode
                      ? 'rgba(255, 255, 255, 0.05)'
                      : (theme === 'notionStyle' ? '#f7f6f3' : '#f0f3f6'),
                    borderBottom: darkMode
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : (theme === 'notionStyle' ? '1px solid #e3e2e0' : '1px solid #ddd'),
                    borderTopLeftRadius: theme === 'notionStyle' ? '3px' : '8px',
                    borderTopRightRadius: theme === 'notionStyle' ? '3px' : '8px'
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="45px" height="13px" viewBox="0 0 450 130">
                      <ellipse cx="50" cy="65" rx="50" ry="52" stroke="rgb(220,60,54)" strokeWidth="2" fill="rgb(237,108,96)" />
                      <ellipse cx="225" cy="65" rx="50" ry="52" stroke="rgb(218,151,33)" strokeWidth="2" fill="rgb(247,193,81)" />
                      <ellipse cx="400" cy="65" rx="50" ry="52" stroke="rgb(27,161,37)" strokeWidth="2" fill="rgb(100,200,86)" />
                    </svg>
                    <span className="markdown-code-language" style={{
                      marginLeft: 'auto',
                      fontSize: theme === 'notionStyle' ? '12px' : '13px',
                      fontWeight: theme === 'notionStyle' ? '500' : '600',
                      color: darkMode
                        ? 'rgba(255, 255, 255, 0.7)'
                        : (theme === 'notionStyle' ? '#9b9a97' : '#57606a'),
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>{languageLabel}</span>
                  </div>
                  <pre 
                    {...props}
                    className={`markdown-code-content ${className || ''}`}
                    style={{
                      margin: 0,
                      padding: 0,
                      borderRadius: theme === 'notionStyle' ? '0 0 3px 3px' : '0 0 6px 6px',
                      overflow: 'auto'
                    }}
                  >
                    {children}
                  </pre>
                </div>
              );
            },
            
            // 处理表格
            table: ({...props}) => <table {...props} className="markdown-table" />,
            thead: ({...props}) => <thead {...props} />,
            tbody: ({...props}) => <tbody {...props} />,
            tr: ({...props}) => <tr {...props} />,
            th: ({...props}) => <th {...props} />,
            td: ({...props}) => <td {...props} />,
            
            // 处理强调和加粗
            em: ({...props}) => <em {...props} className="markdown-em" />,
            strong: ({...props}) => <strong {...props} className="markdown-strong" />,
            
            // 处理图片
            img: ({...props}) => {
              // 确保src属性存在且不为空并清理URL
              let imgSrc = props.src ? cleanImageUrl(props.src) : '';
              
              return (
                <img 
                  {...props} 
                  src={imgSrc}
                  className="markdown-img" 
                  alt={props.alt || ''} 
                  loading="lazy"
                  style={{
                    maxWidth: '100%',
                    display: 'block',
                    margin: '8px 0'
                  }}
                  onError={(e) => {
                    console.error('图片加载失败:', e.type, imgSrc);
                    // 设置失败样式
                    e.currentTarget.style.border = '1px dashed #d1d5db';
                    e.currentTarget.style.padding = '8px';
                    e.currentTarget.style.minHeight = '32px';
                    e.currentTarget.style.minWidth = '32px';
                    // 可选：设置一个失败提示
                    e.currentTarget.setAttribute('alt', `图片加载失败: ${props.alt || imgSrc}`);
                  }}
                  onLoad={() => {
                  }}
                />
              );
            },
            
            // 处理水平线
            hr: ({...props}) => <hr {...props} className="markdown-hr" />,
            
            // 处理删除线
            del: ({...props}) => <del {...props} className="markdown-del" />,
          }}
        >
          {processedContent}
        </ReactMarkdown>
      </article>
    </ErrorBoundary>
  );
};

export default MarkdownRenderer; 