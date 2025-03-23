export const testMarkdown = `
请选择一个单元格开始预览
`
// export const testMarkdown = `
// # Markdown渲染测试

// ## 特殊字符测试

// ### 行内代码中的特殊字符

// 这是一个包含连字符的行内代码示例：\`a-b-c\`

// 这是带有井号的行内代码：\`#标题\`

// 这是包含下划线的行内代码：\`hello_world\`

// 这是包含星号的行内代码：\`*强调*\`

// 这是包含反引号的行内代码（用HTML实体替代）：<code>\`code\`</code>

// ### 代码块测试

// \`\`\`javascript
// // 这是JavaScript代码
// function test() {
//   const a = 'hello-world';
//   const b = '#标题';
//   const c = '*强调*';
//   return a + b + c;
// }
// \`\`\`

// ## 列表测试

// ### 无序列表

// - 第一项
// - 第二项
//   - 嵌套的第一项
//   - 嵌套的第二项
// - 第三项

// ### 有序列表

// 1. 第一项
// 2. 第二项
//    1. 嵌套的第一项
//    2. 嵌套的第二项
// 3. 第三项

// ## 表格测试

// | 标题1 | 标题2 | 标题3 |
// |-------|-------|-------|
// | 单元格1 | 单元格2 | 单元格3 |
// | 行内代码\`a-b\` | 行内代码\`#tag\` | 行内代码\`*star*\` |

// ## 引用测试

// > 这是一个引用
// > 
// > 引用中的行内代码：\`code-with-hyphen\`
// >
// > > 嵌套引用

// ## 强调和加粗测试

// *斜体文本* _斜体文本_

// **粗体文本** __粗体文本__

// ***粗斜体文本*** ___粗斜体文本___

// ## 链接和图片测试

// [链接文本](https://example.com)

// ![图片描述](https://th.bing.com/th/id/OSK.HEROR41ocHR5EQfXb458V-qgvm-oq_agITm9vDEo8QhHFvA?rs=1&pid=ImgDetMain)

// ## 删除线测试

// ~~删除的文本~~

// ## 水平线测试

// ---

// ***

// ___

// ## 任务列表测试

// - [x] 已完成任务
// - [ ] 未完成任务
// - [x] 包含\`code-with-hyphen\`的任务

// ## 数学公式测试

// ### 行内公式

// 爱因斯坦质能方程：$E = mc^2$

// ### 块级公式

// $$
// \\begin{aligned}
// \\frac{\\partial J}{\\partial \\theta_k} &= \\sum_{i=0}^m y^{(i)}\\frac{1}{h_\\theta(x^{(i)})}\\frac{\\partial h_\\theta(x^{(i)})}{\\partial \\theta_k} + (1 - y^{(i)})\\frac{1}{1 - h_\\theta(x^{(i)})}\\frac{\\partial h_\\theta(x^{(i)})}{\\partial \\theta_k} \\\\
// &= \\sum_{i=0}^m \\left( y^{(i)} \\frac{1}{h_\\theta(x^{(i)})} - (1 - y^{(i)})\\frac{1}{1 - h_\\theta(x^{(i)})} \\right) \\frac{\\partial h_\\theta(x^{(i)})}{\\partial \\theta_k} \\\\
// &= \\sum_{i=0}^m \\left( \\frac{y^{(i)} - h_\\theta(x^{(i)})}{h_\\theta(x^{(i)})(1 - h_\\theta(x^{(i)}))} \\right) \\frac{\\partial h_\\theta(x^{(i)})}{\\partial \\theta_k} \\\\
// &= \\sum_{i=0}^m \\left( \\frac{y^{(i)} - h_\\theta(x^{(i)})}{h_\\theta(x^{(i)})(1 - h_\\theta(x^{(i)}))} \\right) h_\\theta(x^{(i)}) x_k^{(i)} \\\\
// &= \\sum_{i=0}^m (y^{(i)} - h_\\theta(x^{(i)})) x_k^{(i)}
// \\end{aligned}
// $$

// ## Mermaid图表测试

// \`\`\`mermaid
// graph TD
//   A[开始] --> B[处理数据]
//   B --> C{数据有效?}
//   C -->|是| D[保存结果]
//   C -->|否| E[报错处理]
//   D --> F[结束]
//   E --> F
// \`\`\`

// \`\`\`mermaid
// pie
//   title 时间分配
//   "工作" : 40
//   "学习" : 20
//   "休息" : 30
//   "其他" : 10
// \`\`\`

// ## GitHub风格警告提示

// [!NOTE]
// 这是一个信息提示框，用于提供注意事项或额外信息。

// [!TIP]
// 这是一个提示框，用于提供有用的技巧或建议。

// [!IMPORTANT]
// 这是一个重要提示框，用于强调重要信息。

// [!WARNING]
// 这是一个警告提示框，用于提醒潜在的风险或问题。

// [!CAUTION]
// 这是一个警告提示框，用于警告危险操作或严重后果。
// `; 