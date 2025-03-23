import React, { useEffect, useState, useRef } from 'react';
import { bitable } from '@lark-base-open/js-sdk';
import 'github-markdown-css/github-markdown.css';
import MarkdownRenderer from './utils/MarkdownRenderer';
import { testMarkdown } from './test-markdown';
import ReactDOM from 'react-dom';
import './App.css';
import mermaid from 'mermaid';

// 定义主题样式
const themes = {
  notionLight: {
    name: 'GitHub 风格',
    containerStyle: {
      backgroundColor: '#ffffff',
      color: '#24292e'
    },
    preStyle: {
      backgroundColor: '#f6f8fa',
      borderRadius: '6px',
      padding: '16px'
    },
    markdownClass: 'markdown-body github-markdown-light',
    preBackground: '#f6f8fa'
  },
  notionStyle: {
    name: 'Notion 风格',
    containerStyle: {
      backgroundColor: '#ffffff',
      color: '#37352f'
    },
    preStyle: {
      backgroundColor: '#f7f6f3',
      borderRadius: '3px',
      padding: '16px'
    },
    markdownClass: 'markdown-body notion-style',
    preBackground: '#f7f6f3'
  }
};

// 定义主题模式类型
enum ThemeModeType {
  Light = 'light',
  Dark = 'dark'
}

// 深色主题风格映射
const darkThemes = {
  notionLight: {
    backgroundColor: '#2f3437',
    color: '#e6e6e6',
    borderColor: '#4d4d4d',
    buttonBgColor: '#454545',
    buttonHoverBgColor: '#5a5a5a',
    buttonTextColor: '#e6e6e6',
    inputBgColor: '#454545',
    inputBorderColor: '#5a5a5a',
    inputTextColor: '#e6e6e6',
  },
  notionStyle: {
    backgroundColor: '#2f3437',
    color: '#e6e6e6',
    borderColor: '#4d4d4d',
    buttonBgColor: '#454545',
    buttonHoverBgColor: '#5a5a5a',
    buttonTextColor: '#e6e6e6',
    inputBgColor: '#454545',
    inputBorderColor: '#5a5a5a',
    inputTextColor: '#e6e6e6',
  }
}

// 添加公众号兼容样式
const mpCompatStyles = `
  /* 确保显示在公众号中时的样式 */
  .mp-compatible {
    font-size: 16px !important;
    line-height: 1.8 !important;
    color: #333 !important;
    max-width: 100% !important;
    word-break: break-word !important;
  }
  
  .mp-compatible h1 {
    font-size: 22px !important;
    color: #000 !important;
    font-weight: bold !important;
    margin-top: 20px !important;
    margin-bottom: 10px !important;
  }
  
  .mp-compatible h2 {
    font-size: 20px !important;
    color: #000 !important;
    font-weight: bold !important;
    margin-top: 18px !important;
    margin-bottom: 10px !important;
  }
  
  .mp-compatible h3 {
    font-size: 18px !important;
    color: #000 !important;
    font-weight: bold !important;
    margin-top: 16px !important;
    margin-bottom: 8px !important;
  }
  
  .mp-compatible h4, 
  .mp-compatible h5, 
  .mp-compatible h6 {
    font-size: 16px !important;
    color: #000 !important;
    font-weight: bold !important;
    margin-top: 14px !important;
    margin-bottom: 8px !important;
  }
  
  .mp-compatible p {
    margin-top: 8px !important;
    margin-bottom: 8px !important;
    line-height: 1.7 !important;
  }
  
  .mp-compatible ul {
    margin-top: 8px !important;
    margin-bottom: 8px !important;
    padding-left: 2em !important;
  }
  
  .mp-compatible ol {
    margin-top: 8px !important;
    margin-bottom: 8px !important;
    padding-left: 2em !important;
  }
  
  .mp-compatible li {
    margin: 4px 0 !important;
  }
  
  .mp-compatible code {
    background-color: rgba(0, 0, 0, 0.06) !important;
    padding: 2px 4px !important;
    border-radius: 3px !important;
    font-family: "Courier New", monospace !important;
    font-size: 14px !important;
  }
  
  .mp-compatible pre {
    background-color: rgba(0, 0, 0, 0.06) !important;
    padding: 10px !important;
    border-radius: 5px !important;
    white-space: pre-wrap !important;
    word-wrap: break-word !important;
    margin: 10px 0 !important;
  }
  
  .mp-compatible blockquote {
    padding: 10px 15px !important;
    background-color: #f7f7f7 !important;
    border-left: 3px solid #ddd !important;
    margin: 10px 0 !important;
  }
  
  .mp-compatible img {
    max-width: 100% !important;
    height: auto !important;
    display: block !important;
    margin: 10px auto !important;
  }
  
  .mp-compatible a {
    color: #5181b8 !important;
    text-decoration: underline !important;
  }
  
  .mp-compatible table {
    border-collapse: collapse !important;
    width: 100% !important;
    margin: 16px 0 !important;
  }
  
  .mp-compatible th,
  .mp-compatible td {
    border: 1px solid #ddd !important;
    padding: 8px !important;
    text-align: left !important;
  }
  
  /* GitHub风格警告提示适配公众号 */
  .mp-compatible .markdown-alert {
    padding: 12px !important;
    margin: 12px 0 !important;
    background-color: #f8f8f8 !important;
    border-left: 4px solid #ddd !important;
  }
  
  .mp-compatible .markdown-alert-note {
    border-left-color: #2eaadc !important;
    background-color: #f0f7fb !important;
  }
  
  .mp-compatible .markdown-alert-tip {
    border-left-color: #0f9d58 !important;
    background-color: #f0f9f4 !important;
  }
  
  .mp-compatible .markdown-alert-important {
    border-left-color: #f5b400 !important;
    background-color: #fbf8e9 !important;
  }
  
  .mp-compatible .markdown-alert-warning {
    border-left-color: #f5a623 !important;
    background-color: #fff8e6 !important;
  }
  
  .mp-compatible .markdown-alert-caution {
    border-left-color: #eb5757 !important;
    background-color: #fdeeee !important;
  }
  
  .mp-compatible .markdown-alert-title {
    font-weight: 600 !important;
    margin-bottom: 8px !important;
    display: flex !important;
    align-items: center !important;
  }
  
  .mp-compatible .markdown-alert-title strong {
    text-transform: uppercase !important;
    font-size: 14px !important;
    margin-left: 8px !important;
  }
`;

