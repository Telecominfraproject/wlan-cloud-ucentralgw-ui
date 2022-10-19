import { useQuery } from '@tanstack/react-query';
import { axiosSec } from '../../constants/axiosInstances';

// eslint-disable-next-line import/prefer-default-export
export const useGetRequirements = () =>
  useQuery(['get-requirements'], () => axiosSec.post('oauth2?requirements=true', {}).then(({ data }) => data), {
    staleTime: Infinity,
  });
