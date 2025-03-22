import React, { useState } from 'react';
import { marked } from 'marked';
import { bitable, FieldType } from '@lark-base-open/js-sdk';

export class MarkdownFieldExtension {
  constructor() {
    console.log('MarkdownFieldExtension 初始化');
  }

  // 获取扩展字段配置
  async getConfig() {
    console.log('getConfig 被调用');
    return {
      type: FieldType.Text,
      name: 'Markdown 编辑器',
      description: '支持 Markdown 格式的文本编辑器',
      defaultValue: '',
    };
  }

  // 渲染单元格
  async render(cellValue: string) {
    console.log('render 被调用', cellValue);
    return <MarkdownField initialValue={cellValue} />;
  }

  // 验证单元格值
  async validate(value: string) {
    console.log('validate 被调用', value);
    return true;
  }

  // 转换单元格值
  async transform(value: string) {
    console.log('transform 被调用', value);
    return value;
  }
}

interface MarkdownFieldProps {
  initialValue?: string;
}

const MarkdownField: React.FC<MarkdownFieldProps> = ({ initialValue = '' }) => {
  console.log('MarkdownField 渲染', initialValue);
  const [content, setContent] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);

  const handleContentChange = async (newContent: string) => {
    console.log('内容变更', newContent);
    setContent(newContent);
  };

  const toggleEdit = () => {
    console.log('切换编辑模式', !isEditing);
    setIsEditing(!isEditing);
  };

  return (
    <div style={{ padding: '8px' }}>
      <div style={{ marginBottom: '8px' }}>
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
          {isEditing ? '预览' : '编辑'}
        </button>
      </div>

      {isEditing ? (
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
          }}
        />
      ) : (
        <div
          dangerouslySetInnerHTML={{ __html: marked(content) }}
          style={{
            padding: '8px',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            minHeight: '200px',
          }}
        />
      )}
    </div>
  );
}; 