// 自定义Markdown样式，符合GitHub风格
const customMarkdownStyles = `
${mpCompatStyles}

/* 基本样式 */
.markdown-body {
  color-scheme: light dark;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
  font-size: 16px;
  line-height: 1.5;
  word-wrap: break-word;
}

.github-markdown-light {
  color: #24292e;
  background-color: transparent;
}

.notion-style {
  color: #37352f;
  background-color: transparent;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
}

/* 行内代码span样式 */
.inline-code-span {
  display: inline !important;
  white-space: pre !important;
  padding: 0.2em 0.4em !important;
  margin: 0 !important;
  font-size: 85% !important;
  font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace !important;
  border-radius: 4px !important;
  vertical-align: middle !important;
  box-sizing: border-box !important;
}

.github-markdown-light .inline-code-span {
  background-color: rgba(27, 31, 35, 0.05) !important;
  color: #d14 !important;
}

.notion-style .inline-code-span {
  background-color: rgba(135, 131, 120, 0.15) !important;
  color: #eb5757 !important;
}

/* 标题样式 */
.markdown-h1, .markdown-h2, .markdown-h3, .markdown-h4, .markdown-h5, .markdown-h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-h1:first-child, .markdown-h2:first-child, .markdown-h3:first-child,
.markdown-h4:first-child, .markdown-h5:first-child, .markdown-h6:first-child {
  margin-top: 0;
}

.github-markdown-light .markdown-h1 {
  font-size: 2em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

.notion-style .markdown-h1 {
  font-size: 2em;
  color: #37352f;
  font-weight: 700;
  border-bottom: none;
}

.github-markdown-light .markdown-h2 {
  font-size: 1.5em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

.notion-style .markdown-h2 {
  font-size: 1.5em;
  color: #37352f;
  font-weight: 600;
  border-bottom: none;
}

.markdown-h3 {
  font-size: 1.25em;
}

.notion-style .markdown-h3 {
  font-size: 1.25em;
  color: #37352f;
  font-weight: 600;
}

.markdown-h4 {
  font-size: 1em;
}

.notion-style .markdown-h4 {
  font-size: 1em;
  color: #37352f;
  font-weight: 600;
}

.markdown-h5 {
  font-size: 0.875em;
}

.notion-style .markdown-h5 {
  font-size: 0.875em;
  color: #37352f;
  font-weight: 600;
}

.markdown-h6 {
  font-size: 0.85em;
  color: #6a737d;
}

.notion-style .markdown-h6 {
  font-size: 0.85em;
  color: #9b9a97;
  font-weight: 600;
}

/* 段落样式 */
.markdown-p {
  margin-top: 0;
  margin-bottom: 16px;
}

.notion-style .markdown-p {
  color: #37352f;
  line-height: 1.7;
}

.markdown-p:last-child {
  margin-bottom: 0;
}

.markdown-p-in-list {
  margin-top: 0;
  margin-bottom: 0;
}

/* 链接样式 */
.markdown-link {
  color: #0366d6;
  text-decoration: none;
}

.notion-style .markdown-link {
  color: #2eaadc;
  text-decoration: underline;
  text-decoration-color: rgba(55, 53, 47, 0.2);
}

.markdown-link:hover {
  text-decoration: underline;
}

.notion-style .markdown-link:hover {
  text-decoration-color: rgba(55, 53, 47, 0.4);
}

/* 列表样式 */
.markdown-ul, .markdown-ol {
  padding-left: 2em;
  margin-top: 0;
  margin-bottom: 16px;
}

.notion-style .markdown-ul, .notion-style .markdown-ol {
  color: #37352f;
  padding-left: 1.5em;
}

.markdown-ul:last-child, .markdown-ol:last-child {
  margin-bottom: 0;
}

.markdown-li {
  word-wrap: break-all;
}

.notion-style .markdown-li {
  color: #37352f;
  padding: 3px 0;
}

.markdown-li + .markdown-li {
  margin-top: 0.25em;
}

.markdown-li > p {
  margin-top: 16px;
  margin-bottom: 16px;
}

.notion-style .markdown-li > p {
  margin-top: 6px;
  margin-bottom: 6px;
}

.markdown-li > p:first-child {
  margin-top: 0;
}

.markdown-li > p:last-child {
  margin-bottom: 0;
}

/* 防止列表内嵌套列表的边距问题 */
.markdown-li > .markdown-ul,
.markdown-li > .markdown-ol {
  margin-top: 4px;
  margin-bottom: 4px;
}

/* 确保列表项中的代码块正确显示 */
.markdown-li > .markdown-pre {
  margin-top: 16px;
  margin-bottom: 16px;
}

/* 引用样式 */
.markdown-blockquote {
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
  margin: 0 0 16px 0;
}

.notion-style .markdown-blockquote {
  border-left: 3px solid #e3e2e0;
  padding-left: 0.9em;
  padding-right: 0;
  color: #37352f;
  margin-left: 0;
  margin-right: 0;
}

.markdown-blockquote > :first-child {
  margin-top: 0;
}

.markdown-blockquote > :last-child {
  margin-bottom: 0;
}

/* 代码样式 */
.markdown-inline-code, .single-char-code {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(27, 31, 35, 0.05);
  border-radius: 4px;
  font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
  display: inline;
  white-space: pre;
  word-wrap: break-word;
  color: #d14;
  line-height: 1.5;
  vertical-align: middle;
  box-sizing: border-box;
  border: none;
}

.notion-style .markdown-inline-code, 
.notion-style .single-char-code {
  background-color: rgba(135, 131, 120, 0.15);
  color: #eb5757;
  border-radius: 3px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
}

/* 确保rehype-raw处理的HTML标签样式正确 */
.single-char-code {
  font-weight: normal !important;
  padding: 0.2em 0.4em !important;
  white-space: pre !important;
  display: inline !important;
  vertical-align: middle !important;
}

.markdown-pre {
  margin-top: 0;
  margin-bottom: 16px;
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa;
  border-radius: 6px;
  word-wrap: normal;
}

.notion-style .markdown-pre {
  background-color: #f7f6f3;
  border-radius: 3px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
}

.markdown-pre > code {
  background: transparent;
  padding: 0;
  margin: 0;
  font-size: 100%;
  word-break: normal;
  white-space: pre;
  overflow: visible;
  line-height: inherit;
  word-wrap: normal;
  background-color: transparent;
  border: 0;
  display: block;
}

.markdown-block-code {
  padding: 0;
  margin: 0;
  font-size: 100%;
  word-break: normal;
  white-space: pre;
  background: transparent;
  border: 0;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  display: block;
  overflow-x: auto;
}

/* 语法高亮支持 */
.language-javascript .token.keyword,
.language-typescript .token.keyword,
.language-js .token.keyword,
.language-ts .token.keyword {
  color: #d73a49;
}

.notion-style .language-javascript .token.keyword,
.notion-style .language-typescript .token.keyword,
.notion-style .language-js .token.keyword,
.notion-style .language-ts .token.keyword {
  color: #eb5757;
}

/* 表格样式 */
.markdown-table {
  display: block;
  width: 100%;
  overflow: auto;
  margin-top: 0;
  margin-bottom: 16px;
  border-spacing: 0;
  border-collapse: collapse;
}

.notion-style .markdown-table {
  margin-bottom: 10px;
  color: #37352f;
  border-collapse: collapse;
  border-spacing: 0;
}

.markdown-table tr {
  background-color: #ffffff;
  border-top: 1px solid #c6cbd1;
}

.notion-style .markdown-table tr {
  border-top: 1px solid #e3e2e0;
  border-bottom: 1px solid #e3e2e0;
}

.markdown-table tr:nth-child(2n) {
  background-color: #f6f8fa;
}

.notion-style .markdown-table tr:nth-child(2n) {
  background-color: #f7f6f3;
}

.markdown-table th, .markdown-table td {
  padding: 6px 13px;
  border: 1px solid #dfe2e5;
}

.notion-style .markdown-table th, 
.notion-style .markdown-table td {
  padding: 6px 13px;
  border: 1px solid #e3e2e0;
}

.markdown-table th {
  font-weight: 600;
}

.notion-style .markdown-table th {
  font-weight: 500;
  text-align: left;
  background-color: #f7f6f3;
}

/* 水平线样式 */
.markdown-hr {
  height: 0.25em;
  padding: 0;
  margin: 24px 0;
  background-color: #e1e4e8;
  border: 0;
}

.notion-style .markdown-hr {
  height: 1px;
  background-color: #e3e2e0;
  margin: 12px 0;
}

/* 其他样式 */
.markdown-strong {
  font-weight: 600;
}

.notion-style .markdown-strong {
  font-weight: 600;
  color: #37352f;
}

.markdown-em {
  font-style: italic;
}

.notion-style .markdown-em {
  font-style: italic;
  color: #37352f;
}

.markdown-img {
  max-width: 100%;
  box-sizing: content-box;
  background-color: #fff;
  border-style: none;
}

.notion-style .markdown-img {
  border-radius: 3px;
  margin: 8px 0;
}

.markdown-del {
  text-decoration: line-through;
}

.notion-style .markdown-del {
  text-decoration: line-through;
  color: #9b9a97;
}

/* 任务列表项样式 */
.contains-task-list {
  padding-left: 0;
  list-style: none;
}

.task-list-item {
  position: relative;
  list-style-type: none;
  padding-left: 1.5em;
}

.notion-style .task-list-item {
  padding-left: 24px;
}

.task-list-item-checkbox {
  position: absolute;
  top: 0.25em;
  left: 0;
}

.notion-style .task-list-item-checkbox {
  appearance: none;
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border: 1px solid #9b9a97;
  border-radius: 3px;
  position: absolute;
  left: 0;
  top: 3px;
}

.notion-style .task-list-item-checkbox:checked {
  background-color: #2eaadc;
  border-color: #2eaadc;
}

.notion-style .task-list-item-checkbox:checked:after {
  content: '✓';
  position: absolute;
  left: 2px;
  top: -2px;
  color: white;
  font-size: 12px;
}

/* 代码块语言标签 */
.code-language {
  position: relative;
  top: -0.2em;
  margin-left: 1em;
  font-size: 0.75em;
  color: #6a737d;
}

.notion-style .code-language {
  color: #9b9a97;
  font-size: 0.75em;
}

/* 数学公式支持 */
.katex-display {
  overflow-x: auto;
  overflow-y: hidden;
  padding: 1em 0;
  margin: 1em 0;
}

.notion-style .katex-display {
  background-color: #f7f6f3;
  border-radius: 3px;
  padding: 10px;
}

/* GitHub风格的提示框 */
.markdown-alert {
  padding: 1em;
  margin-bottom: 16px;
  border-radius: 6px;
  border-left: 0.25em solid;
  position: relative;
}

.notion-style .markdown-alert {
  border-radius: 3px;
  padding: 16px;
  background-color: #f7f6f3;
  margin-bottom: 10px;
}

.markdown-alert-title {
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  line-height: 1;
}

.notion-style .markdown-alert-title {
  color: #37352f;
  font-weight: 500;
}

.markdown-alert-title strong {
  text-transform: uppercase;
  font-size: 0.85em;
}

.notion-style .markdown-alert-title strong {
  font-size: 0.9em;
  color: #37352f;
}

.markdown-alert-title::before {
  content: '';
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 8px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.notion-style .markdown-alert-title::before {
  width: 18px;
  height: 18px;
}

.markdown-alert p {
  margin-top: 0;
  margin-bottom: 8px;
}

.notion-style .markdown-alert p {
  color: #37352f;
}

.markdown-alert p:last-child {
  margin-bottom: 0;
}

.markdown-alert-note {
  background-color: rgba(221, 244, 255, 0.5);
  border-left-color: #58a6ff;
}

.notion-style .markdown-alert-note {
  border-left-color: #2eaadc;
  background-color: rgba(46, 170, 220, 0.1);
}

.notion-style .markdown-alert-note .markdown-alert-title::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' width='16' height='16'%3E%3Cpath fill='%232eaadc' d='M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z'%3E%3C/path%3E%3C/svg%3E");
}

.markdown-alert-tip {
  background-color: rgba(222, 248, 222, 0.5);
  border-left-color: #2da44e;
}

.notion-style .markdown-alert-tip {
  border-left-color: #0f9d58;
  background-color: rgba(15, 157, 88, 0.1);
}

.notion-style .markdown-alert-tip .markdown-alert-title::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' width='16' height='16'%3E%3Cpath fill='%230f9d58' d='M8 1.5c-2.363 0-4 1.69-4 3.75 0 .984.424 1.625.984 2.304l.214.253c.223.264.47.556.673.848.284.411.537.896.621 1.49a.75.75 0 0 1-1.484.211c-.04-.282-.163-.547-.37-.847a8.456 8.456 0 0 0-.542-.68c-.084-.1-.173-.205-.268-.32C3.201 7.75 2.5 6.766 2.5 5.25 2.5 2.31 4.863 0 8 0s5.5 2.31 5.5 5.25c0 1.516-.701 2.5-1.328 3.259-.095.115-.184.22-.268.319-.207.245-.383.453-.541.681-.208.3-.33.565-.37.847a.751.751 0 0 1-1.485-.212c.084-.593.337-1.078.621-1.489.203-.292.45-.584.673-.848.075-.088.147-.173.213-.253.561-.679.985-1.32.985-2.304 0-2.06-1.637-3.75-4-3.75ZM5.75 14.5a2.25 2.25 0 0 1 4.5 0 .75.75 0 0 1-1.5 0 .75.75 0 0 0-1.5 0 .75.75 0 0 1-1.5 0Z'%3E%3C/path%3E%3C/svg%3E");
}

.markdown-alert-important {
  background-color: rgba(255, 242, 204, 0.5);
  border-left-color: #bf8700;
}

.notion-style .markdown-alert-important {
  border-left-color: #f5b400;
  background-color: rgba(245, 180, 0, 0.1);
}

.notion-style .markdown-alert-important .markdown-alert-title::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' width='16' height='16'%3E%3Cpath fill='%23f5b400' d='M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v9.5A1.75 1.75 0 0 1 14.25 13H8.06l-2.573 2.573A1.458 1.458 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25Zm1.75-.25a.25.25 0 0 0-.25.25v9.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h6.5a.25.25 0 0 0 .25-.25v-9.5a.25.25 0 0 0-.25-.25Zm7 2.25v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z'%3E%3C/path%3E%3C/svg%3E");
}

.markdown-alert-warning {
  background-color: rgba(255, 237, 213, 0.5);
  border-left-color: #fd8c73;
}

.notion-style .markdown-alert-warning {
  border-left-color: #f5a623;
  background-color: rgba(245, 166, 35, 0.1);
}

.notion-style .markdown-alert-warning .markdown-alert-title::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' width='16' height='16'%3E%3Cpath fill='%23f5a623' d='M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z'%3E%3C/path%3E%3C/svg%3E");
}

.markdown-alert-caution {
  background-color: rgba(255, 223, 235, 0.5);
  border-left-color: #d73a49;
}

.notion-style .markdown-alert-caution {
  border-left-color: #eb5757;
  background-color: rgba(235, 87, 87, 0.1);
}

.notion-style .markdown-alert-caution .markdown-alert-title::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' width='16' height='16'%3E%3Cpath fill='%23eb5757' d='M4.47.22A.749.749 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.749.749 0 0 1-.22.53l-4.25 4.25A.749.749 0 0 1 11 16H5a.749.749 0 0 1-.53-.22L.22 11.53A.749.749 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z'%3E%3C/path%3E%3C/svg%3E");
}

/* Mermaid图表样式 */
.mermaid-wrapper {
  margin: 1em 0;
  text-align: center;
  overflow: visible !important;
  max-width: 100%;
  position: relative;
}

.notion-style .mermaid-wrapper {
  margin: 10px 0;
  background-color: #f7f6f3;
  border-radius: 3px;
  padding: 10px;
  border: 1px solid #e3e2e0;
  overflow: visible !important;
}

.mermaid {
  overflow: visible !important;
  display: inline-block;
  min-width: 100%;
  background: transparent !important;
  text-align: center;
  z-index: 1;
}

/* 修复SVG元素的可见性 */
.mermaid svg {
  max-width: 100%;
  height: auto;
  overflow: visible;
}

/* 暗黑模式Mermaid样式优化 */
.dark-mode .mermaid-wrapper {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dark-mode .mermaid text {
  fill: #e6e6e6 !important;
}

.dark-mode .mermaid .label text {
  fill: #e6e6e6 !important;
}

.dark-mode .mermaid .node rect,
.dark-mode .mermaid .node circle,
.dark-mode .mermaid .node polygon,
.dark-mode .mermaid .node path {
  fill: #2d333b !important;
  stroke: #444c56 !important;
}

.dark-mode .mermaid .edgePath .path {
  stroke: #768390 !important;
}

.dark-mode .mermaid .edgeLabel {
  background-color: #2d333b !important;
  color: #e6e6e6 !important;
}

.dark-mode .mermaid .cluster rect {
  fill: #2d333b !important;
  stroke: #444c56 !important;
}

/* 修复图表箭头和连接线 */
.mermaid .flowchart-link {
  stroke-width: 2px !important;
}

.dark-mode .mermaid .flowchart-link {
  stroke: #768390 !important;
}

/* 修复序列图样式 */
.mermaid .actor {
  stroke: #aaa !important;
  fill: #f8f9fa !important;
}

.dark-mode .mermaid .actor {
  stroke: #444c56 !important;
  fill: #2d333b !important;
}

.mermaid .messageLine0 {
  stroke-width: 1.5 !important;
}

.dark-mode .mermaid .messageLine0 {
  stroke: #768390 !important;
}

/* 修复甘特图样式 */
.mermaid .grid .tick line {
  stroke: #e1e4e8 !important;
}

.dark-mode .mermaid .grid .tick line {
  stroke: #444c56 !important;
}

.mermaid .taskText {
  fill: #24292e !important;
}

.dark-mode .mermaid .taskText {
  fill: #e6e6e6 !important;
}

.mermaid .taskTextOutsideRight {
  fill: #24292e !important;
}

.dark-mode .mermaid .taskTextOutsideRight {
  fill: #e6e6e6 !important;
}

/* 修复实体关系图样式 */
.mermaid .er.entityBox {
  fill: #f6f8fa !important;
  stroke: #d0d7de !important;
}

.dark-mode .mermaid .er.entityBox {
  fill: #2d333b !important;
  stroke: #444c56 !important;
}

/* 原始模式的样式 */
.raw-markdown-renderer {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.notion-style .raw-markdown-renderer {
  font-family: 'SFMono-Regular', Monaco, Menlo, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 15px;
  line-height: 1.7;
  color: #37352f;
  background-color: #f7f6f3;
  border-radius: 3px;
  border: 1px solid #e3e2e0;
}

.raw-markdown-renderer p,
.raw-markdown-renderer h1,
.raw-markdown-renderer h2,
.raw-markdown-renderer h3,
.raw-markdown-renderer h4,
.raw-markdown-renderer h5,
.raw-markdown-renderer h6,
.raw-markdown-renderer a {
  margin-top: 0;
  margin-bottom: 0;
  line-height: inherit;
  font-size: inherit;
  font-family: inherit;
}

.notion-style .raw-markdown-renderer p,
.notion-style .raw-markdown-renderer h1,
.notion-style .raw-markdown-renderer h2,
.notion-style .raw-markdown-renderer h3,
.notion-style .raw-markdown-renderer h4,
.notion-style .raw-markdown-renderer h5,
.notion-style .raw-markdown-renderer h6 {
  color: #37352f;
}

.raw-markdown-renderer a {
  text-decoration: none;
  word-break: break-all;
  display: inline;
}

.notion-style .raw-markdown-renderer a {
  color: #2eaadc;
  text-decoration: underline;
  text-decoration-color: rgba(55, 53, 47, 0.2);
}

.raw-markdown-renderer a:hover {
  text-decoration: underline;
}

.notion-style .raw-markdown-renderer a:hover {
  text-decoration-color: rgba(55, 53, 47, 0.4);
}

.raw-markdown-renderer .md-empty-line {
  height: 16px;
  display: block;
}

.notion-style .raw-markdown-renderer .md-empty-line {
  height: 18px; /* Notion风格的空行稍大一些 */
}

/* 代码块样式增强 */
.markdown-block-code {
  display: block;
  border-radius: 6px;
  overflow: hidden;
  margin: 24px 0;
  position: relative;
  padding-top: 4px;
  padding-bottom: 4px;
}

/* 单行代码块的特殊处理 */
.markdown-block-code.single-line {
  padding-top: 12px;
  padding-bottom: 12px;
}

.markdown-block-code pre {
  margin: 0 !important;
  padding: 16px 20px !important;
  background-color: #f6f8fa;
  border-radius: 6px;
  overflow: auto;
  font-size: 90% !important;
}

/* 修复代码块中的多余空行 */
.markdown-block-code code {
  padding-bottom: 0 !important;
  margin-bottom: 0 !important;
}

.markdown-block-code .react-syntax-highlighter-line-number {
  font-size: 90% !important;
}

/* 暗黑模式下的代码块 */
.github-markdown-dark .markdown-block-code pre {
  background-color: #161b22 !important;
  border: 1px solid #30363d;
}

/* 代码行样式 */
.markdown-block-code .linenumber {
  color: #8b949e !important;
  min-width: 1.5em;
  padding: 0 16px 0 0;
  text-align: right;
  user-select: none;
  opacity: 0.7;
}

/* 代码的滚动条样式 */
.markdown-block-code pre::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

.markdown-block-code pre::-webkit-scrollbar-thumb {
  background-color: #d0d7de;
  border-radius: 4px;
}

.github-markdown-dark .markdown-block-code pre::-webkit-scrollbar-thumb {
  background-color: #484f58;
}

.notion-style .markdown-block-code pre::-webkit-scrollbar-thumb {
  background-color: #e3e2e0;
}

.markdown-block-code pre::-webkit-scrollbar-track {
  background-color: transparent;
  border-radius: 4px;
}

/* 行内代码优化 */
.markdown-inline-code {
  font-size: 85%;
  border-radius: 6px;
  padding: 0.2em 0.4em;
  margin: 0;
  font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
  word-break: keep-all;
}

.github-markdown-dark .markdown-inline-code {
  background-color: rgba(240, 246, 252, 0.15) !important;
  color: #e6edf3 !important;
}

.notion-style .markdown-inline-code {
  background-color: rgba(135, 131, 120, 0.15) !important;
  color: #eb5757 !important;
  border-radius: 3px;
  font-family: 'SFMono-Regular', Monaco, Menlo, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 85%;
  padding: 0.2em 0.4em;
  border: none;
}

/* 代码块容器样式 */
.markdown-code-wrapper {
  margin: 24px 0;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f6f8fa;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
}

/* 暗色模式下的代码块容器 */
.github-markdown-dark .markdown-code-wrapper {
  background-color: #161b22;
  border: 1px solid #30363d;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
}

.notion-style .markdown-code-wrapper {
  background-color: #f7f6f3;
  border: 1px solid #e3e2e0;
  border-radius: 3px;
  box-shadow: none;
  margin: 16px 0;
}

/* 代码块头部样式 */
.markdown-code-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f0f3f6;
  border-bottom: 1px solid #ddd;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

/* 暗色模式下的代码块头部 */
.github-markdown-dark .markdown-code-header {
  background-color: #0d1117;
  border-bottom: 1px solid #30363d;
}

.notion-style .markdown-code-header {
  background-color: #f7f6f3;
  border-bottom: 1px solid #e3e2e0;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  padding: 8px 12px;
}

/* Mac风格窗口按钮 */
.markdown-code-button {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  margin-right: 8px;
}

.markdown-code-button.red {
  background-color: #ff5f56;
}

.markdown-code-button.yellow {
  background-color: #ffbd2e;
}

.markdown-code-button.green {
  background-color: #27c93f;
}

/* 语言标签 */
.markdown-code-language {
  margin-left: auto;
  font-size: 13px;
  font-weight: 600;
  color: #57606a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 暗色模式下的语言标签 */
.github-markdown-dark .markdown-code-language {
  color: #8b949e;
}

.notion-style .markdown-code-language {
  color: #9b9a97;
  font-weight: 500;
  font-size: 12px;
}

/* 代码块样式更新 */
.markdown-code-content {
  display: block;
  padding: 0 !important;
  margin: 0 !important;
}

.markdown-code-content code {
  margin: 0 !important;
  padding: 0 !important;
}

/* react-syntax-highlighter 容器样式修复 */
.react-syntax-highlighter-line-number {
  margin-right: 20px;
  padding-top: 1px;
  padding-bottom: 1px;
  font-size: 90% !important;
  opacity: 0.7;
}

/* 确保行号与代码内容正确对齐 */
.markdown-block-code .linenumber,
.markdown-block-code .react-syntax-highlighter-line-number {
  display: inline-block;
  line-height: 1.6 !important;
  vertical-align: top;
}

pre.prism-code {
  margin: 0 !important;
  padding: 16px 20px !important;
}

/* 防止代码块末尾空行 */
.react-syntax-highlighter-line:last-child:empty {
  display: none;
}

/* 优化代码区域整体布局 */
.markdown-body p + .markdown-code-wrapper,
.markdown-body h1 + .markdown-code-wrapper,
.markdown-body h2 + .markdown-code-wrapper,
.markdown-body h3 + .markdown-code-wrapper,
.markdown-body h4 + .markdown-code-wrapper,
.markdown-body h5 + .markdown-code-wrapper,
.markdown-body h6 + .markdown-code-wrapper,
.markdown-body ul + .markdown-code-wrapper,
.markdown-body ol + .markdown-code-wrapper {
  margin-top: 16px;
}

.markdown-body .markdown-code-wrapper + p,
.markdown-body .markdown-code-wrapper + h1,
.markdown-body .markdown-code-wrapper + h2,
.markdown-body .markdown-code-wrapper + h3,
.markdown-body .markdown-code-wrapper + h4,
.markdown-body .markdown-code-wrapper + h5,
.markdown-body .markdown-code-wrapper + h6 {
  margin-top: 16px;
}

/* 调整代码字体 */
.markdown-block-code code,
.markdown-code-content code {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
  line-height: 1.6 !important;
}

/* 代码行样式 - 增加行间距 */
.react-syntax-highlighter-line {
  padding: 1px 0;
}

/* Notion风格的原始模式内特定元素样式 */
.notion-raw code,
.notion-raw pre {
  color: #eb5757;
  background-color: rgba(135, 131, 120, 0.15);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: inherit;
  font-size: inherit;
}

/* 修复代码块样式 */
.notion-raw pre code {
  display: block;
  padding: 16px;
  background-color: #f7f6f3;
  border: 1px solid #e3e2e0;
  border-radius: 3px;
  overflow-x: auto;
  color: #eb5757;
  line-height: 1.7;
}

.notion-raw ul, 
.notion-raw ol {
  color: #37352f;
}

.notion-raw h1, 
.notion-raw h2, 
.notion-raw h3 {
  color: #37352f;
  font-weight: 600;
}

.notion-raw blockquote {
  margin-left: 0;
  padding-left: 14px;
  border-left: 3px solid #e3e2e0;
  color: #37352f;
}

.notion-raw hr {
  height: 1px;
  background-color: #e3e2e0;
  border: none;
}
`;

