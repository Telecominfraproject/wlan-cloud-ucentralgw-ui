# uCentralGW UI

## What is this?
The uCentralGW Client is a user interface that lets you monitor and manage devices connected to the [uCentral gateway](https://github.com/Telecominfraproject/wlan-cloud-ucentralgw). To use the interface,
you either need to run it on your machine for [development](#development) or build it for [production](#production).

NOTE: This UI will be evolving as micro services are added to the uCentral program most notably with provisioning, base dashboard, firmware, device management

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