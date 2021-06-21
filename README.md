# uCentralGW UI

## What is this?
The uCentralGW Client is a user interface to be used a the uCentralGW server to manage and monitor devices. To use this project,
you either need to run it on your machine for [development](#development) or build it for [production](#production).

## Running the solution

### Development
Here are the instructions to run the solution on your machine for development purposes. You need to run these in the root folder of the project and also have npm installed on your machine.
```
npm install

npm start
```
### Production
Here are the instructions to build the production veresion of the application. You need to run this in the root folder of the project and also have npm installed on your machine.
```
npm run build
```
Once the build is done, you can move the 'build' folder on your server.

### Environment variables
There are two environment variables currently used to control the gateway URL and also controlling if the users can modify the gateway URL. You can modify these values by going to the .env file at the root of the project. 

During development, you will need to stop and start the project again to see those changes come into effect.
```asm
REACT_APP_DEFAULT_GATEWAY_URL=https://ucentral.dpaas.arilia.com:16001
REACT_APP_ALLOW_GATEWAY_CHANGE=false
```