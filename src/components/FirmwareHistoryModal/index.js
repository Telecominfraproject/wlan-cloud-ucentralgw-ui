import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from 'contexts/AuthProvider';
import { useTranslation } from 'react-i18next';
import axiosInstance from 'utils/axiosInstance';
import {
  CButton,
  CModal,
  CModalBody,
  CModalHeader,
  CModalFooter,
  CModalTitle,
} from '@coreui/react';
import { FirmwareHistoryTable } from 'ucentral-libs';

const FirmwareHistoryModal = ({ serialNumber, show, toggle }) => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const getHistory = () => {
    setLoading(true);

    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    axiosInstance
      .get(`${endpoints.ucentralfms}/api/v1/revisionHistory/${serialNumber}`, options)
      .then((response) => setData(response.data.history ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (show) {
      getHistory();
    } else {
      setData([]);
    }
  }, [show]);

  return (
    <CModal size="xl" show={show} onClose={toggle} scrollable>
      <CModalHeader closeButton>
        <CModalTitle>
          #{serialNumber} {t('firmware.history_title')}
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <FirmwareHistoryTable t={t} loading={loading} data={data} />
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={toggle}>
          {t('common.close')}
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

FirmwareHistoryModal.propTypes = {
  serialNumber: PropTypes.string.isRequired,
  show: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
};

export default FirmwareHistoryModal;
