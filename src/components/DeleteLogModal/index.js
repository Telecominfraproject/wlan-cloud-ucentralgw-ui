import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CCol,
  CRow,
  CPopover,
  CButton,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilX } from '@coreui/icons';
import DatePicker from 'react-widgets/DatePicker';
import PropTypes from 'prop-types';
import { ConfirmFooter, useAuth, useDevice, useToast } from 'ucentral-libs';
import { dateToUnix } from 'utils/helper';
import axiosInstance from 'utils/axiosInstance';
import eventBus from 'utils/eventBus';

const DeleteLogModal = ({ show, toggle, object }) => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const { addToast } = useToast();
  const { deviceSerialNumber } = useDevice();
  const [loading, setLoading] = useState(false);
  const [maxDate, setMaxDate] = useState(new Date().toString());

  const setDate = (date) => {
    if (date) {
      setMaxDate(date.toString());
    }
  };

  const deleteLog = async () => {
    setLoading(true);

    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
      params: {
        endDate: dateToUnix(maxDate),
      },
    };
    return axiosInstance
      .delete(`${endpoints.owgw}/api/v1/device/${deviceSerialNumber}/${object}`, options)
      .then(() => {})
      .catch((e) => {
        addToast({
          title: t('common.error'),
          body: t('commands.error_delete_log', { error: e.response?.data?.ErrorDescription }),
          color: 'danger',
          autohide: true,
        });
      })
      .finally(() => {
        if (object === 'healthchecks')
          eventBus.dispatch('deletedHealth', { message: 'Healthcheck was deleted' });
        else if (object === 'logs')
          eventBus.dispatch('deletedLogs', { message: 'Deleted device logs' });
        setLoading(false);
        toggle();
      });
  };

  useEffect(() => {
    setLoading(false);
    setMaxDate(new Date().toString());
  }, [show]);

  return (
    <CModal className="text-dark" show={show} onClose={toggle}>
      <CModalHeader className="p-1">
        <CModalTitle className="pl-1 pt-1">
          {object === 'healthchecks'
            ? t('delete_logs.healthchecks_title')
            : t('delete_logs.device_logs_title')}
        </CModalTitle>
        <div className="text-right">
          <CPopover content={t('common.close')}>
            <CButton color="primary" variant="outline" className="ml-2" onClick={toggle}>
              <CIcon content={cilX} />
            </CButton>
          </CPopover>
        </div>
      </CModalHeader>
      <CModalBody>
        <h6>{t('delete_logs.explanation', { object })}</h6>
        <CRow className="pt-3">
          <CCol md="4" className="mt-2">
            <p>{t('common.date')}:</p>
          </CCol>
          <CCol xs="12" md="8">
            <DatePicker
              selected={new Date(maxDate)}
              includeTime
              value={new Date(maxDate)}
              placeholder="Select custom date"
              disabled={loading}
              onChange={(date) => setDate(date)}
            />
          </CCol>
        </CRow>
      </CModalBody>
      <ConfirmFooter
        t={t}
        isShown={show}
        isLoading={loading}
        action={deleteLog}
        color="primary"
        toggleParent={toggle}
      />
    </CModal>
  );
};

DeleteLogModal.propTypes = {
  show: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  object: PropTypes.string.isRequired,
};

export default DeleteLogModal;
