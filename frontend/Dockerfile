# Étape 1 : Build de l'application React/Vite
FROM node:20-alpine as build

WORKDIR /app

# Copier et installer les dépendances
COPY package*.json ./
RUN npm install

# Copier le reste du code et construire le build de production
COPY . .
RUN npm run build

# Étape 2 : Serveur Nginx pour exposer les fichiers statiques
FROM nginx:alpine

# Copier les fichiers de build (dist pour Vite) vers Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
