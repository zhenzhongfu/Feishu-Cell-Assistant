// Markdown主题定义
export type ThemeStyle = 'github' | 'notion';

// CSS变量定义接口
interface ThemeVariables {
  // 标题样式
  headingColor: string;
  headingBorderColor: string;
  
  // 文本和链接样式
  textColor: string;
  linkColor: string;
  linkHoverColor: string;
  
  // 代码块样式
  codeBg: string;
  codeBorder: string;
  codeText: string;
  inlineCodeBg: string;
  inlineCodeText: string;
  
  // 引用块样式
  blockquoteBg: string;
  blockquoteBorder: string;
  blockquoteText: string;
  
  // 表格样式
  tableBorder: string;
  tableHeaderBg: string;
  tableOddRowBg: string;
  tableEvenRowBg: string;
  
  // 提示框样式
  noteBorder: string;
  noteBg: string;
  tipBorder: string;
  tipBg: string;
  importantBorder: string;
  importantBg: string;
  warningBorder: string;
  warningBg: string;
  cautionBorder: string;
  cautionBg: string;

  // 编辑区和预览区背景颜色
  editorBg: string;
  previewBg: string;
}

// 主题定义 - 移除dark主题部分
const githubTheme: ThemeVariables = {
  // 标题样式
  headingColor: '#0f1417',
  headingBorderColor: '#bdc4cc',
  
  // 文本和链接样式
  textColor: '#1a1f24',
  linkColor: '#0366d6',
  linkHoverColor: '#0246a2',
  
  // 代码块样式
  codeBg: '#f0f4f8',
  codeBorder: '#bdc4cc',
  codeText: '#1a1f24',
  inlineCodeBg: '#f0f4f8',
  inlineCodeText: '#d73a49',
  
  // 引用块样式
  blockquoteBg: '#f0f4f8',
  blockquoteBorder: '#bdc4cc',
  blockquoteText: '#3a434e',
  
  // 表格样式
  tableBorder: '#bdc4cc',
  tableHeaderBg: '#e7ecf2',
  tableOddRowBg: '#ffffff',
  tableEvenRowBg: '#f6f8fa',
  
  // 提示框样式
  noteBorder: '#0366d6',
  noteBg: '#dbedff',
  tipBorder: '#2da44e',
  tipBg: '#dafbe1',
  importantBorder: '#9a6700',
  importantBg: '#fff8c5',
  warningBorder: '#bd5f00',
  warningBg: '#fff1e5',
  cautionBorder: '#cf222e',
  cautionBg: '#ffebe9',

  // 编辑区和预览区背景颜色
  editorBg: '#ffffff',
  previewBg: '#ffffff'
};

// Notion主题
const notionTheme: ThemeVariables = {
  // 标题样式
  headingColor: '#121212',
  headingBorderColor: '#d9d8d4',
  
  // 文本和链接样式
  textColor: '#1f1f1f', 
  linkColor: '#0b76b8',
  linkHoverColor: '#085d92',
  
  // 代码块样式
  codeBg: '#f5f4f0',
  codeBorder: '#d9d8d4',
  codeText: '#1f1f1f',
  inlineCodeBg: '#ebeae6',
  inlineCodeText: '#ca3323',
  
  // 引用块样式
  blockquoteBg: '#f5f4f0',
  blockquoteBorder: '#d9d8d4',
  blockquoteText: '#4f4e49',
  
  // 表格样式
  tableBorder: '#d9d8d4',
  tableHeaderBg: '#f0efe9',
  tableOddRowBg: '#ffffff',
  tableEvenRowBg: '#fafaf8',
  
  // 提示框样式
  noteBorder: '#0b76b8',
  noteBg: '#e8f3fa',
  tipBorder: '#158342',
  tipBg: '#e2f5ec',
  importantBorder: '#ad7c14',
  importantBg: '#fcf6de',
  warningBorder: '#ad5700',
  warningBg: '#fdf1e3',
  cautionBorder: '#c22f39',
  cautionBg: '#fcecec',

  // 编辑区和预览区背景颜色
  editorBg: '#fffff7',
  previewBg: '#ffffff'
};

// 主题集合
export const markdownThemes: Record<ThemeStyle, ThemeVariables> = {
  github: githubTheme,
  notion: notionTheme
};

// 生成CSS类 - 移除isDarkMode参数
export const generateThemeStyles = (theme: ThemeStyle): React.CSSProperties => {
  const variables = markdownThemes[theme];
  
  return {
    // 标题样式
    '--heading-color': variables.headingColor,
    '--heading-border-color': variables.headingBorderColor,
    
    // 文本和链接样式
    '--text-color': variables.textColor,
    '--link-color': variables.linkColor,
    '--link-hover-color': variables.linkHoverColor,
    
    // 代码块样式
    '--code-bg': variables.codeBg,
    '--code-border': variables.codeBorder,
    '--code-text': variables.codeText,
    '--inline-code-bg': variables.inlineCodeBg,
    '--inline-code-text': variables.inlineCodeText,
    
    // 引用块样式
    '--blockquote-bg': variables.blockquoteBg,
    '--blockquote-border': variables.blockquoteBorder,
    '--blockquote-text': variables.blockquoteText,
    
    // 表格样式
    '--table-border': variables.tableBorder,
    '--table-header-bg': variables.tableHeaderBg,
    '--table-odd-row-bg': variables.tableOddRowBg,
    '--table-even-row-bg': variables.tableEvenRowBg,
    
    // 提示框样式
    '--note-border': variables.noteBorder,
    '--note-bg': variables.noteBg,
    '--tip-border': variables.tipBorder,
    '--tip-bg': variables.tipBg,
    '--important-border': variables.importantBorder,
    '--important-bg': variables.importantBg,
    '--warning-border': variables.warningBorder,
    '--warning-bg': variables.warningBg,
    '--caution-border': variables.cautionBorder,
    '--caution-bg': variables.cautionBg,

    // 编辑区和预览区背景颜色
    '--editor-bg': variables.editorBg,
    '--preview-bg': variables.previewBg,
  } as React.CSSProperties;
}; 