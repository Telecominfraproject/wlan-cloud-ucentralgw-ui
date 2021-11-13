import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import axiosInstance from 'utils/axiosInstance';
import { getItem, setItem } from 'utils/localStorageHelper';
import DeviceSearchBar from 'components/DeviceSearchBar';
import DeviceFirmwareModal from 'components/DeviceFirmwareModal';
import FirmwareHistoryModal from 'components/FirmwareHistoryModal';
import { DeviceListTable, useAuth, useToast } from 'ucentral-libs';
import meshIcon from '../../assets/icons/Mesh.png';
import apIcon from '../../assets/icons/AP.png';
import internetSwitch from '../../assets/icons/Switch.png';
import iotIcon from '../../assets/icons/IotIcon.png';

const DeviceList = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const history = useHistory();
  const [page, setPage] = useState(parseInt(sessionStorage.getItem('deviceTable') ?? 0, 10));
  const { currentToken, endpoints } = useAuth();
  const [upgradeStatus, setUpgradeStatus] = useState({
    loading: false,
  });
  const [deleteStatus, setDeleteStatus] = useState({
    loading: false,
  });
  const [deviceCount, setDeviceCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [devicesPerPage, setDevicesPerPage] = useState(getItem('devicesPerPage') || '10');
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHistoryModal, setHistoryModal] = useState(false);
  const [showFirmwareModal, setShowFirmwareModal] = useState(false);
  const [firmwareDevice, setFirmwareDevice] = useState({
    deviceType: '',
    serialNumber: '',
  });

  const deviceIcons = {
    meshIcon,
    apIcon,
    internetSwitch,
    iotIcon,
  };

  const toggleFirmwareModal = (device) => {
    setShowFirmwareModal(!showFirmwareModal);
    if (device !== undefined) setFirmwareDevice(device);
  };

  const toggleHistoryModal = (device) => {
    setHistoryModal(!showHistoryModal);
    if (device !== undefined) setFirmwareDevice(device);
  };

  const getDeviceInformation = (selectedPage = page, devicePerPage = devicesPerPage) => {
    setLoading(true);

    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    let fullDevices;

    axiosInstance
      .get(
        `${endpoints.owgw}/api/v1/devices?deviceWithStatus=true&limit=${devicePerPage}&offset=${
          devicePerPage * selectedPage + 1
        }`,
        options,
      )
      .then((response) => {
        fullDevices = response.data.devicesWithStatus;
        const serialsToGet = fullDevices.map((device) => device.serialNumber);

        if (serialsToGet.length === 0) {
          return null;
        }
        return axiosInstance.get(
          `${endpoints.owfms}/api/v1/firmwareAge?select=${serialsToGet}`,
          options,
        );
      })
      .then((response) => {
        if (response !== null) {
          fullDevices = fullDevices.map((device, index) => {
            const foundAgeDate = response.data.ages[index].age !== undefined;
            if (foundAgeDate) {
              return {
                ...device,
                firmwareInfo: {
                  age: response.data.ages[index].age,
                  latest: response.data.ages[index].latest,
                },
              };
            }
            return device;
          });
        }
        setDevices(fullDevices);
        setLoading(false);
      })
      .catch((e) => {
        addToast({
          title: t('common.error'),
          body: t('device.error_fetching_devices', { error: e.response?.data?.ErrorDescription }),
          color: 'danger',
          autohide: true,
        });
        setLoading(false);
      });
  };

  const getCount = () => {
    setLoading(true);

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };

    axiosInstance
      .get(`${endpoints.owgw}/api/v1/devices?countOnly=true`, {
        headers,
      })
      .then((response) => {
        const devicesCount = response.data.count;
        const pagesCount = Math.ceil(devicesCount / devicesPerPage);
        setPageCount(pagesCount);
        setDeviceCount(devicesCount);

        let selectedPage = page;

        if (page >= pagesCount) {
          history.push(`/devices?page=${pagesCount - 1}`);
          selectedPage = pagesCount - 1;
        }
        getDeviceInformation(selectedPage);
      })
      .catch((e) => {
        addToast({
          title: t('common.error'),
          body: t('device.error_fetching_devices', { error: e.response?.data?.ErrorDescription }),
          color: 'danger',
          autohide: true,
        });
        setLoading(false);
      });
  };

  const refreshDevice = (serialNumber) => {
    setLoading(true);

    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    let newDevice;

    axiosInstance
      .get(
        `${endpoints.owgw}/api/v1/devices?deviceWithStatus=true&select=${encodeURIComponent(
          serialNumber,
        )}`,
        options,
      )
      .then(
        ({
          data: {
            devicesWithStatus: [device],
          },
        }) => {
          newDevice = device;

          return axiosInstance.get(
            `${endpoints.owfms}/api/v1/firmwareAge?select=${serialNumber}`,
            options,
          );
        },
      )
      .then((response) => {
        newDevice.firmwareInfo = {
          age: response.data.ages[0].age,
          latest: response.data.ages[0].latest,
        };
        const foundIndex = devices.findIndex((obj) => obj.serialNumber === serialNumber);
        const newList = devices;
        newList[foundIndex] = newDevice;
        setDevices(newList);
        setLoading(false);
      })
      .catch((e) => {
        addToast({
          title: t('common.error'),
          body: t('device.error_fetching_devices', { error: e.response?.data?.ErrorDescription }),
          color: 'danger',
          autohide: true,
        });
        setLoading(false);
      });
  };

  const updateDevicesPerPage = (value) => {
    setItem('devicesPerPage', value);
    setDevicesPerPage(value);

    const newPageCount = Math.ceil(deviceCount / value);
    setPageCount(newPageCount);

    let selectedPage = page;

    if (page >= newPageCount) {
      history.push(`/devices?page=${newPageCount - 1}`);
      selectedPage = newPageCount - 1;
    }

    getDeviceInformation(selectedPage, value);
  };

  const updatePageCount = ({ selected: selectedPage }) => {
    sessionStorage.setItem('deviceTable', selectedPage);
    setPage(selectedPage);
    getDeviceInformation(selectedPage);
  };

  const upgradeToLatest = (device) => {
    setUpgradeStatus({
      loading: true,
      serialNumber: device.serialNumber,
    });

    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    axiosInstance
      .get(
        `${endpoints.owfms}/api/v1/firmwares?deviceType=${device.compatible}&latestOnly=true`,
        options,
      )
      .then((response) => {
        if (response.data.uri) {
          const parameters = {
            serialNumber: device.serialNumber,
            when: 0,
            uri: response.data.uri,
          };
          return axiosInstance.post(
            `${endpoints.owgw}/api/v1/device/${device.serialNumber}/upgrade`,
            parameters,
            options,
          );
        }
        setUpgradeStatus({
          loading: false,
          result: {
            success: false,
            error: t('firmware.error_fetching_latest'),
          },
        });
        return null;
      })
      .then((response) => {
        if (response) {
          setUpgradeStatus({
            loading: false,
            result: {
              success: response.data.errorCode === 0,
              error: response.data.errorCode === 0 ? '' : t('firmware.error_fetching_latest'),
            },
          });
        }
      })
      .catch(() => {
        setUpgradeStatus({
          loading: false,
          result: {
            success: false,
            error: t('common.general_error'),
          },
        });
      });
  };

  const connectRtty = (serialNumber) => {
    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    axiosInstance
      .get(`${endpoints.owgw}/api/v1/device/${encodeURIComponent(serialNumber)}/rtty`, options)
      .then((response) => {
        const url = `https://${response.data.server}:${response.data.viewport}/connect/${response.data.connectionId}`;
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
        if (newWindow) newWindow.opener = null;
      })
      .catch((e) => {
        addToast({
          title: t('common.error'),
          body: t('connect.error_trying_to_connect', { error: e.response?.data?.ErrorDescription }),
          color: 'danger',
          autohide: true,
        });
      });
  };

  const deleteDevice = (serialNumber) => {
    setDeleteStatus({
      loading: true,
    });

    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    axiosInstance
      .delete(`${endpoints.owgw}/api/v1/device/${encodeURIComponent(serialNumber)}`, options)
      .then(() => {
        addToast({
          title: t('common.success'),
          body: t('common.device_deleted'),
          color: 'success',
          autohide: true,
        });
        getCount();
      })
      .catch(() => {
        addToast({
          title: t('common.error'),
          body: t('common.unable_to_delete'),
          color: 'danger',
          autohide: true,
        });
      })
      .finally(() => {
        setDeleteStatus({
          loading: false,
        });
      });
  };

  useEffect(() => {
    getCount();
  }, []);

  useEffect(() => {
    if (upgradeStatus.result !== undefined) {
      addToast({
        title: upgradeStatus.result.success ? t('common.success') : t('common.error'),
        body: upgradeStatus.result.success
          ? t('firmware.upgrade_command_submitted')
          : upgradeStatus.result.error,
        color: upgradeStatus.result.success ? 'success' : 'danger',
        autohide: true,
      });
      setUpgradeStatus({
        loading: false,
      });
      setShowFirmwareModal(false);
    }
  }, [upgradeStatus]);

  return (
    <div>
      <DeviceListTable
        currentPage={page}
        t={t}
        searchBar={<DeviceSearchBar />}
        devices={devices}
        loading={loading}
        updateDevicesPerPage={updateDevicesPerPage}
        devicesPerPage={devicesPerPage}
        pageCount={pageCount}
        updatePage={updatePageCount}
        pageRangeDisplayed={5}
        refreshDevice={refreshDevice}
        toggleFirmwareModal={toggleFirmwareModal}
        toggleHistoryModal={toggleHistoryModal}
        upgradeToLatest={upgradeToLatest}
        upgradeStatus={upgradeStatus}
        deviceIcons={deviceIcons}
        connectRtty={connectRtty}
        deleteDevice={deleteDevice}
        deleteStatus={deleteStatus}
      />
      <DeviceFirmwareModal
        endpoints={endpoints}
        currentToken={currentToken}
        device={firmwareDevice}
        show={showFirmwareModal}
        toggleFirmwareModal={toggleFirmwareModal}
        setUpgradeStatus={setUpgradeStatus}
        upgradeStatus={upgradeStatus}
      />
      <FirmwareHistoryModal
        serialNumber={firmwareDevice.serialNumber}
        show={showHistoryModal}
        toggle={toggleHistoryModal}
      />
    </div>
  );
};

export default DeviceList;
