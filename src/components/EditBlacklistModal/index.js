import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CPopover,
  CRow,
  CCol,
  CLabel,
  CTextarea,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { useAuth, useToast } from 'ucentral-libs';
import { cilSave, cilX } from '@coreui/icons';
import axiosInstance from 'utils/axiosInstance';

const EditBlacklistModal = ({ show, toggle, serialNumber, refresh }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const { endpoints, currentToken } = useAuth();
  const [reason, setReason] = useState('');

  const getBlacklistInfo = () => {
    setLoading(true);

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };

    axiosInstance
      .get(`${endpoints.owgw}/api/v1/blacklist/${serialNumber}`, {
        headers,
      })
      .then((response) => {
        setReason(response.data.reason);
        setLoading(false);
      })
      .catch((e) => {
        addToast({
          title: t('common.error'),
          body: t('device.error_fetching_devices', { error: e.response?.data?.ErrorDescription }),
          color: 'danger',
          autohide: true,
        });
        setLoading(false);
        toggle();
      });
  };

  const save = () => {
    setLoading(true);

    const parameters = {
      reason,
    };

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };

    axiosInstance
      .put(`${endpoints.owgw}/api/v1/blacklist/${serialNumber}`, parameters, { headers })
      .then(() => {
        addToast({
          title: t('common.success'),
          body: t('device.success_edit_blacklist'),
          color: 'success',
          autohide: true,
        });
        toggle();
        if (refresh) refresh();
      })
      .catch((e) => {
        addToast({
          title: t('common.error'),
          body: t('device.error_edit_blacklist', { error: e.response?.data?.ErrorDescription }),
          color: 'danger',
          autohide: true,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (show) getBlacklistInfo();
  }, [show, serialNumber]);

  return (
    <CModal className="text-dark" size="lg" show={show} onClose={toggle}>
      <CModalHeader className="p-1">
        <CModalTitle className="pl-1 pt-1">{t('device.edit_blacklist')}</CModalTitle>
        <div className="text-right">
          <CPopover content={t('common.add')}>
            <CButton
              color="primary"
              variant="outline"
              className="ml-2"
              onClick={save}
              disabled={loading || reason === ''}
            >
              <CIcon content={cilSave} />
            </CButton>
          </CPopover>
          <CPopover content={t('common.close')}>
            <CButton color="primary" variant="outline" className="ml-2" onClick={toggle}>
              <CIcon content={cilX} />
            </CButton>
          </CPopover>
        </div>
      </CModalHeader>
      <CModalBody>
        <CRow>
          <CLabel col sm="3">
            {t('common.reason')}
          </CLabel>
          <CCol sm="9" className="pt-2">
            <CTextarea
              name="reason"
              id="reason"
              rows="3"
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </CCol>
        </CRow>
      </CModalBody>
    </CModal>
  );
};

EditBlacklistModal.propTypes = {
  show: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  serialNumber: PropTypes.string,
  refresh: PropTypes.func,
};

EditBlacklistModal.defaultProps = {
  serialNumber: '',
  refresh: null,
};

export default EditBlacklistModal;
