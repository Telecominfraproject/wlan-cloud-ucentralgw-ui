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
npm run dev
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

You can control the uCentral Security Service URL (uCentralSec) by modifying the ENV variable "VITE_UCENTRALSEC_URL". There is an example .env file located at the root of this repository.
Here are the current default values:

```
VITE_UCENTRALSEC_URL="https://ucentral.dpaas.arilia.com:16001"
```
