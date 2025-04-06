# Use a lightweight Node image
FROM node:22.13.1-alpine

# Set working directory
WORKDIR /app

# Copy local frontend code into container
COPY . .

# Install dependencies
RUN npm install

# Build the Vite app
RUN npm run build

# Install a tiny HTTP server to serve static files
RUN npm install -g serve

# Expose Vite's default port
EXPOSE 5173

# Serve the built frontend
CMD ["serve", "-s", "dist", "-l", "5173"]

