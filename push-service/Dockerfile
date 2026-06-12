FROM node:20-alpine

# tzdata so TZ=Europe/Madrid applies to Date and node-cron
RUN apk add --no-cache tzdata

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY index.js ./

ENV NODE_ENV=production
CMD ["node", "index.js"]
