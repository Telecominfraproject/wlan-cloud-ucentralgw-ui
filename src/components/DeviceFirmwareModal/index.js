/* eslint-disable no-await-in-loop */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth, useToast, useToggle } from 'ucentral-libs';
import axiosInstance from 'utils/axiosInstance';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';

const DeviceFirmwareModal = ({
  device,
  show,
  toggleFirmwareModal,
  setUpgradeStatus,
  upgradeStatus,
}) => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const { currentToken, endpoints } = useAuth();
  const [loading, setLoading] = useState(false);
  const [firmwareVersions, setFirmwareVersions] = useState([]);
  const [keepRedirector, toggleKeepRedirector, setKeepRedirector] = useToggle(true);

  const getPartialFirmware = async (offset) => {
    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };

    return axiosInstance
      .get(
        `${endpoints.owfms}/api/v1/firmwares?deviceType=${device.compatible}&limit=500&offset=${offset}`,
        {
          headers,
        },
      )
      .then((response) => response.data.firmwares)
      .catch(() => {
        addToast({
          title: t('common.error'),
          body: t('common.general_error'),
          color: 'danger',
          autohide: true,
        });
        return [];
      });
  };

  const getFirmwareList = async () => {
    setLoading(true);

    const allFirmwares = [];
    let continueFirmware = true;
    let i = 0;
    while (continueFirmware) {
      const newFirmwares = await getPartialFirmware(i);
      if (newFirmwares === null || newFirmwares.length === 0) continueFirmware = false;
      allFirmwares.push(...newFirmwares);
      i += 500;
    }
    const sortedFirmware = allFirmwares.sort((a, b) => {
      const firstDate = a.imageDate;
      const secondDate = b.imageDate;
      if (firstDate < secondDate) return 1;
      return firstDate > secondDate ? -1 : 0;
    });
    setFirmwareVersions(sortedFirmware);

    setLoading(false);
  };

  const upgradeToVersion = (uri) => {
    setUpgradeStatus({
      loading: true,
    });

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };

    const parameters = {
      serialNumber: device.serialNumber,
      keepRedirector,
      when: 0,
      uri,
    };

    axiosInstance
      .post(`${endpoints.owgw}/api/v1/device/${device.serialNumber}/upgrade`, parameters, {
        headers,
      })
      .then((response) => {
        setUpgradeStatus({
          loading: false,
          result: {
            success: response.data.errorCode === 0,
            error: response.data.errorCode === 0 ? '' : t('firmware.error_fetching_latest'),
          },
        });
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

  useEffect(() => {
    if (show && device.compatible) getFirmwareList();
    if (show) setKeepRedirector(true);
  }, [device, show]);

  return (
    <Modal
      t={t}
      device={device}
      show={show}
      toggle={toggleFirmwareModal}
      firmwareVersions={firmwareVersions}
      upgradeToVersion={upgradeToVersion}
      loading={loading}
      upgradeStatus={upgradeStatus}
      keepRedirector={keepRedirector}
      toggleRedirector={toggleKeepRedirector}
    />
  );
};

DeviceFirmwareModal.propTypes = {
  device: PropTypes.instanceOf(Object).isRequired,
  show: PropTypes.bool.isRequired,
  toggleFirmwareModal: PropTypes.func.isRequired,
  setUpgradeStatus: PropTypes.func.isRequired,
  upgradeStatus: PropTypes.instanceOf(Object).isRequired,
};

export default React.memo(DeviceFirmwareModal);
