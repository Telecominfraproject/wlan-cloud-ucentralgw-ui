import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { currentToken, endpoints } = useAuth();
  const [upgradeStatus, setUpgradeStatus] = useState({
    loading: false,
  });
  const [toast, setToast] = useState({
    show: false,
    success: true,
    text: '',
  });
  const [loadedSerials, setLoadedSerials] = useState(false);
  const [serialNumbers, setSerialNumbers] = useState([]);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [devicesPerPage, setDevicesPerPage] = useState(getItem('devicesPerPage') || '10');
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFirmwareModal, setShowFirmwareModal] = useState(false);
  const [firmwareDevice, setFirmwareDevice] = useState({
    deviceType: '',
    serialNumber: '',
  });

  const toggleFirmwareModal = (device) => {
    setShowFirmwareModal(!showFirmwareModal);
    if (device !== undefined) setFirmwareDevice(device);
  };

  const getSerialNumbers = () => {
    setLoading(true);

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };

    axiosInstance
      .get(`${endpoints.ucentralgw}/api/v1/devices?serialOnly=true&limit=1000`, {
        headers,
      })
      .then((response) => {
        setSerialNumbers(response.data.serialNumbers);
        setLoadedSerials(true);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const getDeviceInformation = () => {
    setLoading(true);

    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    const startIndex = page * devicesPerPage;
    const endIndex = parseInt(startIndex, 10) + parseInt(devicesPerPage, 10);
    const serialsToGet = serialNumbers
      .slice(startIndex, endIndex)
      .map((x) => encodeURIComponent(x))
      .join(',');

    let fullDevices;

    axiosInstance
      .get(
        `${endpoints.ucentralgw}/api/v1/devices?deviceWithStatus=true&select=${serialsToGet}`,
        options,
      )
      .then((response) => {
        fullDevices = response.data.devicesWithStatus;
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
  };

  const updatePageCount = ({ selected: selectedPage }) => {
    setPage(selectedPage);
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

  useEffect(() => {
    getSerialNumbers();
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

  useEffect(() => {
    if (loadedSerials) getDeviceInformation();
  }, [serialNumbers, page, devicesPerPage, loadedSerials]);

  useEffect(() => {
    if (loadedSerials) {
      const count = Math.ceil(serialNumbers.length / devicesPerPage);
      setPageCount(count);
    }
  }, [devicesPerPage, loadedSerials]);

  return (
    <div>
      <DeviceListTable
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
        meshIcon={meshIcon}
        apIcon={apIcon}
        internetSwitch={internetSwitch}
        iotIcon={iotIcon}
        connectRtty={connectRtty}
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
