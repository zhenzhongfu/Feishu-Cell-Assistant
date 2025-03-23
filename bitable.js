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
    editorContainer.className = 'markdown-editor-container';
    
    // 创建样式元素并添加到容器中
    const styleElement = document.createElement('style');
    styleElement.textContent = this.getStyles();
    editorContainer.appendChild(styleElement);
    
    // 创建工具栏
    const toolbar = document.createElement('div');
    toolbar.className = 'markdown-toolbar';
    
    // 创建编辑按钮
    const editButton = document.createElement('button');
    editButton.textContent = '编辑';
    editButton.className = 'markdown-edit-button';
    toolbar.appendChild(editButton);
    
    // 创建预览容器
    const previewContainer = document.createElement('div');
    previewContainer.className = 'markdown-preview-container';
    previewContainer.style.cssText = `
      width: 100%;
      height: calc(100% - 40px);
      min-height: 60px;
      padding: 16px;
      background-color: rgb(255, 255, 255);
      border-radius: 3px;
      transition: 0.3s;
      border: 1px solid #e5e5e5;
      overflow-y: auto;
    `;
    
    // 创建编辑器
    const editor = document.createElement('textarea');
    editor.className = 'markdown-editor';
    editor.style.cssText = `
      width: 100%;
      height: calc(100% - 40px);
      min-height: 60px;
      padding: 16px;
      border: 1px solid #e5e5e5;
      border-radius: 3px;
      font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
      font-size: 14px;
      line-height: 1.6;
      color: #37352f;
      background-color: rgb(247, 246, 243);
      resize: none;
      display: none;
      white-space: pre-wrap;
      word-wrap: break-word;
      transition: 0.3s;
    `;
    
    // 添加到主容器
    editorContainer.appendChild(toolbar);
    editorContainer.appendChild(editor);
    editorContainer.appendChild(previewContainer);
    container.appendChild(editorContainer);
    
    // 创建 Notion 样式
    const notionStyle = document.createElement('style');
    notionStyle.textContent = `
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
    `;
    document.head.appendChild(notionStyle);
    
    // 加载 marked.js
    if (typeof marked === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
      script.onload = () => {
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

  // 获取样式
  getStyles() {
    return `
      .markdown-editor-container {
        width: 100%;
        height: 100%;
        min-height: 100px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 8px;
        box-sizing: border-box;
        background: #ffffff;
      }

      .markdown-toolbar {
        display: flex;
        gap: 8px;
        padding: 4px;
        border-radius: 4px;
        border: 1px solid #e5e5e5;
        background: #ffffff;
      }

      .markdown-edit-button {
        padding: 4px 12px;
        border: 1px solid #e5e5e5;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        color: #37352f;
        background: #ffffff;
      }
    `;
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
      const renderer = new marked.Renderer();
      
      // 配置 marked
      marked.setOptions({
        renderer: renderer,
        breaks: true,
        gfm: true,
        headerIds: false,
        mangle: false,
        headerPrefix: '',
        smartLists: true,
        smartypants: false
      });
      
      // 创建外层容器
      const outerDiv = document.createElement('div');
      outerDiv.className = 'notion-light'; // 添加 Notion 样式类
      outerDiv.style.cssText = `
        padding: 16px;
        background-color: rgb(255, 255, 255);
        border-radius: 3px;
        transition: 0.3s;
      `;
      
      // 创建内容容器
      const contentDiv = document.createElement('div');
      contentDiv.className = 'markdown-preview-content';
      
      // 解析 Markdown 内容
      const parsedContent = marked.parse(content);
      contentDiv.innerHTML = parsedContent;
      
      // 组装预览内容
      outerDiv.appendChild(contentDiv);
      
      // 清空容器并添加新内容
      container.innerHTML = '';
      container.appendChild(outerDiv);
    }
  }
}

// 注册插件
window.registerBitableExtension = (bitable) => {
  return new MarkdownFieldExtension({ bitable });
}; 