// 添加全局样式
const globalStyles = `
${customMarkdownStyles}

/* 原始模式的样式 */
.raw-markdown-renderer {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.notion-style .raw-markdown-renderer {
  font-family: 'SFMono-Regular', Monaco, Menlo, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 15px;
  line-height: 1.7;
  color: #37352f;
  background-color: #f7f6f3;
  border-radius: 3px;
  border: 1px solid #e3e2e0;
}

.raw-markdown-renderer p,
.raw-markdown-renderer h1,
.raw-markdown-renderer h2,
.raw-markdown-renderer h3,
.raw-markdown-renderer h4,
.raw-markdown-renderer h5,
.raw-markdown-renderer h6,
.raw-markdown-renderer a {
  margin-top: 0;
  margin-bottom: 0;
  line-height: inherit;
  font-size: inherit;
  font-family: inherit;
}

.notion-style .raw-markdown-renderer p,
.notion-style .raw-markdown-renderer h1,
.notion-style .raw-markdown-renderer h2,
.notion-style .raw-markdown-renderer h3,
.notion-style .raw-markdown-renderer h4,
.notion-style .raw-markdown-renderer h5,
.notion-style .raw-markdown-renderer h6 {
  color: #37352f;
}

.raw-markdown-renderer a {
  text-decoration: none;
  word-break: break-all;
  display: inline;
}

.notion-style .raw-markdown-renderer a {
  color: #2eaadc;
  text-decoration: underline;
  text-decoration-color: rgba(55, 53, 47, 0.2);
}

.raw-markdown-renderer a:hover {
  text-decoration: underline;
}

.notion-style .raw-markdown-renderer a:hover {
  text-decoration-color: rgba(55, 53, 47, 0.4);
}

.raw-markdown-renderer .md-empty-line {
  height: 16px;
  display: block;
}

.notion-style .raw-markdown-renderer .md-empty-line {
  height: 18px; /* Notion风格的空行稍大一些 */
}

/* 代码块样式增强 */
.markdown-block-code {
  display: block;
  border-radius: 6px;
  overflow: hidden;
  margin: 24px 0;
  position: relative;
  padding-top: 4px;
  padding-bottom: 4px;
}

/* 单行代码块的特殊处理 */
.markdown-block-code.single-line {
  padding-top: 12px;
  padding-bottom: 12px;
}

.markdown-block-code pre {
  margin: 0 !important;
  padding: 16px 20px !important;
  background-color: #f6f8fa;
  border-radius: 6px;
  overflow: auto;
  font-size: 90% !important;
}

/* 修复代码块中的多余空行 */
.markdown-block-code code {
  padding-bottom: 0 !important;
  margin-bottom: 0 !important;
}

.markdown-block-code .react-syntax-highlighter-line-number {
  font-size: 90% !important;
}

/* 暗黑模式下的代码块 */
.github-markdown-dark .markdown-block-code pre {
  background-color: #161b22 !important;
  border: 1px solid #30363d;
}

/* 代码行样式 */
.markdown-block-code .linenumber {
  color: #8b949e !important;
  min-width: 1.5em;
  padding: 0 16px 0 0;
  text-align: right;
  user-select: none;
  opacity: 0.7;
}

/* 代码的滚动条样式 */
.markdown-block-code pre::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

.markdown-block-code pre::-webkit-scrollbar-thumb {
  background-color: #d0d7de;
  border-radius: 4px;
}

.github-markdown-dark .markdown-block-code pre::-webkit-scrollbar-thumb {
  background-color: #484f58;
}

.notion-style .markdown-block-code pre::-webkit-scrollbar-thumb {
  background-color: #e3e2e0;
}

.markdown-block-code pre::-webkit-scrollbar-track {
  background-color: transparent;
  border-radius: 4px;
}

/* 行内代码优化 */
.markdown-inline-code {
  font-size: 85%;
  border-radius: 6px;
  padding: 0.2em 0.4em;
  margin: 0;
  font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
  word-break: keep-all;
}

.github-markdown-dark .markdown-inline-code {
  background-color: rgba(240, 246, 252, 0.15) !important;
  color: #e6edf3 !important;
}

.notion-style .markdown-inline-code {
  background-color: rgba(135, 131, 120, 0.15) !important;
  color: #eb5757 !important;
  border-radius: 3px;
  font-family: 'SFMono-Regular', Monaco, Menlo, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 85%;
  padding: 0.2em 0.4em;
  border: none;
}

/* 代码块容器样式 */
.markdown-code-wrapper {
  margin: 24px 0;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f6f8fa;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
}

/* 暗色模式下的代码块容器 */
.github-markdown-dark .markdown-code-wrapper {
  background-color: #161b22;
  border: 1px solid #30363d;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
}

.notion-style .markdown-code-wrapper {
  background-color: #f7f6f3;
  border: 1px solid #e3e2e0;
  border-radius: 3px;
  box-shadow: none;
  margin: 16px 0;
}

/* 代码块头部样式 */
.markdown-code-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f0f3f6;
  border-bottom: 1px solid #ddd;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

/* 暗色模式下的代码块头部 */
.github-markdown-dark .markdown-code-header {
  background-color: #0d1117;
  border-bottom: 1px solid #30363d;
}

.notion-style .markdown-code-header {
  background-color: #f7f6f3;
  border-bottom: 1px solid #e3e2e0;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  padding: 8px 12px;
}

/* Mac风格窗口按钮 */
.markdown-code-button {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  margin-right: 8px;
}

.markdown-code-button.red {
  background-color: #ff5f56;
}

.markdown-code-button.yellow {
  background-color: #ffbd2e;
}

.markdown-code-button.green {
  background-color: #27c93f;
}

/* 语言标签 */
.markdown-code-language {
  margin-left: auto;
  font-size: 13px;
  font-weight: 600;
  color: #57606a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 暗色模式下的语言标签 */
.github-markdown-dark .markdown-code-language {
  color: #8b949e;
}

.notion-style .markdown-code-language {
  color: #9b9a97;
  font-weight: 500;
  font-size: 12px;
}

/* 代码块样式更新 */
.markdown-code-content {
  display: block;
  padding: 0 !important;
  margin: 0 !important;
}

.markdown-code-content code {
  margin: 0 !important;
  padding: 0 !important;
}

/* react-syntax-highlighter 容器样式修复 */
.react-syntax-highlighter-line-number {
  margin-right: 20px;
  padding-top: 1px;
  padding-bottom: 1px;
  font-size: 90% !important;
  opacity: 0.7;
}

/* 确保行号与代码内容正确对齐 */
.markdown-block-code .linenumber,
.markdown-block-code .react-syntax-highlighter-line-number {
  display: inline-block;
  line-height: 1.6 !important;
  vertical-align: top;
}

pre.prism-code {
  margin: 0 !important;
  padding: 16px 20px !important;
}

/* 防止代码块末尾空行 */
.react-syntax-highlighter-line:last-child:empty {
  display: none;
}

/* 优化代码区域整体布局 */
.markdown-body p + .markdown-code-wrapper,
.markdown-body h1 + .markdown-code-wrapper,
.markdown-body h2 + .markdown-code-wrapper,
.markdown-body h3 + .markdown-code-wrapper,
.markdown-body h4 + .markdown-code-wrapper,
.markdown-body h5 + .markdown-code-wrapper,
.markdown-body h6 + .markdown-code-wrapper,
.markdown-body ul + .markdown-code-wrapper,
.markdown-body ol + .markdown-code-wrapper {
  margin-top: 16px;
}

.markdown-body .markdown-code-wrapper + p,
.markdown-body .markdown-code-wrapper + h1,
.markdown-body .markdown-code-wrapper + h2,
.markdown-body .markdown-code-wrapper + h3,
.markdown-body .markdown-code-wrapper + h4,
.markdown-body .markdown-code-wrapper + h5,
.markdown-body .markdown-code-wrapper + h6 {
  margin-top: 16px;
}

/* 调整代码字体 */
.markdown-block-code code,
.markdown-code-content code {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
  line-height: 1.6 !important;
}

/* 代码行样式 - 增加行间距 */
.react-syntax-highlighter-line {
  padding: 1px 0;
}

/* Notion风格的原始模式内特定元素样式 */
.notion-raw code,
.notion-raw pre {
  color: #eb5757;
  background-color: rgba(135, 131, 120, 0.15);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: inherit;
  font-size: inherit;
}

/* 修复代码块样式 */
.notion-raw pre code {
  display: block;
  padding: 16px;
  background-color: #f7f6f3;
  border: 1px solid #e3e2e0;
  border-radius: 3px;
  overflow-x: auto;
  color: #eb5757;
  line-height: 1.7;
}

.notion-raw ul, 
.notion-raw ol {
  color: #37352f;
}

.notion-raw h1, 
.notion-raw h2, 
.notion-raw h3 {
  color: #37352f;
  font-weight: 600;
}

.notion-raw blockquote {
  margin-left: 0;
  padding-left: 14px;
  border-left: 3px solid #e3e2e0;
  color: #37352f;
}

.notion-raw hr {
  height: 1px;
  background-color: #e3e2e0;
  border: none;
}
`;

