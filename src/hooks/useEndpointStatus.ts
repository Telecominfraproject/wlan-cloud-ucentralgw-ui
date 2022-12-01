import { useAuth } from 'contexts/AuthProvider';

export const useEndpointStatus = (endpoint: string) => {
  const { token, endpoints } = useAuth();

  return {
    isReady: !!token && !!endpoints && !!endpoints[endpoint],
  };
};
