# Stage 1: Build Angular app
FROM node:lts-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source code
COPY . .

# Define build arguments and use them during the build
RUN npm run build

# Stage 2: Serve the app using Nginx
FROM docker.io/nginxinc/nginx-unprivileged:stable-alpine

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist/selfie/browser /usr/share/nginx/html

# Start NgInx service
CMD ["nginx", "-g", "daemon off;"]
