export const testMarkdown = `
# Markdown 格式示例

这是一个段落，**这是粗体文本**，*这是斜体文本*，~~这是删除线文本~~。

## 列表示例

### 无序列表

- 第一项
- 第二项
  - 嵌套项
  - 另一个嵌套项
- 第三项

### 有序列表

1. 第一项
2. 第二项
   1. 嵌套项
   2. 另一个嵌套项
3. 第三项

## 表格示例

| 名称 | 类型 | 描述 |
|------|------|------|
| Name | string | 用户名称 |
| Age | number | 用户年龄 |
| Email | string | 邮箱地址 |

## 代码示例

行内代码：\`const value = 123;\`

代码块：

\`\`\`javascript
function greeting(name) {
  console.log(\`Hello, \${name}!\`);
  return true;
}
\`\`\`

## 其他元素

> 这是一段引用文本
> 
> 引用中的**粗体文本**也有效

[这是一个链接](https://example.com)

![图片描述](https://via.placeholder.com/150)

水平线：

---

## Mermaid 图表

\`\`\`mermaid
graph TD
  A[开始] --> B[处理数据]
  B --> C{数据有效?}
  C -->|是| D[保存结果]
  C -->|否| E[报错]
  D --> F[结束]
  E --> F
\`\`\`

## 数学公式

行内公式: $E = mc^2$

公式块:

$$
\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}
$$

## GitHub风格提示

> [!NOTE]
> 这是一个信息提示，用于提供额外说明。

> [!WARNING]
> 这是一个警告提示，用于提醒潜在风险。

> [!TIP]
> 这是一个提示，用于提供建议。
`;

export default testMarkdown; 