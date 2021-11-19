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
  CInput,
  CInvalidFeedback,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { useAuth, useToast } from 'ucentral-libs';
import { cilPlus, cilX } from '@coreui/icons';
import axiosInstance from 'utils/axiosInstance';

const AddToBlacklistModal = ({ show, toggle, serialNumber, refresh }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const { endpoints, currentToken } = useAuth();
  const [chosenSerialNumber, setChosenSerialNumber] = useState('');
  const [reason, setReason] = useState('');

  const addToBlacklist = () => {
    setLoading(true);

    const parameters = {
      serialNumber: chosenSerialNumber,
      reason,
    };

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };

    axiosInstance
      .post(`${endpoints.owgw}/api/v1/blacklist/${chosenSerialNumber}`, parameters, { headers })
      .then(() => {
        addToast({
          title: t('common.success'),
          body: t('device.success_added_blacklist'),
          color: 'success',
          autohide: true,
        });
        toggle();
        if (refresh) refresh();
      })
      .catch((e) => {
        addToast({
          title: t('common.error'),
          body: t('device.error_adding_blacklist', { error: e.response?.data?.ErrorDescription }),
          color: 'danger',
          autohide: true,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (show) {
      if (serialNumber) setChosenSerialNumber(serialNumber);
      else setChosenSerialNumber('');
    }
  }, [show, serialNumber]);

  return (
    <CModal className="text-dark" size="lg" show={show} onClose={toggle}>
      <CModalHeader className="p-1">
        <CModalTitle className="pl-1 pt-1">{t('device.add_to_blacklist')}</CModalTitle>
        <div className="text-right">
          <CPopover content={t('common.add')}>
            <CButton
              color="primary"
              variant="outline"
              className="ml-2"
              onClick={addToBlacklist}
              disabled={
                chosenSerialNumber.length !== 12 ||
                !chosenSerialNumber.match('^[a-fA-F0-9]+$') ||
                reason === '' ||
                loading
              }
            >
              <CIcon content={cilPlus} />
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
            {t('common.serial_number')}
          </CLabel>
          <CCol sm="9" className="pt-1">
            <CInput
              id="description"
              type="text"
              required
              value={chosenSerialNumber}
              onChange={(e) => setChosenSerialNumber(e.target.value)}
              invalid={
                chosenSerialNumber.length !== 12 && chosenSerialNumber.match('^[a-fA-F0-9]+$')
              }
              disabled={loading}
              maxLength="50"
            />
            <CInvalidFeedback>{t('entity.valid_serial')}</CInvalidFeedback>
          </CCol>
        </CRow>
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

AddToBlacklistModal.propTypes = {
  show: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  serialNumber: PropTypes.string,
  refresh: PropTypes.func,
};

AddToBlacklistModal.defaultProps = {
  serialNumber: '',
  refresh: null,
};

export default AddToBlacklistModal;
