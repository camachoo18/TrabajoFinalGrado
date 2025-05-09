# Usar la imagen oficial de Node.js como base
FROM node:18

# Instalar herramientas de compilación necesarias para better-sqlite3 y sqlite3
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos de configuración de dependencias
COPY package*.json ./

# Instalar las dependencias dentro del contenedor
RUN npm install

# Copiar el resto del código de la aplicación
COPY . .

# Exponer el puerto en el que la aplicación escucha
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]
