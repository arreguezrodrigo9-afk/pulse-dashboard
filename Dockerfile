FROM node:20-slim

WORKDIR /app

# Instalar dependencias
COPY package.json package-lock.json* ./
RUN npm install

# Copiar todo el código
COPY . .

# Build del frontend
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Arrancar servidor
CMD ["npx", "tsx", "server.ts"]
