/**
 * 表格处理工具函数
 */

/**
 * 规范化表格格式
 * 确保表格的每行有相同数量的单元格，并美化表格对齐
 * @param markdown Markdown文本
 * @returns 处理后的Markdown文本
 */
export const normalizeMarkdownTables = (markdown: string): string => {
  if (typeof markdown !== 'string') {
    console.warn('normalizeMarkdownTables: 输入不是字符串类型');
    return String(markdown || '');
  }

  try {
    // 正则表达式匹配整个表格
    const tableRegex = /^(\|.+\|\r?\n)((?:\|:?[-]+:?)+\|\r?\n)((?:\|.+\|\r?\n?)+)/gm;
    
    // 替换每个匹配的表格
    return markdown.replace(tableRegex, (tableMatch) => {
      // 分割表格为行
      const lines = tableMatch.split(/\r?\n/);
      if (lines.length < 3) return tableMatch; // 不是有效的表格
      
      // 分析表头行，确定列数
      const headerRow = lines[0];
      const headerCells = parseMdTableRow(headerRow);
      const numColumns = headerCells.length;
      
      // 分析分隔行
      const separatorRow = lines[1];
      let alignments = parseMdTableSeparator(separatorRow, numColumns);
      
      // 处理每一行
      const formattedLines = lines.map((line, index) => {
        // 跳过空行
        if (!line.trim()) return '';
        
        // 第一行是表头
        if (index === 0) {
          return formatMdTableRow(headerCells, alignments);
        }
        // 第二行是分隔符
        else if (index === 1) {
          return formatMdTableSeparator(alignments);
        }
        // 数据行
        else {
          const cells = parseMdTableRow(line);
          // 如果单元格数量不匹配，调整为正确的列数
          while (cells.length < numColumns) cells.push('');
          if (cells.length > numColumns) cells.splice(numColumns);
          
          return formatMdTableRow(cells, alignments);
        }
      }).filter(Boolean); // 移除空行
      
      return formattedLines.join('\n') + '\n';
    });
  } catch (error) {
    console.error('规范化表格格式时出错:', error);
    return markdown;
  }
};

/**
 * 解析表格行，返回单元格内容数组
 * @param row 表格行文本
 * @returns 单元格内容数组
 */
const parseMdTableRow = (row: string): string[] => {
  if (!row.includes('|')) return [];
  
  // 移除行首行尾的 |，然后按 | 分割
  const rowContent = row.trim();
  const stripped = rowContent.startsWith('|') ? rowContent.slice(1) : rowContent;
  const endStripped = stripped.endsWith('|') ? stripped.slice(0, -1) : stripped;
  
  // 分割为单元格并修剪空白
  return endStripped.split('|').map(cell => cell.trim());
};

/**
 * 解析表格分隔行，确定每列的对齐方式
 * @param separator 分隔行文本
 * @param numColumns 列数
 * @returns 每列的对齐方式数组 ('left', 'center', 'right')
 */
const parseMdTableSeparator = (separator: string, numColumns: number): string[] => {
  const cells = parseMdTableRow(separator);
  const alignments: string[] = [];
  
  // 为每列确定对齐方式
  for (let i = 0; i < numColumns; i++) {
    const cell = cells[i] || '---';
    
    if (cell.startsWith(':') && cell.endsWith(':')) {
      alignments.push('center');
    } else if (cell.endsWith(':')) {
      alignments.push('right');
    } else {
      alignments.push('left');
    }
  }
  
  return alignments;
};

/**
 * 格式化表格行
 * @param cells 单元格内容数组
 * @param alignments 对齐方式数组
 * @returns 格式化的表格行
 */
const formatMdTableRow = (cells: string[], alignments: string[]): string => {
  const formattedCells = cells.map((cell, index) => {
    const alignment = alignments[index] || 'left';
    
    // 根据对齐方式添加适当的空格
    switch (alignment) {
      case 'center':
        return ` ${cell} `;
      case 'right':
        return ` ${cell} `;
      case 'left':
      default:
        return ` ${cell} `;
    }
  });
  
  return `|${formattedCells.join('|')}|`;
};

