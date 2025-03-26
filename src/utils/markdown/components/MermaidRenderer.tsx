import React, { useEffect, useState, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidRendererProps {
  code: string;
  className?: string;
  onError?: (error: string) => void;
}

const MermaidRenderer: React.FC<MermaidRendererProps> = ({
  code,
  className = '',
  onError
}) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!code || !mounted.current) return;

      try {
        // 清理HTML实体
        const cleanCode = code
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .trim();

        // 初始化 mermaid 配置
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
          fontSize: 14,
          flowchart: {
            htmlLabels: true,
            curve: 'basis',
            useMaxWidth: true,
            padding: 8,
            nodeSpacing: 50,
            rankSpacing: 50
          },
          sequence: {
            useMaxWidth: true,
            width: 150,
            height: 65,
            boxMargin: 10,
            mirrorActors: false,
            bottomMarginAdj: 1,
            messageMargin: 35
          },
          gantt: {
            useMaxWidth: true,
            topPadding: 50,
            leftPadding: 75,
            gridLineStartPadding: 35,
            barHeight: 20,
            barGap: 4,
            topAxis: true
          }
        });

        // 生成唯一的图表ID
        const id = `mermaid-${Math.random().toString(36).substring(2)}`;

        // 渲染图表
        const { svg: renderedSvg } = await mermaid.render(id, cleanCode);

        if (mounted.current) {
          setSvg(renderedSvg);
          setError(null);
        }
      } catch (err) {
        console.error('Mermaid 渲染错误:', err);
        const errorMessage = err instanceof Error ? err.message : '图表渲染失败';
        setError(errorMessage);
        if (onError) {
          onError(errorMessage);
        }
      }
    };

    renderDiagram();
  }, [code, onError]);

  useEffect(() => {
    if (!svg || !containerRef.current) return;

    const container = containerRef.current;
    const adjustSvgSize = () => {
      const svgElement = container.querySelector('svg');
      if (svgElement) {
        const containerWidth = container.clientWidth;
        const svgWidth = svgElement.viewBox.baseVal.width;
        const svgHeight = svgElement.viewBox.baseVal.height;
        
        // 设置最大宽度为容器宽度的90%
        const maxWidth = containerWidth * 0.9;
        
        // 如果 SVG 宽度小于最大宽度，保持原始大小
        if (svgWidth <= maxWidth) {
          svgElement.style.width = `${svgWidth}px`;
          svgElement.style.height = `${svgHeight}px`;
        } else {
          // 否则按比例缩放
          const scale = maxWidth / svgWidth;
          svgElement.style.width = `${maxWidth}px`;
          svgElement.style.height = `${svgHeight * scale}px`;
        }
        
        // 确保 SVG 居中显示
        svgElement.style.display = 'block';
        svgElement.style.margin = '0 auto';
      }
    };

    // 初始调整
    adjustSvgSize();
    
    // 监听窗口大小变化
    const resizeObserver = new ResizeObserver(adjustSvgSize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [svg]);

  if (error) {
    return (
      <div className={`p-4 text-center border border-red-200 rounded bg-red-50 text-red-600 ${className}`}>
        {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex justify-center overflow-visible my-4 ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default MermaidRenderer; 