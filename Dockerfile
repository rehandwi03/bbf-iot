# Use a Node.js base image
FROM node:18

# Set up working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port on which Express app is running
EXPOSE 3000

# Command to run the application
CMD ["node", "server.js"]
