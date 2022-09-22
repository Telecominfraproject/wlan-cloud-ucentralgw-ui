import React, { useState, useEffect } from 'react';
import axiosInstance from 'utils/axiosInstance';
import { useAuth } from 'ucentral-libs';
import { CPopover } from '@coreui/react';
import { extraCompactSecondsToDetailed, secondsToDetailed } from 'utils/helper';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const propTypes = {
  newData: PropTypes.instanceOf(Object),
};
const defaultProps = {
  newData: undefined,
};

const SidebarDevices = ({ newData }) => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const [stats, setStats] = useState();
  const [lastUpdate, setLastUpdate] = useState();
  const [lastTime, setLastTime] = useState();

  const getInitialStats = async () => {
    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    axiosInstance
      .get(`${endpoints.owgw}/api/v1/devices?connectionStatistics=true`, options)
      .then(({ data }) => {
        setStats(data);
        setLastUpdate(new Date());
      })
      .catch(() => {});
  };

  const getTime = () => {
    if (lastTime === undefined || lastUpdate === undefined) return null;

    const seconds = lastTime.getTime() - lastUpdate.getTime();

    return Math.max(0, Math.floor(seconds / 1000));
  };

  useEffect(() => {
    if (newData !== undefined && Object.keys(newData).length > 0) {
      setStats({ ...newData });
      setLastUpdate(new Date());
    }
  }, [newData]);

  useEffect(() => {
    getInitialStats();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastTime(new Date());
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  if (!stats) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '0px',
        width: '100%',
        background: '#2f3d54 !important',
        backgroundColor: '#2f3d54 !important',
        borderTop: '3px solid #d8dbe0',
        color: 'white',
        textAlign: 'center',
        paddingTop: '5px',
        paddingBottom: '5px',
      }}
    >
      <h3 style={{ marginBottom: '0px' }}>{stats?.connectedDevices ?? stats?.numberOfDevices}</h3>
      <h6>Connected Devices</h6>
      <CPopover
        content={secondsToDetailed(
          stats?.averageConnectionTime ?? stats?.averageConnectedTime,
          t('common.day'),
          t('common.days'),
          t('common.hour'),
          t('common.hours'),
          t('common.minute'),
          t('common.minutes'),
          t('common.second'),
          t('common.seconds'),
        )}
      >
        <h3 style={{ marginBottom: '0px' }}>
          {extraCompactSecondsToDetailed(
            stats?.averageConnectionTime ?? stats?.averageConnectedTime,
            t('common.day'),
            t('common.days'),
            t('common.seconds'),
          )}
        </h3>
      </CPopover>
      <h6>Avg. Connection Time</h6>
      <h7 style={{ color: '#ebedef', fontStyle: 'italic' }}>{getTime()} seconds ago</h7>
    </div>
  );
};

SidebarDevices.propTypes = propTypes;
SidebarDevices.defaultProps = defaultProps;

export default React.memo(SidebarDevices);
