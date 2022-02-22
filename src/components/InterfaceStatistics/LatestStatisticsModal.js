import React, { useState, useEffect } from 'react';
import { CButton, CModal, CModalHeader, CModalBody, CModalTitle, CPopover } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilX } from '@coreui/icons';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import axiosInstance from 'utils/axiosInstance';
import { useAuth, useDevice, CopyToClipboardButton } from 'ucentral-libs';

const LatestStatisticsModal = ({ show, toggle }) => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const { deviceSerialNumber } = useDevice();
  const [latestStats, setLatestStats] = useState('');

  const getLatestStats = () => {
    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    axiosInstance
      .get(
        `${endpoints.owgw}/api/v1/device/${deviceSerialNumber}/statistics?lastOnly=true`,
        options,
      )
      .then((response) => {
        setLatestStats(response.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (show) {
      getLatestStats();
    }
  }, [show]);

  return (
    <CModal size="lg" show={show} onClose={toggle}>
      <CModalHeader className="p-1">
        <CModalTitle className="text-dark">{t('statistics.latest_statistics')}</CModalTitle>
        <div className="text-right">
          <CPopover content={t('common.close')}>
            <CButton color="primary" variant="outline" className="ml-2" onClick={toggle}>
              <CIcon content={cilX} />
            </CButton>
          </CPopover>
        </div>
      </CModalHeader>
      <CModalBody>
        <div style={{ textAlign: 'right' }}>
          <CopyToClipboardButton
            t={t}
            size="lg"
            content={JSON.stringify(latestStats ?? {}, null, 4)}
          />
        </div>
        <pre className="ignore">{JSON.stringify(latestStats, null, 2)}</pre>
      </CModalBody>
    </CModal>
  );
};

LatestStatisticsModal.propTypes = {
  toggle: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
};

export default LatestStatisticsModal;
