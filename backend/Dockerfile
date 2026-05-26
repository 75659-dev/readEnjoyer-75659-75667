FROM node:22-alpine

WORKDIR /app

# First copy only files needed for installing dependencies
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Install dependencies
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the code
COPY . .

EXPOSE 3000

# Run via npx to ensure binaries are available
CMD sh -c "npx prisma generate && npx prisma db push && npm run start:dev"