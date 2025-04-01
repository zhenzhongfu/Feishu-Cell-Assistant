import React, { useState, useEffect, useCallback, useRef } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import CodeBlock from '../utils/markdown/components/CodeBlock';
import MermaidRenderer from '../utils/markdown/components/MermaidRenderer';
import katex from 'katex';
import MarkdownToolbar from './MarkdownToolbar';
import 'katex/dist/katex.min.css';
import { getCellValue } from '../utils/bitable';
import Modal from './Modal';
import html2pdf from 'html2pdf.js';
import { ThemeStyle, generateThemeStyles } from '../utils/markdownThemes';

// 配置 marked 解析器
const configureMarked = () => {
  const renderer = new marked.Renderer();
  
  // 标题渲染
  renderer.heading = (text, level) => {
    const sizes: Record<number, string> = {
      1: 'text-4xl font-bold',
      2: 'text-3xl font-bold',
      3: 'text-2xl font-bold',
      4: 'text-xl font-bold',
      5: 'text-lg font-bold',
      6: 'text-base font-bold'
    };
    
    // 减小标题的上下边距，但保持上长下短的原则和h1上下相等
    const margins: Record<number, string> = {
      1: 'mt-8 mb-8',   // h1: 上下相等 (2rem)
      2: 'mt-9 mb-4',   // h2: 上 2.25rem, 下 1rem
      3: 'mt-8 mb-3',   // h3: 上 2rem, 下 0.75rem
      4: 'mt-6 mb-2',   // h4: 上 1.5rem, 下 0.5rem
      5: 'mt-5 mb-2',   // h5: 上 1.25rem, 下 0.5rem
      6: 'mt-4 mb-1'    // h6: 上 1rem, 下 0.25rem
    };
    
    const className = `${sizes[level] || sizes[6]} ${margins[level] || 'my-4'} text-gray-900 dark:text-gray-100`;
    return `<h${level} class="${className}">${text}</h${level}>`;
  };

  // 段落渲染
  renderer.paragraph = (text) => {
    return `<p class="my-4 text-base text-gray-800 dark:text-gray-200 leading-relaxed">${text}</p>`;
  };

  // 列表项渲染
  renderer.listitem = (text) => {
    return `<li class="my-1">${text}</li>`;
  };

  // 分隔线渲染
  renderer.hr = () => {
    return '<hr class="my-8 border-t border-gray-300 dark:border-gray-700" />';
  };

  // 引用块渲染
  renderer.blockquote = (quote) => {
    // 处理嵌套引用
    const nestedQuoteRegex = /^<blockquote[^>]*>([\s\S]*?)<\/blockquote>$/;
    const match = quote.match(nestedQuoteRegex);
    
    if (match) {
      // 这是嵌套的引用，增加左边距和边框颜色深度
      return `<blockquote class="pl-4 my-4 border-l-4 border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 italic" data-nested="true">${quote}</blockquote>`;
    }
    
    // 普通引用
    return `<blockquote class="pl-4 my-4 border-l-4 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 italic" data-nested="false">${quote}</blockquote>`;
  };

  // 强调（加粗）渲染
  renderer.strong = (text) => {
    return `<strong class="font-bold text-gray-900 dark:text-gray-100">${text}</strong>`;
  };

  // 斜体渲染
  renderer.em = (text) => {
    return `<em class="italic text-gray-900 dark:text-gray-100">${text}</em>`;
  };

  // 行内代码渲染
  renderer.codespan = (code) => {
    return `<code class="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm">${code}</code>`;
  };

  // 代码块渲染
  renderer.code = (code, language) => {
    // 处理 Mermaid 图表
    if (language === 'mermaid') {
      return `<div class="mermaid-wrapper">${code}</div>`;
    }
    
    // 处理数学公式
    if (language === 'math' || language === 'latex') {
      try {
        return katex.renderToString(code, {
          displayMode: true,
          throwOnError: false,
          strict: false
        });
      } catch (error) {
        return `<div class="text-red-500">公式渲染错误: ${(error as Error).message}</div>`;
      }
    }
    
    // 返回一个特殊标记，稍后会被替换为实际的 React 组件
    return `<div class="codeblock-placeholder" data-language="${language || 'text'}" data-code="${encodeURIComponent(code)}"></div>`;
  };
  
  // 图片渲染
  renderer.image = (href, title, text) => {
    return `<figure class="image-container" style="margin:0;padding:0;font-size:0;line-height:0;text-align:center;">
              <img src="${href}" alt="${text}" title="${title || ''}" class="max-w-full h-auto mx-auto rounded-lg shadow-md" style="margin:0;padding:0;display:inline-block;vertical-align:top;" />
              ${text ? `<figcaption style="margin:8px 0 0 0;padding:0;font-size:14px;line-height:1.4;color:#666;">${text}</figcaption>` : ''}
              ${title ? `<figcaption style="margin:8px 0 0 0;padding:0;font-size:14px;line-height:1.4;color:#666;">${title}</figcaption>` : ''}
            </figure>`;
  };
  
  // 链接渲染
  renderer.link = (href, title, text) => {
    return `<a href="${href}" title="${title || ''}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline">${text}</a>`;
  };
  
  // 列表渲染
  renderer.list = (body, ordered, start) => {
    const type = ordered ? 'ol' : 'ul';
    const startAttr = ordered && start !== 1 ? ` start="${start}"` : '';
    const className = ordered 
      ? 'list-decimal pl-8 my-4 space-y-2' 
      : 'list-disc pl-8 my-4 space-y-2';
    return `<${type}${startAttr} class="${className}">${body}</${type}>`;
  };
  
  // 表格渲染
  renderer.table = (header, body) => {
    return `<div class="my-4 overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-800">${header}</thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">${body}</tbody>
              </table>
            </div>`;
  };

  // 表格单元格渲染
  renderer.tablecell = (content, { header, align }) => {
    const classes = [
      header ? 'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider' : 'px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100',
      align === 'center' ? 'text-center' : '',
      align === 'right' ? 'text-right' : '',
    ].filter(Boolean).join(' ');
    
    return `<td class="${classes}">${content}</td>`;
  };
  
  // 添加数学公式扩展
  const mathExtension = {
    name: 'math',
    level: 'inline',
    start(src: string) {
      return src.match(/\$|\\\(|\\\[/)?.index;
    },
    tokenizer(src: string) {
      const blockRule = /^\$\$([\s\S]+?)\$\$|^\\\[([\s\S]+?)\\\]/;
      const inlineRule = /^\$([^\n$]+?)\$|^\\\(([^\n\)]+?)\\\)/;
      
      const blockMatch = src.match(blockRule);
      const inlineMatch = src.match(inlineRule);

      if (blockMatch) {
        return {
          type: 'math',
          raw: blockMatch[0],
          text: blockMatch[1] || blockMatch[2],
          display: true,
          tokens: []
        };
      }

      if (inlineMatch) {
        return {
          type: 'math',
          raw: inlineMatch[0],
          text: inlineMatch[1] || inlineMatch[2],
          display: false,
          tokens: []
        };
      }

      return undefined;
    },
    renderer(token: any) {
      try {
        const tex = token.text.trim();
        return katex.renderToString(tex, {
          displayMode: token.display,
          throwOnError: false,
          strict: false,
          trust: true,
          macros: {
            '\\R': '\\mathbb{R}',
            '\\N': '\\mathbb{N}',
            '\\Z': '\\mathbb{Z}',
            '\\Q': '\\mathbb{Q}',
            '\\C': '\\mathbb{C}'
          }
        });
      } catch (error) {
        console.error('KaTeX 渲染错误:', error);
        return `<div class="text-red-500">公式渲染错误: ${(error as Error).message}</div>`;
      }
    }
  };
  
  // 设置 marked 选项
  marked.setOptions({
    renderer: renderer,
    gfm: true,
    breaks: true,
    pedantic: false
  });

  marked.use({ 
    extensions: [mathExtension],
    async: false
  });

  return renderer;
};

// 初始化 marked 配置
configureMarked();

interface SplitEditorProps {
  initialValue: string;
  onSave?: (content: string) => Promise<void>;
  readOnly?: boolean;
  recordId?: string;
  fieldId?: string;
  isBitable?: boolean;
  style?: ThemeStyle;  // 修改为使用ThemeStyle类型
  isAutoSaveEnabled?: boolean;  // 添加自动保存属性
  onThemeChange?: (theme: ThemeStyle) => void;  // 添加主题变更回调
  onAutoSaveChange?: (autoSave: boolean) => void;  // 添加自动保存设置变更回调
}

// 用于从数学公式元素中提取TeX内容的辅助函数
const extractTexContent = (block: Element): string => {
  let tex = '';
  
  // 尝试多种方式提取TeX内容
  // 1. 从annotation获取
  const annotation = block.querySelector('annotation[encoding="application/x-tex"]');
  if (annotation) {
    tex = annotation.textContent || '';
  }
  
  // 2. 从math标签获取
  if (!tex) {
    const mathContent = block.textContent || '';
    const patterns = [
      /\\begin\{aligned\}([\s\S]*?)\\end\{aligned\}/,
      /\\begin\{equation\*?\}([\s\S]*?)\\end\{equation\*?\}/,
      /\\begin\{gather\*?\}([\s\S]*?)\\end\{gather\*?\}/,
      /\\begin\{array\}([\s\S]*?)\\end\{array\}/
    ];
    
    for (const pattern of patterns) {
      const match = mathContent.match(pattern);
      if (match) {
        tex = match[0];
        break;
      }
    }
  }
  
  // 3. 从katex-mathml获取
  if (!tex) {
    const mathml = block.querySelector('.katex-mathml');
    if (mathml) {
      tex = mathml.textContent?.trim() || '';
    }
  }
  
  // 4. 从data-latex属性获取
  if (!tex) {
    tex = block.getAttribute('data-latex') || '';
  }
  
  // 5. 从原始HTML提取$$包围的内容
  if (!tex) {
    const htmlContent = block.outerHTML;
    const dollarMatch = htmlContent.match(/\$\$([\s\S]*?)\$\$/);
    if (dollarMatch) {
      tex = dollarMatch[1].trim();
    }
  }

  // 6. 从.katex-html元素重建
  if (!tex) {
    const katexHtml = block.querySelector('.katex-html');
    if (katexHtml) {
      const elements = Array.from(katexHtml.querySelectorAll('.mord, .mbin, .mrel, .mopen, .mclose, .mpunct, .minner, .mop, .msupsub'));
      tex = elements.map(el => {
        // 处理上标和下标
        if (el.classList.contains('msupsub')) {
          const sup = el.querySelector('.msup')?.textContent;
          const sub = el.querySelector('.msub')?.textContent;
          return (sup ? `^{${sup}}` : '') + (sub ? `_{${sub}}` : '');
        }
        return el.textContent || '';
      }).join(' ').trim();
    }
  }

  // 7. 尝试从script标签获取
  if (!tex) {
    const script = block.querySelector('script[type="math/tex; mode=display"]');
    if (script) {
      tex = script.textContent || '';
    }
  }

  // 清理和规范化TeX内容
  if (tex) {
    tex = tex.replace(/\s+/g, ' ')
              .replace(/\\\\(?!\[|\{)/g, ' \\\\ ')
              .replace(/([^\\])\$/g, '$1 \\$')
              .trim();
  }
  
  return tex;
};

// 渲染TeX为图片的辅助函数
const renderTexToImage = async (tex: string, displayMode: boolean): Promise<HTMLElement> => {
  // 创建临时容器并渲染公式
  const container = document.createElement('div');
  container.style.cssText = 'position: fixed; left: -9999px; top: -9999px; width: 1000px; height: auto; background: white;';
  document.body.appendChild(container);

  try {
    // 渲染公式
    container.innerHTML = katex.renderToString(tex, {
      displayMode: displayMode,
      throwOnError: false,
      output: 'html',
      strict: false,
      trust: true
    });

    // 获取渲染后的尺寸
    const katexElement = container.querySelector('.katex-html') || container.querySelector('.katex');
    if (!katexElement) {
      throw new Error('找不到渲染后的KaTeX元素');
    }

    // 统一字体大小
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .katex {
        font-size: 1.21em !important;
      }
      .katex .mord, .katex .mrel, .katex .mbin, .katex .msupsub {
        font-size: 1em !important;
      }
      .katex .mspace {
        margin-right: 0.2778em !important;
      }
    `;
    container.insertBefore(styleElement, container.firstChild);

    const rect = katexElement.getBoundingClientRect();
    const width = Math.ceil(rect.width);
    const height = Math.ceil(rect.height);

    // 创建Canvas并渲染SVG
    const canvas = document.createElement('canvas');
    const scale = 3; // 使用3倍缩放以获得更清晰的图像，特别是为了公众号
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('无法获取Canvas上下文');
    }

    // 设置白色背景
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 缩放以提高清晰度
    ctx.scale(scale, scale);

    // 将SVG转换为图片
    const svgData = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">
            ${container.innerHTML}
          </div>
        </foreignObject>
      </svg>
    `;

    // 创建图片并等待加载
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    });

    // 绘制到Canvas
    ctx.drawImage(img, 0, 0);

    // 转换为PNG (增加质量和清晰度)
    const pngData = canvas.toDataURL('image/png', 1.0);

    // 创建图片元素
    if (displayMode) {
      // 块级公式的容器 - 为公众号进行优化
      const imgContainer = document.createElement('p');
      imgContainer.style.cssText = 'text-align:center;display:block;margin:16px auto;padding:0;line-height:0;';
      
      const imgElement = document.createElement('img');
      imgElement.src = pngData;
      // 使用更简洁的行内样式，确保公众号兼容性
      imgElement.style.cssText = 'max-width:100%;display:inline-block;vertical-align:middle;margin:0;padding:0;';
      imgElement.alt = tex;
      // 设置宽度属性，提高公众号兼容性
      imgElement.setAttribute('width', `${width}px`);
      
      imgContainer.appendChild(imgElement);
      return imgContainer;
    } else {
      // 行内公式 - 为公众号进行优化
      const imgElement = document.createElement('img');
      imgElement.src = pngData;
      // 使用公众号兼容的样式
      imgElement.style.cssText = 'display:inline-block;vertical-align:middle;margin:0 2px;height:1.2em;';
      imgElement.alt = tex;
      return imgElement;
    }
  } finally {
    // 清理临时容器
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  }
};

// 处理HTML内容的通用函数 - 重命名未使用的函数
// @ts-ignore - 保留这些函数供将来使用
const processHtmlForWechat = async (html: string) => {
  // 简化为空函数，仅保留接口
      return html;
};

// 复制到剪贴板的通用函数
const copyToClipboardWithHtml = async (text: string, html?: string) => {
  try {
    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = 'position:fixed;top:0;left:0;width:auto;height:auto;padding:0;border:none;outline:none;boxShadow:none;background:transparent;white-space:pre-wrap;';
    tempDiv.contentEditable = 'true';
    
    if (html) {
      tempDiv.innerHTML = html;
    } else {
      tempDiv.textContent = text;
    }
    
    document.body.appendChild(tempDiv);
    
    const range = document.createRange();
    range.selectNodeContents(tempDiv);
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    const successful = document.execCommand('copy');
    document.body.removeChild(tempDiv);
    if (selection) {
      selection.removeAllRanges();
    }
    
    return successful;
  } catch (err) {
    console.error('复制失败:', err);
    return false;
  }
};

// 复制函数通用实现
const copyToClipboard = async (text: string, html?: string) => {
  return copyToClipboardWithHtml(text, html);
};

// 使用定制的列表处理方法，确保不生成空白行
// @ts-ignore - 保留这些函数供将来使用
const cleanProcessLists = (container: HTMLElement) => {
  // 处理所有列表
  const processAllLists = () => {
    // 获取所有顶级列表
    const lists = Array.from(container.querySelectorAll('ul, ol')).filter(list => 
      !list.parentElement || !(list.parentElement.tagName === 'LI')
    );
    
    lists.forEach(list => {
      // 记录列表类型
      const isOrdered = list.tagName === 'OL';
      
      // 创建新的容器来替换列表
      const newContainer = document.createElement('div');
      
      // 递归处理列表项
      const processListItems = (items: NodeListOf<HTMLLIElement>, level: number) => {
        Array.from(items).forEach((item, index) => {
          // 提取列表项内容(不包括嵌套列表)
          let content = '';
          Array.from(item.childNodes).forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
              content += node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE && 
                      !(node as Element).tagName.match(/^(UL|OL)$/i)) {
              content += (node as Element).outerHTML;
            }
          });
          
          // 创建列表项标记
          const marker = isOrdered ? `${index + 1}.` : '•';
          
          // 计算缩进
          const indentation = level * 20;
          
          // 使用公众号编辑器支持的p标签结构
          const paragraph = document.createElement('p');
          paragraph.style.margin = '0.2rem 0'; // 更小的上下边距
          paragraph.style.padding = '0';
          paragraph.style.lineHeight = '1.6';
          
          // 创建用于标记和缩进的span
          const markerSpan = document.createElement('span');
          markerSpan.textContent = marker;
          markerSpan.style.display = 'inline-block';
          markerSpan.style.width = '20px';
          markerSpan.style.textAlign = 'center';
          markerSpan.style.marginRight = '4px';
          markerSpan.style.marginLeft = `${indentation}px`;
          
          // 创建内容span
          const contentSpan = document.createElement('span');
          contentSpan.innerHTML = content.trim();
          
          // 组装段落
          paragraph.appendChild(markerSpan);
          paragraph.appendChild(contentSpan);
          newContainer.appendChild(paragraph);
          
          // 递归处理嵌套列表
          const nestedLists = item.querySelectorAll(':scope > ul > li, :scope > ol > li');
          if (nestedLists.length > 0) {
            processListItems(nestedLists as NodeListOf<HTMLLIElement>, level + 1);
          }
        });
      };
      
      // 开始处理顶级列表项
      processListItems(list.querySelectorAll(':scope > li'), 0);
      
      // 替换原始列表
      if (list.parentNode) {
        list.parentNode.replaceChild(newContainer, list);
      }
    });
  };
  
  // 执行列表处理
  processAllLists();
};

