import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import { CToast, CToastBody, CToaster, CToastHeader } from '@coreui/react';
import { useAuth } from 'contexts/AuthProvider';
import axiosInstance from 'utils/axiosInstance';
import { getItem, setItem } from 'utils/localStorageHelper';
import DeviceFirmwareModal from 'components/DeviceFirmwareModal';
import { DeviceListTable } from 'ucentral-libs';
import meshIcon from '../../assets/icons/Mesh.png';
import apIcon from '../../assets/icons/AP.png';
import internetSwitch from '../../assets/icons/Switch.png';
import iotIcon from '../../assets/icons/IotIcon.png';

const DeviceList = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { search } = useLocation();
  const page = new URLSearchParams(search).get('page');
  const { currentToken, endpoints } = useAuth();
  const [upgradeStatus, setUpgradeStatus] = useState({
    loading: false,
  });
  const [deleteStatus, setDeleteStatus] = useState({
    loading: false,
  });
  const [toast, setToast] = useState({
    show: false,
    success: true,
    text: '',
  });
  const [deviceCount, setDeviceCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [devicesPerPage, setDevicesPerPage] = useState(getItem('devicesPerPage') || '10');
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
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
        `${
          endpoints.ucentralgw
        }/api/v1/devices?deviceWithStatus=true&limit=${devicePerPage}&offset=${
          devicePerPage * selectedPage + 1
        }`,
        options,
      )
      .then((response) => {
        fullDevices = response.data.devicesWithStatus;
        const serialsToGet = fullDevices.map((device) => device.serialNumber);

        return axiosInstance.get(
          `${endpoints.ucentralfms}/api/v1/firmwareAge?select=${serialsToGet}`,
          options,
        );
      })
      .then((response) => {
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
        setDevices(fullDevices);
        setLoading(false);
      })
      .catch(() => {
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
      .get(`${endpoints.ucentralgw}/api/v1/devices?countOnly=true`, {
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
      .catch(() => {
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

    axiosInstance
      .get(
        `${endpoints.ucentralgw}/api/v1/devices?deviceWithStatus=true&select=${encodeURIComponent(
          serialNumber,
        )}`,
        options,
      )
      .then((response) => {
        const device = response.data.devicesWithStatus[0];
        const foundIndex = devices.findIndex((obj) => obj.serialNumber === serialNumber);
        const newList = devices;
        newList[foundIndex] = device;
        setDevices(newList);
        setLoading(false);
      })
      .catch(() => {
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
    history.push(`/devices?page=${selectedPage}`);
    getDeviceInformation(selectedPage);
  };

  const upgradeToLatest = (device) => {
    setUpgradeStatus({
      loading: true,
    });

    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    axiosInstance
      .get(
        `${endpoints.ucentralfms}/api/v1/firmwares?deviceType=${device.compatible}&latestOnly=true`,
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
            `${endpoints.ucentralgw}/api/v1/device/${device.serialNumber}/upgrade`,
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
    setToast({
      show: false,
      success: true,
      text: '',
    });

    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    axiosInstance
      .get(
        `${endpoints.ucentralgw}/api/v1/device/${encodeURIComponent(serialNumber)}/rtty`,
        options,
      )
      .then((response) => {
        const url = `https://${response.data.server}:${response.data.viewport}/connect/${response.data.connectionId}`;
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
        if (newWindow) newWindow.opener = null;
      })
      .catch(() => {
        setToast({
          show: true,
          success: false,
          text: t('common.unable_to_connect'),
        });
      });
  };

  const deleteDevice = (serialNumber) => {
    setDeleteStatus({
      loading: true,
    });
    setToast({
      show: false,
      success: true,
      text: '',
    });

    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    axiosInstance
      .delete(`${endpoints.ucentralgw}/api/v1/device/${encodeURIComponent(serialNumber)}`, options)
      .then(() => {
        setToast({
          show: true,
          success: true,
          text: t('common.device_deleted'),
        });
        getCount();
      })
      .catch(() => {
        setToast({
          show: true,
          success: false,
          text: t('common.unable_to_delete'),
        });
      })
      .finally(() => {
        setDeleteStatus({
          loading: false,
        });
      });
  };

  useEffect(() => {
    if (page === undefined || page === null || Number.isNaN(page)) {
      history.push(`/devices?page=0`);
    }
    getCount();
  }, []);

  useEffect(() => {
    if (upgradeStatus.result !== undefined) {
      setToast({
        show: true,
        success: upgradeStatus.result.success,
        text: upgradeStatus.result.success
          ? t('firmware.upgrade_command_submitted')
          : upgradeStatus.result.error,
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
        devices={devices}
        loading={loading}
        updateDevicesPerPage={updateDevicesPerPage}
        devicesPerPage={devicesPerPage}
        pageCount={pageCount}
        updatePage={updatePageCount}
        pageRangeDisplayed={5}
        refreshDevice={refreshDevice}
        toggleFirmwareModal={toggleFirmwareModal}
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
      <CToaster>
        <CToast
          autohide={5000}
          fade
          color={toast.success ? 'success' : 'danger'}
          className="text-white align-items-center"
          show={toast.show}
        >
          <CToastHeader closeButton>
            {toast.success ? t('common.success') : t('common.error')}
          </CToastHeader>
          <div className="d-flex">
            <CToastBody>{toast.text}</CToastBody>
          </div>
        </CToast>
      </CToaster>
    </div>
  );
};

export default DeviceList;
