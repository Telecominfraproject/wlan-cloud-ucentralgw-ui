import { QueryFunctionContext, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { axiosGw } from 'constants/axiosInstances';
import { AtLeast } from 'models/General';

export type DefaultFirmware = {
  deviceType: string;
  description: string;
  uri: string;
  revision: string;
  imageCreationDate: number;
  created: number;
  lastModified: number;
};

export type DefaultFirmwareResponse = {
  firmwares: DefaultFirmware[];
};

const getDefaultFirmware = async () =>
  axiosGw.get('default_firmwares').then((response) => response.data as DefaultFirmwareResponse);

export const useGetDefaultFirmware = () =>
  useQuery(['default_firmwares', 'all'], getDefaultFirmware, {
    staleTime: 1000 * 60,
  });

const getDefaultFirmwareByDeviceType = async (context: QueryFunctionContext<[string, string]>) =>
  axiosGw.get(`default_firmware/${context.queryKey[1]}`).then((response) => response.data as DefaultFirmware);

export const useGetDefaultFirmwareByDeviceType = (deviceType: string) =>
  useQuery(['default_firmwares', deviceType], getDefaultFirmwareByDeviceType);

export const createDefaultFirmware = async (defaultFirmware: DefaultFirmware) =>
  axiosGw
    .post(`default_firmware/${defaultFirmware.deviceType}`, defaultFirmware)
    .then((response) => response.data as DefaultFirmware);

export const useCreateDefaultFirmware = () => {
  const queryClient = useQueryClient();

  return useMutation(createDefaultFirmware, {
    onSuccess: () => {
      queryClient.invalidateQueries(['default_firmwares']);
    },
  });
};

const deleteDefaultFirmware = async (deviceType: string) =>
  axiosGw.delete(`default_firmware/${deviceType}`).then((response) => response.data as DefaultFirmware);

export const useDeleteDefaultFirmware = () => {
  const queryClient = useQueryClient();

  return useMutation(deleteDefaultFirmware, {
    onSuccess: () => {
      queryClient.invalidateQueries(['default_firmwares']);
    },
  });
};

const deleteBatchDefaultFirmware = async (deviceTypes: string[]) => {
  const promises = deviceTypes.map((deviceType) =>
    axiosGw
      .delete(`default_firmware/${deviceType}`)
      .then(() => ({
        deviceType,
        success: true,
      }))
      .catch((e) => ({
        deviceType,
        error: axios.isAxiosError(e) ? e.response?.data.ErrorDescription : e,
      })),
  );
  const res = await Promise.allSettled(promises);

  return res;
};

export const useDeleteBatchDefaultFirmware = () => {
  const queryClient = useQueryClient();

  return useMutation(deleteBatchDefaultFirmware, {
    onSuccess: () => {
      queryClient.invalidateQueries(['default_firmwares']);
    },
  });
};

export const updateDefaultFirmware = async (defaultFirmware: AtLeast<DefaultFirmware, 'deviceType'>) =>
  axiosGw
    .put(`default_firmware/${defaultFirmware.deviceType}`, defaultFirmware)
    .then((response) => response.data as DefaultFirmware);

export const useUpdateDefaultFirmware = () => {
  const queryClient = useQueryClient();

  return useMutation(updateDefaultFirmware, {
    onSuccess: () => {
      queryClient.invalidateQueries(['default_firmwares']);
    },
  });
};
