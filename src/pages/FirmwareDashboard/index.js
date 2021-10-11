import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FirmwareDashboard as Dashboard, useAuth, COLOR_LIST } from 'ucentral-libs';
import axiosInstance from 'utils/axiosInstance';

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
    endpoints: [],
    latestSoftwareRate: '-',
  });

  const getOuiInfo = async (oui) => {
    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };

    return axiosInstance
      .get(`${endpoints.owgw}/api/v1/ouis?macList=${oui.join(',')}`, {
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
    const sortedTypes = parsedData.deviceTypes.sort((a, b) => (a.value < b.value ? 1 : -1));
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

    // Latest/unknown distribution
    const usingLatestFirmware =
      parsedData.usingLatest.length > 0
        ? parsedData.usingLatest.reduce((acc, firmware) => acc + firmware.value, 0)
        : 0;
    const unknownFirmware = parsedData.numberOfDevices - usingLatestFirmware;
    parsedData.usingLatestFirmware = usingLatestFirmware;
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

    if (
      parsedData.numberOfDevices === undefined ||
      Number.isNaN(parsedData.numberOfDevices) ||
      parsedData === 0
    ) {
      parsedData.latestSoftwareRate = '-';
    } else {
      parsedData.latestSoftwareRate = `${(
        (parsedData.usingLatestFirmware / parsedData.numberOfDevices) *
        100
      ).toFixed(1)}%`;
    }

    // Average firmware age calculation
    const usingUnknownFirmwareFromArray =
      parsedData.unknownFirmwares.length > 0
        ? parsedData.unknownFirmwares.reduce((acc, firmware) => acc + firmware.value, 0)
        : 0;
    const devicesForAverage = parsedData.numberOfDevices - usingUnknownFirmwareFromArray;

    if (parsedData.totalSecondsOld.length > 0) {
      parsedData.averageFirmwareAge =
        parsedData.totalSecondsOld[0].value /
        (devicesForAverage > 0 ? devicesForAverage : 1) /
        (24 * 60 * 60);
    } else {
      parsedData.averageFirmwareAge = 0;
    }

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
    const ouiCompleteInfo = [];
    const ouisLabels = [];
    const sortedOuis = parsedData.ouis.sort((a, b) => (a.value < b.value ? 1 : -1));
    for (const point of sortedOuis) {
      ouiCompleteInfo.push({
        value: point.value,
        tag: point.tag,
      });
      ouisLabels.push(point.tag === '' ? 'Unknown' : point.tag);
    }
    const ouiDetails = await getOuiInfo(ouisLabels);

    // Merging 'Good' labels with ouiCompleteInfo
    if (ouiDetails !== null) {
      for (let i = 0; i < ouiCompleteInfo.length; i += 1) {
        ouiCompleteInfo[i].label =
          ouiDetails[ouiCompleteInfo[i].tag].value !== undefined &&
          ouiDetails[ouiCompleteInfo[i].tag].value !== ''
            ? ouiDetails[ouiCompleteInfo[i].tag].value
            : 'Unknown';
      }
    }

    // Merging OUIs that have the same label that we got from getOuiInfo
    const finalOuis = {};
    for (const oui of ouiCompleteInfo) {
      if (finalOuis[oui.label] === undefined) {
        finalOuis[oui.label] = {
          label: oui.label,
          value: oui.value,
        };
      } else {
        finalOuis[oui.label] = {
          label: oui.label,
          value: finalOuis[oui.label].value + oui.value,
        };
      }
    }

    // Flattening finalOuis into an array so we can create the arrays necessary for the chart
    const finalOuisArr = Object.entries(finalOuis);
    const finalOuiDs = [];
    const finalOuiLabels = [];
    const finalOuiColors = [];
    for (const oui of finalOuisArr) {
      finalOuiDs.push(oui[1].value);
      finalOuiLabels.push(oui[1].label);
      finalOuiColors.push('#39f');
    }
    const totalOthers = finalOuiDs.slice(5).reduce((acc, oui) => acc + oui, 0);

    parsedData.ouis = {
      datasets: [
        {
          label: 'OUIs',
          data: finalOuiDs.slice(0, 5).concat(totalOthers),
          backgroundColor: finalOuiColors.concat('#39f'),
        },
      ],
      labels: finalOuiLabels.slice(0, 5).concat('Others'),
    };

    // Endpoints table
    const endpointsDs = [];
    const endpointsTotal = parsedData.endPoints.reduce((acc, point) => acc + point.value, 0);
    for (const point of parsedData.endPoints) {
      endpointsDs.push({
        endpoint: point.tag,
        devices: point.value,
        percent: `${Math.round((point.value / endpointsTotal) * 100)}%`,
      });
    }
    parsedData.endpoints = endpointsDs;

    setData(parsedData);
  };

  const getDashboard = () => {
    setLoading(true);

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };
    axiosInstance
      .get(`${endpoints.owfms}/api/v1/deviceReport`, {
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
