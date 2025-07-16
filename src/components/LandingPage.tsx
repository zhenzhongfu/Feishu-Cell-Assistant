import React from 'react';

// 页面组件
const Header: React.FC = () => (
  <header className="bg-gray-800 text-white py-4 px-6 md:px-12 flex justify-between items-center">
    <h1 className="text-xl font-bold">飞书Markdown助手</h1>
    <nav>
      <ul className="flex space-x-6">
        <li><a href="#what-is" className="hover:text-gray-300">简介</a></li>
        <li><a href="#features" className="hover:text-gray-300">功能</a></li>
        <li><a href="#how-to" className="hover:text-gray-300">使用方法</a></li>
        <li><a href="#faq" className="hover:text-gray-300">常见问题</a></li>
      </ul>
    </nav>
  </header>
);

const Hero: React.FC = () => (
  <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 md:py-24 px-6 md:px-12">
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-3xl md:text-5xl font-bold mb-6">飞书Markdown助手</h1>
      <h2 className="text-xl md:text-2xl mb-8">在飞书多维表格中轻松编辑和预览Markdown内容</h2>
      <p className="text-lg mb-8">用于飞书多维表格的Markdown字段扩展插件，让您的文档编辑变得简单高效</p>
      <button className="bg-white text-blue-600 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition duration-300">立即开始使用</button>
    </div>
  </section>
);

