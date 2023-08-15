FROM node:20-bullseye

WORKDIR /home/workflowish 

COPY package.json . 
COPY package-lock.json . 
RUN npm install .

COPY . . 
RUN npm run build
ENTRYPOINT ["/bin/bash", "-c", "npm run start-backend"]