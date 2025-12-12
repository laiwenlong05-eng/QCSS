# QCSS (Quantitative CSS) 🎨

![Size](https://img.shields.io/badge/size-~1.5k_lines-green)
![Dependencies](https://img.shields.io/badge/dependencies-0-blue)
![License](https://img.shields.io/badge/license-MIT-orange)

> **English**: Structure First. Zero Runtime. Specificity Solved.
> **中文**: 结构至上。零运行时。彻底告别权重地狱。

---

## 🌟 What is QCSS? / 什么是 QCSS？

**[English]**
QCSS is a revolutionary CSS compiler designed for the modern component era. Unlike Sass (which just adds syntax sugar) or Tailwind (which clutters your HTML), QCSS binds styles directly to your **DOM Structure**.

> **"Strong Coupling" is a Feature.**
> Historically, we were taught to decouple CSS from HTML to make it "resilient". The result? A graveyard of unused styles (Zombie Code) and a fear of deleting anything.
> QCSS takes the opposite approach: **If your HTML changes, your CSS *should* know.** It treats your CSS like a Type System for your DOM.

It compiles your semantic structure into **Hash-Based Atomic CSS**, giving you the developer experience of BEM but the performance of Atomic CSS.

**[中文]**
QCSS 是一个为现代组件化时代而生的革命性 CSS 编译器。不同于 Sass（只是加点糖）或 Tailwind（把 HTML 搞得乱七八糟），QCSS 将样式直接绑定到你的 **DOM 结构**上。

> **"强耦合" 是一个特性。**
> 历史上，我们被教导要解耦 CSS 和 HTML 以保持"弹性"。结果呢？造就了无数不敢删的“僵尸代码”。
> QCSS 反其道而行之：**如果你的 HTML 变了，你的 CSS *就应该* 知道。** 它把 CSS 当作是 DOM 的类型系统来对待。

它能把你写的语义化结构，编译成**基于哈希的原子 CSS**。简单说就是：写的时候像 BEM 一样爽，跑的时候像 Atomic CSS 一样快。

---

## ✨ Key Features / 核心特性

### 1. Structure-Based Styling (结构化样式)
No more `class="btn btn-primary btn-large"`. Just map your DOM!
告别那一长串的类名，直接映射你的 DOM 树！

**HTML:**
```html
<div data-ref="card">
    <h3 data-ref="title">Hello</h3>
</div>
```

**QCSS:**
```css
/* No dots, no hashes, just logical names */
card {
    background: white;
    title {
        color: #333;
    }
}
```

### 2. Hash Mode & Production Optimization (哈希编译 & 生产优化)
In production, QCSS flattens everything into short hashes.
在生产环境，QCSS 会把所有深层嵌套拍平成短短的哈希值。

**Output (CSS):**
```css
[q-id="q-x8z9"] { background: white; }
[q-id="q-a1b2"] { color: #333; }
```
**Performance:** The file size is tiny, and selector matching speed is blazing fast! 
**性能:** 文件体积极小，且浏览器匹配速度极快！

### 3. Tree Shaking (智能剪枝) ✂️
Defined a style but didn't use it in HTML? QCSS will **automatically remove it**.
写了样式但 HTML 里没用到？QCSS 会**自动把它删掉**。

```bash
# Pass your HTML file to enable Tree Shaking
node src/index.js --hash --html index.html style.qcss style.css
```

**White-listing Dynamic Elements / 动态元素白名单:**
If you create elements dynamically in JS, tell QCSS to keep them:
如果你在 JS 里动态创建元素，告诉 QCSS 保留它们：
```css
dynamic-box {
    @keep; /* Protects this block from Tree Shaking */
    color: red;
}
```

### 4. Scoped Animations (动画隔离) 🎬
Animation names are also hashed! No more global conflicts for `@keyframes spin`.
动画名称也会被哈希化！再也不用担心 `@keyframes spin` 全局冲突了。

### 5. Doctor Mode (结构医生) 🩺
Changed your HTML structure? Don't worry.
HTML 结构变了？别慌。

```bash
node src/index.js --check --html index.html style.qcss
```
QCSS Doctor will tell you exactly which styles are broken:
QCSS 医生会精确地告诉你哪里断了：
> ❌ [Warning] Path defined in QCSS but NOT found in HTML: "root sidebar header"

### 6. Intelligent Suggestions (智能纠错) 🧠
Typo in your property name? Forgot a variable name?
属性名拼错了？变量名忘了？

QCSS will smartly guess what you meant:
QCSS 会智能猜测你的意图：

> ⚠️ Warning: Unknown property 'colr'. Did you mean 'color'?
> ⚠️ Warning: Undefined variable $primry. Did you mean $primary?

### 7. Source Maps (源映射) 🗺️
Debug your `.qcss` files directly in the browser DevTools.
直接在浏览器控制台调试你的 `.qcss` 源码。

```bash
node src/index.js --sourcemap style.qcss style.css
```

---

## 🚀 Quick Start / 快速上手

### Installation / 安装
Clone this repo and you are good to go. Zero dependencies!
克隆这个仓库就能用，零依赖（除了 Node.js 本身）！

### Usage / 用法

**Development (开发模式)**:
Readable selectors, watch mode.
可读性高的选择器，开启监听模式。
```bash
node src/index.js --watch --layer examples/style.qcss examples/style.css
```

**Production (生产模式)**:
Hashed, minified, tree-shaken.
哈希化，压缩，自动剪枝。
```bash
node src/index.js --hash --minify --html examples/index.html examples/style.qcss examples/style.css
```

---

## 🛠️ Syntax Guide / 语法指南

### Variables / 变量
```css
$primary: #6c5ce7;
button { color: $primary; }
```

### Mixins / 混合宏
```css
@mixin center {
    display: flex;
    justify-content: center;
}
div { @include center; }
```

### Auto-Prefixing / 自动前缀
Just write standard CSS, we handle the rest.
只管写标准 CSS，剩下的交给我们。
```css
transform: scale(1); 
/* Compiles to: -webkit-transform: ... -ms-transform: ... transform: ... */
```

---

## 🔌 Ecosystem / 生态

### Vite Plugin
Using Vue or React? We have a plugin!
在用 Vue 或 React？我们有插件！

```javascript
// vite.config.js
import qcss from 'vite-plugin-qcss';
export default {
  plugins: [qcss()]
}
```

---

## 🆚 Comparison / 深度对比

| Feature | Sass / SCSS | Tailwind CSS | CSS-in-JS (Styled) | **QCSS** |
| :--- | :--- | :--- | :--- | :--- |
| **Philosophy / 核心理念** | CSS with Superpowers | Utility-First | CSS in JavaScript | **Structure-First** |
| **HTML Cleanliness / HTML 干净度** | ✅ Clean | ❌ Class Soup | ✅ Clean | **✅✅ Semantic** |
| **Specificity Issues / 权重问题** | ❌ High (Nested Hell) | ✅ Solved (Atomic) | ✅ Solved (Unique Class) | **✅ Solved (Hash)** |
| **Dead Code / 死代码** | ❌ Manual Removal | ✅ PurgeCSS | ✅ Automatic | **✅ Smart Tree Shaking** |
| **Debug Experience / 调试体验** | Source Maps | DevTools Class List | React/Vue DevTools | **Doctor Mode + Intellisense** |
| **Runtime Cost / 运行时开销** | Zero | Zero | High | **Zero** |

---

## ❓ FAQ / 常见问题

**Q: If I change my HTML structure, won't my CSS break?**
**问：如果我改了 HTML 结构，CSS 岂不是这就挂了？**

**A:** Yes, it will break, and **that's a feature, not a bug**.
Changes in structure *should* reflect in styles. Use `qcss --check` (Doctor Mode) to quickly find and fix these discrepancies. It's better to break explicitly than to have unused CSS rot in your codebase forever.
**答：** 是的，会挂，但**这是一个特性，不是 Bug**。
结构的改变*本就应该*引起样式的注意。使用 `qcss --check`（医生模式）来快速定位并修复这些不一致。显式的报错总比隐式的“死代码堆积”要好得多。

---

**Happy Coding with QCSS!** 🎉
**用 QCSS 快乐编码吧！**
