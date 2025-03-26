# Feishu Markdown Helper

一个用于在飞书多维表格中编辑和预览 Markdown 的字段扩展插件。

## 功能特点

- 支持 Markdown 格式编辑和预览
- 实时预览转换效果
- 支持常用 Markdown 语法
- 自动保存编辑内容
- 完全集成到多维表格界面

## 支持的 Markdown 语法

- 标题（H1-H6）
- 粗体、斜体
- 有序和无序列表
- 代码块和行内代码
- 引用块
- 链接和图片
- 表格
- 任务列表
- Mermaid图表
- 数学公式（KaTeX）

## 开发说明

本插件使用以下技术：

- 飞书多维表格插件 SDK
- React 用于构建UI组件
- marked.js（用于 Markdown 转换）
- KaTeX（用于数学公式渲染）
- Mermaid（用于图表渲染）
- Prism（用于代码高亮）

## 开发命令

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建扩展
npm run build
```

## 注意事项

- 图片需要使用公网可访问的 URL
- 建议控制单个单元格的内容量
- 部分高级 Markdown 语法可能不支持

## 待添加功能

- [ ] 工具栏快捷按钮
- [ ] 自定义主题

## 许可证

MIT 

## 最近更新

### 2025年3月更新 - 模块化重构
我们对项目进行了全面的模块化重构，以提高代码的可维护性和扩展性：

1. **模块化设计**：将Markdown处理逻辑拆分为多个专注的模块
   - `/formatters` - 处理文本格式化的函数
   - `/components` - React组件用于UI渲染
   - `/helpers` - 辅助函数和工具

2. **改进的组件系统**：
   - `MarkdownRenderer` - 核心渲染组件
   - `CodeBlock` - 代码块高亮组件
   - `MathRenderer` - 数学公式渲染
   - `MermaidRenderer` - 图表渲染
   - `ImageRenderer` - 增强的图片处理

3. **统一的导出API**：通过索引文件提供简洁的导入方式
   ```typescript
   import { MarkdownRenderer, preprocessMarkdown } from './utils/markdown';
   ```