ARG NODE_VERSION=22-alpine

# ----------------------------------------
# 1) Builder stage: install & build everything
# ----------------------------------------
FROM node:${NODE_VERSION} AS builder

WORKDIR /usr/src/app

# Copy package files & install ALL deps (dev+prod)
COPY package*.json ./
RUN npm ci

# Copy source & build
COPY . .
RUN npm run build


# ----------------------------------------
# 2) Final stage: runtime
# ----------------------------------------
FROM node:${NODE_VERSION} AS runtime

WORKDIR /usr/src/app

# Copy only the node_modules (with dev-deps included)
COPY --from=builder /usr/src/app/node_modules ./node_modules
# Copy the compiled output
COPY --from=builder /usr/src/app/dist ./dist
# Copy package.json for metadata (optional)
COPY --from=builder /usr/src/app/package*.json ./

# Default to production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Expose the HTTP port
EXPOSE 3000

# Dynamic entrypoint: dev vs prod
CMD ["sh", "-c", "\
  if [ \"$NODE_ENV\" = \"development\" ]; then \
    npm run start:dev; \
  else \
    RUN mkdir -p logs \
    npm run start:prod; \
  fi\
"]
