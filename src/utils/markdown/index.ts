/**
 * Markdown 工具函数索引文件
 * 导出所有 Markdown 相关的工具函数和组件
 */

// 导出格式化器
export * from './formatters/codeFormatters';
export * from './formatters/listFormatters';
export * from './formatters/mathFormatters';
export * from './formatters/preprocessor';
export * from './formatters/tableFormatters';
export * from './formatters/textFormatters';

// 导出辅助工具
export * from './helpers/htmlHelpers';
export * from './helpers/imageHelpers';

// 导出组件
export * from './components';

// 导出所有组件以便直接使用
export { default as CodeBlock } from './components/CodeBlock';
export { default as ImageRenderer } from './components/ImageRenderer';
export { default as MathRenderer } from './components/MathRenderer';
export { default as MermaidRenderer } from './components/MermaidRenderer';

import { marked } from 'marked';
import { fixCommonMathErrors } from './formatters/mathFormatters';

export { marked, fixCommonMathErrors }; 