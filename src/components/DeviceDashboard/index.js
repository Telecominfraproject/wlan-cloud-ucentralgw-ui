import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DeviceDashboard as Dashboard, useAuth, COLOR_LIST } from 'ucentral-libs';
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
    associations: {
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
    let totalDevices = parsedData.status.reduce((acc, point) => acc + point.value, 0);
    for (const point of parsedData.status) {
      statusDs.push(Math.round((point.value / totalDevices) * 100));
      statusLabels.push(point.tag);
      let color = '';
      switch (point.tag) {
        case 'connected':
          color = '#41B883';
          break;
        case 'not connected':
          color = '#39f';
          break;
        case 'disconnected':
          color = '#e55353';
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

    // General Health
    let devicesAt100 = 0;
    let devicesUp90 = 0;
    let devicesUp60 = 0;
    let devicesDown60 = 0;

    // Health pie chart
    const healthDs = [];
    const healthColors = [];
    const healthLabels = [];
    totalDevices = parsedData.healths.reduce((acc, point) => acc + point.value, 0);
    for (const point of parsedData.healths) {
      healthDs.push(Math.round((point.value / totalDevices) * 100));
      healthLabels.push(point.tag);
      let color = '';
      switch (point.tag) {
        case '100%':
          color = '#41B883';
          devicesAt100 += point.value;
          break;
        case '>90%':
          color = '#ffff5c';
          devicesUp90 += point.value;
          break;
        case '>60%':
          color = '#f9b115';
          devicesUp60 += point.value;
          break;
        case '<60%':
          color = '#e55353';
          devicesDown60 += point.value;
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
    parsedData.overallHealth =
      totalDevices === 0
        ? '-'
        : `${Math.round(
            (devicesAt100 * 100 + devicesUp90 * 95 + devicesUp60 * 75 + devicesDown60 * 35) /
              totalDevices,
          )}%`;

    // Associations pie chart
    const associationsDs = [];
    const associationsColors = [];
    const associationsLabels = [];
    const totalAssociations = parsedData.associations.reduce((acc, point) => acc + point.value, 0);
    for (let i = 0; i < parsedData.associations.length; i += 1) {
      const point = parsedData.associations[i];
      associationsDs.push(Math.round((point.value / totalAssociations) * 100));
      associationsLabels.push(point.tag);

      switch (parsedData.associations[i].tag) {
        case '2G':
          associationsColors.push('#41B883');
          break;
        case '5G':
          associationsColors.push('#3399ff');
          break;
        default:
          associationsColors.push('#636f83');
          break;
      }
    }
    parsedData.totalAssociations = totalAssociations;
    parsedData.associations = {
      datasets: [
        {
          data: associationsDs,
          backgroundColor: associationsColors,
        },
      ],
      labels: associationsLabels,
    };

    // Uptime bar chart
    const uptimeDs = [0, 0, 0, 0];
    const uptimeLabels = ['now', '>day', '>week', '>month'];
    const uptimeColors = ['#321fdb', '#321fdb', '#321fdb', '#321fdb'];

    for (const point of parsedData.upTimes) {
      switch (point.tag) {
        case 'now':
          uptimeDs[0] = point.value;
          break;
        case '>day':
          uptimeDs[1] = point.value;
          break;
        case '>week':
          uptimeDs[2] = point.value;
          break;
        case '>month':
          uptimeDs[3] = point.value;
          break;
        default:
          uptimeDs.push(point.value);
          uptimeLabels.push(point.tag);
          uptimeColors.push('#321fdb');
      }
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
    const otherVendors = vendorsTypeDs.slice(5).reduce((acc, vendor) => acc + vendor, 0);
    parsedData.vendors = {
      datasets: [
        {
          label: 'Devices',
          data: vendorsTypeDs.slice(0, 5).concat([otherVendors]),
          backgroundColor: vendorsColors,
        },
      ],
      labels: vendorsLabels.slice(0, 5).concat(['Others']),
    };

    // Device Type pie chart
    const deviceTypeDs = [];
    const deviceTypeColors = [];
    const deviceTypeLabels = [];
    const sortedTypes = parsedData.deviceType.sort((a, b) => (a.value < b.value ? 1 : -1));
    for (let i = 0; i < sortedTypes.length; i += 1) {
      const point = sortedTypes[i];

      deviceTypeDs.push(point.value);
      deviceTypeLabels.push(point.tag);
      deviceTypeColors.push(COLOR_LIST[i]);
    }
    const otherTypes = deviceTypeDs.slice(5).reduce((acc, type) => acc + type, 0);
    parsedData.deviceType = {
      datasets: [
        {
          data: deviceTypeDs.slice(0, 5).concat([otherTypes]),
          backgroundColor: deviceTypeColors,
        },
      ],
      labels: deviceTypeLabels.slice(0, 5).concat(['Others']),
    };

    // Certificates pie chart
    const certificatesDs = [];
    const certificatesColors = [];
    const certificatesLabels = [];
    const totalCerts = parsedData.certificates.reduce((acc, point) => acc + point.value, 0);
    for (const point of parsedData.certificates) {
      certificatesDs.push(Math.round((point.value / totalCerts) * 100));
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
      .get(`${endpoints.owgw}/api/v1/deviceDashboard`, {
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