// 处理微信公众号内容的主函数
const processContentForWechat = async (container: HTMLElement): Promise<string> => {
  // 创建一个克隆的容器以避免修改原始内容
  const clonedContainer = container.cloneNode(true) as HTMLElement;
  
  try {
    // 0. 首先移除所有代码块工具栏和不必要的控件
    const codeToolbars = clonedContainer.querySelectorAll('.codebar');
    codeToolbars.forEach(toolbar => toolbar.remove());
    
    // 1. 处理所有数学公式为图片
    // 公式会被转为图片，这样在公众号中也能正确显示
    console.log('开始处理数学公式...');
    await processBlockMath(clonedContainer);
    await processInlineMath(clonedContainer);
    
    // 2. 处理标题样式
    console.log('处理标题样式...');
    processHeadings(clonedContainer);
    
    // 3. 处理引用块
    console.log('处理引用块...');
    processQuotes(clonedContainer);
    
    // 4. 处理图片
    console.log('处理图片...');
    processImages(clonedContainer);
    
    // 5. 处理代码块
    console.log('处理代码块...');
    processCodeBlocks(clonedContainer);
    
    // 6. 处理 Mermaid 图表
    console.log('处理Mermaid图表...');
    processMermaidCharts(clonedContainer);
    
    // 7. 处理列表
    console.log('处理列表...');
    processWechatLists(clonedContainer);
    
    // 8. 处理表格
    console.log('处理表格...');
    processWechatTables(clonedContainer);
    
    // 9. 删除不支持的标签和属性
    console.log('清理HTML...');
    cleanupForWechat(clonedContainer);
    
    // 10. 添加全局样式覆盖（确保公众号样式一致性）
    const styleWrapper = document.createElement('div');
    styleWrapper.setAttribute('style', 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif; font-size: 16px; line-height: 1.6; color: #333;');
    
    // 将处理后的内容移到样式包装器中
    styleWrapper.innerHTML = clonedContainer.innerHTML;
    
    // 返回处理后的 HTML
    return styleWrapper.outerHTML;
  } catch (error) {
    console.error('处理微信公众号内容时出错:', error);
    return container.innerHTML; // 如果出错，返回原始 HTML
  }
};

// 为微信公众号处理列表
const processWechatLists = (container: HTMLElement) => {
  // 处理有序列表
  const orderedLists = container.querySelectorAll('ol');
  orderedLists.forEach(list => {
    // 为列表添加基本样式
    list.setAttribute('style', 'padding-left: 20px; margin: 10px 0;');
    
    const items = list.querySelectorAll('li');
    // 为每个列表项添加行内样式
    items.forEach((item, index) => {
      // 公众号支持基本的列表，但我们使用行内样式确保兼容性
      item.setAttribute('style', 'margin: 5px 0; padding-left: 8px; line-height: 1.6;');
      
      // 确保列表项有正确的编号
      const marker = document.createElement('span');
      marker.textContent = `${index + 1}. `;
      marker.setAttribute('style', 'font-weight: bold; margin-right: 4px;');
      
      // 保存原有内容
      const content = item.innerHTML;
      item.innerHTML = '';
      item.appendChild(marker);
      
      // 创建内容容器
        const contentSpan = document.createElement('span');
      contentSpan.innerHTML = content;
      item.appendChild(contentSpan);
    });
  });
  
  // 处理无序列表
  const unorderedLists = container.querySelectorAll('ul');
  unorderedLists.forEach(list => {
    // 为列表添加基本样式
    list.setAttribute('style', 'padding-left: 20px; margin: 10px 0;');
    
    const items = list.querySelectorAll('li');
    // 为每个列表项添加行内样式
    items.forEach(item => {
      item.setAttribute('style', 'margin: 5px 0; padding-left: 8px; line-height: 1.6;');
      
      // 使用 • 作为列表标记
      const marker = document.createElement('span');
      marker.textContent = '• ';
      marker.setAttribute('style', 'font-weight: bold; margin-right: 4px;');
      
      // 保存原有内容
      const content = item.innerHTML;
      item.innerHTML = '';
      item.appendChild(marker);
      
      // 创建内容容器
      const contentSpan = document.createElement('span');
      contentSpan.innerHTML = content;
      item.appendChild(contentSpan);
        });
      });
    };
    
// 为微信公众号处理表格
const processWechatTables = (container: HTMLElement) => {
  const tables = container.querySelectorAll('table');
  tables.forEach(table => {
    // 为表格添加基本样式
    table.setAttribute('style', 'border-collapse: collapse; width: 100%; margin: 15px 0; font-size: 14px;');
    
    // 处理表头行
    const theadRows = table.querySelectorAll('thead tr');
    theadRows.forEach(row => {
      row.setAttribute('style', 'background-color: #f8f8f8;');
    });
    
    // 处理表头
    const headers = table.querySelectorAll('th');
    headers.forEach(header => {
      header.setAttribute('style', 'border: 1px solid #dddddd; padding: 8px; text-align: left; font-weight: bold;');
    });
    
    // 处理表格主体行（斑马纹效果）
    const tbodyRows = table.querySelectorAll('tbody tr');
    tbodyRows.forEach((row, index) => {
      if (index % 2 === 0) {
        row.setAttribute('style', 'background-color: #ffffff;');
      } else {
        row.setAttribute('style', 'background-color: #f9f9f9;');
      }
    });
    
    // 处理单元格
    const cells = table.querySelectorAll('td');
    cells.forEach(cell => {
      cell.setAttribute('style', 'border: 1px solid #dddddd; padding: 8px; text-align: left;');
    });
  });
};

// 清理 HTML 以适配微信公众号
const cleanupForWechat = (container: HTMLElement) => {
  // 1. 移除所有 class 和 id 属性
  const elementsWithClassOrId = container.querySelectorAll('[class], [id]');
  elementsWithClassOrId.forEach(element => {
    element.removeAttribute('class');
    element.removeAttribute('id');
  });
  
  // 2. 处理 SVG 元素（维持 Mermaid 图表，但确保其他 SVG 不影响渲染）
  const svgs = container.querySelectorAll('svg');
  svgs.forEach(svg => {
    // 如果在 Mermaid 容器中，调整其样式而非移除
    if (svg.closest('.mermaid-wrapper') || svg.closest('.mermaid')) {
      svg.setAttribute('style', 'max-width: 100%; height: auto; display: block; margin: 0 auto;');
      return;
    }
    
    // 否则使用 placeholder 替换
    const placeholder = document.createElement('span');
    placeholder.textContent = '[图表]';
    placeholder.setAttribute('style', 'color: #999; font-style: italic;');
    if (svg.parentNode) {
      svg.parentNode.replaceChild(placeholder, svg);
    }
  });
  
  // 3. 处理链接，确保使用微信支持的样式
  const links = container.querySelectorAll('a');
  links.forEach(link => {
    link.setAttribute('style', 'color: #576b95; text-decoration: underline;');
  });
  
  // 4. 确保段落使用行内样式
  const paragraphs = container.querySelectorAll('p');
  paragraphs.forEach(p => {
    const currentStyle = p.getAttribute('style') || '';
    p.setAttribute('style', `${currentStyle}; margin: 0.7em 0; padding: 0; line-height: 1.6;`);
  });
  
  // 5. 将 Flex/Grid 布局转换为 block
  const flexElements = container.querySelectorAll('[style*="display: flex"], [style*="display:flex"], [style*="display: grid"], [style*="display:grid"]');
  flexElements.forEach(el => {
    const style = el.getAttribute('style') || '';
    el.setAttribute('style', style
      .replace(/display\s*:\s*flex\s*;?/gi, 'display: block;')
      .replace(/display\s*:\s*grid\s*;?/gi, 'display: block;')
    );
  });
  
  // 6. 转换复杂的定位属性
  const positionedElements = container.querySelectorAll('[style*="position: absolute"], [style*="position:absolute"], [style*="position: fixed"], [style*="position:fixed"], [style*="position: sticky"], [style*="position:sticky"]');
  positionedElements.forEach(el => {
    const style = el.getAttribute('style') || '';
    el.setAttribute('style', style
      .replace(/position\s*:\s*(absolute|fixed|sticky)\s*;?/gi, 'position: relative;')
    );
  });
  
  // 7. 处理 pre 和 code 元素，确保代码块保持格式
  const codeBlocks = container.querySelectorAll('pre');
  codeBlocks.forEach(block => {
    block.setAttribute('style', 'background-color: #f8f8f8; border: 1px solid #ddd; border-radius: 3px; padding: 10px; font-family: Consolas, Monaco, monospace; font-size: 14px; line-height: 1.4; overflow-x: auto; white-space: pre; margin: 15px 0;');
  });
  
  const inlineCodes = container.querySelectorAll('code:not(pre code)');
  inlineCodes.forEach(code => {
    code.setAttribute('style', 'background-color: #f0f0f0; padding: 2px 4px; border-radius: 3px; font-family: Consolas, Monaco, monospace; font-size: 0.9em;');
  });
  
  // 8. 处理强调元素
  const strongs = container.querySelectorAll('strong, b');
  strongs.forEach(strong => {
    strong.setAttribute('style', 'font-weight: bold;');
  });
  
  const ems = container.querySelectorAll('em, i');
  ems.forEach(em => {
    em.setAttribute('style', 'font-style: italic;');
  });
  
  // 9. 处理水平线
  const hrs = container.querySelectorAll('hr');
  hrs.forEach(hr => {
    hr.setAttribute('style', 'border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;');
  });
  
  // 10. 处理图片容器
  const figures = container.querySelectorAll('figure');
  figures.forEach(figure => {
    figure.setAttribute('style', 'margin: 15px 0; text-align: center;');
    
    const figcaptions = figure.querySelectorAll('figcaption');
    figcaptions.forEach(caption => {
      caption.setAttribute('style', 'font-size: 14px; color: #666; margin-top: 5px;');
    });
  });
};

// 复制到公众号的函数 - 标记为未使用但保留接口
// @ts-ignore - 这个函数未使用但保留接口
// const copyToWechat = async (text: string, html?: string) => {
//   try {
//     console.log('开始复制内容...');
//     return copyToClipboardWithHtml(text, html);
//   } catch (err) {
//     console.error('复制失败:', err);
//     return false;
//   }
// };

// 获取微信公众号友好的HTML - 标记为未使用但保留接口
// @ts-ignore - 这个函数未使用但保留接口
// const getWechatCleanHtml = (container: HTMLElement): string => {
//   return container.innerHTML;
// };

// 移除多余的空白
// @ts-ignore - 保留这些函数供将来使用
const removeExtraWhitespace = (container: HTMLElement) => {
  // 移除空文本节点
  const walkNode = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent && /^\s*$/.test(node.textContent)) {
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // 先处理子节点，从后往前，避免处理过程中索引变化
      for (let i = node.childNodes.length - 1; i >= 0; i--) {
        walkNode(node.childNodes[i]);
      }
      
      // 处理元素节点
      if (node.nodeName === 'P' || node.nodeName === 'DIV') {
        if (!node.textContent || /^\s*$/.test(node.textContent)) {
          const hasNonTextContent = Array.from((node as Element).children).some(
            el => ['IMG', 'BR', 'HR', 'IFRAME'].includes(el.tagName)
          );
          
          if (!hasNonTextContent && node.parentNode) {
            node.parentNode.removeChild(node);
          }
        }
      }
    }
  };
  
  for (let i = container.childNodes.length - 1; i >= 0; i--) {
    walkNode(container.childNodes[i]);
  }
};

