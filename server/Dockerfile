# ContractCommander server — production image.
#
# This is an npm-workspaces monorepo, so dependency resolution (and the
# committed package-lock.json) spans /client and /server together. That
# means this image MUST be built with the repository root as the build
# context, not server/ alone — otherwise `npm ci` can't see the lockfile
# or the sibling workspace manifests it references.
#
# Render:
#   Dockerfile Path:            server/Dockerfile
#   Docker Build Context Dir:   .   (repo root)
#
# Local equivalent:
#   docker build -f server/Dockerfile -t contractcommander-server .
#
# Both stages use the same Debian base (not Alpine) so the Prisma query
# engine generated in the build stage is binary-compatible with the
# runtime stage — mixing libc families here is a classic source of
# "engine not found" failures at container startup.

# ---- build ------------------------------------------------------------
FROM node:20-bookworm-slim AS build
WORKDIR /app

# node:20-bookworm-slim has no OpenSSL, so Prisma can't detect a libssl
# version and silently guesses one for the query-engine binary it fetches
# — a build that succeeds with a build-time warning, then crashes at
# container startup the moment a query actually runs. Install it so
# `prisma generate` picks the engine that matches this image for real.
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# Workspace manifests only, first — keeps this layer cached across source
# changes that don't touch dependencies.
COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
COPY client/package.json ./client/package.json

# Installs devDependencies too (needed for the TypeScript compiler and the
# Prisma CLI below). Scripts are skipped here on purpose: server/prisma
# hasn't been copied in yet, so the project's own `postinstall` (which
# runs `prisma generate`) would fail if npm tried to run it this early.
RUN npm ci --ignore-scripts

# Now bring in what the server workspace needs to actually build.
COPY server/prisma ./server/prisma
COPY server/tsconfig.json ./server/tsconfig.json
COPY server/src ./server/src

# `prisma generate` only needs DATABASE_URL to be present (schema parsing
# checks the referenced env var), never valid — real credentials are
# injected by Render at container runtime and are never baked into the
# image.
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public"

RUN npm run prisma:generate --workspace server
RUN npm run build --workspace server

# ---- runtime ------------------------------------------------------------
FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# The query-engine binary generated in the build stage is a native binary
# linked against libssl — it needs OpenSSL present here too, not just at
# generate time.
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
COPY client/package.json ./client/package.json

# Production-only install, and no lifecycle scripts: `prisma` (the CLI
# postinstall needs) is a devDependency and is intentionally absent here.
# The already-generated Prisma client comes from the build stage instead.
#
# @prisma/client declares `prisma` as a peerDependency ("prisma": "*"), and
# npm auto-installs satisfied peers regardless of --omit=dev — verified
# `--omit=peer` does NOT stop this on npm 10.8.2 (the version bundled with
# this base image), so the CLI package (~11MB) ends up here anyway. It is
# never imported at runtime — only the already-generated `.prisma/client`
# output below is — so it's removed explicitly rather than relied on to be
# omitted.
RUN npm ci --omit=dev --ignore-scripts && rm -rf node_modules/prisma

COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/server/dist ./server/dist

# Render assigns its own PORT at runtime, which overrides this default —
# the app already reads process.env.PORT (see server/src/index.ts).
ENV PORT=4000
EXPOSE 4000

WORKDIR /app/server
CMD ["node", "dist/index.js"]
