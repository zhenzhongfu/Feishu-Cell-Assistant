// 飞书多维表格插件
export default class MarkdownFieldExtension {
  constructor(args) {
    this.bitable = args.bitable;
  }

  // 获取扩展字段配置
  async getConfig() {
    return {
      type: 'markdown',
      name: 'Markdown 编辑器',
      description: '支持 Markdown 格式的文本编辑器',
      icon: 'https://example.com/markdown-icon.png',
    };
  }

  // 初始化视图
  async init(args) {
    const { container, record, field } = args;
    
    // 创建编辑器容器
    const editorContainer = document.createElement('div');
    editorContainer.style.cssText = `
      width: 100%;
      height: 100%;
      min-height: 100px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px;
      box-sizing: border-box;
    `;
    
    // 创建工具栏
    const toolbar = document.createElement('div');
    toolbar.style.cssText = `
      display: flex;
      gap: 8px;
      padding: 4px;
      background-color: var(--color-fill-secondary);
      border-radius: 4px;
    `;
    
    // 创建编辑按钮
    const editButton = document.createElement('button');
    editButton.textContent = '编辑';
    editButton.style.cssText = `
      padding: 4px 8px;
      border: none;
      border-radius: 4px;
      background-color: var(--color-primary);
      color: white;
      cursor: pointer;
      font-size: 12px;
    `;
    toolbar.appendChild(editButton);
    
    // 创建预览容器
    const previewContainer = document.createElement('div');
    previewContainer.style.cssText = `
      width: 100%;
      height: calc(100% - 40px);
      min-height: 60px;
      padding: 8px;
      border: 1px solid var(--color-border);
      border-radius: 4px;
      overflow-y: auto;
    `;
    
    // 创建编辑器
    const editor = document.createElement('textarea');
    editor.style.cssText = `
      width: 100%;
      height: calc(100% - 40px);
      min-height: 60px;
      padding: 8px;
      border: 1px solid var(--color-border);
      border-radius: 4px;
      resize: vertical;
      font-family: var(--font-family-mono);
      font-size: 14px;
      line-height: 1.5;
      display: none;
    `;
    
    // 添加到主容器
    editorContainer.appendChild(toolbar);
    editorContainer.appendChild(editor);
    editorContainer.appendChild(previewContainer);
    container.appendChild(editorContainer);
    
    // 加载 marked.js
    if (typeof marked === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
      script.onload = () => {
        marked.setOptions({
          breaks: true,
          gfm: true,
          headerIds: false
        });
        this.loadContent(record, field, editor, previewContainer);
      };
      document.head.appendChild(script);
    } else {
      this.loadContent(record, field, editor, previewContainer);
    }
    
    // 监听编辑器变化
    editor.addEventListener('input', async () => {
      const content = editor.value;
      await this.bitable.base.setFieldValue(record.id, field.id, content);
      this.updatePreview(previewContainer, content);
    });
    
    // 切换编辑/预览模式
    let isEditing = false;
    editButton.onclick = () => {
      isEditing = !isEditing;
      if (isEditing) {
        editor.style.display = 'block';
        previewContainer.style.display = 'none';
        editButton.textContent = '预览';
        editor.focus();
      } else {
        editor.style.display = 'none';
        previewContainer.style.display = 'block';
        editButton.textContent = '编辑';
      }
    };
  }

  // 加载内容
  async loadContent(record, field, editor, previewContainer) {
    const content = await this.bitable.base.getFieldValue(record.id, field.id) || '';
    editor.value = content;
    this.updatePreview(previewContainer, content);
  }

  // 更新预览
  updatePreview(container, content) {
    if (typeof marked !== 'undefined') {
      container.innerHTML = marked.parse(content);
    }
  }
}

// 注册插件
window.registerBitableExtension = (bitable) => {
  return new MarkdownFieldExtension({ bitable });
}; 