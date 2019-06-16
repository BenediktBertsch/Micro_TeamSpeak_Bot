FROM node:10-slim

ENV APIport=
ENV APIhost=""
ENV TShost=""
ENV TSqueryport=
ENV TSserverport=
ENV TSqueryusername=""
ENV TSquerypassword=""
ENV TSnickname=""
ENV runningPort=3000

WORKDIR /nodeapp
COPY package.json /nodeapp
COPY package-lock.json /nodeapp
COPY config.json /nodeapp
COPY index.js /nodeapp
RUN npm install
CMD ["node", "index.js"]
EXPOSE 3000