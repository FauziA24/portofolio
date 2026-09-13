FROM node:22-alpine AS app

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm --filter @portfolio/api build

EXPOSE 3001
CMD ["pnpm", "--filter", "@portfolio/api", "start"]
