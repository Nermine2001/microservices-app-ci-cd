FROM node:20-alpine

# Crée le répertoire de travail
WORKDIR /app

# Copie uniquement package.json si tu en as un
# (si tu n’as pas de package.json, on installera directement express plus bas)
COPY package*.json ./

# Installe les dépendances dans l’image
RUN npm install express@4.18.2 cors@2.8.5 axios@1.6.2 morgan@1.10.0

# Copie le code source
COPY src/server.js .

# Expose le port
EXPOSE 3000

# Lance le serveur
CMD ["node", "server.js"]
