import React, { useState, useEffect, useCallback } from 'react';
import { bitable } from '@lark-base-open/js-sdk';
import { formatMarkdown } from './utils/markdown/formatters';
import SplitEditor from './components/SplitEditor';
import { isInBitableEnvironment, getCellValue, setCellValue } from './utils/bitable';
import ScrollToTop from './components/ScrollToTop';
import './styles/tailwind.css';
import './styles/markdownBase.css';
import { ThemeStyle } from './utils/markdownThemes';

// 示例Markdown内容
const exampleMarkdown = `# Markdown单元格助手

## 基本语法示例

### 文本格式化

这是**粗体**文本，这是*斜体*文本，这是~~删除线~~文本。

### 列表

无序列表:
- 项目1
- 项目2
- 项目3

有序列表:
1. 第一项
2. 第二项
3. 第三项

### 引用

> 这是一段引用文本
> 多行引用

### 代码

行内代码 \`console.log('Hello world')\`

代码块:
\`\`\`javascript
function sayHello() {
  console.log('Hello, world!');
}
\`\`\`

### 表格

| 表头1 | 表头2 | 表头3 |
| ----- | ----- | ----- |
| 单元格1 | 单元格2 | 单元格3 |
| 单元格4 | 单元格5 | 单元格6 |

### 链接和图片

[链接示例](https://example.com)

![图片示例](https://via.placeholder.com/150)
`;

// 添加防抖函数
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

