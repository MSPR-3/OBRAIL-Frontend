# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Force cache bust on each Railway deployment (SHA change = new layer)
ARG RAILWAY_GIT_COMMIT_SHA
COPY . .
# ARG -> ENV : sinon Vite ne voit pas la variable au build (l'URL API serait perdue)
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
# Template envsubst : ${API_PROXY_PASS} remplacé au démarrage du conteneur
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Backend visé par le proxy /api/ — surcharger sur Railway si le nom du service diffère
ENV API_PROXY_PASS=http://obrail-api.railway.internal:8000/
# N'autoriser l'envsubst que sur cette variable (préserve $host, $uri, ...)
ENV NGINX_ENVSUBST_FILTER=API_PROXY_PASS

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
