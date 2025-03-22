import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { bitable } from '@lark-base-open/js-sdk';
import 'github-markdown-css/github-markdown.css';

// 定义主题样式
const themes = {
  notionLight: {
    name: 'Notion 亮色',
    containerStyle: {
      backgroundColor: '#ffffff',
      color: '#37352f'
    },
    preStyle: {
      backgroundColor: '#f7f6f3',
      borderRadius: '3px',
      padding: '16px'
    },
    markdownClass: 'markdown-body notion-light'
  },
  notionDark: {
    name: 'Notion 暗色',
    containerStyle: {
      backgroundColor: '#191919',
      color: '#e0e0e0'
    },
    preStyle: {
      backgroundColor: '#2f2f2f',
      borderRadius: '3px',
      padding: '16px'
    },
    markdownClass: 'markdown-body notion-dark'
  }
};

const App: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isRawMode, setIsRawMode] = useState<boolean>(false);
  const [currentTheme, setCurrentTheme] = useState<keyof typeof themes>('notionLight');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const formattedContentRef = useRef<HTMLDivElement>(null);

  // 处理单元格值
  const processCellValue = (value: any): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && Array.isArray(value)) {
      return value.map(item => {
        if (item && typeof item === 'object' && item.text) {
          return item.text;
        }
        return '';
      }).join('');
    }
    if (typeof value === 'object') {
      if (value.text) return value.text;
      if (value.value) return value.value;
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  // 复制内容到剪贴板
  const copyToClipboard = () => {
    try {
      if (isRawMode) {
        // 复制原始文本
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
      } else {
        // 复制带格式的内容
        if (formattedContentRef.current) {
          const range = document.createRange();
          range.selectNode(formattedContentRef.current);
          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
            document.execCommand('copy');
            selection.removeAllRanges();
          }
        }
      }
      
      // 更新状态
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
      setError('复制失败，请重试');
    }
  };

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
          setContent(processCellValue(cellValue));
        }

        bitable.base.onSelectionChange(async (event) => {
          console.log('选择发生变化:', event);
          setLoading(true);
          try {
            const newSelection = await bitable.base.getSelection();
            const { tableId, recordId, fieldId } = newSelection;
            if (!tableId || !recordId || !fieldId) {
              setContent('请选择一个单元格');
              return;
            }

            const table = await bitable.base.getTableById(tableId);
            const cellValue = await table.getCellValue(fieldId, recordId);

            console.log('获取到单元格内容:', cellValue);
            setContent(processCellValue(cellValue));
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

  return (
    <div style={{ 
      padding: '16px',
      height: '100vh',
      overflow: 'auto',
      ...themes[currentTheme].containerStyle,
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsRawMode(!isRawMode)}
            style={{
              padding: '8px 16px',
              backgroundColor: isRawMode ? 
                (currentTheme === 'notionDark' ? '#2f2f2f' : '#f7f6f3') : 
                (currentTheme === 'notionDark' ? '#e0e0e0' : '#37352f'),
              color: isRawMode ? 
                (currentTheme === 'notionDark' ? '#e0e0e0' : '#37352f') : 
                (currentTheme === 'notionDark' ? '#191919' : '#ffffff'),
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"'
            }}
          >
            {isRawMode ? '显示排版效果' : '显示原始内容'}
          </button>
          <button
            onClick={copyToClipboard}
            style={{
              padding: '8px 16px',
              backgroundColor: copySuccess ? 
                (currentTheme === 'notionDark' ? '#2ea043' : '#dcf5e8') : 
                (currentTheme === 'notionDark' ? '#2f2f2f' : '#f7f6f3'),
              color: copySuccess ? 
                (currentTheme === 'notionDark' ? '#ffffff' : '#1a7f37') : 
                (currentTheme === 'notionDark' ? '#e0e0e0' : '#37352f'),
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {copySuccess ? '已复制' : (isRawMode ? '复制原始内容' : '复制带格式内容')}
          </button>
        </div>
        <select
          value={currentTheme}
          onChange={(e) => setCurrentTheme(e.target.value as keyof typeof themes)}
          style={{
            padding: '8px 16px',
            borderRadius: '3px',
            border: currentTheme === 'notionDark' ? '1px solid #2f2f2f' : '1px solid #e0e0e0',
            cursor: 'pointer',
            backgroundColor: currentTheme === 'notionDark' ? '#2f2f2f' : '#ffffff',
            color: currentTheme === 'notionDark' ? '#e0e0e0' : '#37352f',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"'
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
          color: currentTheme === 'notionDark' ? '#e0e0e0' : '#37352f',
          opacity: 0.5
        }}>加载中...</div>
      )}
      {error && (
        <div style={{ 
          marginBottom: '16px', 
          color: '#eb5757'
        }}>{error}</div>
      )}
      {!loading && !error && !content && (
        <div style={{ 
          color: currentTheme === 'notionDark' ? '#e0e0e0' : '#37352f',
          opacity: 0.5
        }}>请选择包含 Markdown 内容的单元格</div>
      )}
      {!loading && !error && content && (
        <div style={{ 
          padding: '16px',
          backgroundColor: themes[currentTheme].containerStyle.backgroundColor,
          borderRadius: '3px',
          transition: 'all 0.3s ease'
        }}>
          {isRawMode ? (
            <pre style={{
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
              fontSize: '14px',
              lineHeight: '1.6',
              padding: '16px',
              margin: 0,
              ...themes[currentTheme].preStyle,
              transition: 'all 0.3s ease'
            }}>
              {content}
            </pre>
          ) : (
            <div 
              ref={formattedContentRef}
              className={themes[currentTheme].markdownClass}
            >
              <style>
                {`
                  .notion-light {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol";
                    line-height: 1.6;
                    color: #37352f;
                  }
                  .notion-light h1, .notion-light h2, .notion-light h3 {
                    font-weight: 600;
                    line-height: 1.3;
                    padding-bottom: 0.3em;
                    margin-bottom: 1em;
                    border-bottom: 1px solid #eaecef;
                  }
                  .notion-light h1 { font-size: 2em; margin-top: 1.6em; }
                  .notion-light h2 { font-size: 1.6em; margin-top: 1.4em; }
                  .notion-light h3 { font-size: 1.2em; margin-top: 1.2em; }
                  .notion-light blockquote {
                    margin: 0;
                    padding-left: 1em;
                    border-left: 3px solid #e0e0e0;
                    color: #6b6b6b;
                  }
                  .notion-light code {
                    background: #f7f6f3;
                    border-radius: 3px;
                    padding: 0.2em 0.4em;
                    font-size: 85%;
                    font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
                  }
                  .notion-light pre {
                    background: #f7f6f3;
                    border-radius: 3px;
                    padding: 16px;
                    overflow: auto;
                  }
                  .notion-light pre code {
                    background: none;
                    padding: 0;
                  }
                  
                  .notion-dark {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol";
                    line-height: 1.6;
                    color: #e0e0e0;
                    background: #191919;
                  }
                  .notion-dark h1, .notion-dark h2, .notion-dark h3 {
                    font-weight: 600;
                    line-height: 1.3;
                    padding-bottom: 0.3em;
                    margin-bottom: 1em;
                    border-bottom: 1px solid #333;
                  }
                  .notion-dark h1 { font-size: 2em; margin-top: 1.6em; }
                  .notion-dark h2 { font-size: 1.6em; margin-top: 1.4em; }
                  .notion-dark h3 { font-size: 1.2em; margin-top: 1.2em; }
                  .notion-dark blockquote {
                    margin: 0;
                    padding-left: 1em;
                    border-left: 3px solid #4f4f4f;
                    color: #999;
                  }
                  .notion-dark code {
                    background: #2f2f2f;
                    border-radius: 3px;
                    padding: 0.2em 0.4em;
                    font-size: 85%;
                    font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
                  }
                  .notion-dark pre {
                    background: #2f2f2f;
                    border-radius: 3px;
                    padding: 16px;
                    overflow: auto;
                  }
                  .notion-dark pre code {
                    background: none;
                    padding: 0;
                  }
                `}
              </style>
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App; 