// 提取文本内容 - 标记为未使用但保留接口
// @ts-ignore - 这个函数未使用但保留接口
// const extractTextContent = (element: HTMLElement): string => {
//   return element.textContent || '';
// };

// 彻底清理HTML，确保不产生额外的空白行
// @ts-ignore - 保留这些函数供将来使用
const performFinalCleaning = (html: string): string => {
  // 使用临时div进行DOM操作
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // 1. 移除所有空节点
  const removeEmptyNodes = (node: Node) => {
    // 首先递归处理所有子节点
    for (let i = node.childNodes.length - 1; i >= 0; i--) {
      const child = node.childNodes[i];
      if (child.nodeType === Node.ELEMENT_NODE) {
        removeEmptyNodes(child);
      }
    }
    
    // 然后处理当前节点
    if (node.nodeType === Node.TEXT_NODE) {
      // 处理文本节点：如果是纯空白，则移除
      if (node.textContent && node.textContent.trim() === '') {
        // 修复TypeScript错误，使用parentNode.removeChild替代remove方法
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      
      // 处理元素节点：如果是空段落或只包含空白，则移除
      if (element.tagName === 'P' && 
          (!element.textContent || element.textContent.trim() === '') &&
          !element.querySelector('img, br, hr')) {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      }
      
      // 移除多余的换行和空白字符
      if (element.innerHTML) {
        element.innerHTML = element.innerHTML.replace(/>\s+</g, '><');
      }
    }
  };
  
  // 处理根节点
  removeEmptyNodes(tempDiv);
  
  // 2. 使用字符串替换方法进一步清理
  let result = tempDiv.innerHTML;
  result = result
    // 移除HTML注释
    .replace(/<!--[\s\S]*?-->/g, '')
    // 移除多余的空段落
    .replace(/<p>\s*<\/p>/g, '')
    // 移除只包含一个<br>的段落
    .replace(/<p>\s*<br\s*\/?>\s*<\/p>/g, '')
    // 压缩标签之间的空白
    .replace(/>\s+</g, '><')
    // 移除多余的换行符
    .replace(/\n{2,}/g, '\n');
  
  return result;
};

// 公众号处理特化版本的数学公式处理
const processBlockMath = async (container: HTMLElement) => {
  const katexBlocks = container.querySelectorAll('.katex-display');
  
  for (const block of katexBlocks) {
    try {
      const tex = extractTexContent(block);
      
      if (!tex) {
        console.error('无法提取TeX内容，跳过当前公式块');
        continue;
      }
      
      // 渲染为图片
      const imgContainer = await renderTexToImage(tex, true);
      block.replaceWith(imgContainer);
    } catch (error) {
      console.error('处理公式失败:', error);
    }
  }
};

// 公众号处理特化版本的行内公式处理
const processInlineMath = async (container: HTMLElement) => {
  const inlineMath = container.querySelectorAll('.katex:not(.katex-display .katex)');
  
  for (const math of inlineMath) {
    try {
      const texElement = math.querySelector('annotation[encoding="application/x-tex"]');
      if (!texElement) continue;

      const tex = texElement.textContent || '';
      const processedTex = tex.trim()
        .replace(/[\n\r]+/g, ' ')
        .replace(/\\\\/g, ' \\\\ ')
        .replace(/\s+/g, ' ');
      
      // 渲染为图片
      const imgElement = await renderTexToImage(processedTex, false);
      math.replaceWith(imgElement);
    } catch (error) {
      console.error('处理行内公式失败:', error);
    }
  }
};

// 公众号处理特化版本的标题处理
const processHeadings = (container: HTMLElement) => {
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  headings.forEach(heading => {
    const level = parseInt(heading.tagName.substring(1));
    
    // 根据标题级别设置不同的边距，减小值
    let marginTop, marginBottom;
    
    switch (level) {
      case 1: // h1标题上下边距相等
        marginTop = marginBottom = '1.5em';
        break;
      case 2:
        marginTop = '2em';
        marginBottom = '0.8em';
        break;
      case 3:
        marginTop = '1.8em';
        marginBottom = '0.7em';
        break;
      case 4:
        marginTop = '1.5em';
        marginBottom = '0.5em';
        break;
      case 5:
        marginTop = '1.2em';
        marginBottom = '0.4em';
        break;
      case 6:
        marginTop = '1em';
        marginBottom = '0.3em';
        break;
      default:
        marginTop = '0.8em';
        marginBottom = '0.8em';
    }
    
    // 应用样式，确保使用!important覆盖公众号默认样式
    heading.setAttribute('style', `margin-top:${marginTop} !important;margin-bottom:${marginBottom} !important;line-height:1.4 !important;padding:0 !important;`);
  });
};

// 公众号处理特化版本的引用处理
const processQuotes = (container: HTMLElement) => {
  const quotes = container.querySelectorAll('blockquote');
  
  quotes.forEach(quote => {
    const isNested = quote.getAttribute('data-nested') === "true";
    const paddingLeft = isNested ? "2em" : "1em";
    const borderColor = isNested ? "#666" : "#ccc";
    
    // 处理引用内的段落
    const paragraphs = quote.querySelectorAll('p');
    paragraphs.forEach(p => {
      p.style.cssText = 'margin:0 !important;padding:0 !important;line-height:1.5 !important;';
    });
    
    // 减少引用的上下留白
    quote.style.cssText = `padding:2px 0 2px ${paddingLeft} !important;border-left:4px solid ${borderColor} !important;margin:0.3em 0 !important;background:none !important;line-height:1.5 !important;`;
  });
};

// 公众号处理特化版本的图片处理
const processImages = (container: HTMLElement) => {
  const figures = container.querySelectorAll('figure.image-container');
  
  figures.forEach(figure => {
    const img = figure.querySelector('img');
    const title = figure.querySelector('figcaption');
    
    if (img) {
      const src = img.getAttribute('src') || '';
      const alt = img.getAttribute('alt') || '';
      const titleText = title ? title.textContent : '';
      
      const wrapper = document.createElement('div');
      wrapper.innerHTML = `<p style="text-align:center;margin:0;padding:0;"><img src="${src}" alt="${alt}" style="max-width:100%;margin:0;padding:0;display:block;"></p>${titleText ? `<p style="text-align:center;margin:5px 0 0 0;padding:0;font-size:14px;color:#666;">${titleText}</p>` : ''}`;
      
      figure.replaceWith(wrapper);
    }
  });
};

// 公众号处理特化版本的代码块处理
const processCodeBlocks = (container: HTMLElement) => {
  const codeBlocks = container.querySelectorAll('.relative.rounded-lg.overflow-hidden');
  
  codeBlocks.forEach(block => {
    if (block instanceof HTMLElement) {
      const codebar = block.querySelector('.codebar');
      if (codebar) {
        codebar.remove();
      }
      
      block.setAttribute('style', 'margin:16px 0;border-radius:6px;overflow:hidden;');
    }
  });
};

// 公众号处理特化版本的Mermaid图表处理
const processMermaidCharts = (container: HTMLElement) => {
  const mermaidDivs = container.querySelectorAll('.mermaid-wrapper');
  
  for (const div of mermaidDivs) {
    try {
      const svg = div.querySelector('svg');
      if (svg && svg instanceof SVGElement && div instanceof HTMLElement) {
        const viewBox = svg.getAttribute('viewBox');
        if (viewBox) {
          const [, , width] = viewBox.split(' ').map(Number);
          const maxWidth = 600;
          const targetWidth = Math.min(width, maxWidth);
          
          svg.setAttribute('style', `width:${targetWidth}px !important;height:auto !important;max-width:100%;display:block;margin:0 auto;`);
          div.setAttribute('style', `display:block;width:100%;text-align:center;margin:16px auto;page-break-inside:avoid;background:white;`);
        }
      }
    } catch (error) {
      // 静默处理错误，继续处理下一个图表
      if (div instanceof HTMLElement) {
        div.innerHTML = '<div class="text-red-500">图表处理失败</div>';
      }
    }
  }
};

// 获取Katex样式表
const getKatexStyles = () => {
  return Array.from(document.styleSheets)
    .filter(sheet => {
      try {
        return sheet.href?.includes('katex');
      } catch (e) {
        return false;
      }
    })
    .map(sheet => {
      try {
        return Array.from(sheet.cssRules)
          .map(rule => rule.cssText)
          .join('\n');
      } catch (e) {
        return '';
      }
    })
    .join('\n');
};

// 处理代码块，移除工具栏
const processCodeBlocksForExport = (container: HTMLElement) => {
  const codeBlocks = container.querySelectorAll('.relative.rounded-lg.overflow-hidden');
  codeBlocks.forEach(block => {
    const codebar = block.querySelector('.codebar');
    if (codebar) {
      codebar.remove();
    }
    
    if (block instanceof HTMLElement) {
      block.setAttribute('style', 'margin: 16px 0; border-radius: 6px; overflow: hidden;');
    }
  });
};

// 处理Mermaid图表
const processMermaidForExport = (container: HTMLElement) => {
  const mermaidDivs = container.querySelectorAll('.mermaid-wrapper');
  mermaidDivs.forEach((div: Element) => {
    if (div instanceof HTMLElement) {
      const svg = div.querySelector('svg');
      if (svg && svg instanceof SVGElement) {
        const viewBox = svg.getAttribute('viewBox');
        if (viewBox) {
          const [, , width] = viewBox.split(' ').map(Number);
          // 移除未使用的变量 height
          const maxWidth = 600;
          // 移除未使用的变量 ratio
          
          const targetWidth = Math.min(width, maxWidth);
          svg.setAttribute('style', `width:${targetWidth}px;height:auto;max-width:100%;display:block;margin:0 auto;`);
          div.setAttribute('style', 'display:block;width:100%;text-align:center;margin:16px auto;page-break-inside:avoid;background:white;');
        }
      }
    }
  });
};

// 创建并格式化导出用的HTML容器
const createExportContainer = (content: HTMLElement) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content.innerHTML;
  
  // 添加KaTeX样式
  const styleElement = document.createElement('style');
  styleElement.textContent = getKatexStyles();
  tempDiv.insertBefore(styleElement, tempDiv.firstChild);
  
  // 处理代码块和Mermaid图表
  processCodeBlocksForExport(tempDiv);
  processMermaidForExport(tempDiv);
  
  return tempDiv;
};

