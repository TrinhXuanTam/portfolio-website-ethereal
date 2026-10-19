# Build the static site, then serve it with nginx.

# 1. Install deps
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# 2. Build the Vite bundle into /app/dist
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG VITE_CMS_URL=https://cms.trinhxuantam.com
ENV VITE_CMS_URL=${VITE_CMS_URL}
RUN npm run build

# 3. Serve the static output with nginx
FROM nginx:1.27-alpine AS runner
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

HEALTHCHECK --interval=10s --timeout=5s --start-period=60s --retries=6 CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
