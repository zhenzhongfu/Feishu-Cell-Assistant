import React, { useEffect, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { fixCommonMathErrors } from '../formatters/mathFormatters';

interface MathRendererProps {
  formula: string;
  display?: boolean;
  className?: string;
  errorColor?: string;
  onError?: (error: Error) => void;
}

/**
 * 数学公式渲染组件
 * 使用KaTeX渲染TeX数学公式
 */
const MathRenderer: React.FC<MathRendererProps> = ({
  formula,
  display = false,
  className = '',
  errorColor = '#cc0000',
  onError
}) => {
  const [html, setHtml] = useState<string>('');
  
  useEffect(() => {
    if (!formula) {
      setHtml('');
      return;
    }
    
    try {
      // 修复常见的数学公式错误
      let fixedFormula = fixCommonMathErrors(formula);
      
      // 处理 aligned 环境
      if (fixedFormula.includes('\\begin{aligned}')) {
        fixedFormula = `\\begin{aligned} ${fixedFormula.replace(/\\begin{aligned}|\\end{aligned}/g, '')} \\end{aligned}`;
      }
      
      // 使用KaTeX渲染公式
      const renderedHTML = katex.renderToString(fixedFormula, {
        displayMode: display,
        throwOnError: false,
        errorColor,
        trust: true,
        strict: false,
        macros: {
          '\\aligned': '\\begin{aligned}',
          '\\endaligned': '\\end{aligned}'
        },
        output: 'html'
      });
      
      setHtml(renderedHTML);
    } catch (err) {
      console.error('数学公式渲染错误:', err);
      
      if (onError) {
        onError(err as Error);
      }
      
      // 即使有错误，也尝试渲染
      try {
        // 尝试添加 \displaystyle
        const fallbackFormula = display ? `\\displaystyle ${formula}` : formula;
        const fallbackHTML = katex.renderToString(fallbackFormula, {
          displayMode: display,
          throwOnError: false,
          errorColor,
          strict: false,
          macros: {
            '\\aligned': '\\begin{aligned}',
            '\\endaligned': '\\end{aligned}'
          }
        });
        setHtml(fallbackHTML);
      } catch {
        setHtml(`<span class="text-red-600 font-medium">公式渲染错误: ${(err as Error).message}</span>`);
      }
    }
  }, [formula, display, errorColor, onError]);
  
  if (!formula) {
    return null;
  }
  
  return (
    <span
      className={`${
        display 
          ? 'block my-4 text-center' 
          : 'inline-block align-middle'
      } overflow-x-auto overflow-y-hidden max-w-full scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default MathRenderer; 