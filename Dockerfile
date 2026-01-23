FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Prisma generate
RUN npx prisma generate

EXPOSE 8080

CMD ["npm", "start"]
