import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// 导入飞书多维表格扩展和环境检测
// import { isInBitableEnvironment } from './utils/bitable';
import './styles/tailwind.css';  // 导入 Tailwind 基础样式

const init = async () => {
  try {
    // const isInBitable = await isInBitableEnvironment();
    
    const root = ReactDOM.createRoot(
      document.getElementById('root') as HTMLElement
    );
    
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    // 静默处理错误
  }
};

init(); 