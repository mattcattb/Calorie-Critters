FROM oven/bun:1.3.5 AS bun

FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:20

RUN apt-get update && \
  apt-get install -y --no-install-recommends \
  postgresql-client \
  sqlite3 \
  gpg \
  curl \
  && rm -rf /var/lib/apt/lists/*

RUN VERSION=$(curl -s https://api.github.com/repos/stripe/stripe-cli/releases/latest | grep -Po '"tag_name": "v\K[0-9.]+') && \
  curl -L "https://github.com/stripe/stripe-cli/releases/download/v${VERSION}/stripe_${VERSION}_linux_arm64.tar.gz" -o stripe.tar.gz && \
  tar -xvf stripe.tar.gz && \
  mv stripe /usr/local/bin/ && \
  rm stripe.tar.gz

RUN npm i -g @openai/codex
RUN npm install -g @anthropic-ai/claude-code
RUN npm i -g @openai/codex



COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
RUN ln -s /usr/local/bin/bun /usr/local/bin/bunx

RUN mkdir -p /home/node/.codex && \
  chown -R node:node /home/node/.codex /usr/local/lib/node_modules /usr/local/bin