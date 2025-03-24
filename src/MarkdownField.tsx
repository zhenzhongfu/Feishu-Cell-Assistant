import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { FieldType } from '@lark-base-open/js-sdk';
import { preprocessMarkdown } from './utils/MarkdownRenderer';
import 'katex/dist/katex.min.css';

export class MarkdownFieldExtension {
  constructor() {
  }

  // 获取扩展字段配置
  async getConfig() {
    return {
      type: FieldType.Text,
      name: 'Markdown 编辑器',
      description: '支持 Markdown 格式的文本编辑器',
      defaultValue: '',
    };
  }

  // 渲染单元格
  async render(cellValue: string) {
    return <MarkdownField initialValue={cellValue} onSave={(value) => {
      // 更新多维表格单元格内容
      return value;
    }} />;
  }

  // 验证单元格值
  async validate(value: string) {
    return true;
  }

  // 转换单元格值
  async transform(value: string) {
    return value;
  }
}

interface MarkdownFieldProps {
  initialValue?: string;
  onSave?: (value: string) => void;
}

const MarkdownField: React.FC<MarkdownFieldProps> = ({ 
  initialValue = '', 
  onSave 
}) => {
  const [content, setContent] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);

  const handleContentChange = async (newContent: string) => {
    setContent(newContent);
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(content);
    }
  };

  return (
    <div style={{ padding: '8px' }}>
      <div style={{ marginBottom: '8px', display: 'flex', gap: '8px' }}>
        <button
          onClick={toggleEdit}
          style={{
            padding: '4px 8px',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {isEditing ? '退出编辑' : '编辑模式'}
        </button>
        {isEditing && (
          <button
            onClick={handleSave}
            style={{
              padding: '4px 8px',
              backgroundColor: 'var(--color-success)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            保存
          </button>
        )}
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '16px',
        height: isEditing ? 'auto' : 'unset'
      }}>
        {isEditing && (
          <div style={{ flex: 1 }}>
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              style={{
                width: '100%',
                minHeight: '200px',
                padding: '8px',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                fontFamily: 'var(--font-family-mono)',
                fontSize: '14px',
                lineHeight: '1.5',
                resize: 'vertical',
              }}
            />
          </div>
        )}
        <div
          style={{
            flex: 1,
            padding: '8px',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            minHeight: '200px',
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeRaw, rehypeKatex]}
            skipHtml={false}
            unwrapDisallowed={false}
            components={{
              code: ({ inline, className, children, ...props }: any) => {
                // 获取原始文本内容
                let codeText = typeof children === 'string' ? children : String(children);
                
                // 检查行内代码
                if (props.node?.position?.start?.line === props.node?.position?.end?.line) {
                  // 确保 Markdown 语法在代码中不被解析
                  // 使用 HTML 转义符号解决这个问题
                  codeText = codeText
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;')
                    .replace(/\[/g, '&#91;')
                    .replace(/\]/g, '&#93;')
                    .replace(/\(/g, '&#40;')
                    .replace(/\)/g, '&#41;');
                    
                  return (
                    <code 
                      {...props} 
                      className="markdown-inline-code" 
                      style={{
                        display: 'inline',
                        boxSizing: 'border-box', 
                        padding: '0.2em 0.4em',
                        margin: '0',
                        fontSize: '85%',
                        backgroundColor: 'rgba(27, 31, 35, 0.05)',
                        borderRadius: '4px',
                        fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace',
                        color: '#d14',
                        whiteSpace: 'normal',
                        wordBreak: 'keep-all',
                        wordWrap: 'normal',
                        borderStyle: 'none',
                        verticalAlign: 'middle'
                      }}
                      dangerouslySetInnerHTML={{ __html: codeText }}
                    />
                  );
                }
                return <code {...props} className={`markdown-block-code ${className || ''}`}>{children}</code>;
              },
              
              // 处理列表
              ul: (props) => <ul {...props} className="markdown-ul" style={{marginBottom: '16px', paddingLeft: '2em', listStyleType: 'disc'}} />,
              ol: (props) => <ol {...props} className="markdown-ol" style={{marginBottom: '16px', paddingLeft: '2em', listStyleType: 'decimal'}} />,
              li: (props) => <li {...props} className="markdown-li" style={{marginBottom: '4px'}} />
            }}
          >
            {preprocessMarkdown(content)}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default MarkdownField; 