import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DeviceFirmwareModal as Modal } from 'ucentral-libs';
import axiosInstance from 'utils/axiosInstance';
import { useAuth } from 'contexts/AuthProvider';
import { useTranslation } from 'react-i18next';

const DeviceFirmwareModal = ({
  device,
  show,
  toggleFirmwareModal,
  setUpgradeStatus,
  upgradeStatus,
}) => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const [loading, setLoading] = useState(false);
  const [firmwareVersions, setFirmwareVersions] = useState([]);

  const getFirmwareList = () => {
    setLoading(true);

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };

    axiosInstance
      .get(`${endpoints.ucentralfms}/api/v1/firmwares?deviceType=${device.compatible}`, {
        headers,
      })
      .then((response) => {
        const sortedFirmware = response.data.firmwares.sort((a, b) => {
          const firstDate = a.imageDate;
          const secondDate = b.imageDate;
          if (firstDate < secondDate) return 1;
          return firstDate > secondDate ? -1 : 0;
        });
        setFirmwareVersions(sortedFirmware);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
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
      when: 0,
      uri,
    };

    axiosInstance
      .post(`${endpoints.ucentralgw}/api/v1/device/${device.serialNumber}/upgrade`, parameters, {
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
