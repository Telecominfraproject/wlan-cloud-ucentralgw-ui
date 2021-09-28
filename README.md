# uCentralGW UI

## What is this?
The uCentralGW Client is a user interface that lets you monitor and manage devices connected to the [uCentral gateway](https://github.com/Telecominfraproject/wlan-cloud-ucentralgw). To use the interface,
you either need to run it on your machine for [development](#development) or build it for [production](#production).

NOTE: This UI will be evolving as micro services are added to the uCentral program most notably with provisioning, base dashboard, firmware, device management

## Running the solution

### Development
You need to run these commands in the root folder of the project and also have npm installed on your machine.
```
git clone https://github.com/Telecominfraproject/wlan-cloud-ucentralgw-ui
cd wlan-cloud-ucentralgw-ui
npm install
npm start
```

Run these commands if you want to run the solution on your machine while also doing development on the [uCentral UI Library](https://github.com/Telecominfraproject/wlan-cloud-ucentral-ui-libs).
```
git clone https://github.com/Telecominfraproject/wlan-cloud-ucentralgw-ui
git clone https://github.com/Telecominfraproject/wlan-cloud-ucentral-ui-libs
cd wlan-cloud-ucentralgw-ui
npm link ../wlan-cloud-ucentral-ui-libs // Add sudo at the start of this command if it fails because of permissions
npm start
```

### Production
You need to run this in the root folder of the project and also have npm installed on your machine.
```
git clone https://github.com/Telecominfraproject/wlan-cloud-ucentralgw-ui
cd wlan-cloud-ucentralgw-ui
npm install
npm run build
```
Once the build is done, you can move the `build` folder on your server.

### Configuration
You must change the `config.json` file in `public` directory to point to your uCentral Security Service URL (uCentralSec). You may also limit the ability for users to change the default uCentralSec. If you do not allow a uCentralSec change, the uCentralSec URL will not appear on the login screen. 

Here are the current default values: 
```
{
  "DEFAULT_UCENTRALSEC_URL": "https://ucentral.dpaas.arilia.com:16001",
  "ALLOW_UCENTRALSEC_CHANGE": false
}
```
