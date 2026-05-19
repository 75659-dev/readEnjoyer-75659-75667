FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Expose Vite port
EXPOSE 5173

# The --host flag is required so Docker can bind the port externally
CMD ["npm", "run", "dev", "--", "--host"]