const WhatIs: React.FC = () => (
  <section id="what-is" className="py-16 px-6 md:px-12 bg-white">
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-center">什么是飞书Markdown助手？</h2>
      <div className="flex flex-col md:flex-row gap-10 items-center">
        <div className="md:w-1/2">
          <p className="text-lg mb-4">飞书Markdown助手是一个专为飞书多维表格设计的字段扩展插件，让您可以在多维表格中使用Markdown格式编辑和预览文本内容。</p>
          <p className="text-lg mb-4">无论是编写文档、记录笔记还是创建结构化内容，飞书Markdown助手都能让您的工作更加高效和专业。</p>
        </div>
        <div className="md:w-1/2 bg-gray-100 p-6 rounded-lg">
          <div className="bg-white p-4 rounded shadow-md">
            <pre className="text-sm overflow-auto p-2 bg-gray-50 rounded">
              <code>
{`# 标题示例
## 二级标题
- 列表项1
- 列表项2

\`\`\`javascript
// 代码块示例
function hello() {
  console.log("Hello World!");
}
\`\`\``}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Features: React.FC = () => (
  <section id="features" className="py-16 px-6 md:px-12 bg-gray-50">
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-12 text-center">功能特点</h2>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4">实时预览转换效果</h3>
          <p>编辑Markdown时即时查看渲染结果，所见即所得。</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4">自动保存编辑内容</h3>
          <p>无需担心内容丢失，自动保存功能确保您的编辑随时得到保存。</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4">完全集成到多维表格</h3>
          <p>无缝集成到飞书多维表格界面，无需切换应用。</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4">丰富的Markdown语法支持</h3>
          <p>支持标题、列表、代码、表格、Mermaid图表和数学公式等多种语法。</p>
        </div>
      </div>
    </div>
  </section>
);

const SyntaxSupport: React.FC = () => (
  <section className="py-16 px-6 md:px-12 bg-white">
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-center">支持的Markdown语法</h2>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-3">基础格式</h3>
          <ul className="space-y-2 list-disc pl-5">
            <li>标题（H1-H6）</li>
            <li>粗体、斜体</li>
            <li>有序和无序列表</li>
            <li>引用块</li>
          </ul>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-3">高级功能</h3>
          <ul className="space-y-2 list-disc pl-5">
            <li>代码块和行内代码</li>
            <li>链接和图片</li>
            <li>表格</li>
            <li>任务列表</li>
          </ul>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-3">特殊功能</h3>
          <ul className="space-y-2 list-disc pl-5">
            <li>Mermaid图表</li>
            <li>数学公式（KaTeX）</li>
            <li>自定义样式</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
);

const HowTo: React.FC = () => (
  <section id="how-to" className="py-16 px-6 md:px-12 bg-gray-50">
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-center">如何使用</h2>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="md:w-16 flex-shrink-0 bg-blue-600 text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold">1</div>
          <div>
            <h3 className="text-xl font-semibold mb-2">在飞书多维表格中添加扩展</h3>
            <p className="text-lg">打开您的飞书多维表格，进入扩展中心，搜索并安装"Markdown助手"扩展。</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="md:w-16 flex-shrink-0 bg-blue-600 text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold">2</div>
          <div>
            <h3 className="text-xl font-semibold mb-2">选择需要编辑的单元格</h3>
            <p className="text-lg">在多维表格中选择一个文本类型的单元格，点击Markdown助手图标启动编辑器。</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="md:w-16 flex-shrink-0 bg-blue-600 text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold">3</div>
          <div>
            <h3 className="text-xl font-semibold mb-2">编辑和预览Markdown内容</h3>
            <p className="text-lg">在编辑器中输入Markdown格式的文本，实时查看右侧预览窗口中的渲染效果。</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="md:w-16 flex-shrink-0 bg-blue-600 text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold">4</div>
          <div>
            <h3 className="text-xl font-semibold mb-2">保存内容</h3>
            <p className="text-lg">完成编辑后，点击保存按钮或启用自动保存功能，内容将自动保存到表格单元格中。</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Why: React.FC = () => (
  <section className="py-16 px-6 md:px-12 bg-gradient-to-r from-blue-500 to-blue-700 text-white">
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-12 text-center">为什么选择飞书Markdown助手</h2>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur-sm">
          <h3 className="text-xl font-semibold mb-4">效率提升</h3>
          <p>使用Markdown语法快速创建格式丰富的文档，比传统格式编辑更加高效。</p>
        </div>
        <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur-sm">
          <h3 className="text-xl font-semibold mb-4">格式一致性</h3>
          <p>Markdown提供统一的格式规则，确保所有文档保持一致的样式和结构。</p>
        </div>
        <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur-sm">
          <h3 className="text-xl font-semibold mb-4">专注于内容</h3>
          <p>减少格式编辑的干扰，让您可以更专注于内容本身的创作。</p>
        </div>
      </div>
    </div>
  </section>
);

const FAQ: React.FC = () => (
  <section id="faq" className="py-16 px-6 md:px-12 bg-white">
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-12 text-center">常见问题</h2>
      <div className="space-y-8">
        <div className="border-b pb-6">
          <h3 className="text-xl font-semibold mb-2">飞书Markdown助手支持哪些类型的表格字段？</h3>
          <p className="text-lg">飞书Markdown助手主要支持文本类型的字段，包括多行文本和富文本字段。</p>
        </div>
        <div className="border-b pb-6">
          <h3 className="text-xl font-semibold mb-2">我的Markdown内容会保存在哪里？</h3>
          <p className="text-lg">您的Markdown内容将保存在飞书多维表格的对应单元格中，同时本地也会有临时缓存以提高编辑体验。</p>
        </div>
        <div className="border-b pb-6">
          <h3 className="text-xl font-semibold mb-2">如何在表格中展示格式化后的Markdown内容？</h3>
          <p className="text-lg">当前版本中，在表格视图中会显示原始Markdown文本。如需查看格式化效果，请使用Markdown助手的预览功能。</p>
        </div>
        <div className="border-b pb-6">
          <h3 className="text-xl font-semibold mb-2">是否支持导出Markdown内容？</h3>
          <p className="text-lg">是的，您可以导出为HTML或复制格式化后的内容到其他应用中使用。</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">我可以自定义Markdown的渲染样式吗？</h3>
          <p className="text-lg">当前支持"GitHub"和"Notion"两种预设主题，未来版本将支持更多自定义选项。</p>
        </div>
      </div>
    </div>
  </section>
);

const Footer: React.FC = () => (
  <footer className="bg-gray-800 text-white py-8 px-6 md:px-12">
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <h2 className="text-xl font-bold mb-2">飞书Markdown助手</h2>
          <p className="text-gray-400">让文档编辑更加高效和专业</p>
        </div>
        <div>
          <p className="text-gray-400">© {new Date().getFullYear()} 飞书Markdown助手</p>
        </div>
      </div>
    </div>
  </footer>
);

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Hero />
      <WhatIs />
      <Features />
      <SyntaxSupport />
      <HowTo />
      <Why />
      <FAQ />
      <Footer />
    </div>
  );
};

export default LandingPage; 