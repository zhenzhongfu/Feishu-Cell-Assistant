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
  headingColor: '#24292f',
  headingBorderColor: '#d0d7de',
  
  // 文本和链接样式
  textColor: '#24292f',
  linkColor: '#0969da',
  linkHoverColor: '#0550AE',
  
  // 代码块样式
  codeBg: '#f6f8fa',
  codeBorder: '#d0d7de',
  codeText: '#24292f',
  inlineCodeBg: '#f6f8fa',
  inlineCodeText: '#24292f',
  
  // 引用块样式
  blockquoteBg: '#f6f8fa',
  blockquoteBorder: '#d0d7de',
  blockquoteText: '#57606a',
  
  // 表格样式
  tableBorder: '#d0d7de',
  tableHeaderBg: '#f6f8fa',
  tableOddRowBg: '#ffffff',
  tableEvenRowBg: '#f6f8fa',
  
  // 提示框样式
  noteBorder: '#0969da',
  noteBg: '#ddf4ff',
  tipBorder: '#1a7f37',
  tipBg: '#dafbe1',
  importantBorder: '#9a6700',
  importantBg: '#fff8c5',
  warningBorder: '#bd5f00',
  warningBg: '#fff1e5',
  cautionBorder: '#d1242f',
  cautionBg: '#ffebe9',

  // 编辑区和预览区背景颜色
  editorBg: '#ffffff',
  previewBg: '#ffffff'
};

// Notion主题
const notionTheme: ThemeVariables = {
  // 标题样式
  headingColor: '#37352f',
  headingBorderColor: '#e3e2e0',
  
  // 文本和链接样式
  textColor: '#37352f',
  linkColor: '#2eaadc',
  linkHoverColor: '#0b85a1',
  
  // 代码块样式
  codeBg: '#f7f6f3',
  codeBorder: '#e3e2e0',
  codeText: '#37352f',
  inlineCodeBg: '#f0f0f0',
  inlineCodeText: '#37352f',
  
  // 引用块样式
  blockquoteBg: '#f7f6f3',
  blockquoteBorder: '#e3e2e0',
  blockquoteText: '#6b6a67',
  
  // 表格样式
  tableBorder: '#e3e2e0',
  tableHeaderBg: '#f7f6f3',
  tableOddRowBg: '#ffffff',
  tableEvenRowBg: '#f7f6f3',
  
  // 提示框样式
  noteBorder: '#2eaadc',
  noteBg: '#f0faff',
  tipBorder: '#0f9d58',
  tipBg: '#e6f9ef',
  importantBorder: '#f5b400',
  importantBg: '#fff9e8',
  warningBorder: '#f5a623',
  warningBg: '#fff4e6',
  cautionBorder: '#eb5757',
  cautionBg: '#fdebeb',

  // 编辑区和预览区背景颜色
  editorBg: '#f9f5d7',  // 更深更温暖的奶油色背景
  previewBg: '#ffffff'  // Notion预览区白色背景
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