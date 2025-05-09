# Use the official Puppeteer image
FROM ghcr.io/browserless/chrome:latest

# Create app directory
WORKDIR /usr/src/app

# Copy package manifests and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the code
COPY . .

# Use headless mode, disable sandboxing
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Expose the port your Express app listens on
EXPOSE 5000

# Launch your server
CMD ["node", "server.js"] 