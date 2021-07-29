import React, { useState, useEffect } from 'react';
import { useAuth } from 'contexts/AuthProvider';
import { useTranslation } from 'react-i18next';
import { DeviceDashboard as Dashboard } from 'ucentral-libs';
import axiosInstance from 'utils/axiosInstance';

const DeviceDashboard = () => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    status: {
      datasets: [],
      labels: [],
    },
    healths: {
      datasets: [],
      labels: [],
    },
    upTimes: {
      datasets: [],
      labels: [],
    },
    deviceType: {
      datasets: [],
      labels: [],
    },
    vendors: {
      datasets: [],
      labels: [],
    },
    certificates: {
      datasets: [],
      labels: [],
    },
    commands: {
      datasets: [],
      labels: [],
    },
    memoryUsed: {
      datasets: [],
      labels: [],
    },
  });

  const parseData = (newData) => {
    const parsedData = newData;

    // Status pie chart
    const statusDs = [];
    const statusColors = [];
    const statusLabels = [];
    for (const point of parsedData.status) {
      statusDs.push(point.value);
      statusLabels.push(point.tag);
      let color = '';
      switch (point.tag) {
        case 'connected':
          color = '#41B883';
          break;
        case 'not connected':
          color = '#39f';
          break;
        default:
          break;
      }
      statusColors.push(color);
    }
    parsedData.status = {
      datasets: [
        {
          data: statusDs,
          backgroundColor: statusColors,
        },
      ],
      labels: statusLabels,
    };

    // Health pie chart
    const healthDs = [];
    const healthColors = [];
    const healthLabels = [];
    for (const point of parsedData.healths) {
      healthDs.push(point.value);
      healthLabels.push(point.tag);
      let color = '';
      switch (point.tag) {
        case '100%':
          color = '#41B883';
          break;
        case '>60%':
          color = '#f9b115';
          break;
        case '<60%%>':
          color = '#e55353';
          break;
        default:
          color = '#39f';
          break;
      }
      healthColors.push(color);
    }
    parsedData.healths = {
      datasets: [
        {
          data: healthDs,
          backgroundColor: healthColors,
        },
      ],
      labels: healthLabels,
    };

    // Uptime bar chart
    const uptimeDs = [];
    const uptimeColors = [];
    const uptimeLabels = [];
    for (const point of parsedData.upTimes) {
      uptimeDs.push(point.value);
      uptimeLabels.push(point.tag);
      uptimeColors.push('#39f');
    }
    parsedData.upTimes = {
      datasets: [
        {
          label: 'Devices',
          data: uptimeDs,
          backgroundColor: uptimeColors,
        },
      ],
      labels: uptimeLabels,
    };

    // Vendors bar chart
    const vendorsTypeDs = [];
    const vendorsColors = [];
    const vendorsLabels = [];
    const sortedVendors = parsedData.vendors.sort((a, b) => (a.value < b.value ? 1 : -1));
    for (const point of sortedVendors) {
      vendorsTypeDs.push(point.value);
      vendorsLabels.push(point.tag === '' ? 'Unknown' : point.tag);
      vendorsColors.push('#eb7474');
    }
    parsedData.vendors = {
      datasets: [
        {
          label: 'Devices',
          data: vendorsTypeDs.slice(0, 5),
          backgroundColor: vendorsColors,
        },
      ],
      labels: vendorsLabels.slice(0, 5),
    };

    // Device Type pie chart
    const deviceTypeDs = [];
    const deviceTypeColors = [];
    const deviceTypeLabels = [];
    for (const point of parsedData.deviceType) {
      deviceTypeDs.push(point.value);
      deviceTypeLabels.push(point.tag);
      let color = '';
      switch (point.tag) {
        case '100%':
          color = '#41B883';
          break;
        case '>60%':
          color = '#f9b115';
          break;
        case '<60%%>':
          color = '#e55353';
          break;
        default:
          color = '#39f';
          break;
      }
      deviceTypeColors.push(color);
    }
    parsedData.deviceType = {
      datasets: [
        {
          data: deviceTypeDs,
          backgroundColor: deviceTypeColors,
        },
      ],
      labels: deviceTypeLabels,
    };

    // Certificates pie chart
    const certificatesDs = [];
    const certificatesColors = [];
    const certificatesLabels = [];
    for (const point of parsedData.certificates) {
      certificatesDs.push(point.value);
      certificatesLabels.push(point.tag);
      let color = '';
      switch (point.tag) {
        case 'verified':
          color = '#41B883';
          break;
        case 'serial mismatch':
          color = '#f9b115';
          break;
        case 'no certificate':
          color = '#e55353';
          break;
        default:
          color = '#39f';
          break;
      }
      certificatesColors.push(color);
    }
    parsedData.certificates = {
      datasets: [
        {
          data: certificatesDs,
          backgroundColor: certificatesColors,
        },
      ],
      labels: certificatesLabels,
    };

    // Commands bar chart
    const commandsDs = [];
    const commandsColors = [];
    const commandsLabels = [];
    for (const point of parsedData.commands) {
      commandsDs.push(point.value);
      commandsLabels.push(point.tag);
      commandsColors.push('#39f');
    }
    parsedData.commands = {
      datasets: [
        {
          label: t('common.commands_executed'),
          data: commandsDs,
          backgroundColor: commandsColors,
        },
      ],
      labels: commandsLabels,
    };

    // Memory Used bar chart
    const memoryDs = [];
    const memoryColors = [];
    const memoryLabels = [];
    for (const point of parsedData.memoryUsed) {
      memoryDs.push(point.value);
      memoryLabels.push(point.tag);
      memoryColors.push('#636f83');
    }
    parsedData.memoryUsed = {
      datasets: [
        {
          label: 'Devices',
          data: memoryDs,
          backgroundColor: memoryColors,
        },
      ],
      labels: memoryLabels,
    };

    setData(parsedData);
  };

  const getDashboard = () => {
    setLoading(true);

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };
    axiosInstance
      .get(`${endpoints.ucentralgw}/api/v1/deviceDashboard`, {
        headers,
      })
      .then((response) => {
        parseData(response.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getDashboard();
  }, []);

  return <Dashboard loading={loading} t={t} data={data} />;
};

export default DeviceDashboard;
