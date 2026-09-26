FROM node:20-alpine
RUN apk add --no-cache mariadb-client
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN mkdir -p uploads backups && chown -R node:node /app
USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://127.0.0.1:4000/healthz || exit 1
CMD ["sh", "-c", "node scripts/docker-init.js && node server.js"]
