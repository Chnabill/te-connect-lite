# Étape 1 : construction de l'application Angular
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build -- --output-path=dist/frontend --configuration production

# Étape 2 : serveur nginx pour servir les fichiers
FROM nginx:alpine

COPY --from=build /app/dist/frontend /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