// 添加更完整的LaTeX到ASCII/Unicode的映射函数
const convertLatexToUnicode = (texCode: string): string => {
  // 常见的LaTeX符号及其Unicode或ASCII表示
  const replacements: [RegExp, string][] = [
    // 希腊字母
    [/\\alpha/g, 'α'], [/\\beta/g, 'β'], [/\\gamma/g, 'γ'], [/\\delta/g, 'δ'],
    [/\\epsilon/g, 'ε'], [/\\zeta/g, 'ζ'], [/\\eta/g, 'η'], [/\\theta/g, 'θ'],
    [/\\iota/g, 'ι'], [/\\kappa/g, 'κ'], [/\\lambda/g, 'λ'], [/\\mu/g, 'μ'],
    [/\\nu/g, 'ν'], [/\\xi/g, 'ξ'], [/\\pi/g, 'π'], [/\\rho/g, 'ρ'],
    [/\\sigma/g, 'σ'], [/\\tau/g, 'τ'], [/\\upsilon/g, 'υ'], [/\\phi/g, 'φ'],
    [/\\chi/g, 'χ'], [/\\psi/g, 'ψ'], [/\\omega/g, 'ω'],
    [/\\Gamma/g, 'Γ'], [/\\Delta/g, 'Δ'], [/\\Theta/g, 'Θ'], [/\\Lambda/g, 'Λ'],
    [/\\Xi/g, 'Ξ'], [/\\Pi/g, 'Π'], [/\\Sigma/g, 'Σ'], [/\\Phi/g, 'Φ'],
    [/\\Psi/g, 'Ψ'], [/\\Omega/g, 'Ω'],
    
    // 数学运算符
    [/\\times/g, '×'], [/\\div/g, '÷'], [/\\pm/g, '±'], [/\\mp/g, '∓'],
    [/\\cdot/g, '·'], [/\\cdots/g, '⋯'], [/\\ldots/g, '...'],
    [/\\leq/g, '≤'], [/\\geq/g, '≥'], [/\\neq/g, '≠'], [/\\approx/g, '≈'],
    [/\\equiv/g, '≡'], [/\\cong/g, '≅'], [/\\sim/g, '∼'],
    
    // 集合和逻辑
    [/\\in/g, '∈'], [/\\notin/g, '∉'], [/\\subset/g, '⊂'], [/\\supset/g, '⊃'],
    [/\\subseteq/g, '⊆'], [/\\supseteq/g, '⊇'], [/\\cup/g, '∪'], [/\\cap/g, '∩'],
    [/\\emptyset/g, '∅'], [/\\varnothing/g, '∅'],
    [/\\forall/g, '∀'], [/\\exists/g, '∃'], [/\\neg/g, '¬'],
    [/\\lor/g, '∨'], [/\\land/g, '∧'], [/\\Rightarrow/g, '⇒'], [/\\Leftarrow/g, '⇐'],
    [/\\Leftrightarrow/g, '⇔'], [/\\rightarrow/g, '→'], [/\\leftarrow/g, '←'],
    [/\\leftrightarrow/g, '↔'],
    
    // 微积分和分析
    [/\\infty/g, '∞'], [/\\partial/g, '∂'], [/\\nabla/g, '∇'],
    [/\\sum/g, '∑'], [/\\prod/g, '∏'], [/\\int/g, '∫'], [/\\oint/g, '∮'],
    
    // 括号和其他符号
    [/\\{/g, '{'], [/\\}/g, '}'], [/\\|/g, '|'],
    [/\\langle/g, '⟨'], [/\\rangle/g, '⟩'],
    [/\\lfloor/g, '⌊'], [/\\rfloor/g, '⌋'], [/\\lceil/g, '⌈'], [/\\rceil/g, '⌉'],
    
    // 分数和上下标
    [/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '$1/$2'], // 简单分数转换
    
    // 空格和换行
    [/\\\\/g, '\n'], [/\\quad/g, '    '], [/\\qquad/g, '        '],
    
    // 括号转换
    [/\\left\(/g, '('], [/\\right\)/g, ')'],
    [/\\left\[/g, '['], [/\\right\]/g, ']'],
    [/\\left\\{/g, '{'], [/\\right\\}/g, '}'],
    
    // 删除不支持的指令
    [/\\text\{([^{}]*)\}/g, '$1'], // 文本指令
    [/\\mathrm\{([^{}]*)\}/g, '$1'], // mathrm指令
    [/\\mathbf\{([^{}]*)\}/g, '$1'], // mathbf指令
    [/\\mathit\{([^{}]*)\}/g, '$1'], // mathit指令
    
    // 上标和下标
    [/\^(\d)/g, '^$1'], // 简单上标
    [/_(\d)/g, '_$1'], // 简单下标
    [/\^\{([^{}]*)\}/g, '^($1)'], // 复杂上标
    [/_\{([^{}]*)\}/g, '_($1)'], // 复杂下标
    
    // 清理剩余的命令
    [/\\[a-zA-Z]+/g, '?'] // 未知命令替换为问号
  ];
  
  // 应用所有替换
  let result = texCode;
  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }
  
  // 清理连续的空格
  result = result.replace(/\s+/g, ' ').trim();
  
  return result;
};

