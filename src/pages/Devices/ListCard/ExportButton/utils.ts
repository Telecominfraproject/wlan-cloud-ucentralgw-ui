import { axiosGw, axiosProv } from 'constants/axiosInstances';
import { DeviceWithStatus } from 'hooks/Network/Devices';
import { InventoryTag } from 'hooks/Network/Inventory';

export type ExportedDeviceInfo = {
  serialNumber: string;
  connected: 'true' | 'false';
  firmware: string;
  memory: number;
  load: number;
  temperature: number;
  sanity: number;
  revision: string;
  ip: string;
  /** Venue, Entity or subscriber name */
  provisioning: string;
  radiusSessions: number;
  /** Uptime in seconds */
  uptime: number;
  /** Last Contact as date */
  lastContact: string;
  /** Last Upgrade as date */
  lastUpgrade: string;
  /** Rx MBs  */
  rx: number;
  /** Tx MBs  */
  tx: number;
  twoG: number;
  fiveG: number;
  sixG: number;
  /** Expiry as date */
  certificateExpiry: string;
};

const getDevicesProvisioningStatus = async (serialNumbers: string[]) =>
  serialNumbers.length === 0
    ? []
    : axiosProv
        .get(`inventory?withExtendedInfo=true&select=${serialNumbers}`)
        .then(({ data }: { data: { taglist: InventoryTag[] } }) =>
          serialNumbers.map((serialNumber) => {
            const found = data.taglist.find((tag) => tag.serialNumber === serialNumber);

            let provisioning = 'Not Found';

            if (found) {
              if (found.entity.length > 0) provisioning = found.extendedInfo?.entity?.name ?? found.entity;
              else if (found.venue.length > 0) provisioning = found.extendedInfo?.venue?.name ?? found.venue;
              else if (found.subscriber.length > 0)
                provisioning = found.extendedInfo?.subscriber?.name ?? found.subscriber;
            }

            return {
              serialNumber,
              provisioning,
            };
          }),
        )
        .catch(() => []);

const getDeviceGatewayInfo = (limit: number, offset: number) =>
  axiosGw
    .get(`devices?deviceWithStatus=true&limit=${limit}&offset=${offset}`)
    .then((response) => response.data) as Promise<{ devicesWithStatus: DeviceWithStatus[] }>;

const getAllGatewayDeviceInfo = async (
  count: number,
  initialProgress: number,
  setProgress: (progress: number) => void,
) => {
  const progressStep = (90 - initialProgress) / Math.ceil(count / 100);
  let newProgress = initialProgress;
  let offset = 0;
  let devices: DeviceWithStatus[] = [];
  let devicesResponse: { devicesWithStatus: DeviceWithStatus[] };
  do {
    // eslint-disable-next-line no-await-in-loop
    devicesResponse = await getDeviceGatewayInfo(100, offset);
    devices = devices.concat(devicesResponse.devicesWithStatus);
    setProgress((newProgress += progressStep));
    offset += 100;
  } while (devicesResponse.devicesWithStatus.length === 100);

  return devices;
};

