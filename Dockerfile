FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 80
ENV PORT=80
ENV HOSTNAME=0.0.0.0
CMD ["node_modules/.bin/next", "start", "-p", "80"]
