import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// 导入飞书多维表格扩展和环境检测
import { initBitableExtension, isInBitableEnvironment } from './utils/bitable';
import './styles/tailwind.css';  // 导入 Tailwind 基础样式

try {
  console.log('应用初始化中...');
  
  // 环境信息
  const isInBitable = isInBitableEnvironment();
  console.log(`环境检测: ${isInBitable ? '飞书多维表格环境' : '普通Web环境'}`);
  
  // 获取根元素
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    throw new Error('找不到根元素，无法挂载应用');
  }
  
  // 初始化逻辑
  // 飞书多维表格环境 - 初始化扩展
  console.log('正在初始化多维表格扩展...');
  const success = initBitableExtension();
  if (success) {
    // rootElement.innerHTML = '<div class="bitable-extension-loaded">多维表格扩展已加载</div>';
    console.log('正在渲染React应用...');
    try {
      const root = ReactDOM.createRoot(rootElement);
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
      console.log('React应用渲染成功');
    } catch (renderError) {
      console.error('React应用渲染失败:', renderError);
      rootElement.innerHTML = `
        <div class="render-error">
          <h2>应用渲染失败</h2>
          <p>发生了一个错误，应用无法正常加载。</p>
          <button onclick="window.location.reload()">重新加载</button>
        </div>
      `;
    }
    console.log('多维表格扩展初始化成功');
  } else {
    rootElement.innerHTML = '<div class="bitable-extension-error">多维表格扩展加载失败</div>';
    console.error('多维表格扩展初始化失败');
  }
} catch (error) {
  console.error('应用初始化失败:', error);
  
  // 尝试显示错误信息
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div class="init-error">
        <h2>应用初始化失败</h2>
        <p>发生了一个错误，应用无法启动。</p>
        <pre class="error-details">${error}</pre>
        <button onclick="window.location.reload()">重新加载</button>
      </div>
    `;
  }
} 