FROM node:20-bullseye-slim

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies without optional packages
RUN npm install --no-optional

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose Vite's default port
EXPOSE 5173

# Start the development server
CMD ["npm", "run", "dev", "--", "--host"] 