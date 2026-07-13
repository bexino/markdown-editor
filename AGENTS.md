# AGENTS.md — 开发规范与命令参考

本仓库为 Vue 3 + TypeScript Markdown 编辑器，使用 Vite 构建，Supabase 后端，Tailwind CSS 样式。

## 项目结构

```
src/
  features/           # 按功能模块组织（auth, documents, profile, landing）
    <feature>/
      components/     # Vue SFC 组件
      composables/    # 可复用逻辑（use* 函数）
      pages/          # 路由页面组件
      services/       # 数据访问层（Supabase 交互）
      types/          # TypeScript 类型定义
      lib/            # 纯工具函数
      data/           # 静态数据
  shared/             # 跨功能共享代码
    components/       # 通用组件
    pages/            # 通用页面（404, 401, 403）
    services/         # 全局服务（supabase, theme）
    lib/              # 通用工具（auth）
  router/             # Vue Router 路由配置
  assets/             # 静态资源（CSS, 图片）
```

路径别名：`@/` 映射到 `src/`。

## 常用命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 类型检查 + 生产构建
npm run build-only   # 仅 Vite 构建（跳过类型检查）
npm run type-check   # vue-tsc --build 类型检查
npm run lint         # 先 oxlint 再 eslint（顺序执行）
npm run format       # Prettier 格式化 src/ 目录
```

本项目当前**无测试框架**，无 test 脚本。如需添加测试，优先使用 Vitest。

## Lint 与格式化

- **OxLint**（`oxlint`）：快速 linter，配置在 `.oxlintrc.json`，启用 eslint/typescript/unicorn/oxc/vue 插件。
- **ESLint**（`eslint.config.ts`）：使用 `@vue/eslint-config-typescript` + `eslint-plugin-vue flat/essential` + `eslint-plugin-prettier`。Prettier 格式化规则由 eslint-config-prettier 跳过冲突。
- **Prettier**（`.prettierrc.json`）：无分号、单引号、行宽 100。
- **EditorConfig**：2 空格缩进、UTF-8、LF 换行、行宽 100、去除尾部空白、文件末尾空行。

## 代码风格规范

### TypeScript

- 所有函数必须标注**显式返回类型**（`: void`、`: Promise<string>` 等）。
- 使用 `interface` 定义对象形状，`type` 定义联合类型或类型别名。
- 使用 `import type { ... }` 进行纯类型导入。
- 严格空值检查：使用 `?.` 可选链和 `??` 空值合并。
- 启用 `noUncheckedIndexedAccess`，数组索引访问后必须判空。

### Vue

- 所有组件使用 `<script setup lang="ts">`。
- `defineProps` / `defineEmits` 使用类型声明语法（非运行时声明）。
- 组件名使用 PascalCase，文件名与组件名一致。
- Composable 函数以 `use` 命名（如 `useProfileSettings`），返回对象的键按字母序排列。

### 命名约定

| 类别         | 风格        | 示例                          |
| ------------ | ----------- | ----------------------------- |
| 组件文件     | PascalCase  | `EditorToolbar.vue`           |
| composable   | camelCase   | `useProfileSettings.ts`       |
| service 模块 | camelCase   | `documentStorage`             |
| 接口/类型    | PascalCase  | `DocumentRecord`, `ProfileFormData` |
| 函数/变量    | camelCase   | `renderMarkdown`, `isLoading` |
| 常量         | camelCase   | `markdown`, `joinedDateFormatter` |
| 路由路径     | kebab-case  | `/auth/callback`              |

### 模块导出

- Service 层使用对象字面量模式导出：
  ```ts
  export const documentStorage = {
    async getAll(): Promise<DocumentRecord[]> { ... },
    async create(name: string, content: string): Promise<DocumentRecord> { ... },
  }
  ```
- 工具函数和 composable 使用命名函数导出：`export function renderMarkdown(...)`.
- 类型/接口使用 `export interface` 或 `export type` 直接导出。

### 导入顺序

代码中无强制排序规则，但现有惯例为：
1. 第三方库（`vue`, `vue-router`, `@supabase/supabase-js`）
2. `@/` 路径别名导入

### 错误处理

- Service 层：检查 Supabase 返回的 `error`，抛出 `throw new Error(error.message)`。
- Composable / 页面层：`try/catch/finally` 模式，`catch` 中使用 `error instanceof Error ? error.message : '备用文案'`。
- 异步 fire-and-forget 调用使用 `void` 前缀：`void loadProfile()`。

### CSS / 样式

- 使用 Tailwind CSS 工具类，不写自定义 CSS（除全局样式）。
- 条件类绑定使用三元或对象语法。

### 路由

- 路由组件使用直接 import 懒加载（非动态 `import()`）。
- 认证守卫在 `router.beforeEach` 中通过 `getSession()` 检查。
- 路由 meta 中 `requiresAuth: true` 标记需登录页面。

## 环境变量

需要在 `.env.local` 中配置（参考 `.env.example`）：

```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

## 代码生成规则

- **不添加注释**，除非被明确要求。
- 保持与现有代码一致的风格和模式。
- 新增功能遵循 feature-based 目录结构。
- 新增 composable 必须返回对象（非数组），键按字母序排列。
- 新增 service 方法必须标注显式返回类型，使用 `requireUserId()` 模式进行鉴权。
- 修改文件后运行 `npm run lint` 和 `npm run type-check` 验证。
