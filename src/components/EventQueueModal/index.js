import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth, useDevice, useToast } from 'ucentral-libs';
import { useTranslation } from 'react-i18next';
import axiosInstance from 'utils/axiosInstance';
import Modal from './Modal';

const EventQueueModal = ({ show, toggle }) => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const { deviceSerialNumber } = useDevice();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({});

  const getQueue = () => {
    setLoading(true);

    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    const parameters = {
      serialNumber: deviceSerialNumber,
      types: ['dhcp', 'wifi'],
    };

    axiosInstance
      .post(`${endpoints.owgw}/api/v1/device/${deviceSerialNumber}/eventqueue`, parameters, options)
      .then((response) => {
        setResult(response.data);
      })
      .catch((e) => {
        addToast({
          title: t('common.error'),
          body: t('commands.unable_queue', { error: e.response?.data?.ErrorDescription }),
          color: 'danger',
          autohide: true,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (show) getQueue();
  }, [show]);

  return <Modal t={t} show={show} toggle={toggle} loading={loading} result={result} />;
};

EventQueueModal.propTypes = {
  show: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
};

export default EventQueueModal;
