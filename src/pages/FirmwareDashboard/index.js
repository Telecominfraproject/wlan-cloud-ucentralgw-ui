import React, { useState, useEffect } from 'react';
import { useAuth } from 'contexts/AuthProvider';
import { useTranslation } from 'react-i18next';
import { FirmwareDashboard as Dashboard } from 'ucentral-libs';
import axiosInstance from 'utils/axiosInstance';
import colors from 'utils/colors';

const FirmwareDashboard = () => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    status: {
      datasets: [],
      labels: [],
    },
    deviceType: {
      datasets: [],
      labels: [],
    },
    firmwareDistribution: {
      datasets: [],
      labels: [],
    },
    latest: {
      datasets: [],
      labels: [],
    },
    unknownFirmwares: {
      datasets: [],
      labels: [],
    },
    ouis: {
      datasets: [],
      labels: [],
    },
    endpoints: {
      datasets: [],
      labels: [],
    },
  });

  const getOuiInfo = async (oui) => {
    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };

    return axiosInstance
      .get(`${endpoints.ucentralgw}/api/v1/ouis?macList=${oui.join(',')}`, {
        headers,
      })
      .then((response) => {
        const matchedObject = {};
        for (let i = 0; i < response.data.tagList.length; i += 1) {
          matchedObject[oui[i]] = response.data.tagList[i];
        }
        return matchedObject;
      })
      .catch(() => {});
  };

  const parseData = async (newData) => {
    const parsedData = newData;

    // Status pie chart
    const statusDs = [];
    const statusColors = [];
    const statusLabels = [];
    const totalDevices = parsedData.status.reduce((acc, point) => acc + point.value, 0);
    for (const point of parsedData.status) {
      statusDs.push(Math.round((point.value / totalDevices) * 100));
      statusLabels.push(point.tag);
      let color = '';
      switch (point.tag) {
        case 'connected':
          color = '#41B883';
          break;
        case 'not connected':
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

    // Device Type pie chart
    const deviceTypeDs = [];
    const deviceTypeColors = [];
    const deviceTypeLabels = [];
    for (let i = 0; i < parsedData.deviceTypes.length; i += 1) {
      const point = parsedData.deviceTypes[i];

      deviceTypeDs.push(point.value);
      deviceTypeLabels.push(point.tag);
      deviceTypeColors.push(colors[i]);
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

    // Latest/unknown distribution
    const unknownFirmware = parsedData.unknownFirmwares.reduce(
      (acc, firmware) => acc + firmware.value,
      0,
    );
    const usingLatestFirmware = parsedData.usingLatest.reduce(
      (acc, firmware) => acc + firmware.value,
      0,
    );
    parsedData.firmwareDistribution = {
      datasets: [
        {
          label: t('common.devices'),
          data: [unknownFirmware, usingLatestFirmware],
          backgroundColor: ['#e55353', '#41B883'],
        },
      ],
      labels: [t('common.unknown'), t('common.latest')],
    };

    // Latest firmware distribution
    const latestDs = [];
    const latestColors = [];
    const latestLabels = [];
    const usingLatest = parsedData.usingLatest.sort((a, b) => (a.value < b.value ? 1 : -1));
    for (const point of usingLatest) {
      latestDs.push(point.value);
      if (point.tag === '') {
        latestLabels.push('Unknown');
      } else if (point.tag.split(' / ').length > 1) {
        latestLabels.push(point.tag.split(' / ')[1]);
      } else {
        latestLabels.push(point.tag);
      }
      latestColors.push('#39f');
    }
    parsedData.latest = {
      datasets: [
        {
          label: t('common.firmware'),
          data: latestDs.slice(0, 5),
          backgroundColor: latestColors,
        },
      ],
      labels: latestLabels.slice(0, 5),
    };

    // Unknown firmware distribution
    const unknownDs = [];
    const unknownColors = [];
    const unknownLabels = [];
    const unknownFirmwares = parsedData.unknownFirmwares.sort((a, b) =>
      a.value < b.value ? 1 : -1,
    );
    for (const point of unknownFirmwares) {
      unknownDs.push(point.value);
      if (point.tag === '') {
        unknownLabels.push('Unknown');
      } else if (point.tag.split(' / ').length > 1) {
        unknownLabels.push(point.tag.split(' / ')[1]);
      } else {
        unknownLabels.push(point.tag);
      }

      unknownColors.push('#39f');
    }
    parsedData.unknownFirmwares = {
      datasets: [
        {
          label: t('common.firmware'),
          data: unknownDs.slice(0, 5),
          backgroundColor: unknownColors,
        },
      ],
      labels: unknownLabels.slice(0, 5),
    };

    // OUIs bar graph
    const ouisDs = [];
    const ouisColors = [];
    let ouisLabels = [];
    const sortedOuis = parsedData.ouis.sort((a, b) => (a.value < b.value ? 1 : -1));
    for (const point of sortedOuis) {
      ouisDs.push(point.value);
      ouisLabels.push(point.tag === '' ? 'Unknown' : point.tag);
      ouisColors.push('#39f');
    }
    const ouiDetails = await getOuiInfo(ouisLabels);
    if (ouiDetails !== null) {
      ouisLabels = ouisLabels.map((label) => {
        if (ouiDetails[label]?.value === undefined) {
          return label;
        }
        return ouiDetails[label].value === '' ? 'Unknown' : ouiDetails[label].value;
      });
    }

    parsedData.ouis = {
      datasets: [
        {
          label: 'OUIs',
          data: ouisDs.slice(0, 5),
          backgroundColor: ouisColors,
        },
      ],
      labels: ouisLabels.slice(0, 5),
    };

    // Endpoints pie chart
    const endpointsDs = [];
    const endpointsColors = [];
    const endpointsLabels = [];
    for (const point of parsedData.endPoints) {
      endpointsDs.push(point.value);
      endpointsLabels.push(point.tag);
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

    parsedData.endpoints = {
      datasets: [
        {
          data: endpointsDs,
          backgroundColor: endpointsColors,
        },
      ],
      labels: endpointsLabels,
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
      .get(`${endpoints.ucentralfms}/api/v1/deviceReport`, {
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

export default FirmwareDashboard;
