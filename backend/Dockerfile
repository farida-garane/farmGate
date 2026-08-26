FROM node:20-alpine

# Créer le répertoire de l'application
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer OpenSSL (requis par Prisma sur Alpine Linux)
RUN apk add --no-cache openssl

# Installer les dépendances
RUN npm install

# Copier le reste du code source
COPY . .

# Générer le client Prisma (indispensable car le schéma vient d'être copié)
RUN npx prisma generate
# Exposer le port (le port sera défini dans le docker-compose ou le .env, par défaut on expose 5000)
EXPOSE 5000

# Commande pour démarrer l'application
CMD ["npm", "start"]