const App: React.FC = () => {
  const [content, setContent] = useState<string>(testMarkdown);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isRawMode, setIsRawMode] = useState<boolean>(false);
  const [currentTheme, setCurrentTheme] = useState<keyof typeof themes>('notionLight');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const formattedContentRef = useRef<HTMLDivElement>(null);
  const [bitableTheme, setBitableTheme] = useState<ThemeModeType>(ThemeModeType.Light);
  // 添加公众号兼容模式状态
  const [mpCompatMode, setMpCompatMode] = useState<boolean>(false);

  // 处理单元格值的函数，确保文本正确显示
  const processCellValue = (value: any): string => {
    // 创建HTML实体解码器
    const decodeHTML = (html: string) => {
      const textarea = document.createElement('textarea');
      textarea.innerHTML = html;
      return textarea.value;
    };

    // 处理不同类型的值
    if (!value) return '';
    let processedValue = '';
    
    if (typeof value === 'string') {
      processedValue = value;
    } else if (typeof value === 'object' && Array.isArray(value)) {
      processedValue = value.map(item => {
        if (item && typeof item === 'object' && item.text) {
          return item.text;
        }
        return '';
      }).join('');
    } else if (typeof value === 'object') {
      if (value.text) processedValue = value.text;
      else if (value.value) processedValue = value.value;
      else processedValue = JSON.stringify(value, null, 2);
    } else {
      processedValue = String(value);
    }

    // 先解码HTML实体
    const decodedValue = decodeHTML(processedValue);
    
    // 步骤1: 保护行内代码块
    const protectedCode = new Map<string, string>();
    let codeBlockId = 0;
    
    let processed = decodedValue.replace(/`([^`]+)`/g, (match, codeContent) => {
      const placeholder = `__INLINE_CODE_${codeBlockId++}__`;
      protectedCode.set(placeholder, match);
      return placeholder;
    });
    
    // 步骤2: 保护GitHub风格的警告提示语法
    processed = processed.replace(/\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](.*?)(?=\n\[!|\n\n|$)/gs, (match) => {
      return `__GITHUB_ALERT__${match}__GITHUB_ALERT__`;
    });
    
    // 步骤3: 保护图片语法
    processed = processed.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, url) => {
      return `__IMG_MD__${alt}__IMG_URL__${url}__IMG_END__`;
    });
    
    // 步骤4: 保护链接语法 [文本](URL) - 不再转换为HTML
    processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match) => {
      return `__LINK_MD__${match}__LINK_END__`;
    });
    
    // 步骤5: 恢复图片语法
    processed = processed.replace(/__IMG_MD__(.*?)__IMG_URL__(.*?)__IMG_END__/g, (_, alt, url) => {
      return `![${alt}](${url})`;
    });
    
    // 步骤6: 恢复链接语法
    processed = processed.replace(/__LINK_MD__(.*?)__LINK_END__/g, (_, linkContent) => {
      return linkContent;
    });
    
    // 步骤7: 恢复GitHub警告提示语法
    processed = processed.replace(/__GITHUB_ALERT__(.*?)__GITHUB_ALERT__/gs, (_, alertContent) => {
      return alertContent;
    });
    
    // 步骤8: 处理无序列表项
    processed = processed.replace(/^[-*]\s+(.*)/gm, (_match, content) => {
      return `• ${content}`;
    });
    
    // 步骤9: 处理有序列表项
    processed = processed.replace(/^\d+\.\s+(.*)/gm, (match) => {
      return match;
    });
    
    // 最后: 恢复所有行内代码
    for (const [placeholder, original] of protectedCode.entries()) {
      processed = processed.replace(placeholder, original);
    }
    
    return processed;
  };

  // 处理HTML，确保嵌套引用能够正确显示
  const processNestedQuotes = (html: string): string => {
    // 使用正则表达式找到嵌套的引用
    return html.replace(
      /<blockquote[^>]*>(?:(?!<\/blockquote>)[\s\S])*?<blockquote[^>]*>([\s\S]*?)<\/blockquote>[\s\S]*?<\/blockquote>/g,
      (match) => {
        // 将嵌套引用用特殊标记替换
        return match.replace(
          /<blockquote([^>]*)>([\s\S]*?)(?=<\/blockquote>)/g, 
          (_m, attrs, content) => {
            // 给内部blockquote添加特殊标记
            if (content.includes('<blockquote')) {
              return `<blockquote${attrs} data-nested="true" style="padding:0 1em !important;color:#6a737d !important;border-left:0.25em solid #dfe2e5 !important;margin:8px 0 !important;display:block !important"><div class="nested-quote-marker" style="font-weight:bold;color:#6a737d;margin-bottom:4px">引用：</div>${content}`;
            }
            return `<blockquote${attrs}>${content}`;
          }
        );
      }
    );
  };

  // 引用块处理
  const processBlockquotes = (containerEl: HTMLElement): void => {
    // 获取所有引用块
    const blockquotes = containerEl.querySelectorAll('blockquote');
    
    blockquotes.forEach(blockquote => {
      // 设置明确的样式，防止公众号丢失样式
      blockquote.setAttribute('style', 
        'padding: 0 1em !important; color: #6a737d !important; border-left: 0.25em solid #dfe2e5 !important; margin: 0 0 16px 0 !important; display: block !important; quotes: none !important;');
      
      // 检查是否有嵌套引用
      const isNested = blockquote.parentElement && blockquote.parentElement.nodeName.toLowerCase() === 'blockquote';
      
      if (isNested) {
        // 嵌套引用特殊处理
        blockquote.setAttribute('style', 
          'padding: 0 1em !important; color: #6a737d !important; border-left: 0.25em solid #dfe2e5 !important; margin: 8px 0 !important; display: block !important; quotes: none !important;');
        
        // 在第一个段落前添加"引用："前缀
        const firstP = blockquote.querySelector('p');
        if (firstP) {
          const originalContent = firstP.innerHTML;
          firstP.innerHTML = `<strong style="color: #6a737d !important;">引用：</strong> ${originalContent}`;
        }
        
        // 将嵌套引用用div包裹，避免公众号过度处理
        const wrapper = document.createElement('div');
        wrapper.setAttribute('style', 'margin: 8px 0 !important; display: block !important;');
        wrapper.setAttribute('data-type', 'nested-quote');
        
        // 将嵌套引用移到新的div中
        const parent = blockquote.parentNode;
        if (parent) {
          parent.insertBefore(wrapper, blockquote);
          wrapper.appendChild(blockquote);
        }
      }
    });
  };
  
  // 数学公式处理
  const processMathFormulas = (containerEl: HTMLElement): void => {
    // 寻找所有块级公式
    const katexDisplayElements = containerEl.querySelectorAll('.katex-display');
    
    katexDisplayElements.forEach((formula: Element) => {
      try {
        // 提取原始TeX代码
        const texAnnotation = formula.querySelector('.katex-html annotation[encoding="application/x-tex"]');
        if (!texAnnotation) return;
        
        const texCode = texAnnotation.textContent || '';
        if (!texCode) return;
        
        // 检查是否是对齐环境公式
        const alignedMatch = texCode.match(/\\begin\{aligned\}([\s\S]*?)\\end\{aligned\}/);
        if (alignedMatch) {
          const alignedContent = alignedMatch[1];
          // 按行分割
          const lines: string[] = alignedContent.split('\\\\').map((lineStr: string) => lineStr.trim());
          
          // 创建纯文本公式块 - 使用pre元素保持格式
          const preElement = document.createElement('pre');
          preElement.className = 'plain-text-formula';
          preElement.setAttribute('style', 'display:block;text-align:center;margin:1em 0;font-family:monospace;white-space:pre;background-color:#f8f8f8;padding:10px;border-radius:5px;');
          
          // 构建纯文本表示
          let textFormula = '【公式】\n';
          
          lines.forEach((lineStr: string) => {
            // 处理对齐符号&
            const parts = lineStr.split('&');
            if (parts.length > 1) {
              // 左侧部分（右对齐）并替换常见数学符号为Unicode表示
              let leftPart = convertLatexToUnicode(parts[0].trim());
              
              // 右侧部分（左对齐）并应用同样的替换
              let rightPart = convertLatexToUnicode(parts[1].trim());
              
              // 构建均衡的纯文本表示，使用空格对齐
              const padLength = 20; // 左侧最大长度
              const paddedLeft = leftPart.padStart(padLength, ' ');
              textFormula += `${paddedLeft} ${rightPart}\n`;
            } else {
              // 单列内容（居中）
              let plainText = convertLatexToUnicode(lineStr.trim());
              textFormula += `          ${plainText}\n`;
            }
          });
          
          textFormula += '【公式结束】';
          
          // 设置纯文本内容
          preElement.textContent = textFormula;
          
          // 替换原始公式
          const parentElement = formula.parentElement;
          if (parentElement) {
            parentElement.replaceChild(preElement, formula);
          }
        } else {
          // 非对齐环境，使用简单的纯文本表示
          const preElement = document.createElement('pre');
          preElement.className = 'plain-text-formula';
          preElement.setAttribute('style', 'display:block;text-align:center;margin:1em 0;font-family:monospace;white-space:pre;background-color:#f8f8f8;padding:10px;border-radius:5px;');
          
          // 使用转换函数处理LaTeX代码
          let plainText = convertLatexToUnicode(texCode);
          
          preElement.textContent = `【公式】\n${plainText}\n【公式结束】`;
          
          // 替换原始公式
          const parentElement = formula.parentElement;
          if (parentElement) {
            parentElement.replaceChild(preElement, formula);
          }
        }
      } catch (error) {
        console.error('处理数学公式出错:', error);
        // 保留原始内容
      }
    });
    
    // 处理行内公式
    const katexInlineElements = containerEl.querySelectorAll('.katex:not(.katex-display .katex)');
    
    katexInlineElements.forEach((formula: Element) => {
      try {
        // 提取原始TeX代码
        const texAnnotation = formula.querySelector('annotation[encoding="application/x-tex"]');
        if (!texAnnotation) return;
        
        const texCode = texAnnotation.textContent || '';
        if (!texCode) return;
        
        // 创建简化的行内公式 - 使用纯文本
        const inlineText = document.createElement('span');
        inlineText.className = 'plain-text-inline-formula';
        inlineText.setAttribute('style', 'font-family:monospace;white-space:nowrap;background-color:#f8f8f8;padding:0 3px;border-radius:2px;');
        
        // 使用转换函数处理LaTeX代码
        let plainText = convertLatexToUnicode(texCode);
        
        inlineText.textContent = `【${plainText}】`;
        
        // 替换原始公式
        const parentElement = formula.parentElement;
        if (parentElement) {
          parentElement.replaceChild(inlineText, formula);
        }
      } catch (error) {
        console.error('处理行内公式出错:', error);
        // 保留原始内容
      }
    });
  };
  
  // 处理Mermaid图表
  const processMermaidDiagrams = (containerEl: HTMLElement, forClipboard: boolean = false): void => {
    // 寻找所有Mermaid容器
    const mermaidWrappers = containerEl.querySelectorAll('.mermaid-wrapper, .mermaid-container');
    
    mermaidWrappers.forEach(wrapper => {
      const mermaidElement = wrapper.querySelector('.mermaid');
      const svgElement = wrapper.querySelector('svg');
      
      // 如果是为剪贴板准备的内容，保留并增强SVG，确保能够复制图表
      if (forClipboard && svgElement) {
        // 不做任何替换，保留原始SVG内容以便复制
        console.log('剪贴板模式：保留并增强SVG图表');
        // 为复制到剪贴板优化SVG元素
        try {
          // 确保SVG有正确的尺寸和样式
          svgElement.setAttribute('width', svgElement.getAttribute('width') || '100%');
          svgElement.setAttribute('height', svgElement.getAttribute('height') || 'auto');
          // 安全地设置style属性
          const svgStyle = (svgElement as unknown as SVGElement).style;
          svgStyle.maxWidth = '100%';
          svgStyle.height = 'auto';
          svgStyle.display = 'inline-block';
          svgStyle.overflow = 'visible';
          
          // 添加特殊类名，标记为剪贴板准备的SVG
          svgElement.classList.add('clipboard-svg-ready');
        } catch (e) {
          console.error('为剪贴板优化SVG失败:', e);
        }
        return;
      }
      
      // 只有当明确指定为公众号兼容模式AND不是剪贴板模式时，才进行SVG替换
      if (mpCompatMode && !forClipboard && svgElement) {
        try {
          // 创建一个简单的表示，提示用户需要使用图片代替Mermaid图表
          const mermaidPlaceholder = document.createElement('div');
          mermaidPlaceholder.className = 'mermaid-placeholder';
          mermaidPlaceholder.setAttribute('style', `
            text-align: center;
            padding: 12px;
            margin: 12px 0;
            background-color: #f6f8fa;
            border: 1px solid #ddd;
            border-radius: 5px;
          `);
          
          // 添加图表说明
          const infoText = document.createElement('div');
          infoText.style.fontWeight = 'bold';
          infoText.style.marginBottom = '8px';
          infoText.textContent = '【Mermaid图表】';
          mermaidPlaceholder.appendChild(infoText);
          
          // 添加图表说明文字
          const infoDesc = document.createElement('div');
          infoDesc.style.marginBottom = '12px';
          infoDesc.style.color = '#555';
          infoDesc.textContent = '图表无法在公众号直接显示，请截图后作为图片插入';
          mermaidPlaceholder.appendChild(infoDesc);
          
          // 尝试保留SVG
          try {
            const svgText = new XMLSerializer().serializeToString(svgElement);
            const svgContainer = document.createElement('div');
            svgContainer.style.maxWidth = '100%';
            svgContainer.style.margin = '0 auto';
            svgContainer.style.overflow = 'visible';
            // 为SVG添加样式以确保在公众号中显示
            svgContainer.innerHTML = svgText.replace('<svg', '<svg style="max-width:100%;height:auto;display:inline-block;"');
            
            mermaidPlaceholder.appendChild(svgContainer);
          } catch (e) {
            console.error('处理SVG失败:', e);
            const errText = document.createElement('div');
            errText.textContent = '图表渲染失败，请使用截图代替';
            errText.style.color = '#d73a49';
            mermaidPlaceholder.appendChild(errText);
          }
          
          wrapper.parentNode?.replaceChild(mermaidPlaceholder, wrapper);
        } catch (e) {
          console.error('处理Mermaid图表失败:', e);
        }
      } else if (mpCompatMode && !forClipboard && mermaidElement && !svgElement) {
        // 如果是公众号兼容模式、不是剪贴板模式，且找到mermaid元素但没有SVG（可能尚未渲染），创建占位符
        const mermaidContent = mermaidElement.textContent || '';
        const placeholder = document.createElement('div');
        placeholder.className = 'mermaid-placeholder';
        placeholder.setAttribute('style', `
          text-align: center;
          padding: 12px;
          margin: 12px 0;
          background-color: #f6f8fa;
          border: 1px solid #ddd;
          border-radius: 5px;
        `);
        
        const infoText = document.createElement('div');
        infoText.style.fontWeight = 'bold';
        infoText.textContent = '【Mermaid图表 - 未渲染】';
        placeholder.appendChild(infoText);
        
        const codeBlock = document.createElement('pre');
        codeBlock.style.textAlign = 'left';
        codeBlock.style.marginTop = '8px';
        codeBlock.style.padding = '8px';
        codeBlock.style.backgroundColor = '#f0f0f0';
        codeBlock.style.borderRadius = '4px';
        codeBlock.style.whiteSpace = 'pre-wrap';
        codeBlock.style.fontSize = '12px';
        codeBlock.textContent = mermaidContent;
        placeholder.appendChild(codeBlock);
        
        wrapper.parentNode?.replaceChild(placeholder, wrapper);
      }
      // 在其他情况下，保留原始SVG，不做任何修改（正常显示图表）
    });
  };

  // 准备公众号兼容的内容
  const prepareContentForMp = (): string => {
    // 创建临时容器
    const container = document.createElement('div');
    container.className = 'mp-content';
    container.innerHTML = formattedContentRef.current?.innerHTML || '';
    
    // 调用处理函数
    processBlockquotes(container);
    processMathFormulas(container);
    processMermaidDiagrams(container, false); // 明确指定不是为剪贴板准备的
    
    return container.outerHTML;
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
        
        // 更新复制成功状态
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } else {
        // 标准复制方式 - 先确保Mermaid图表已渲染
        const ensureMermaidRendered = () => {
          // 检查是否有未渲染的Mermaid图表
          const mermaidElements = formattedContentRef.current?.querySelectorAll('.mermaid');
          const unrenderedMermaidExists = Array.from(mermaidElements || []).some(
            el => !el.querySelector('svg')
          );
          
          if (unrenderedMermaidExists && typeof mermaid !== 'undefined') {
            console.log('发现未渲染的Mermaid图表，尝试渲染');
            try {
              // 初始化mermaid配置
              mermaid.initialize({
                startOnLoad: false,
                theme: bitableTheme === ThemeModeType.Dark ? 'dark' : 'default',
                securityLevel: 'loose',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                flowchart: { htmlLabels: true, curve: 'basis' },
                sequence: { useMaxWidth: false, wrap: true },
                gantt: { useMaxWidth: false }
              });
              
              // 选择性地只渲染未渲染的图表
              Array.from(mermaidElements || []).forEach(el => {
                if (!el.querySelector('svg')) {
                  console.log('渲染未完成的Mermaid图表:', el.textContent);
                  try {
                    mermaid.init(undefined, el as HTMLElement);
                  } catch (e) {
                    console.error('Mermaid单个图表渲染失败:', e);
                  }
                }
              });
              
              // 延迟一点时间确保渲染完成后再复制
              setTimeout(() => performCopy(), 500);
            } catch (err) {
              console.error('Mermaid渲染失败，继续复制:', err);
              performCopy();
            }
          } else {
            // 没有未渲染的图表，直接复制
            performCopy();
          }
        };
        
        // 执行实际的复制操作，确保不影响原始DOM
        const performCopy = () => {
          if (formattedContentRef.current) {
            try {
              // 创建一个新的根临时容器
              const tempRoot = document.createElement('div');
              tempRoot.style.position = 'fixed';
              tempRoot.style.left = '-9999px';
              tempRoot.style.top = '0';
              tempRoot.style.width = '1000px'; // 设置足够宽度
              tempRoot.style.height = 'auto';
              tempRoot.style.visibility = 'hidden';
              tempRoot.className = 'temp-copy-container';
              document.body.appendChild(tempRoot);
              
              // 创建一个新的内容容器添加到根临时容器中
              const tempDiv = document.createElement('div');
              tempDiv.className = formattedContentRef.current.className + ' for-clipboard-temp';
              tempRoot.appendChild(tempDiv);
              
              // 深度克隆DOM节点的内容，不使用cloneNode以避免可能的引用问题
              tempDiv.innerHTML = formattedContentRef.current.innerHTML;
              
              // 获取克隆后的所有SVG元素，对它们进行特殊处理
              const svgElements = tempDiv.querySelectorAll('svg');
              svgElements.forEach(svg => {
                try {
                  // 确保SVG有正确的尺寸和样式
                  svg.setAttribute('width', svg.getAttribute('width') || '100%');
                  svg.setAttribute('height', svg.getAttribute('height') || 'auto');
                  // 安全地设置style属性
                  const svgStyle = (svg as unknown as SVGElement).style;
                  svgStyle.maxWidth = '100%';
                  svgStyle.height = 'auto';
                  svgStyle.display = 'inline-block';
                  svgStyle.overflow = 'visible';
                  
                  // 标记此SVG为剪贴板临时使用
                  svg.classList.add('for-clipboard-svg');
                } catch (e) {
                  console.error('处理临时SVG失败:', e);
                }
              });
              
              // 特别处理Mermaid容器内的SVG
              const mermaidContainers = tempDiv.querySelectorAll('.mermaid-wrapper, .mermaid-container');
              mermaidContainers.forEach(container => {
                const svg = container.querySelector('svg');
                if (svg) {
                  try {
                    // 确保SVG有正确的尺寸和样式
                    svg.setAttribute('width', svg.getAttribute('width') || '100%');
                    svg.setAttribute('height', svg.getAttribute('height') || 'auto');
                    // 安全地设置style属性
                    const svgStyle = (svg as unknown as SVGElement).style;
                    svgStyle.maxWidth = '100%';
                    svgStyle.height = 'auto';
                    svgStyle.display = 'inline-block';
                    svgStyle.overflow = 'visible';
                    
                    // 标记此SVG为剪贴板临时使用
                    svg.classList.add('clipboard-svg-ready');
                  } catch (e) {
                    console.error('处理Mermaid SVG失败:', e);
                  }
                }
              });
              
              // 使用更可靠的复制方法
              const range = document.createRange();
              range.selectNodeContents(tempDiv);
              const selection = window.getSelection();
              if (selection) {
                selection.removeAllRanges();
                selection.addRange(range);
                document.execCommand('copy');
                selection.removeAllRanges();
              }
              
              // 清除所有临时元素
              document.body.removeChild(tempRoot);
            } catch (err) {
              console.error('DOM复制失败:', err);
              // 备用方法：直接使用innerHTML到一个全新的临时div
              try {
                const backupDiv = document.createElement('div');
                // 直接复制HTML内容而不是引用DOM节点
                backupDiv.innerHTML = formattedContentRef.current.innerHTML;
                backupDiv.style.position = 'fixed';
                backupDiv.style.left = '-9999px';
                backupDiv.style.top = '0';
                backupDiv.style.opacity = '0';
                document.body.appendChild(backupDiv);
                
                // 使用基本的复制方法
                const range = document.createRange();
                range.selectNodeContents(backupDiv);
                const selection = window.getSelection();
                if (selection) {
                  selection.removeAllRanges();
                  selection.addRange(range);
                  document.execCommand('copy');
                  selection.removeAllRanges();
                }
                
                document.body.removeChild(backupDiv);
              } catch (finalError) {
                console.error('备用复制方法也失败:', finalError);
                // 最后的备用方法：仅复制文本内容
                const textBackup = document.createElement('textarea');
                textBackup.value = formattedContentRef.current.textContent || '';
                textBackup.style.position = 'fixed';
                textBackup.style.left = '-9999px';
                textBackup.style.top = '0';
                document.body.appendChild(textBackup);
                textBackup.select();
                document.execCommand('copy');
                document.body.removeChild(textBackup);
              }
            }
          }
          
          // 更新复制成功状态
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        };
        
        // 开始处理流程
        ensureMermaidRendered();
      }
    } catch (err) {
      console.error('复制失败:', err);
      setError('复制失败，请重试');
    }
  };

  // 处理复制按钮点击事件
  const handleCopyClick = () => {
    // 确保在复制前Mermaid图表已完全渲染
    if (!isRawMode) {
      // 先初始化mermaid以确保图表被渲染
      const initAndRenderMermaid = () => {
        try {
          if (typeof mermaid !== 'undefined') {
            console.log('初始化Mermaid准备复制，主题:', bitableTheme);
            
            // 重置mermaid以避免多次初始化冲突
            if (typeof mermaid.mermaidAPI !== 'undefined') {
              try {
                mermaid.mermaidAPI.reset();
              } catch (e) {
                console.warn('Mermaid重置失败:', e);
              }
            }
            
            // 初始化mermaid
            mermaid.initialize({
              startOnLoad: false,
              theme: bitableTheme === ThemeModeType.Dark ? 'dark' : 'default',
              securityLevel: 'loose',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
              flowchart: { htmlLabels: true, curve: 'basis' },
              sequence: { useMaxWidth: false, wrap: true },
              gantt: { useMaxWidth: false }
            });
            
            // 获取所有mermaid元素
            const mermaidDivs = document.querySelectorAll('.mermaid');
            // 找出未渲染的图表
            const unrenderedMermaidDivs = Array.from(mermaidDivs).filter(div => !div.querySelector('svg'));
            
            if (unrenderedMermaidDivs.length > 0) {
              console.log('需要渲染的Mermaid图表数量:', unrenderedMermaidDivs.length);
              
              // 逐个处理未渲染的图表
              unrenderedMermaidDivs.forEach(div => {
                try {
                  console.log('准备复制时渲染Mermaid图表:', div.textContent);
                  mermaid.init(undefined, div as HTMLElement);
                } catch (e) {
                  console.error('Mermaid渲染失败:', e);
                }
              });
              
              // 给渲染一些时间后再复制
              setTimeout(() => {
                // 再次检查是否所有图表都已渲染
                const stillUnrenderedDivs = Array.from(document.querySelectorAll('.mermaid')).filter(div => !div.querySelector('svg'));
                if (stillUnrenderedDivs.length > 0) {
                  console.log('仍有未渲染完成的图表，再次尝试渲染:', stillUnrenderedDivs.length);
                  stillUnrenderedDivs.forEach(div => {
                    try {
                      mermaid.init(undefined, div as HTMLElement);
                    } catch (e) {
                      console.error('Mermaid二次渲染失败:', e);
                    }
                  });
                }
                
                // 直接调用复制函数，无需在此处理理DOM元素的样式
                copyToClipboard();
              }, 500);
            } else {
              // 没有需要渲染的图表，直接复制
              copyToClipboard();
            }
          } else {
            // mermaid不可用，直接复制
            copyToClipboard();
          }
        } catch (err) {
          console.error('Mermaid初始化失败:', err);
          // 即使失败也尝试复制
          copyToClipboard();
        }
      };
      
      // 执行初始化和渲染流程
      initAndRenderMermaid();
    } else {
      // 原始模式直接复制
      copyToClipboard();
    }
  };

  // 初始化插件
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
          const processedValue = processCellValue(cellValue);
          // 只有当获取到的内容不为空时，才更新content
          if (processedValue.trim()) {
            setContent(processedValue);
            
            // 给Markdown渲染一些时间，然后初始化Mermaid图表
            setTimeout(() => {
              initMermaid();
            }, 800); // 给足够时间渲染Markdown
          }
        }

        bitable.base.onSelectionChange(async (event) => {
          console.log('选择发生变化:', event);
          setLoading(true);
          try {
            const newSelection = await bitable.base.getSelection();
            const { tableId, recordId, fieldId } = newSelection;
            if (!tableId || !recordId || !fieldId) {
              // 如果没有选择单元格，不更改内容，保持测试内容
              setLoading(false);
          return;
        }
        
            const table = await bitable.base.getTableById(tableId);
            const cellValue = await table.getCellValue(fieldId, recordId);

            console.log('获取到单元格内容:', cellValue);
            const processedValue = processCellValue(cellValue);
            // 只有当获取到的内容不为空时，才更新content
            if (processedValue.trim()) {
              setContent(processedValue);
            }
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

  // 初始化主题
  useEffect(() => {
    const initTheme = async () => {
      try {
        // 获取当前主题
        if (bitable && bitable.base) {
          // 使用类型断言
          const base = bitable.base as any;
          const currentTheme = await base.getTheme();
          setBitableTheme(currentTheme as ThemeModeType);
          
          // 监听主题变化
          base.onThemeChange((theme: string) => {
            setBitableTheme(theme as ThemeModeType);
          });
        }
      } catch (error) {
        console.error('获取主题失败:', error);
      }
    };
    
    initTheme();
  }, [bitable]);

  // Mermaid图表初始化函数
  const initMermaid = () => {
    try {
      // 获取所有Mermaid容器
      const mermaidDivs = document.querySelectorAll('.mermaid');
      if (mermaidDivs.length > 0) {
        console.log('初始化Mermaid图表，数量:', mermaidDivs.length);
        
        // 初始化配置
        if (typeof mermaid !== 'undefined' && typeof mermaid.mermaidAPI !== 'undefined') {
          try {
            mermaid.mermaidAPI.reset();
          } catch (e) {
            console.warn('Mermaid重置失败:', e);
          }
          
          mermaid.initialize({
            startOnLoad: false,
            theme: bitableTheme === ThemeModeType.Dark ? 'dark' : 'default',
            securityLevel: 'loose',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
            flowchart: { htmlLabels: true, curve: 'basis' },
            sequence: { useMaxWidth: false, wrap: true },
            gantt: { useMaxWidth: false }
          });
          
          // 处理每个Mermaid容器
          mermaidDivs.forEach(div => {
            try {
              // 确保容器可见性
              (div as HTMLElement).style.visibility = 'visible';
              (div as HTMLElement).style.display = 'block';
              (div as HTMLElement).style.overflow = 'visible';
              
              // 获取父容器并设置样式
              const parent = div.parentElement;
              if (parent) {
                parent.style.overflow = 'visible';
                parent.style.textAlign = 'center';
              }
            } catch (err) {
              console.error('设置Mermaid容器样式失败:', err);
            }
          });
          
          // 初始化所有图表
          setTimeout(() => {
            try {
              mermaid.init(undefined, '.mermaid');
            } catch (err) {
              console.error('Mermaid初始化失败:', err);
              
              // 尝试逐个初始化
              mermaidDivs.forEach((div, index) => {
                try {
                  mermaid.init(undefined, div as HTMLElement);
                } catch (e) {
                  console.error(`Mermaid图表 #${index} 初始化失败:`, e);
                }
              });
            }
          }, 100);
        } else {
          console.error('无法访问mermaid对象，可能未正确加载');
        }
      }
    } catch (error) {
      console.error('初始化Mermaid失败:', error);
    }
  };
  
  // 监听原始内容更新
  useEffect(() => {
    if (content.trim() && !isRawMode) {
      // 当内容更新且不是原始模式时，给一点时间让Markdown渲染，然后初始化Mermaid图表
      const timer = setTimeout(() => {
        initMermaid();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [content, isRawMode]);

  // 监听原始/渲染模式切换
  useEffect(() => {
    if (!isRawMode && content.trim()) {
      // 当从原始模式切换到渲染模式时，初始化Mermaid图表
      const timer = setTimeout(() => {
        initMermaid();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isRawMode]);

  return (
    <div 
      className="markdown-content-container for-clipboard"
      style={{ 
        padding: '16px',
        height: '100vh',
        overflow: 'auto',
        ...themes[currentTheme].containerStyle,
        transition: 'all 0.3s ease'
      }}
    >
      {/* 添加全局样式 */}
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      
      <div style={{
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        borderBottom: currentTheme === 'notionStyle' ? '1px solid #e3e2e0' : '1px solid #d0d7de',
        paddingBottom: '12px'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsRawMode(!isRawMode)}
            style={{
              padding: '6px 12px',
              backgroundColor: isRawMode ? 
                (currentTheme === 'notionStyle' ? '#f7f6f3' : '#f6f8fa') : 
                (currentTheme === 'notionStyle' ? '#2eaadc' : '#2da44e'),
              color: isRawMode ? 
                (currentTheme === 'notionStyle' ? '#37352f' : '#24292e') : 
                '#ffffff',
              border: isRawMode ? 
                (currentTheme === 'notionStyle' ? '1px solid #e3e2e0' : '1px solid #d0d7de') : 
                (currentTheme === 'notionStyle' ? '1px solid #2eaadc' : 'none'),
              borderRadius: currentTheme === 'notionStyle' ? '3px' : '3px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontWeight: currentTheme === 'notionStyle' ? 400 : 500,
              fontSize: '14px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
              boxShadow: currentTheme === 'notionStyle' ? (isRawMode ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.1)') : 'none'
            }}
          >
            {isRawMode ? '显示排版效果' : '显示原始内容'}
          </button>
          
          <button
            onClick={handleCopyClick}
            style={{
              padding: '6px 12px',
              backgroundColor: copySuccess ? 
                (currentTheme === 'notionStyle' ? '#2eaadc' : '#2da44e') : 
                (currentTheme === 'notionStyle' ? '#f7f6f3' : '#f6f8fa'),
              color: copySuccess ? 
                '#ffffff' : 
                (currentTheme === 'notionStyle' ? '#37352f' : '#24292e'),
              border: copySuccess ? 
                (currentTheme === 'notionStyle' ? '1px solid #2eaadc' : 'none') : 
                (currentTheme === 'notionStyle' ? '1px solid #e3e2e0' : '1px solid #d0d7de'),
              borderRadius: '3px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontWeight: currentTheme === 'notionStyle' ? 400 : 500,
              fontSize: '14px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
              boxShadow: currentTheme === 'notionStyle' ? (copySuccess ? '0 1px 2px rgba(0, 0, 0, 0.1)' : 'none') : 'none'
            }}
          >
            {copySuccess ? '已复制' : '复制内容'}
          </button>
        </div>
        <select
          value={currentTheme}
          onChange={(e) => setCurrentTheme(e.target.value as keyof typeof themes)}
          style={{
            padding: '6px 12px',
            borderRadius: '3px',
            border: currentTheme === 'notionStyle' ? '1px solid #e3e2e0' : '1px solid #d0d7de',
            cursor: 'pointer',
            backgroundColor: currentTheme === 'notionStyle' ? '#f7f6f3' : '#f6f8fa',
            color: currentTheme === 'notionStyle' ? '#37352f' : '#24292e',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
            fontSize: '14px'
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
          color: currentTheme === 'notionStyle' ? '#9b9a97' : '#6a737d',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
        }}>加载中...</div>
      )}
      {error && (
        <div style={{ 
          marginBottom: '16px', 
          color: currentTheme === 'notionStyle' ? '#eb5757' : '#cf222e',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
        }}>{error}</div>
      )}
      {!loading && content && (
        <div style={{ 
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: currentTheme === 'notionStyle' ? '1px solid #e3e2e0' : '1px solid #d0d7de',
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          {isRawMode ? (
            <pre
              className={`raw-markdown-renderer ${currentTheme === 'notionStyle' ? 'notion-raw' : ''}`}
              style={{
                margin: 0,
                backgroundColor: currentTheme === 'notionStyle' ? '#f7f6f3' : '#ffffff',
                padding: '16px',
                transition: 'all 0.3s ease',
                overflow: 'auto',
                color: currentTheme === 'notionStyle' ? '#37352f' : '#24292e',
                fontFamily: currentTheme === 'notionStyle' ? 
                  'SFMono-Regular, Monaco, Menlo, Consolas, "Liberation Mono", "Courier New", monospace' : 
                  '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
                fontSize: currentTheme === 'notionStyle' ? '15px' : '14px',
                lineHeight: currentTheme === 'notionStyle' ? '1.7' : '1.6',
                borderRadius: currentTheme === 'notionStyle' ? '3px' : '0',
                border: currentTheme === 'notionStyle' ? '1px solid #e3e2e0' : 'none'
              }}
            >
              {content}
            </pre>
          ) : (
            <div 
              ref={formattedContentRef}
              style={{
                backgroundColor: currentTheme === 'notionStyle' ? '#ffffff' : '#ffffff',
                padding: '16px',
                transition: 'all 0.3s ease',
                overflow: 'auto'
              }}
            >
              <MarkdownRenderer 
                content={content} 
                theme={currentTheme} 
                darkMode={bitableTheme === ThemeModeType.Dark}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App; 