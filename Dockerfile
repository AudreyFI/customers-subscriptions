FROM node:alpine as development
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "run", "start"]

#Build prod
FROM node:latest AS build
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

#Production stage
FROM node:alpine AS production
USER node
WORKDIR /app
COPY --chown=node:node --from=build /app/node_modules /app/node_modules
COPY --chown=node:node . /app
EXPOSE 3001
CMD ["node", "dist/index.js"]