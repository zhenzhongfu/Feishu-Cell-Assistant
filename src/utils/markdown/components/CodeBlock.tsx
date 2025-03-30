import React, { useState } from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// 引入常用语言
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import html from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go';
import rust from 'react-syntax-highlighter/dist/esm/languages/prism/rust';
import c from 'react-syntax-highlighter/dist/esm/languages/prism/c';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import csharp from 'react-syntax-highlighter/dist/esm/languages/prism/csharp';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';
import kotlin from 'react-syntax-highlighter/dist/esm/languages/prism/kotlin';
import swift from 'react-syntax-highlighter/dist/esm/languages/prism/swift';
import diff from 'react-syntax-highlighter/dist/esm/languages/prism/diff';

import { normalizeCodeContent, getLanguageDisplayName, parseCodeBlockInfo } from '../formatters/codeFormatters';

// 注册常用语言
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('js', javascript);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('ts', typescript);
SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('md', markdown);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('sh', bash);
SyntaxHighlighter.registerLanguage('shell', bash);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('py', python);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('html', html);
SyntaxHighlighter.registerLanguage('xml', html);
SyntaxHighlighter.registerLanguage('go', go);
SyntaxHighlighter.registerLanguage('golang', go);
SyntaxHighlighter.registerLanguage('rust', rust);
SyntaxHighlighter.registerLanguage('c', c);
SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('csharp', csharp);
SyntaxHighlighter.registerLanguage('cs', csharp);
SyntaxHighlighter.registerLanguage('sql', sql);
SyntaxHighlighter.registerLanguage('yaml', yaml);
SyntaxHighlighter.registerLanguage('yml', yaml);
SyntaxHighlighter.registerLanguage('kotlin', kotlin);
SyntaxHighlighter.registerLanguage('kt', kotlin);
SyntaxHighlighter.registerLanguage('swift', swift);
SyntaxHighlighter.registerLanguage('diff', diff);

interface CodeBlockProps {
  language: string;
  value: string;
  className?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  language,
  value,
  className = '',
  showLineNumbers = true,
  highlightLines = [],
}) => {
  const [copySuccess, setCopySuccess] = useState(false);
  
  // 规范化代码内容
  const codeValue = normalizeCodeContent(value || '');
  
  // 解析语言信息（包括可能的高亮行设置）
  const codeInfo = parseCodeBlockInfo(language || '');
  const actualLanguage = codeInfo.language.toLowerCase();
  const displayLanguage = getLanguageDisplayName(actualLanguage);
  const lineHighlights = codeInfo.highlightLines || highlightLines;
  
  // 处理代码复制
  const handleCopy = async () => {
    try {
      // 移除多余的空行和末尾空格
      const cleanCode = codeValue.trim();
      console.log('准备复制的内容:', cleanCode);
      
      // 尝试使用现代 Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        console.log('使用现代 Clipboard API 复制');
        try {
          await navigator.clipboard.writeText(cleanCode);
          console.log('Clipboard API 复制成功');
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
          return;
        } catch (err) {
          console.error('Clipboard API 复制失败:', err);
          // 如果 Clipboard API 失败，继续尝试后备方案
        }
      }

      console.log('使用传统 execCommand 方式复制');
      // 回退方案：使用传统的 execCommand
      const textArea = document.createElement('textarea');
      textArea.value = cleanCode;
      
      // 确保 textarea 不可见但可以选中
      textArea.style.position = 'fixed';  // 改为 fixed 定位
      textArea.style.left = '0';
      textArea.style.top = '0';
      textArea.style.width = '2em';
      textArea.style.height = '2em';
      textArea.style.padding = '0';
      textArea.style.border = 'none';
      textArea.style.outline = 'none';
      textArea.style.boxShadow = 'none';
      textArea.style.background = 'transparent';
      textArea.style.opacity = '0';
      
      document.body.appendChild(textArea);
      console.log('临时文本区域已创建');
      
      try {
        textArea.focus();
        textArea.select();
        console.log('文本已选中');
        
        const successful = document.execCommand('copy');
        if (successful) {
          console.log('execCommand 复制成功');
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        } else {
          console.error('execCommand 返回失败');
          throw new Error('复制命令执行失败');
        }
      } catch (err) {
        console.error('execCommand 复制出错:', err);
        alert('复制失败，请尝试使用键盘快捷键(Ctrl+C)复制');
      } finally {
        document.body.removeChild(textArea);
        console.log('临时文本区域已移除');
      }
    } catch (err) {
      console.error('整体复制过程失败:', err);
      alert('复制失败，请尝试使用键盘快捷键(Ctrl+C)复制');
    }
  };
  
  // 计算行高亮样式
  const lineProps = (lineNumber: number) => {
    const style: React.CSSProperties = {};
    if (lineHighlights.includes(lineNumber)) {
      style.backgroundColor = 'rgba(255, 255, 0, 0.16)';
      style.display = 'block';
      style.width = '100%';
    }
    return { style };
  };
  
  return (
    <div className={`relative rounded-lg overflow-hidden bg-[#1e1e1e] ${className}`}>
      {/* 操作栏 */}
      <div className="codebar absolute right-2 top-2 flex items-center gap-2 z-10">
        {/* 复制按钮 */}
        <button
          className={`px-2 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors ${
            copySuccess ? 'bg-green-700 hover:bg-green-600' : ''
          }`}
          type="button"
          onClick={handleCopy}
          aria-label="复制代码"
        >
          {copySuccess ? '已复制' : '复制'}
        </button>

        {/* 语言标签 */}
        {displayLanguage && (
          <div className="px-2 py-1 text-xs rounded bg-gray-700 text-gray-300">
            {displayLanguage}
          </div>
        )}
      </div>

      {/* 代码高亮区域 */}
      <SyntaxHighlighter
        language={actualLanguage || 'text'}
        style={vscDarkPlus}
        showLineNumbers={showLineNumbers}
        wrapLines={true}
        lineProps={lineProps}
        customStyle={{
          margin: 0,
          borderRadius: '0.5rem',
          padding: '1rem',
          fontSize: '0.875rem',
          backgroundColor: '#1e1e1e',
        }}
      >
        {codeValue}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock; 