export const getAllExportedDevicesInfo = async (setProgress: (progress: number) => void) => {
  // Base Setup
  setProgress(0);
  const devicesCount = await axiosGw.get('devices?countOnly=true').then((response) => response.data.count as number);
  setProgress(10);

  if (devicesCount === 0) {
    setProgress(100);
    return [];
  }

  // Get Devices Info
  const devices = await getAllGatewayDeviceInfo(devicesCount, 10, setProgress);

  const serialNumbers = devices
    .filter((device) => device.entity.length > 0 || device.venue.length > 0 || device.subscriber.length > 0)
    .map((device) => device.serialNumber);
  const provisioningStatus = await getDevicesProvisioningStatus(serialNumbers);

  setProgress(95);

  const unixToStr = (unixValue: number) => {
    try {
      return new Date(unixValue * 1000).toISOString();
    } catch (e) {
      return '';
    }
  };
  const exportedDevicesInfo: ExportedDeviceInfo[] = devices.map((device) => {
    const provisioning = provisioningStatus.find((status) => status.serialNumber === device.serialNumber)?.provisioning;
    return {
      serialNumber: device.serialNumber,
      connected: device.connected ? 'true' : 'false',
      firmware: device.firmware,
      memory: device.memoryUsed,
      load: device.load,
      temperature: device.temperature,
      sanity: device.sanity,
      revision: device.compatible,
      ip: device.ipAddress.length > 0 ? device.ipAddress : '',
      provisioning: provisioning ?? '',
      radiusSessions: typeof device.hasRADIUSSessions === 'number' ? device.hasRADIUSSessions : 0,
      uptime: !device.connected || device.started === 0 ? 0 : Math.floor(Date.now() / 1000 - device.started),
      lastContact: typeof device.lastContact === 'string' ? '' : unixToStr(device.lastContact),
      lastUpgrade: typeof device.lastFWUpdate === 'string' ? '' : unixToStr(device.lastFWUpdate),
      rx: device.rxBytes / 1024 / 1024,
      tx: device.txBytes / 1024 / 1024,
      twoG: device.associations_2G,
      fiveG: device.associations_5G,
      sixG: device.associations_6G,
      certificateExpiry: device.certificateExpiryDate ? unixToStr(device.certificateExpiryDate) : '',
    };
  });

  setProgress(100);
  return exportedDevicesInfo;
};

const getSelectDevicesGatewayInfo = (serialNumbers: string[]) =>
  axiosGw
    .get(`devices?deviceWithStatus=true&select=${serialNumbers.join(',')}`)
    .then((response) => response.data) as Promise<{ devicesWithStatus: DeviceWithStatus[] }>;

export const getSelectExportedDevicesInfo = async (
  serialNumbers: string[],
  setProgress: (progress: number) => void,
) => {
  // Base Setup
  setProgress(0);
  const devicesCount = serialNumbers.length;
  setProgress(10);

  if (devicesCount === 0) {
    setProgress(100);
    return [];
  }

  // Get Devices Info
  const devices = (await getSelectDevicesGatewayInfo(serialNumbers)).devicesWithStatus;
  setProgress(90);

  const provSerialNumbers = devices
    .filter((device) => device.entity.length > 0 || device.venue.length > 0 || device.subscriber.length > 0)
    .map((device) => device.serialNumber);
  const provisioningStatus = await getDevicesProvisioningStatus(provSerialNumbers);

  setProgress(95);

  const unixToStr = (unixValue: number) => {
    try {
      return new Date(unixValue * 1000).toISOString();
    } catch (e) {
      return '';
    }
  };
  const exportedDevicesInfo: ExportedDeviceInfo[] = devices.map((device) => {
    const provisioning = provisioningStatus.find((status) => status.serialNumber === device.serialNumber)?.provisioning;
    return {
      serialNumber: device.serialNumber,
      connected: device.connected ? 'true' : 'false',
      firmware: device.firmware,
      memory: device.memoryUsed,
      load: device.load,
      temperature: device.temperature,
      sanity: device.sanity,
      revision: device.compatible,
      ip: device.ipAddress.length > 0 ? device.ipAddress : '',
      provisioning: provisioning ?? '',
      radiusSessions: typeof device.hasRADIUSSessions === 'number' ? device.hasRADIUSSessions : 0,
      uptime: !device.connected || device.started === 0 ? 0 : Math.floor(Date.now() / 1000 - device.started),
      lastContact: typeof device.lastContact === 'string' ? '' : unixToStr(device.lastContact),
      lastUpgrade: typeof device.lastFWUpdate === 'string' ? '' : unixToStr(device.lastFWUpdate),
      rx: device.rxBytes / 1024,
      tx: device.txBytes / 1024,
      twoG: device.associations_2G,
      fiveG: device.associations_5G,
      sixG: device.associations_6G,
      certificateExpiry: device.certificateExpiryDate ? unixToStr(device.certificateExpiryDate) : '',
    };
  });

  setProgress(100);
  return exportedDevicesInfo;
};