// 导出PDF的处理函数
const handleExportPDF = async () => {
  try {
    // 获取预览区容器
    const previewContainer = document.querySelector('.flex-auto.min-h-full.px-4.py-3.space-y-4');
    if (!previewContainer) {
      throw new Error('找不到预览内容容器');
    }

    // 创建格式化的导出容器
    const tempDiv = createExportContainer(previewContainer as HTMLElement);

    // 添加PDF专用样式
    const pdfStyleElement = document.createElement('style');
    pdfStyleElement.textContent = `
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #24292e;
        padding: 20px;
      }
      pre {
        background-color: #f6f8fa;
        border-radius: 6px;
        padding: 16px;
        overflow-x: auto;
        page-break-inside: avoid;
      }
      code {
        font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace;
      }
      p code, li code {
        position: relative;
        background: none;
        font-size: 0.9em;
        padding: 0.2em 0.4em;
        margin: 0 0.2em;
        white-space: pre-wrap;
        border-radius: 3px;
        display: inline;
        vertical-align: baseline;
      }
      p code::before, li code::before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-color: #f6f8fa;
        border-radius: 3px;
        z-index: -1;
      }
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 16px 0;
        page-break-inside: avoid;
      }
      th, td {
        border: 1px solid #dfe2e5;
        padding: 8px;
      }
      th {
        background-color: #f6f8fa;
      }
      img {
        max-width: 100%;
        height: auto;
        page-break-inside: avoid;
      }
      blockquote {
        margin: 0;
        padding-left: 16px;
        border-left: 4px solid #dfe2e5;
        color: #6a737d;
        page-break-inside: avoid;
      }
      del, s {
        position: relative;
        text-decoration: none;
      }
      del::before, s::before {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        top: 50%;
        border-top: 1px solid currentColor;
      }
      p, h1, h2, h3, h4, h5, h6, ul, ol, dl {
        page-break-inside: avoid;
        margin: 1em 0;
      }
      .mermaid-wrapper {
        display: block !important;
        text-align: center !important;
        margin: 16px auto !important;
        width: 100% !important;
        max-width: 100% !important;
        page-break-inside: avoid;
        background: white;
      }
      .mermaid {
        display: block !important;
        width: 100% !important;
        text-align: center !important;
        margin: 0 auto !important;
        background: white;
      }
      .mermaid svg {
        display: block !important;
        width: 80% !important;
        height: auto !important;
        margin: 0 auto !important;
      }
    `;
    tempDiv.insertBefore(pdfStyleElement, tempDiv.firstChild);

    // 在导出之前等待一小段时间，确保所有内容都已经正确渲染
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 额外处理Mermaid图表的居中问题
    const extraStyleElement = document.createElement('style');
    extraStyleElement.textContent = `
      .mermaid-wrapper, .mermaid, .mermaid svg {
        display: block !important;
        margin-left: auto !important;
        margin-right: auto !important;
        text-align: center !important;
      }
      .mermaid svg {
        width: 80% !important;
      }
    `;
    tempDiv.appendChild(extraStyleElement);

    // 配置PDF导出选项
    const opt = {
      margin: [15, 15] as [number, number],
      filename: 'markdown-export.pdf',
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true,
        scrollY: -window.scrollY,
        windowWidth: document.documentElement.offsetWidth,
        backgroundColor: '#ffffff',
        logging: true,
        onclone: (clonedDoc: Document) => {
          processMermaidForExport(clonedDoc.body);
        }
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' as 'portrait' | 'landscape',
        compress: true,
        hotfixes: ['px_scaling'],
        putTotalPages: true
      },
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy'],
        before: '.page-break-before',
        after: '.page-break-after',
        avoid: ['tr', 'td', 'pre[class*="language-"]', 'blockquote', '.mermaid-wrapper']
      }
    };

    // 导出PDF
    await html2pdf().set(opt).from(tempDiv).save();
  } catch (error) {
    // 显示用户友好的错误提示
    alert('导出PDF失败，请稍后重试');
    throw error;
  }
};

