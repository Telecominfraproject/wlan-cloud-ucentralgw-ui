import React from 'react';
import { useGetAllDeviceScripts } from 'hooks/Network/Scripts';

const useScriptsTable = () => {
  const getScripts = useGetAllDeviceScripts();
  const hiddenColumns = React.useState<string[]>([]);

  return {
    query: getScripts,
    hiddenColumns,
  };
};

export default useScriptsTable;
