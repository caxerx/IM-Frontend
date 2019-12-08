# Instant Message Front End

## Tested Environment
node 12.11.1
yarn 1.19.1

## Configuration
Some config is required on .env file.
VUE_APP_BASE_URL - The base url of api server. (Please make sure CORS setting on server is correct)
VUE_APP_PUSHER_APP_KEY - Pusher APP Key
VUE_APP_PUSHER_APP_CLUSTER - Pusher APP Cluster

## Step to run
The program can be run on development mode or production mode. In the developement mode, it run on a node.js web server.


In the production mode, it compiles the project into a static website (HTML+CSS+JS). It require a web server to run, open index.html on local will not work.


### 1. Install all dependency

```
yarn install
```

### 2. Start the developement environment
```
yarn serve
```

### 3. Compile the file into the production mode
```
yarn build
```