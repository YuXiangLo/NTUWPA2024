# Start from a lightweight Node image
FROM node:22.13.1-alpine

# Install extra tools (optional, for node-gyp builds)
RUN apk add --no-cache bash curl git python3 make g++

# Set working directory
WORKDIR /app

# Copy your local code and .env into the container.
COPY . .
COPY .env .env

# Install npm dependencies
RUN npm install

# Build the Nest.js project
RUN npm run build

# Expose the API port
EXPOSE 3000

# Start the Nest.js server
CMD ["npm", "run", "start:prod"]

