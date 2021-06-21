# uCentralGW UI

## What is this?
The uCentralGW Client is a user interface that lets you monitor and manage devices connected to the [uCentral gateway](https://github.com/Telecominfraproject/wlan-cloud-ucentralgw). To use the interface,
you either need to run it on your machine for [development](#development) or build it for [production](#production).

## Running the solution

### Development
Here are the instructions to run the solution on your machine for development purposes. You need to run these in the root folder of the project and also have npm installed on your machine. Please install `npm` for the platform you are using.
```
git clone https://github.com/Telecominfraproject/wlan-cloud-ucentralgw-ui
cd wlan-cloud-ucentralgw-ui
npm install
npm start
```
### Production
Here are the instructions to build the production veresion of the application. You need to run this in the root folder of the project and also have npm installed on your machine.
```
git clone https://github.com/Telecominfraproject/wlan-cloud-ucentralgw-ui
cd wlan-cloud-ucentralgw-ui
npm run build
```
Once the build is done, you can move the `build` folder on your server.

### Environment variables
There are two environment variables currently used to control the gateway URL and also controlling if the users can modify the gateway URL. You can modify these values in the `.env` file located in the root of the project. 

During development, you will need to stop and start the project again to see those changes come into effect.
```asm
REACT_APP_DEFAULT_GATEWAY_URL=https://ucentral.dpaas.arilia.com:16001
REACT_APP_ALLOW_GATEWAY_CHANGE=false
```
- `REACT_APP_DEFAULT_GATEWAY_URL` points to the actual uCentral gateway, including the port.
- `REACT_APP_ALLOW_GATEWAY_CHANGE` : when set to `true` will allow a user to change the gateway name she wants to use. When set to `false`, will not show a text field for the gateway and will only allow users to go to the gateway speficied in `REACT_APP_DEFAULT_GATEWAY_URL`.

