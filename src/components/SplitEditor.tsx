import React, { useState, useEffect, useCallback, useRef } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { renderToString } from 'react-dom/server';
import CodeBlock from '../utils/markdown/components/CodeBlock';
import MermaidRenderer from '../utils/markdown/components/MermaidRenderer';
import katex from 'katex';
import MarkdownToolbar from './MarkdownToolbar';
import 'katex/dist/katex.min.css';
import { getCellValue } from '../utils/bitable';
import Modal from './Modal';

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
    const className = `${sizes[level] || sizes[6]} my-4 text-gray-900 dark:text-gray-100`;
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
    return `<blockquote class="pl-4 my-4 border-l-4 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 italic">${quote}</blockquote>`;
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
        console.error('KaTeX 渲染错误:', error);
        return `<div class="text-red-500">公式渲染错误: ${(error as Error).message}</div>`;
      }
    }
    
    // 使用 CodeBlock 组件渲染常规代码块
    return renderToString(
      <CodeBlock
        language={language || 'text'}
        value={code}
        showLineNumbers={true}
      />
    );
  };
  
  // 图片渲染
  renderer.image = (href, title, text) => {
    return `<div class="my-4 text-center">
              <img src="${href}" alt="${text}" title="${title || ''}" class="max-w-full h-auto mx-auto rounded-lg shadow-md" />
              ${title ? `<div class="mt-2 text-sm text-gray-600 dark:text-gray-400">${title}</div>` : ''}
            </div>`;
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
    level: 'block',
    start(src: string) {
      return src.match(/\$|\\\(|\\\[/)?.index;
    },
    tokenizer(src: string) {
      // 匹配块级公式：$$...$$
      const blockMath = src.match(/^\$\$([\s\S]+?)\$\$/);
      if (blockMath) {
        return {
          type: 'math',
          raw: blockMath[0],
          text: blockMath[1].trim(),
          display: true,
          tokens: []
        };
      }

      // 匹配块级公式：\[...\]
      const blockMath2 = src.match(/^\\\[([\s\S]+?)\\\]/);
      if (blockMath2) {
        return {
          type: 'math',
          raw: blockMath2[0],
          text: blockMath2[1].trim(),
          display: true,
          tokens: []
        };
      }

      // 匹配单个 $ 包围的块级公式（需要包含换行）
      const singleDollarBlock = src.match(/^\$([\s\S]*?\n[\s\S]*?)\$/);
      if (singleDollarBlock) {
        return {
          type: 'math',
          raw: singleDollarBlock[0],
          text: singleDollarBlock[1].trim(),
          display: true,
          tokens: []
        };
      }

      // 匹配行内公式：$...$（不包含换行）
      const inlineMath = src.match(/^\$([^\n$]+?)\$/);
      if (inlineMath) {
        return {
          type: 'math',
          raw: inlineMath[0],
          text: inlineMath[1].trim(),
          display: false,
          tokens: []
        };
      }

      // 匹配行内公式：\(...\)
      const inlineMath2 = src.match(/^\\\((.+?)\\\)/);
      if (inlineMath2) {
        return {
          type: 'math',
          raw: inlineMath2[0],
          text: inlineMath2[1].trim(),
          display: false,
          tokens: []
        };
      }

      return undefined;
    },
    renderer(token: any) {
      try {
        return katex.renderToString(token.text, {
          displayMode: token.display,
          throwOnError: false,
          strict: false
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
  
  marked.use({ extensions: [mathExtension] });

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
}

const SplitEditor: React.FC<SplitEditorProps> = ({
  initialValue = '',
  onSave,
  readOnly = false,
  recordId,
  fieldId,
  isBitable = false
}) => {
  const [content, setContent] = useState(initialValue);
  const [savedContent, setSavedContent] = useState(initialValue);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'changed'>('saved');
  const [renderedContent, setRenderedContent] = useState<React.ReactNode[]>([]);
  const [viewMode, setViewMode] = useState<'edit' | 'split' | 'preview'>('edit');
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingContent, setPendingContent] = useState<string | null>(null);
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(false);

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const editorWrapperRef = useRef<HTMLDivElement>(null);
  const lastSavedContent = useRef(initialValue);
  const previousRecordId = useRef(recordId);
  const previousFieldId = useRef(fieldId);
  const isInitialMount = useRef(true);
  const isSaving = useRef(false);

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
          'stroke-dasharray', 'stroke-opacity', 'pathLength'
        ],
        ADD_DATA_URI_TAGS: ['img'],
        FORBID_TAGS: ['script', 'style'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick']
      });
      
      // 创建一个临时容器来解析 HTML
      const container = document.createElement('div');
      container.innerHTML = cleanHtml;
      
      // 将 HTML 转换为 React 节点数组
      const nodes: React.ReactNode[] = [];
      container.childNodes.forEach((node, index) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          
          // 检查是否是 Mermaid 图表容器
          if (element.classList.contains('mermaid-wrapper')) {
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
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: element.outerHTML }}
              />
            );
          }
        }
      });
      
      setRenderedContent(nodes);
    } catch (error) {
      console.error('渲染 Markdown 内容时出错:', error);
      setRenderedContent([
        <div key="error" className="text-red-500">
          渲染内容时出错: {(error as Error).message}
        </div>
      ]);
    }
  }, [content]);

  // 保存内容的函数
  const saveContent = useCallback(async (contentToSave: string) => {
    if (contentToSave === lastSavedContent.current || isSaving.current) {
      return;
    }

    console.log('开始保存内容:', contentToSave);
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
      console.log('内容保存成功');
    } catch (err) {
      console.error('保存失败:', err);
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
        console.log('自动保存触发，当前内容:', content);
        if (content !== savedContent) {
          await saveContent(content);
        }
      } catch (err) {
        console.error('自动保存失败:', err);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAutoSaveEnabled, content, savedContent, saveContent]);

  // 处理单元格切换
  useEffect(() => {
    if (!isBitable || !recordId || !fieldId) return;

    const handleCellChange = async () => {
      console.log('处理单元格切换:', { recordId, fieldId, content, savedContent });
      
      // 检查是否是初始加载
      if (isInitialMount.current) {
        isInitialMount.current = false;
        try {
          const value = await getCellValue(recordId, fieldId);
          console.log('初始加载单元格内容:', value);
          setContent(value || '');
          setSavedContent(value || '');
          lastSavedContent.current = value || '';
        } catch (err) {
          console.error('初始加载单元格内容失败:', err);
          setError(err instanceof Error ? err.message : '获取内容失败');
        }
        return;
      }

      // 处理单元格切换
      if (recordId !== previousRecordId.current || fieldId !== previousFieldId.current) {
        console.log('单元格已切换，检查是否有未保存内容');
        
        if (content !== savedContent) {
          console.log('有未保存的更改，显示确认对话框');
          setPendingContent(null);
          setIsModalOpen(true);
          return;
        }

        try {
          console.log('加载新单元格内容');
          const value = await getCellValue(recordId, fieldId);
          console.log('新单元格内容:', value);
          setContent(value || '');
          setSavedContent(value || '');
          lastSavedContent.current = value || '';
        } catch (err) {
          console.error('获取新单元格内容失败:', err);
          setError(err instanceof Error ? err.message : '获取内容失败');
        }
      }
    };

    handleCellChange();
    previousRecordId.current = recordId;
    previousFieldId.current = fieldId;
  }, [recordId, fieldId, content, savedContent, isBitable]);

  // 处理模态框确认
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

  // 处理模态框关闭
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
    const newContent = e.target.value;
    console.log('内容变更:', newContent);
    setContent(newContent);
    if (newContent !== savedContent) {
      setSaveStatus('changed');
    } else {
      setSaveStatus('saved');
    }
  };

  // 手动保存按钮处理
  const handleSaveClick = async () => {
    if (saveStatus === 'saving' || content === savedContent) {
      return;
    }
    await saveContent(content);
  };

  // 工具栏操作处理
  const handleToolbarAction = (action: string, value?: string) => {
    if (!editorRef.current) return;

    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let newText = '';
    let newCursorPos = start;

    switch (action) {
      case 'heading':
        newText = `# ${selectedText || '标题'}`;
        newCursorPos = start + 2;
        break;
      case 'bold':
        newText = `**${selectedText || '粗体文本'}**`;
        newCursorPos = start + (selectedText ? selectedText.length + 4 : 2);
        break;
      case 'italic':
        newText = `*${selectedText || '斜体文本'}*`;
        newCursorPos = start + (selectedText ? selectedText.length + 2 : 1);
        break;
      case 'code':
        if (selectedText.includes('\n')) {
          newText = `\`\`\`\n${selectedText || '代码块'}\n\`\`\``;
          newCursorPos = start + 4;
        } else {
          newText = `\`${selectedText || '代码'}\``;
          newCursorPos = start + (selectedText ? selectedText.length + 2 : 1);
        }
        break;
      case 'link':
        newText = `[${selectedText || '链接文本'}](url)`;
        newCursorPos = start + (selectedText ? selectedText.length + 3 : 1);
        break;
      case 'image':
        newText = `![${selectedText || '图片描述'}](url)`;
        newCursorPos = start + (selectedText ? selectedText.length + 4 : 2);
        break;
      case 'quote':
        newText = selectedText
          ? selectedText.split('\n').map(line => `> ${line}`).join('\n')
          : `> 引用文本`;
        newCursorPos = start + 2;
        break;
      case 'list-ol':
        newText = selectedText
          ? selectedText.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n')
          : `1. 有序列表项`;
        newCursorPos = start + 3;
        break;
      case 'list-ul':
        newText = selectedText
          ? selectedText.split('\n').map(line => `- ${line}`).join('\n')
          : `- 无序列表项`;
        newCursorPos = start + 2;
        break;
      case 'table':
        newText = `| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 内容1 | 内容2 | 内容3 |`;
        newCursorPos = start + newText.length;
        break;
      case 'code-block':
        newText = `\`\`\`\n${selectedText || '代码'}\n\`\`\``;
        newCursorPos = start + 4;
        break;
      case 'hr':
        newText = `\n---\n`;
        newCursorPos = start + 5;
        break;
      default:
        if (value) {
          newText = value.replace('文本', selectedText || '文本')
                       .replace('代码', selectedText || '代码')
                       .replace('链接文本', selectedText || '链接文本');
          newCursorPos = start + newText.length;
        }
        break;
    }

    // 更新内容
    const newContent = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
    setContent(newContent);
    
    // 更新保存状态
    if (newContent !== savedContent) {
      setSaveStatus('changed');
    } else {
      setSaveStatus('saved');
    }

    // 设置新的光标位置
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className="flex flex-col w-full h-full min-h-split rounded-lg overflow-hidden bg-white border border-gray-200/80">
      <div className="flex-none">
        <div className="flex justify-between items-center px-4 py-2 h-12 bg-white/80 backdrop-blur-sm border-b border-gray-200/80">
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100/80 rounded-md p-0.5">
              <button
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'edit'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setViewMode('edit')}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                编辑
              </button>
              <button
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'split'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setViewMode('split')}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                分屏
              </button>
              <button
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'preview'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setViewMode('preview')}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                预览
              </button>
            </div>
            <button
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all duration-200
                ${isToolbarExpanded 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'}`}
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
          </div>
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                checked={isAutoSaveEnabled}
                onChange={(e) => setIsAutoSaveEnabled(e.target.checked)}
              />
              <span>自动保存</span>
            </label>
            <button
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200
                ${saveStatus === 'changed' 
                  ? 'bg-blue-700 text-white hover:bg-blue-800 animate-pulse-save shadow-md' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              onClick={handleSaveClick}
              disabled={saveStatus === 'saving'}
            >
              {saveStatus === 'saving' ? '保存中...' : '保存'}
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

      <div className="flex flex-auto min-h-[calc(100vh-12rem)] overflow-hidden mb-8">
        {(viewMode === 'edit' || viewMode === 'split') && !readOnly && (
          <div className={`flex flex-col flex-auto min-h-full ${viewMode === 'split' ? 'w-1/2' : 'w-full'} border-r border-split-border dark:border-dark-split-border`} ref={editorWrapperRef}>
            <textarea
              ref={editorRef}
              className="flex-auto w-full min-h-full px-4 py-3 bg-split-editor dark:bg-dark-split-editor text-split-text dark:text-dark-split-text resize-none focus:outline-none"
              value={content}
              onChange={handleContentChange}
              spellCheck={false}
            />
          </div>
        )}
        
        {(viewMode === 'split' || viewMode === 'preview' || readOnly) && (
          <div className={`flex flex-col flex-auto min-h-full ${readOnly || viewMode === 'preview' ? 'w-full' : 'w-1/2'} overflow-auto bg-white dark:bg-gray-900`}>
            <div className="flex-auto min-h-full px-4 py-3 space-y-4 text-gray-900 dark:text-gray-100">
              {renderedContent}
            </div>
          </div>
        )}
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