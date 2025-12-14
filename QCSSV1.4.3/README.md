# QCSS / QJS (`qcss-qjs`)

![Size](https://img.shields.io/badge/size-~1.5k_lines-green)
![Dependencies](https://img.shields.io/badge/dependencies-light-blue)
![License](https://img.shields.io/badge/license-MIT-orange)

> **EN**: Structure-first CSS compiler with optional runtime.  
> **CN**: 以结构为核心的 CSS 编译器，可选轻量运行时。

QCSS 把 CSS 当成 DOM 的「结构类型系统」：  
你不是在写一堆 class，而是在给 DOM 结构下定义。

> 第一次看到可以不用把所有细节记住。  
> 可以先从「快速上手」里的几个命令跑起来，再慢慢看后面的章节。

---

## 🌟 1. What is QCSS / QJS? / 什么是 QCSS / QJS？

**[EN]**

- **QCSS** is a compiler that binds styles to your **DOM structure**:
  - you describe structure with `data-ref`
  - you write nested rules in `.qcss`
  - QCSS compiles them to real CSS selectors
- In production, QCSS can:
  - generate **hash-based atomic selectors** (`q-id`)
  - perform **tree shaking** based on HTML
  - inject hashes back to HTML to avoid FOUC

- **QJS** is an optional runtime that understands the same manifest:
  - binds `q-id` at runtime
  - provides lightweight reactive utilities and list helpers
  - is meant for highly dynamic UIs (feeds, animations, games, etc.)

**[中文]**

- **QCSS** 是一个「以结构为中心」的 CSS 编译器：
  - 用 `data-ref` 描述 DOM 结构；
  - 用 `.qcss` 写出一棵语义清晰的结构树；
  - 编译成真实的 CSS 选择器。
- 在生产环境下，QCSS 可以：
  - 生成基于哈希的 **原子级选择器**（`q-id`）；
  - 结合你的 HTML 做 **Tree Shaking**，只保留用到的路径；
  - 把哈希写回 HTML，避免首屏 FOUC。

- **QJS** 是可选的运行时：
  - 读取同一套 manifest；
  - 负责在运行时绑定 `q-id`，并提供少量响应式能力；
  - 适合高动态页面；纯静态 / SSR 场景可以完全不依赖它。

---

## ✨ 2. Core Ideas / 核心理念

- **Structure-based styling / 基于结构的样式**  
  用 `data-ref` 标记 DOM，再用嵌套 QCSS 映射到结构路径。

- **Scope isolation / 作用域隔离**  
  结构路径天然形成作用域：不同模块使用不同的 `data-ref` 子树，互不干扰。

- **Hash mode / 哈希模式**  
  生产模式下把路径编译成短哈希，用 `q-id` 等属性选择器，获得接近 Atomic CSS 的体积和性能。

- **Tree Shaking / 智能剪枝**  
  根据 HTML 实际出现的路径，自动剪掉没用到的结构分支。

- **Doctor mode / 结构医生**  
  比对「QCSS 中定义的路径」与「HTML 推导出的路径」，查出僵尸样式和缺失定义。

- **HTML injection / HTML 注入**  
  把哈希写回 HTML，让页面在首屏就带着最终的 `q-id`、`q-comp` 等标记。

- **Zero-runtime first / 优先零运行时**  
  默认没有运行时；只有在复杂动态场景下才引入 QJS。

---

## 🚀 3. Quick Start / 快速上手

下面三个场景基本覆盖了日常使用：

### 3.1 Install & CLI / 安装与命令

**通过 npm 包使用：**

```bash
npm install qcss-qjs
```

CLI 名叫 `qcss`（由 `qcss-qjs` 包提供）：

```bash
npx qcss --help
```

**克隆仓库开发 QCSS 本身：**

```bash
git clone https://github.com/your-name/qcss.git
cd qcss
npm install
```

### 3.2 Minimal Example / 最小示例

**HTML：**

```html
<div data-ref="card">
  <h3 data-ref="title">Hello</h3>
</div>
```

**QCSS：**

```css
card {
  background: white;

  title {
    color: #333;
  }
}
```

**编译（开发模式，输出可读 CSS）：**

```bash
npx qcss examples/style.qcss examples/style.css
```

输出类似：

```css
[data-ref="card"] {
  background: white;
}
[data-ref="card"] [data-ref="title"] {
  color: #333;
}
```

### 3.3 Dev Build / 开发构建

可读选择器 + 自动监听：

```bash
npx qcss --watch --layer examples/style.qcss examples/style.css
```

- `--watch`：监听 QCSS 文件变化自动重新编译  
- `--layer`：在输出中包一层 `@layer`，方便与其他 CSS 组合

### 3.4 Prod Build / 生产构建（单/多页面）

哈希 + 压缩 + Tree Shaking：

```bash
# 单页面
npx qcss --hash --minify --html examples/index.html examples/style.qcss examples/style.css

# 多页面（用逗号分隔）
npx qcss --hash --minify --html "examples/index.html,examples/about.html" examples/style.qcss examples/style.css
```

> 起步阶段可以只加 `--hash --html`，先感受 Tree Shaking + 哈希，再按需叠加其他参数。

---

## 🧩 4. Writing QCSS / 如何书写 QCSS

这一节覆盖「所有主要语法」和「与作用域相关的点」。

### 4.1 Structure-based styling / 结构化样式

**HTML：**

```html
<main data-ref="root">
  <header data-ref="header">
    <h1 data-ref="title">Home</h1>
  </header>
</main>
```

**QCSS：**

```css
root {
  header {
    title {
      color: #333;
      font-size: 24px;
    }
  }
}
```

- 逻辑路径是：`root header title`  
- 这条路径既用于生成 CSS，也会出现在哈希 manifest 中。
- 你可以把它理解为「给这一条结构路径声明类型」。

### 4.2 Variables / 变量

```css
$primary: #6c5ce7;

root {
  title {
    color: $primary;
  }
}
```

- 变量在编译阶段展开，不引入运行时依赖。  
- 建议只用于颜色、间距等基础设计变量。

### 4.3 Mixins / 混合宏

```css
@mixin center {
  display: flex;
  justify-content: center;
  align-items: center;
}

dialog {
  @include center;
}
```

- `@mixin` / `@include` 在编译时展开。  
- 内部有循环检测，避免无意递归导致爆栈。

### 4.4 Components / 组件（位置无关）

**QCSS：**

```css
@component btn {
  padding: 10px 20px;
  background: blue;

  &:hover {
    background: darkblue;
  }
}
```

**HTML：**

```html
<button data-comp="btn">Click Me</button>
```

- 组件不依赖树状路径，更像是「结构系统里的积木」。  
- 在哈希模式下，会为 `@component` 分配独立哈希，并通过 `q-comp` 绑定。

### 4.5 Scoped animations / 动画作用域隔离

```css
root {
  title {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
}
```

- QCSS 会为 `@keyframes spin` 生成带哈希的内部名称；  
- 避免不同模块之间的动画名相互污染，是作用域隔离的一部分。

### 4.6 Pseudo & states / 伪类与状态

你可以像普通 CSS 一样在当前节点内使用 `&`：

```css
item {
  &:hover {
    background: #f5f5f5;
  }

  &.is-active {
    color: #000;
  }
}
```

> `item` 部分仍然以结构路径为主，`&` 只是在当前节点的基础上追加伪类 / 状态。

---

## ✂️ 5. Tree Shaking & Dynamic Content / 剪枝与动态内容

### 5.1 Basic tree shaking / 基本剪枝

只要提供 HTML，QCSS 就只保留真正用到的路径：

```bash
npx qcss --hash --html index.html style.qcss style.css
```

### 5.2 Multi-page tree shaking / 多页面剪枝

多页面站点只需要用逗号连接 HTML 路径：

```bash
npx qcss --hash --html "index.html,about.html,docs.html" style.qcss style.css
```

QCSS 会把所有页面路径合并成一棵逻辑大树，再做剪枝。

### 5.3 Keep dynamic branches / 保留动态分支

如果有些元素由 JS 动态创建，Tree Shaking 阶段看不到真实的 `data-ref`，可以用 `@keep`：

```css
dynamic-box {
  @keep;
  color: red;
}
```

即使 HTML 中暂时没有该节点，带 `@keep` 的规则也不会被剪掉。

### 5.4 Scan dynamic templates / 扫描动态模板

除了 HTML，你可以让 QCSS 去代码目录里扫描字符串里的 `data-ref`：

```bash
npx qcss --hash --html index.html --scan src/ style.qcss style.css
```

- `--scan` 会扫描 `src/` 下的 `.js / .jsx / .ts / .tsx / .vue` 等文件；  
- 收集其中的 `data-ref="..."`，一起参与 Tree Shaking；  
- 适合模板字符串、前端路由等场景。

---

## 🩺 6. Doctor Mode / 结构医生

Doctor 模式的目标是：  
**检查「QCSS 描述的结构」与「HTML 实际结构」是否一致。**

### 6.1 Basic check / 基本检查

```bash
npx qcss app.qcss dummy.css --html index.html --check
```

- **QCSS → HTML**：  
  检查「QCSS 有、HTML 没有」的路径（僵尸样式）：

  ```text
  [QCSS → HTML] Path defined in QCSS but NOT found in HTML:
    - "root sidebar header"
  ```

- **HTML → QCSS（默认 info）**：  
  列出「HTML 有、QCSS 没定义」的路径：

  ```text
  [HTML → QCSS] Paths found in HTML but NOT defined in QCSS (info only):
    - "root sidebar"
  ```

当两边完全对齐时，会看到：

```text
✅ All QCSS paths and HTML structure are consistent!
```

### 6.2 Strict HTML mode / 严格 HTML 模式

希望「HTML 里所有 `data-ref` 都必须有对应 QCSS 定义」时可以打开：

```bash
npx qcss app.qcss dummy.css --html index.html --check --strict-html
```

- 此时 HTML → QCSS 的缺失路径也会被视为错误；  
- 适合接入 CI 阶段做结构一致性检查。

### 6.3 Multi-page check / 多页面检查

```bash
npx qcss app.qcss dummy.css --html "index.html,about.html,docs.html" --check
```

- 会把所有页面的路径合并；  
- Doctor 报告中的统计基于这棵合并后的路径树。

### 6.4 data-ref duplicates / data-ref 重复检测

Doctor 还会在同一 HTML 文件内检测 `data-ref` 重复：

```text
[HTML] Duplicate data-ref values in index.html (info only):
  - "title" appears 2 times
```

- 同一 HTML 中多次出现会被标出来；  
- 不同 HTML 文件之间可以重复，不算错误；  
- 在 `--strict-html` 下，这些重复也会计入错误数量。

### 6.5 CI integration / CI 集成

当 Doctor 发现任何不一致或错误时，进程会以**非零退出码**结束：

- 有问题：打印 `❌ Found X potential path inconsistencies.`，退出码非 0；  
- 无问题：打印 ✅ 提示，退出码为 0。

CI 示例：

```bash
npx qcss app.qcss dummy.css --html "index.html,about.html" --check --strict-html
```

只要结构不匹配，就会阻断构建 / 合并。

---

## 💉 7. HTML Injection / HTML 注入

为了解决 FOUC（Flash of Unstyled Content），可以在构建期直接把哈希注入 HTML。

### 7.1 Single page / 单页面

```bash
npx qcss --inject --hash --html index.html style.qcss style.css
```

- 读取 `index.html`；  
- 根据 manifest，将 `q-id / q-inline / q-comp` 写回 DOM；  
- 覆盖写回原 HTML 文件。

### 7.2 Multi-page / 多页面

```bash
npx qcss --inject --hash --html "index.html,about.html" style.qcss style.css
```

- 逐个读取与覆盖每个源 HTML 文件。

### 7.3 Merge output / 合并输出（可选）

```bash
npx qcss --inject --hash --html "index.html,about.html" --output-html dist.html style.qcss style.css
```

- 所有 HTML 会合并后写入 `dist.html`；  
- 适合当作 SSR 的中间产物。

---

## 📦 8. Manifest & QJS Runtime / Manifest 与运行时

### 8.1 Global manifest / 全局 Manifest

在哈希模式下，编译结果包含 CSS 和 manifest：

```bash
npx qcss --hash --html index.html style.qcss style.css
```

默认会生成：

- `style.css`：哈希后的 CSS；  
- `style.css.json`：全局 manifest，类似：

```json
{
  "root header titleRef": "q-xxxxxx",
  "@comp:btn": "q-yyyyyy"
}
```

### 8.2 Per-page manifest / 按页面 Manifest

多页面应用可以为每个页面生成单独的 manifest：

```bash
npx qcss --hash --per-page-manifest --html "page1.html,page2.html" style.qcss dist.css
```

额外生成：

- `page1.qcss-manifest.json`  
- `page2.qcss-manifest.json`

每个文件只包含该页面实际用到的路径 → 哈希映射，方便拆分与懒加载。

### 8.3 QJS runtime (experimental) / QJS 运行时（实验性）

仓库中包含一个 QJS 原型（目录 `qjs/`），目标是：

- 用 manifest 驱动 `q-id` 的绑定和更新；  
- 提供轻量的响应式与列表操作能力；  
- 为信息流、动画、游戏等高动态场景提供基础设施。

目前 QJS 仍处在打磨阶段，更适合作为「未来方向」参考，而不是强依赖。

---

## 🧾 9. CLI Reference / 命令行速查

### 9.1 Basic usage / 基本用法

```bash
npx qcss [flags] <input.qcss> [output.css]
```

- `input.qcss`：必填，QCSS 源文件；  
- `output.css`：可选，不填则输出到 stdout。

### 9.2 Flags / 参数

| Flag | Type | Description |
| --- | --- | --- |
| `--watch` | boolean | 监听输入文件变化，自动重新编译 |
| `--layer` | boolean | 在输出中包一层 `@layer`，方便与其他 CSS 整合 |
| `--minify` | boolean | 压缩输出 CSS |
| `--hash` | boolean | 启用哈希模式，输出 `q-id` 选择器和 manifest |
| `--html <files>` | string | 逗号分隔的 HTML 列表，用于 Tree Shaking / Doctor / 注入 |
| `--inject` | boolean | 根据 manifest 把哈希注入 HTML（配合 `--hash` 使用） |
| `--output-html <file>` | string | 将注入后的 HTML 写入指定文件；不指定则覆盖原 HTML（多页面时逐个覆盖） |
| `--scan <path>` | string | 扫描目录或文件中的代码字符串，收集 `data-ref` 用于 Tree Shaking |
| `--check` | boolean | 启用 Doctor 模式，检查 QCSS 与 HTML 的结构一致性 |
| `--strict-html` | boolean | 将 HTML → QCSS 的缺失路径视为错误，并在 Doctor 模式下返回非零退出码 |
| `--sourcemap` | boolean | 生成 source map 文件 |
| `--loose` | boolean | 宽松模式，允许更灵活的哈希策略（例如按叶子节点匹配） |
| `--per-page-manifest` | boolean | 在多页面场景下，为每个 HTML 输出各自的 manifest 文件 |

> 当你不确定要不要开启某个参数时，可以先用最小组合（如 `--hash --html`），感受一下效果，再逐步叠加。

---

## ⚠️ 10. Tips & Caveats / 注意事项

- **结构即契约**  
  - QCSS 把样式和结构强绑定：改结构、样式就有可能「断」。  
  - 这不是 bug，是一种**显式反馈机制**；配合 Doctor 模式可快速修复。

- **data-ref 命名建议**  
  - 同一页面尽量保证 `data-ref` 唯一，避免语义歧义；  
  - 不同页面可以重复，不会冲突；重复会在 Doctor 报告中以 info 形式提示。

- **哈希模式调试**  
  - 生产环境建议始终用 `--hash --html`；  
  - 调试时以「开发构建」模式输出可读选择器，避免直接对着哈希排查问题。

- **动态内容策略**  
  - 尽量把动态结构变成「有限模板」，让 Tree Shaking 和 Doctor 更容易理解；  
  - 真正不可预测的结构，用 `@keep` 和 `--scan` 兜底。

---

## 📌 11. Project Status / 项目状态

QCSS 当前处于「**适合在个人 / 内部项目大胆尝试**」的阶段：

- 编译器与 CLI 已经过一轮系统性打磨和测试；  
- 多页面、Doctor、Tree Shaking、注入、manifest 等核心能力已能稳定工作；  
- 生态集成（如专用 Vite / SvelteKit 插件）、QJS 运行时以及更大规模的测试矩阵仍在持续完善中。

如果你愿意接纳一点不完美，非常欢迎在自己的项目里直接使用。  
遇到任何问题，尽管大胆改源码，也欢迎在此基础上继续长成你心中那套「理想的 CSS 体系」。

---

## 🆚 12. Comparison / 深度对比

| Feature | Sass / SCSS | Tailwind CSS | CSS-in-JS (Styled) | **QCSS** |
| :--- | :--- | :--- | :--- | :--- |
| **Philosophy / 核心理念** | CSS with Superpowers | Utility-First | CSS in JavaScript | **Structure-First** |
| **HTML Cleanliness / HTML 干净度** | ✅ Clean | ❌ Class Soup | ✅ Clean | **✅✅ Semantic** |
| **Specificity Issues / 权重问题** | ❌ High (Nested Hell) | ✅ Solved (Atomic) | ✅ Solved (Unique Class) | **✅ Solved (Hash)** |
| **Dead Code / 死代码** | ❌ Manual Removal | ✅ PurgeCSS | ✅ Automatic | **✅ Smart Tree Shaking** |
| **Debug Experience / 调试体验** | Source Maps | DevTools Class List | React/Vue DevTools | **Doctor Mode + Intellisense** |
| **Runtime Cost / 运行时开销** | Zero | Zero | High | **Zero (QCSS) / Small (QJS)** |

---

## ❓ 13. FAQ / 常见问题

**Q: If I change my HTML structure, won’t my CSS break?**  
**问：如果我改了 HTML 结构，CSS 会不会一下就挂掉？**

**A:** Yes, it might break – and **that’s a feature, not a bug**.  
Changes in structure *should* reflect in styles. Use `qcss --check` (Doctor Mode) to quickly locate inconsistencies and fix them explicitly, instead of letting dead CSS rot in your codebase.

**答：** 是的，有可能会挂，而且**这是一个特性，而不是 Bug**。  
结构本来就应该和样式绑定在一起：你改变了结构，样式理应被提醒。  
配合 `qcss --check`（医生模式）可以很快发现这些不一致，并明确地修掉；  
比起悄无声息地堆积一堆永远不会被清理的样式，这种「可见的破坏」更健康。

---

**Happy coding with QCSS / QJS!**  
**用 QCSS / QJS 快乐写样式吧！**