const App: React.FC = () => {
  const [content, setContent] = useState(exampleMarkdown);
  const [formatStatus, setFormatStatus] = useState<null | 'success' | 'error'>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [recordId, setRecordId] = useState<string | undefined>();
  const [fieldId, setFieldId] = useState<string | undefined>();
  const [isBitable, setIsBitable] = useState(false);
  const [themeStyle, setThemeStyle] = useState<ThemeStyle>('github'); // 默认主题
  const [isAutoSave, setIsAutoSave] = useState(false); // 默认不自动保存
  
  // 从localStorage加载内容和设置
  useEffect(() => {
    const savedContent = localStorage.getItem('markdownContent');
    if (savedContent) {
      setContent(savedContent);
    }

    // 加载保存的主题设置
    const savedTheme = localStorage.getItem('markdownTheme') as ThemeStyle | null;
    if (savedTheme && (savedTheme === 'github' || savedTheme === 'notion')) {
      setThemeStyle(savedTheme);
    }

    // 加载保存的自动保存设置
    const savedAutoSave = localStorage.getItem('markdownAutoSave');
    if (savedAutoSave) {
      setIsAutoSave(savedAutoSave === 'true');
    }

    // 如果在多维表格环境中，监听选择变化
    const setupSelectionListener = async () => {
      try {
        const isInBitable = await isInBitableEnvironment();
        setIsBitable(isInBitable);
        
        if (!isInBitable) {
          return;
        }
        
        // 获取初始选择
        const selection = await bitable.base.getSelection();
        
        if (selection && selection.tableId && selection.recordId && selection.fieldId) {
          setRecordId(selection.recordId);
          setFieldId(selection.fieldId);
          
          // 获取初始单元格内容
          try {
            const value = await getCellValue(selection.recordId, selection.fieldId);
            // 处理单元格内容，确保是字符串类型
            const textContent = Array.isArray(value) 
              ? value.map(item => String(typeof item === 'object' && item !== null ? JSON.stringify(item) : item || '')).filter(Boolean).join('')
              : typeof value === 'object' && value !== null
                ? String(JSON.stringify(value))
                : String(value || '');
            setContent(textContent);
          } catch (err) {
            // 静默处理错误
          }
        }
        
        // 监听选择变化
        bitable.base.onSelectionChange(async (_: any) => {
          // 获取最新的选择
          const newSelection = await bitable.base.getSelection();
          
          if (newSelection && newSelection.tableId && newSelection.recordId && newSelection.fieldId) {
            setRecordId(newSelection.recordId);
            setFieldId(newSelection.fieldId);
            
            // 获取新单元格内容
            try {
              const value = await getCellValue(newSelection.recordId, newSelection.fieldId);
              // 处理单元格内容，确保是字符串类型
              const textContent = Array.isArray(value) 
                ? value.map(item => String(typeof item === 'object' && item !== null ? JSON.stringify(item) : item || '')).filter(Boolean).join('')
                : typeof value === 'object' && value !== null
                  ? String(JSON.stringify(value))
                  : String(value || '');
              setContent(textContent);
            } catch (err) {
              // 静默处理错误
            }
          }
        });
      } catch (err) {
        // 静默处理错误
      }
    };
    
    setupSelectionListener();
  }, []);

  // 清除格式状态的定时器
  useEffect(() => {
    if (formatStatus) {
      const timer = setTimeout(() => {
        setFormatStatus(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [formatStatus]);

  // 优化的滚动处理函数
  const handleScroll = useCallback(() => {
    const textarea = document.querySelector('textarea');
    const previewContainer = document.querySelector('.overflow-auto');
    
    const currentScrollY = Math.max(
      window.scrollY,
      textarea?.scrollTop || 0,
      previewContainer?.scrollTop || 0
    );

    // 使用更大的缓冲区和滚动方向判断
    const threshold = 20;
    const buffer = 30; // 增加缓冲区大小
    const scrollingDown = currentScrollY > lastScrollY;

    if (!isScrolled && scrollingDown && currentScrollY > threshold + buffer) {
      setIsScrolled(true);
    } else if (isScrolled && !scrollingDown && currentScrollY < threshold + buffer) {
      setIsScrolled(false);
    }

    setLastScrollY(currentScrollY);
  }, [isScrolled, lastScrollY]);

  // 使用防抖的滚动处理函数，增加延迟时间
  const debouncedHandleScroll = useCallback(
    debounce(handleScroll, 100), // 增加防抖时间
    [handleScroll]
  );

  // 添加滚动监听
  useEffect(() => {
    // 监听窗口滚动
    window.addEventListener('scroll', debouncedHandleScroll);
    
    // 监听编辑器和预览容器滚动
    const textarea = document.querySelector('textarea');
    const previewContainer = document.querySelector('.overflow-auto');
    
    textarea?.addEventListener('scroll', debouncedHandleScroll);
    previewContainer?.addEventListener('scroll', debouncedHandleScroll);

    // 定期检查滚动状态，因为编辑模式切换时需要重新绑定事件
    const intervalId = setInterval(() => {
      const newTextarea = document.querySelector('textarea');
      if (newTextarea && newTextarea !== textarea) {
        textarea?.removeEventListener('scroll', debouncedHandleScroll);
        newTextarea.addEventListener('scroll', debouncedHandleScroll);
      }
    }, 1000);

    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll);
      textarea?.removeEventListener('scroll', debouncedHandleScroll);
      previewContainer?.removeEventListener('scroll', debouncedHandleScroll);
      clearInterval(intervalId);
    };
  }, [debouncedHandleScroll]);

  // 保存内容到localStorage和飞书单元格
  const handleSave = async (newContent: string) => {
    try {
      // 保存到 localStorage
      localStorage.setItem('markdownContent', newContent);
      setContent(newContent);

      // 如果在飞书环境中，保存到单元格
      if (isBitable && recordId && fieldId) {
        await setCellValue(recordId, fieldId, newContent);
      }

      return Promise.resolve();
    } catch (error) {
      throw error;
    }
  };

  // 一键格式化
  const handleFormat = () => {
    try {
      const formattedContent = formatMarkdown(content);
      setContent(formattedContent);
      localStorage.setItem('markdownContent', formattedContent);
      setFormatStatus('success');
    } catch (error) {
      console.error('格式化失败:', error);
      setFormatStatus('error');
    }
  };

  useEffect(() => {
    const checkEnvironment = async () => {
      const isInBitable = await isInBitableEnvironment();
      setIsBitable(isInBitable);
    };
    checkEnvironment();
  }, []);

  // 处理主题样式变更
  const handleThemeChange = (newTheme: ThemeStyle) => {
    setThemeStyle(newTheme);
    localStorage.setItem('markdownTheme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

  // 处理自动保存设置变更
  const handleAutoSaveChange = (autoSave: boolean) => {
    setIsAutoSave(autoSave);
    localStorage.setItem('markdownAutoSave', String(autoSave));
  };

  // 设置默认主题
  useEffect(() => {
    document.body.setAttribute('data-theme', themeStyle);
  }, [themeStyle]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#ffffff]">
      <header className="flex-none sticky top-0 z-30 py-2 bg-white shadow-sm border-b border-gray-200/80">
        <div className="flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <svg className={`w-6 h-6 ${themeStyle === 'github' ? 'text-blue-700' : 'text-indigo-700'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h1 className={`tracking-tight font-semibold bg-clip-text text-transparent bg-gradient-to-r ${themeStyle === 'github' ? 'from-blue-800 to-blue-600' : 'from-indigo-800 to-indigo-600'} text-lg`}>
                单元格助手 | Markdown排版预览编辑
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isBitable && (
              <button 
                className="group flex items-center gap-1.5 text-sm text-gray-600 
                  bg-white hover:bg-gray-50 
                  border border-gray-200 hover:border-gray-300
                  rounded-md transition-all duration-200 shadow-sm
                  px-2.5 py-1"
                onClick={handleFormat}
                title="美化整个文档的格式"
              >
                <svg className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                    d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
                <span className="font-medium">格式化文档</span>
              </button>
            )}
          </div>
        </div>
        <p className="text-[13px] text-gray-500 font-medium px-6 mt-2">
          {isBitable 
            ? '在飞书多维表格中使用Markdown格式编辑和预览文本内容' 
            : '高效编辑Markdown文本，支持GitHub和Notion双主题预览'}
        </p>
        {formatStatus && (
          <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full
            px-3 py-1.5 rounded-md text-[13px] font-medium shadow-sm backdrop-blur-sm
            transition-all duration-300 animate-fade-in ${
            formatStatus === 'success' 
              ? 'bg-emerald-50/90 text-emerald-700 border border-emerald-100/80' 
              : 'bg-rose-50/90 text-rose-700 border border-rose-100/80'
          }`}>
            {formatStatus === 'success' 
              ? <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  格式化成功
                </div>
              : <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  格式化失败
                </div>
            }
          </div>
        )}
      </header>     

      <main className="flex-1 overflow-hidden relative">
        {isBitable && (!recordId || !fieldId) && (
          <div className="absolute inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-lg shadow-xl max-w-md mx-4 border border-gray-200/50">
              <div className="flex items-center gap-3 mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-lg font-medium text-gray-900">提示</span>
              </div>
              <p className="text-gray-600">请点击任意文本类型的字段以查看或编辑其Markdown内容</p>
            </div>
          </div>
        )}
        {isBitable ? (
          <div className="bitable-editor-container h-full overflow-hidden">
            <SplitEditor 
              initialValue={recordId && fieldId ? content : ""}
              onSave={handleSave}
              recordId={recordId}
              fieldId={fieldId}
              style={themeStyle}
              isAutoSaveEnabled={isAutoSave}
              onThemeChange={handleThemeChange}
              onAutoSaveChange={handleAutoSaveChange}
              readOnly={!recordId || !fieldId}
            />
          </div>
        ) : (
          <>
            <div className="h-full w-full flex box-border">
              <SplitEditor 
                initialValue={content}
                onSave={handleSave}
                style={themeStyle}
                isAutoSaveEnabled={isAutoSave}
                onThemeChange={handleThemeChange}
                onAutoSaveChange={handleAutoSaveChange}
              />
            </div>
          </>
        )}
      </main>
      <ScrollToTop />
      <footer className="flex-none bg-white/80 backdrop-blur-sm border-t border-gray-200/80 z-[1000] p-0 m-0 box-border">
        <p className="m-0 py-2 text-xs text-gray-500 text-center font-normal">单元格助手 | Markdown排版预览编辑 v0.1</p>
      </footer>
    </div>
  );
};

export default App; 