// 复制预览区内容
const handleCopyPreview = async () => {
  try {
    // 获取预览区容器
    const previewContainer = document.querySelector('.flex-auto.min-h-full.px-4.py-3.space-y-4');
    if (!previewContainer) {
      throw new Error('找不到预览内容容器');
    }

    // 创建格式化的导出容器
    const tempDiv = createExportContainer(previewContainer as HTMLElement);

    // 包装内容以确保样式正确应用
    const wrappedContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        ${tempDiv.innerHTML}
      </div>
    `;

    // 获取纯文本内容
    const plainText = (tempDiv as HTMLElement).innerText;
    
    return await copyToClipboard(plainText, wrappedContent);
  } catch (err) {
    console.error('复制预览区内容失败:', err);
    throw new Error('复制失败，请使用快捷键(Ctrl+C)手动复制');
  }
};

// 工具栏操作映射表，用于处理编辑器操作
const toolbarActionMap: Record<string, { text: string | ((text: string) => string), cursorOffset: number | ((text: string) => number) }> = {
  'heading': { 
    text: '# $text$', 
    cursorOffset: 2 
  },
  'bold': { 
    text: '**$text$**', 
    cursorOffset: text => text ? text.length + 4 : 2 
  },
  'italic': { 
    text: '*$text$*', 
    cursorOffset: text => text ? text.length + 2 : 1 
  },
  'link': { 
    text: '[$text$](url)', 
    cursorOffset: text => text ? text.length + 3 : 1 
  },
  'image': { 
    text: '![$text$](url)', 
    cursorOffset: text => text ? text.length + 4 : 2 
  },
  'quote': { 
    text: (text: string) => text 
      ? text.split('\n').map(line => `> ${line}`).join('\n')
      : '> 引用文本',
    cursorOffset: 2 
  },
  'list-ol': { 
    text: (text: string) => text 
      ? text.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n')
      : '1. 有序列表项',
    cursorOffset: 3 
  },
  'list-ul': { 
    text: (text: string) => text 
      ? text.split('\n').map(line => `- ${line}`).join('\n')
      : '- 无序列表项',
    cursorOffset: 2 
  },
  'table': { 
    text: '| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 内容1 | 内容2 | 内容3 |',
    cursorOffset: text => text ? text.length : 0
  },
  'hr': { 
    text: '\n---\n',
    cursorOffset: 5 
  }
};

// 处理代码块的特殊情况
const handleCodeAction = (text: string) => {
  if (text.includes('\n')) {
    return {
      text: '```\n' + (text || '代码块') + '\n```',
      cursorOffset: 4
    };
  } else {
    return {
      text: '`' + (text || '代码') + '`',
      cursorOffset: text ? text.length + 2 : 1
    };
  }
};

const SplitEditor: React.FC<SplitEditorProps> = ({
  initialValue = '',
  onSave,
  readOnly = false,
  recordId,
  fieldId,
  isBitable = false,
  style = 'notion',  // 默认为Notion样式
  isAutoSaveEnabled = false,  // 添加自动保存属性
  onThemeChange,  // 添加主题变更回调
  onAutoSaveChange  // 添加自动保存设置变更回调
}) => {
  // 状态定义
  const [content, setContent] = useState(initialValue);
  const [savedContent, setSavedContent] = useState(initialValue);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'changed'>('saved');
  const [renderedContent, setRenderedContent] = useState<React.ReactNode[]>([]);
  const [viewMode, setViewMode] = useState<'edit' | 'split' | 'preview'>('edit');
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingContent, setPendingContent] = useState<string | null>(null);
  const [currentStyle, setCurrentStyle] = useState<ThemeStyle>(style);  // 使用ThemeStyle类型
  
  // 复制状态
  const [copyStatus, setCopyStatus] = useState<{
    edit: boolean;
    preview: boolean;
    wechat: boolean | 'processing';
    html: boolean;
  }>({
    edit: false,
    preview: false,
    wechat: false,
    html: false
  });

  // 生成当前主题的样式 - 移除isDarkMode参数
  // const themeStyles = generateThemeStyles(currentStyle);

  // // 记录当前触发滚动的元素
  // const scrollingElement = useRef<'textarea' | 'preview' | null>(null);
  // const isScrolling = useRef(false);
  const textareaContainerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // 引用
  const lastSavedContent = useRef(initialValue);
  const previousRecordId = useRef(recordId);
  const previousFieldId = useRef(fieldId);
  const isInitialMount = useRef(true);
  const isSaving = useRef(false);
  // const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 监听 initialValue 的变化
  useEffect(() => {
    setContent(initialValue);
    setSavedContent(initialValue);
    setSaveStatus('saved');
  }, [initialValue]);

  // 渲染 Markdown 内容
  useEffect(() => {
    try {
      // 配置 DOMPurify
      DOMPurify.addHook('afterSanitizeAttributes', function(node) {
        if (node.tagName === 'DIV' && (node.classList.contains('mermaid') || node.classList.contains('mermaid-wrapper'))) {
          node.setAttribute('style', 'overflow: visible !important; max-width: 100%;');
        }
        if (node.tagName === 'svg') {
          node.setAttribute('style', 'max-width: 100%; height: auto !important; overflow: visible !important;');
        }
      });

      // 使用 marked 解析 markdown
      const renderer = configureMarked();
      const html = marked.parse(content, {
        renderer,
        async: false
      }) as string;
      
      // 使用 DOMPurify 清理 HTML
      const cleanHtml = DOMPurify.sanitize(html, {
        ADD_TAGS: ['div', 'svg', 'path', 'marker', 'defs', 'pattern', 'foreignObject', 'g', 'rect', 'circle', 'line', 'polyline', 'polygon', 'text', 'textPath', 'tspan'],
        ADD_ATTR: [
          'class', 'style', 'id', 'viewBox', 'd', 'fill', 'stroke', 'stroke-width',
          'marker-end', 'transform', 'x', 'y', 'width', 'height', 'points',
          'preserveAspectRatio', 'dx', 'dy', 'font-family', 'font-size',
          'text-anchor', 'dominant-baseline', 'clip-path', 'fill-opacity',
          'stroke-dasharray', 'stroke-opacity', 'pathLength',
          'data-language', 'data-code'
        ],
        ADD_DATA_URI_TAGS: ['img'],
        FORBID_TAGS: ['script', 'style'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick']
      });
      
      // 创建临时容器并解析HTML
      const container = document.createElement('div');
      container.innerHTML = cleanHtml;
      
      // 将HTML转换为React节点数组
      const nodes: React.ReactNode[] = [];
      container.childNodes.forEach((node, index) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          
          // 检查是否是代码块占位符
          if (element.classList.contains('codeblock-placeholder')) {
            const language = element.getAttribute('data-language') || 'text';
            const code = decodeURIComponent(element.getAttribute('data-code') || '');
            nodes.push(
              <div key={index} className="prose max-w-none">
                <CodeBlock
                  language={language}
                  value={code}
                  showLineNumbers={true}
                />
              </div>
            );
          }
          // 检查是否是 Mermaid 图表容器
          else if (element.classList.contains('mermaid-wrapper')) {
            nodes.push(
              <MermaidRenderer
                key={index}
                code={element.textContent || ''}
                className="my-4"
              />
            );
          } else {
            nodes.push(
              <div
                key={index}
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: element.outerHTML }}
              />
            );
          }
        }
      });
      
      setRenderedContent(nodes);
    } catch (error) {
      setRenderedContent([
        <div key="error" className="text-red-500">
          渲染内容时出错: {(error as Error).message}
        </div>
      ]);
    }
  }, [content, currentStyle]);  // 只依赖content和currentStyle

  // 保存内容的函数
  const saveContent = useCallback(async (contentToSave: string) => {
    if (contentToSave === lastSavedContent.current || isSaving.current) {
      return;
    }

    isSaving.current = true;
    setError(null);
    setSaveStatus('saving');

    try {
      if (onSave) {
        await onSave(contentToSave);
      }
      lastSavedContent.current = contentToSave;
      setSavedContent(contentToSave);
      setSaveStatus('saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
      setSaveStatus('changed');
      throw err;
    } finally {
      isSaving.current = false;
    }
  }, [onSave]);

  // 自动保存逻辑
  useEffect(() => {
    if (!isAutoSaveEnabled || content === savedContent || isSaving.current) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        if (content !== savedContent) {
          await saveContent(content);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '自动保存失败');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAutoSaveEnabled, content, savedContent, saveContent]);

  // 处理单元格切换
  useEffect(() => {
    if (!isBitable || !recordId || !fieldId) return;

    const handleCellChange = async () => {
      // 检查是否是初始加载
      if (isInitialMount.current) {
        isInitialMount.current = false;
        try {
          const value = await getCellValue(recordId, fieldId);
          const stringValue = String(value || '');
          setContent(stringValue);
          setSavedContent(stringValue);
          lastSavedContent.current = stringValue;
        } catch (err) {
          setError(err instanceof Error ? err.message : '获取内容失败');
        }
        return;
      }

      // 处理单元格切换
      if (recordId !== previousRecordId.current || fieldId !== previousFieldId.current) {
        if (content !== savedContent) {
          setPendingContent(null);
          setIsModalOpen(true);
          return;
        }

        try {
          const value = await getCellValue(recordId, fieldId);
          const stringValue = String(value || '');
          setContent(stringValue);
          setSavedContent(stringValue);
          lastSavedContent.current = stringValue;
        } catch (err) {
          setError(err instanceof Error ? err.message : '获取内容失败');
        }
      }
    };

    handleCellChange();
    previousRecordId.current = recordId;
    previousFieldId.current = fieldId;
  }, [recordId, fieldId, content, savedContent, isBitable]);

  // 处理模态框操作
  const handleModalConfirm = async () => {
    try {
      await saveContent(content);
      setIsModalOpen(false);
      
      if (pendingContent !== null) {
        setContent(pendingContent);
        setSavedContent(pendingContent);
        lastSavedContent.current = pendingContent;
        setPendingContent(null);
      }
    } catch (err) {
      console.error('保存确认失败:', err);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    if (pendingContent !== null) {
      setContent(pendingContent);
      setSavedContent(pendingContent);
      lastSavedContent.current = pendingContent;
      setPendingContent(null);
    }
  };

  // 内容变更处理
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    const scrollTop = textarea.scrollTop;
    const newContent = e.target.value;
    
    setContent(newContent);
    setSaveStatus(newContent !== savedContent ? 'changed' : 'saved');
    
    // 恢复滚动位置
    requestAnimationFrame(() => {
      textarea.scrollTop = scrollTop;
    });
  };

  // 保持编辑器滚动位置
  useEffect(() => {
    const textarea = editorRef.current;
    if (!textarea) return;

    // 移除未使用的变量
    // let lastScrollTop = textarea.scrollTop;
    const handleScroll = () => {
      // lastScrollTop = textarea.scrollTop;
    };

    textarea.addEventListener('scroll', handleScroll);
    return () => {
      textarea.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 在内容更新后恢复滚动位置
  useEffect(() => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const currentScrollTop = textarea.scrollTop;
    const maxScrollTop = textarea.scrollHeight - textarea.clientHeight;

    if (currentScrollTop > 0 && currentScrollTop <= maxScrollTop) {
      requestAnimationFrame(() => {
        textarea.scrollTop = currentScrollTop;
      });
    }
  }, [content]);

  // 手动保存
  const handleSaveClick = async () => {
    if (saveStatus === 'saving' || content === savedContent) {
      return;
    }
    await saveContent(content);
  };

  // 通用的复制处理函数
  const handleCopy = async (type: 'edit' | 'preview' | 'wechat' | 'html') => {
    try {
      let success = false;
      
      if (type === 'edit') {
        success = await copyToClipboard(content);
      } else if (type === 'preview') {
        success = await handleCopyPreview();
      } else if (type === 'wechat') {
        const previewContainer = document.querySelector('.flex-auto.min-h-full.px-4.py-3.space-y-4');
        if (!previewContainer) {
          throw new Error('找不到预览内容容器');
        }
        
        setCopyStatus(prev => ({ ...prev, wechat: 'processing' }));
        
        try {
          const processedHtml = await processContentForWechat(previewContainer as HTMLElement);
          const plainText = (previewContainer as HTMLElement).innerText;
          success = await copyToClipboardWithHtml(plainText, processedHtml);
        } catch (err) {
          throw new Error(`处理公众号内容失败: ${err instanceof Error ? err.message : String(err)}`);
        }
      } else if (type === 'html') {
        const previewContainer = document.querySelector('.flex-auto.min-h-full.px-4.py-3.space-y-4');
        if (!previewContainer) {
          throw new Error('找不到预览内容容器');
        }
        
        const rawHtml = (previewContainer as HTMLElement).innerHTML;
        success = await copyToClipboard(rawHtml);
      }
      
      if (success) {
        setCopyStatus(prev => ({ ...prev, [type]: true }));
        setTimeout(() => setCopyStatus(prev => ({ ...prev, [type]: false })), 2000);
      } else {
        throw new Error('复制操作未成功完成');
      }
    } catch (err) {
      setCopyStatus(prev => ({ ...prev, [type]: false }));
      
      if (type === 'wechat') {
        alert(`复制到公众号失败: ${err instanceof Error ? err.message : '未知错误'}。可能是因为内容过于复杂，请尝试复制原文后手动处理。`);
      } else {
        alert('复制失败，请使用快捷键(Ctrl+C)手动复制');
      }
    }
  };

  // 工具栏操作处理
  const handleToolbarAction = (action: string, value?: string) => {
    if (!editorRef.current) return;

    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    // 处理导出PDF的特殊情况
    if (action === 'export-pdf') {
      handleExportPDF();
      return;
    }
    
    // 处理代码块的特殊情况
    if (action === 'code') {
      const { text, cursorOffset } = handleCodeAction(selectedText);
      insertText(text, start, end, cursorOffset);
      return;
    }
    
    // 使用操作映射处理其他情况
    if (action in toolbarActionMap) {
      const { text, cursorOffset } = toolbarActionMap[action];
      let newText = '';
      
      if (typeof text === 'function') {
        newText = text(selectedText);
      } else {
        newText = text.replace('$text$', selectedText || (
          action === 'heading' ? '标题' : 
          action === 'bold' ? '粗体文本' : 
          action === 'italic' ? '斜体文本' : 
          action === 'link' ? '链接文本' : 
          action === 'image' ? '图片描述' : 
          ''
        ));
      }
      
      const newCursorPos = typeof cursorOffset === 'function' 
        ? start + cursorOffset(selectedText)
        : start + cursorOffset;
        
      insertText(newText, start, end, newCursorPos);
    } else if (value) {
      // 处理自定义值
      let newText = value
        .replace('文本', selectedText || '文本')
        .replace('代码', selectedText || '代码')
        .replace('链接文本', selectedText || '链接文本');
      
      insertText(newText, start, end, start + newText.length);
    }
  };
  
  // 辅助函数：插入文本并设置光标位置
  const insertText = (text: string, start: number, end: number, cursorPos: number) => {
    if (!editorRef.current) return;
    
    const textarea = editorRef.current;
    const newContent = textarea.value.substring(0, start) + text + textarea.value.substring(end);
    setContent(newContent);
    setSaveStatus(newContent !== savedContent ? 'changed' : 'saved');
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  };

  // 切换样式
  const toggleStyle = () => {
    const newStyle = currentStyle === 'github' ? 'notion' : 'github';
    setCurrentStyle(newStyle);
    // 更新body的data-theme属性
    document.body.setAttribute('data-theme', newStyle);
    onThemeChange?.(newStyle);
  };

  // 初始化时设置主题
  useEffect(() => {
    // 设置初始主题
    document.body.setAttribute('data-theme', currentStyle);
  }, []);

  useEffect(() => {
    onAutoSaveChange?.(isAutoSaveEnabled);
  }, [isAutoSaveEnabled, onAutoSaveChange]);

  useEffect(() => {
    // 处理滚动同步
    if (viewMode !== 'split') return;
    
    return () => {};
  }, [viewMode]);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-white">
      {/* 固定在顶部的工具栏 */}
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="flex justify-between items-center px-2 sm:px-4 py-2 h-12 bg-white border-b border-gray-200/80">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex items-center bg-gray-200 rounded-md p-0.5">
              <button
                className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                  viewMode === 'edit'
                    ? 'bg-white text-blue-700 shadow-sm border border-gray-300'
                    : 'text-gray-900 hover:text-black hover:bg-gray-100'
                }`}
                onClick={() => setViewMode('edit')}
                title="编辑模式"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span className="hidden sm:inline">编辑</span>
              </button>
              <button
                className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                  viewMode === 'split'
                    ? 'bg-white text-blue-700 shadow-sm border border-gray-300'
                    : 'text-gray-900 hover:text-black hover:bg-gray-100'
                }`}
                onClick={() => setViewMode('split')}
                title="分屏模式"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                <span className="hidden sm:inline">分屏</span>
              </button>
              <button
                className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                  viewMode === 'preview'
                    ? 'bg-white text-blue-700 shadow-sm border border-gray-300'
                    : 'text-gray-900 hover:text-black hover:bg-gray-100'
                }`}
                onClick={() => setViewMode('preview')}
                title="预览模式"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="hidden sm:inline">预览</span>
              </button>
            </div>
            <button
              className={`flex items-center justify-center w-8 h-8 rounded-md text-sm font-semibold transition-all duration-200
                ${isToolbarExpanded 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-900 hover:text-black hover:bg-gray-100/80'}`}
              onClick={() => setIsToolbarExpanded(!isToolbarExpanded)}
              title={isToolbarExpanded ? '收起工具栏' : '展开工具栏'}
            >
              <svg 
                className={`w-4 h-4 transform transition-transform ${isToolbarExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {/* 重新设计的样式切换按钮 */}
            <button
              className={`flex items-center justify-center w-8 h-8 rounded-md text-sm font-semibold transition-all duration-200 
                ${currentStyle === 'github' 
                  ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' 
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
              onClick={toggleStyle}
              title={`切换到${currentStyle === 'github' ? 'Notion' : 'GitHub'}样式`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </button>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-3">
            <button
              className={`flex items-center space-x-1 px-2 py-1.5 rounded-md text-sm font-semibold ${
                isAutoSaveEnabled
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-gray-50 text-gray-600 border border-gray-200'
              } transition-all duration-200`}
              onClick={() => onAutoSaveChange?.(!isAutoSaveEnabled)}
              title="自动保存"
            >
              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isAutoSaveEnabled ? 2.5 : 1.5} 
                  d={isAutoSaveEnabled 
                    ? "M5 13l4 4L19 7" 
                    : "M17 16v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2h2m3-4H9a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-1m-1 4l-3 3m0 0l-3-3m3 3V3"} 
                />
              </svg>
              <span className="hidden sm:inline">{isAutoSaveEnabled ? '已开启自动' : '自动'}保存</span>
              <span className="inline sm:hidden">{isAutoSaveEnabled ? '自动' : '手动'}</span>
            </button>
            <button
              className={`px-2 sm:px-3 py-1.5 text-sm font-semibold rounded-md transition-all duration-200
                ${saveStatus === 'changed' 
                  ? 'bg-blue-700 text-white hover:bg-blue-800 animate-pulse-save shadow-md' 
                  : saveStatus === 'saving'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={handleSaveClick}
              disabled={saveStatus === 'saving'}
            >
              {saveStatus === 'saving' 
                ? '保存中...' 
                : saveStatus === 'changed' 
                  ? <>{<span className="hidden sm:inline">保存更改</span>}{<span className="inline sm:hidden">保存</span>}</>
                  : <>{<span className="hidden sm:inline">已保存</span>}{<span className="inline sm:hidden">✓</span>}</>
              }
            </button>
          </div>
        </div>
        <div 
          className={`transition-all duration-300 ease-in-out flex-none overflow-hidden
            ${isToolbarExpanded ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          {!readOnly && <MarkdownToolbar onAction={handleToolbarAction} />}
        </div>
      </div>

      {error && (
        <div className="absolute top-12 left-0 right-0 bg-red-50 text-red-600 px-4 py-2 border border-red-200 z-10">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* 内容区域 */}
      <div className="relative flex flex-1 overflow-hidden split-editor-content">
        {/* 滚动容器 */}
        <div 
          className={`absolute inset-0 ${viewMode === 'edit' ? 'overflow-hidden' : 'overflow-auto'}`}
          ref={previewRef}
        >
          {/* 内容包装器 - 确保内容能完整显示 */}
          <div className="min-h-full w-full flex">
            {(viewMode === 'edit' || viewMode === 'split') && !readOnly && (
              <div 
                className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} relative`}
                ref={textareaContainerRef}
                id="editor-container"
              >
                {/* 编辑区复制按钮 */}
                <button
                  className={`sticky top-3 right-3 z-10 px-2 py-1.5 text-xs rounded-md font-semibold float-right
                    ${copyStatus.edit 
                      ? 'bg-green-700 hover:bg-green-600 text-white' 
                      : 'bg-gray-800/90 hover:bg-gray-700 text-white'} 
                    transition-colors shadow-sm backdrop-blur-sm opacity-30 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center`}
                  onClick={() => handleCopy('edit')}
                  title="复制 Markdown 源码"
                >
                  <svg className="w-3.5 h-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{copyStatus.edit ? '已复制' : '复制'}</span>
                </button>
                <div className="px-4 py-3 h-full">
                  <textarea
                    ref={editorRef}
                    className="editor-textarea"
                    value={content}
                    onChange={handleContentChange}
                    spellCheck={false}
                  />
                </div>
              </div>
            )}
            
            {(viewMode === 'split' || viewMode === 'preview' || readOnly) && (
              <div 
                className={`${readOnly || viewMode === 'preview' ? 'w-full' : 'w-1/2'} preview-container`}
              >
                {/* 预览区复制按钮组 */}
                <div className="sticky top-3 right-3 z-10 flex flex-col space-y-2 float-right opacity-30 hover:opacity-100 transition-opacity duration-300">
                  <button
                    className={`px-2 py-1.5 text-xs rounded-md font-semibold shadow-sm ${
                      copyStatus.preview ? 'bg-green-700 hover:bg-green-600 text-white' : 'bg-gray-800/90 hover:bg-gray-700 text-white'
                    } backdrop-blur-sm transition-colors flex items-center justify-center`}
                    onClick={() => handleCopy('preview')}
                    title="复制原始格式内容"
                  >
                    <svg className="w-3.5 h-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                    <span>{copyStatus.preview ? '已复制' : '复制'}</span>
                  </button>
                  <button
                    className={`px-2 py-1.5 text-xs rounded-md font-semibold shadow-sm ${
                      copyStatus.html ? 'bg-green-700 hover:bg-green-600 text-white' : 'bg-purple-800/90 hover:bg-purple-700 text-white'
                    } backdrop-blur-sm transition-colors flex items-center justify-center`}
                    onClick={() => handleCopy('html')}
                    title="复制HTML源代码"
                  >
                    <svg className="w-3.5 h-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    <span>{copyStatus.html ? '已复制' : 'HTML'}</span>
                  </button>
                </div>
                <div className="markdown-content">
                  {renderedContent}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        title="保存更改"
        message="当前单元格有未保存的更改。是否保存当前更改？"
      />
    </div>
  );
};

export default SplitEditor;