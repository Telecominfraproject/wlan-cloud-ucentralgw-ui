import { isAxiosError } from 'axios';
import { DefaultFirmware, createDefaultFirmware } from 'hooks/Network/DefaultFirmware';

export type CreateDefaultFirmwareResult =
  | {
      deviceType: string;
      error?: undefined;
    }
  | {
      deviceType: string;
      error: string;
    };

export const createFms = async (defaultFirmware: DefaultFirmware): Promise<CreateDefaultFirmwareResult> =>
  createDefaultFirmware(defaultFirmware)
    .then(() => ({
      deviceType: defaultFirmware.deviceType,
    }))
    .catch((e) => ({
      deviceType: defaultFirmware.deviceType,
      error: isAxiosError(e) ? e.response?.data?.ErrorDescription : 'Unknown error',
    }));

export const createDefaultFirmwareBatch = async (
  defaultFirmware: DefaultFirmware[],
): Promise<CreateDefaultFirmwareResult[]> => {
  const promises = defaultFirmware.map((fms) => createFms(fms));
  const responses = await Promise.all(promises);
  return responses;
};
