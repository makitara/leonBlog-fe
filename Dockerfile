# 多阶段构建：构建阶段
FROM node:18-alpine AS build
WORKDIR /app

# 复制 package 文件并安装依赖（利用 Docker 缓存）
COPY package*.json ./
RUN npm ci

# 复制源代码并构建
COPY . .
RUN npm run build

# 运行阶段：使用 Nginx 提供静态文件服务
FROM nginx:alpine

# 复制构建产物到 Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# 复制 Nginx 配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]

