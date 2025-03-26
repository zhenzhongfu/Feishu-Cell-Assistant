import React from 'react';

interface MarkdownToolbarProps {
  onAction: (action: string, value?: string) => void;
}

/**
 * Markdown编辑工具栏，提供常用格式化按钮
 */
const MarkdownToolbar: React.FC<MarkdownToolbarProps> = ({ onAction }) => {
  // 工具栏按钮定义
  const toolbarButtons = [
    { id: 'heading', icon: 'H', title: '标题', value: '# ' },
    { id: 'bold', icon: 'B', title: '粗体', value: '**文本**' },
    { id: 'italic', icon: 'I', title: '斜体', value: '*文本*' },
    { id: 'code', icon: '`', title: '行内代码', value: '`代码`' },
    { id: 'link', icon: '🔗', title: '链接', value: '[链接文本](URL)' },
    { id: 'image', icon: '🖼️', title: '图片', value: '![替代文本](图片URL)' },
    { id: 'list-ul', icon: '•', title: '无序列表', value: '- 列表项' },
    { id: 'list-ol', icon: '1.', title: '有序列表', value: '1. 列表项' },
    { id: 'quote', icon: '❝', title: '引用', value: '> 引用文本' },
    { id: 'hr', icon: '—', title: '分隔线', value: '\n---\n' },
    { id: 'table', icon: '▦', title: '表格', value: '| 标题1 | 标题2 |\n| --- | --- |\n| 内容1 | 内容2 |' },
    { id: 'code-block', icon: '```', title: '代码块', value: '```js\n// 代码\n```' }
  ];

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-white border-b border-gray-200/80">
      {toolbarButtons.map((button) => (
        <button
          key={button.id}
          className="flex items-center justify-center min-w-[32px] h-8 px-2 
            bg-white hover:bg-gray-100/80
            text-gray-600 hover:text-gray-900
            border border-transparent hover:border-gray-200/80
            rounded-sm text-sm transition-all duration-200
            sm:min-w-[28px] sm:h-7 sm:px-1.5 sm:text-xs"
          title={button.title}
          onClick={() => onAction(button.id, button.value)}
        >
          {button.icon}
        </button>
      ))}
    </div>
  );
};

export default MarkdownToolbar; 