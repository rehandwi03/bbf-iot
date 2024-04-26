# Express.js Application Deployment Guide

This guide provides step-by-step instructions for deploying an Express.js application to a server. It includes two deployment methods: deploying directly to a server and deploying with Docker to a server.

## Direct Deployment to Server

### Prerequisites

- Node.js installed on the server
- NPM or Yarn installed on the server
- Git installed on the server

### Steps

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/bumiclan/BE-IOT-BBF-
   ```
2. **Navigate to Project Directory:**
   ```bash
   cd https://github.com/bumiclan/BE-IOT-BBF-
   ```
3. **Copy .env and Please Write Correct Env Values**
   ```bash
   cp .env.example .env
   ```
4. **Install Dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
5. **Start Application:**
   ```bash
   node server.js
   ```

## Deployment with Docker to Server

### Prerequisites

- Docker installed on the server
- Docker Compose installed on the server (optional, if using Docker Compose)

### Steps

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/bumiclan/BE-IOT-BBF-
   ```
2. **Navigate to Project Directory:**
   ```bash
   cd https://github.com/bumiclan/BE-IOT-BBF-
   ```
3. **Copy .env and Please Write Correct Env Values**
   ```bash
   cp .env.example .env
   ```
4. **Create Dockerfile:**

   ```bash
    FROM node:18-alpine

    WORKDIR /usr/src/app

    COPY package*.json ./

    RUN npm install

    COPY . .

    EXPOSE 3000

    CMD ["node", "server.js"]
   ```

5. **Build Docker Image:**
   ```bash
   docker build -t <image-name> .
   ```
6. **Run the Docker Container:**

   ```bash
   docker run -d -p exposed_port:3000 <image-name>

   ```
