# leonBlog-fe

Vue 3 博客前端，极简设计，专注内容展示。

## 技术栈

- **Vue 3** + Composition API
- **TypeScript** + TSX
- **Vite** 构建工具
- **marked** Markdown 渲染
- **Tailwind CSS** (CDN) + 自定义 CSS 变量

## 项目结构

```
leonBlog-fe/
├── App.tsx              # 主组件（状态管理、路由逻辑）
├── index.tsx            # 应用入口
├── index.html           # HTML 模板
├── services/
│   └── api.ts           # API 请求封装
├── types.ts             # TypeScript 类型定义
├── styles.css           # 全局样式（主题变量、Markdown 样式）
├── vite.config.ts       # Vite 配置
└── package.json
```

## 开发

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # 构建到 dist/
npm run preview      # 预览构建产物
```

## 环境变量

创建 `.env` 或 `.env.local`：

```bash
VITE_API_BASE_URL=http://localhost:8080
```

- 不设置时默认使用当前域名（同域部署）
- 生产环境建议通过 Nginx 反向代理，避免 CORS

## API 接口

### GET /api/profile
```typescript
interface UserProfile {
  id: string;
  username: string;
  avatarUrl: string;
  bio: string;
  email: string;
}
```

### GET /api/articles
```typescript
interface ArticleSummary {
  id: string;
  title: string;
  publishDate: string;
}
```

### GET /api/articles/{id}
```typescript
interface ArticleDetail extends ArticleSummary {
  content: string;  // Markdown 格式
}
```

## 构建与部署

### Docker 构建

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 静态部署

构建后的 `dist/` 目录可部署到：
- Nginx
- Netlify / Vercel
- OSS / CDN

## 核心特性

- **主题切换**：深色/浅色模式，localStorage 持久化
- **Markdown 渲染**：使用 `marked` 解析文章内容
- **响应式设计**：移动端适配
- **极简 UI**：复古终端风格

## 注意事项

- 使用 Vue 3 Composition API，无 `.vue` 文件
- 样式通过 CSS 变量实现主题切换
- API 错误处理在 `services/api.ts` 中统一处理
- 如需鉴权，在 `api.ts` 中添加 Header 或 Cookie
