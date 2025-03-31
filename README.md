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