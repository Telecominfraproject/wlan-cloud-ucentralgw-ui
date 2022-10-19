import { axiosFms } from 'constants/axiosInstances';
import { useQuery } from 'react-query';

const useGetDeviceTypes = () =>
  useQuery(['get-device-types'], () => axiosFms.get('/firmwares?deviceSet=true').then(({ data }) => data.deviceTypes), {
    staleTime: Infinity,
  });

export default useGetDeviceTypes;
