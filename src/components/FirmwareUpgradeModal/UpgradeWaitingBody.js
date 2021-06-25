import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { CModalBody } from '@coreui/react';
import { v4 as createUuid } from 'uuid';
import { getToken } from 'utils/authHelper';
import axiosInstance from 'utils/axiosInstance';

const UpgradeWaitingBody = ({ serialNumber }) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [labelsToShow, setLabelsToShow] = useState(['upgrade.command_submitted']);

  const getDeviceConnection = () => {
    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
    };

    axiosInstance
      .get(`/device/${encodeURIComponent(serialNumber)}/status`, options)
      .then((response) => response.data.connected)
      .catch(() => {});
  };

  const getFirmwareVersion = () => {
    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
    };

    axiosInstance
      .get(`/device/${encodeURIComponent(serialNumber)}`, options)
      .then((response) => response.data.firmware)
      .catch(() => {});
  };

  const refreshStep = () => {
    if (currentStep === 0 && !getDeviceConnection) {
      const labelsToAdd = [
        t('upgrade.device_disconnected'),
        t('upgrade.device_upgrading_firmware'),
        t('upgrade.waiting_for_device'),
      ];
      setLabelsToShow([...labelsToShow, ...labelsToAdd]);
      setCurrentStep(1);
    } else if (currentStep === 1 && getDeviceConnection()) {
      const newFirmware = `: ${getFirmwareVersion()}`;
      const labelsToAdd = [
        t('upgrade.device_reconnected'),
        `${t('upgrade.new_version')}: ${newFirmware}`,
      ];
      setLabelsToShow([...labelsToShow, ...labelsToAdd]);
      setCurrentStep(2);
    }
  };

  useEffect(() => {
    const refreshIntervalId = setInterval(() => {
      refreshStep();
    }, 5000);

    const timerIntervalId = setInterval(() => {
      setSecondsElapsed(secondsElapsed + 1);
    }, 1000);

    return () => {
      clearInterval(refreshIntervalId);
      clearInterval(timerIntervalId);
    };
  }, []);

  return (
    <CModalBody>
      <div className="consoleBox">
        {labelsToShow.map((label) => (
          <p key={createUuid()}>
            {new Date().toString()}: {label}
          </p>
        ))}
        <p>
          {t('common.seconds_elapsed')}: {secondsElapsed}
        </p>
      </div>
    </CModalBody>
  );
};

UpgradeWaitingBody.propTypes = {
  serialNumber: PropTypes.string.isRequired,
};

export default UpgradeWaitingBody;
