import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axiosInstance from 'utils/axiosInstance';
import { useTranslation } from 'react-i18next';
import { LifetimeStatsModal as Modal, useAuth, useDevice } from 'ucentral-libs';

const LifetimeStatsModal = ({ show, toggle }) => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const { deviceSerialNumber } = useDevice();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});

  const getData = () => {
    setLoading(true);

    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    axiosInstance
      .get(
        `${endpoints.owgw}/api/v1/device/${deviceSerialNumber}/statistics?lifetime=true`,
        options,
      )
      .then((response) => {
        setData(response.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (show) getData();
  }, [show]);

  return <Modal t={t} loading={loading} show={show} toggle={toggle} data={data} />;
};

LifetimeStatsModal.propTypes = {
  show: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
};

export default LifetimeStatsModal;
