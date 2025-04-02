FROM node:20 AS build-stage

WORKDIR /app

COPY package*.json /app/

RUN npm install

COPY ./ /app/

ARG VITE_API_URL=${VITE_API_URL}


RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Stage 2: usa un server web leggero per servire i file statici
FROM node:20-alpine

WORKDIR /app

# Installa serve per hosting di file statici
RUN npm install -g serve

# Copia solo i file di build dal primo stage
COPY --from=build-stage /app/dist /app

# Esponi la porta 5174
EXPOSE 5174

# Avvia il server sulla porta 5174
CMD ["serve", "-s", ".", "-l", "5174"]
