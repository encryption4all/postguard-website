FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# The source code will be mounted as a volume
# This allows hot reloading during development

EXPOSE 5173

CMD ["yarn", "dev", "--host"]
