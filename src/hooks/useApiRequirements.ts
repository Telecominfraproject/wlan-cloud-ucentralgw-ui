import { useMemo } from 'react';
import { secUrl } from '../constants/axiosInstances';
import { useGetRequirements } from './Network/Requirements';

// eslint-disable-next-line import/prefer-default-export
export const useApiRequirements = () => {
  const { data: requirements } = useGetRequirements();

  const getLinkFromResponse = (isAccess: boolean, apiResult?: string) => {
    if (!apiResult && isAccess) return `${secUrl.split('/api/v1')[0]}/wwwassets/access_policy.html`;
    if (!apiResult && !isAccess) return `${secUrl.split('/api/v1')[0]}/wwwassets/password_policy.html`;

    if (apiResult?.startsWith('https')) return apiResult;
    return `${secUrl.split('/api/v1')[0]}${apiResult}`;
  };

  const toReturn = useMemo(
    () => ({
      accessPolicyLink: getLinkFromResponse(true, requirements?.accessPolicy),
      passwordPattern: requirements?.passwordPattern ?? null,
      passwordPolicyLink: getLinkFromResponse(false, requirements?.passwordPolicy),
      isLoaded: requirements !== undefined && requirements !== null,
    }),
    [requirements],
  );

  return toReturn;
};