/**
 * 格式化表格分隔行
 * @param alignments 对齐方式数组
 * @returns 格式化的分隔行
 */
const formatMdTableSeparator = (alignments: string[]): string => {
  const separators = alignments.map(alignment => {
    switch (alignment) {
      case 'center':
        return ':---:';
      case 'right':
        return '---:';
      case 'left':
      default:
        return '---';
    }
  });
  
  return `|${separators.map(sep => ` ${sep} `).join('|')}|`;
};

/**
 * 判断一行文本是否可能是表格的开始
 * @param line 要检查的文本行
 * @returns 是否可能是表格的开始
 */
export const isPotentialTableRow = (line: string): boolean => {
  if (!line || typeof line !== 'string') return false;
  
  // 表格行通常以|开头，包含至少一个|，并以|结尾
  const trimmed = line.trim();
  return trimmed.startsWith('|') && 
         trimmed.endsWith('|') && 
         trimmed.indexOf('|', 1) !== -1;
};

/**
 * 表格格式化工具函数
 */

/**
 * 规范化表格格式
 * - 确保表格前后有空行
 * - 规范化表格对齐标记
 * - 规范化单元格内容格式
 * @param markdown Markdown文本
 * @returns 处理后的Markdown文本
 */
export const normalizeTables = (markdown: string): string => {
  if (typeof markdown !== 'string') {
    return String(markdown || '');
  }

  try {
    let result = markdown;
    
    // 匹配完整的表格（包括表头和分隔行）
    const tableRegex = /(?:^|\n)((?:\|[^|\n]*)+\|[ \t]*\n(?:\|[ :-]*)+\|[ \t]*\n(?:(?:\|[^|\n]*)+\|[ \t]*\n?)*)/g;
    
    result = result.replace(tableRegex, (table) => {
      // 分割表格行
      const rows = table.trim().split('\n');
      
      // 处理表头行
      const headerRow = rows[0];
      const headers = headerRow.split('|')
        .filter(cell => cell.trim() !== '')
        .map(cell => cell.trim());
      
      // 处理分隔行
      const alignmentRow = rows[1];
      const alignments = alignmentRow.split('|')
        .filter(cell => cell.trim() !== '')
        .map(cell => {
          const trimmed = cell.trim();
          if (trimmed.startsWith(':') && trimmed.endsWith(':')) return ':---:';
          if (trimmed.startsWith(':')) return ':---';
          if (trimmed.endsWith(':')) return '---:';
          return '---';
        });
      
      // 处理数据行
      const dataRows = rows.slice(2).map(row => {
        return row.split('|')
          .filter(cell => cell.trim() !== '')
          .map(cell => cell.trim());
      });
      
      // 计算每列的最大宽度
      const columnCount = Math.max(
        headers.length,
        ...dataRows.map(row => row.length)
      );
      
      // 构建规范化的表格
      const normalizedHeaders = headers
        .concat(Array(columnCount - headers.length).fill(''))
        .map(header => ` ${header} `);
      
      const normalizedAlignments = alignments
        .concat(Array(columnCount - alignments.length).fill('---'))
        .map(align => align);
      
      const normalizedDataRows = dataRows.map(row => {
        return row
          .concat(Array(columnCount - row.length).fill(''))
          .map(cell => ` ${cell} `);
      });
      
      // 组装表格
      const normalizedTable = [
        `|${normalizedHeaders.join('|')}|`,
        `|${normalizedAlignments.join('|')}|`,
        ...normalizedDataRows.map(row => `|${row.join('|')}|`)
      ].join('\n');
      
      // 确保表格前后有空行
      return `\n${normalizedTable}\n`;
    });
    
    // 确保表格前后有空行
    result = result.replace(/([^\n])\n\|/g, '$1\n\n|');
    result = result.replace(/\|\n([^\n])/g, '|\n\n$1');
    
    return result;
  } catch (error) {
    return markdown;
  }
}; 