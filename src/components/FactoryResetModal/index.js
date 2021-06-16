import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSpinner,
  CRow,
  CForm,
  CSwitch,
  CAlert,
} from '@coreui/react';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import 'react-widgets/styles.css';
import { getToken } from 'utils/authHelper';
import axiosInstance from 'utils/axiosInstance';
import SuccessfulActionModalBody from 'components/SuccessfulActionModalBody';
import styles from './index.module.scss';

const ConfigureModal = ({ show, toggleModal }) => {
  const { t } = useTranslation();
  const [hadSuccess, setHadSuccess] = useState(false);
  const [hadFailure, setHadFailure] = useState(false);
  const [doingNow, setDoingNow] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [keepRedirector, setKeepRedirector] = useState(true);
  const [responseBody, setResponseBody] = useState('');
  const [checkingIfSure, setCheckingIfSure] = useState(false);
  const selectedDeviceId = useSelector((state) => state.selectedDeviceId);

  const toggleRedirector = () => {
    setKeepRedirector(!keepRedirector);
  };

  const confirmingIfSure = () => {
    setCheckingIfSure(true);
  };

  useEffect(() => {
    setHadSuccess(false);
    setHadFailure(false);
    setWaiting(false);
    setResponseBody('');
    setCheckingIfSure(false);
  }, [show]);

  const doAction = () => {
    setHadFailure(false);
    setHadSuccess(false);
    setWaiting(true);

    const parameters = {
      serialNumber: selectedDeviceId,
      keepRedirector,
    };

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${getToken()}`,
    };

    axiosInstance
      .post(`/device/${encodeURIComponent(selectedDeviceId)}/factory`, parameters, { headers })
      .then(() => {
        setHadSuccess(true);
      })
      .catch(() => {
        setResponseBody(t('commands.error'));
        setHadFailure(true);
      })
      .finally(() => {
        setDoingNow(false);
        setCheckingIfSure(false);
        setWaiting(false);
      });
  };

  return (
    <CModal show={show} onClose={toggleModal}>
      <CModalHeader closeButton>
        <CModalTitle>{t('factory_reset.title')}</CModalTitle>
      </CModalHeader>
      {hadSuccess ? (
        <SuccessfulActionModalBody toggleModal={toggleModal} />
      ) : (
        <div>
          <CModalBody>
            <CAlert color="danger">{t('factory_reset.warning')}</CAlert>
            <CRow className={styles.spacedRow}>
              <p style={{ paddingLeft: '5%' }}>{t('factory_reset.redirector')}</p>
              <CForm style={{ paddingLeft: '5%' }}>
                <CSwitch
                  color="primary"
                  defaultChecked={keepRedirector}
                  onClick={toggleRedirector}
                  labelOn="Yes"
                  labelOff="No"
                />
              </CForm>
            </CRow>
            <div hidden={!hadSuccess && !hadFailure}>
              <div>
                <pre className="ignore">{responseBody}</pre>
              </div>
            </div>
          </CModalBody>
          <CModalFooter>
            <div hidden={!checkingIfSure}>Are you sure?</div>
            <CButton
              disabled={waiting}
              hidden={checkingIfSure}
              color="primary"
              onClick={() => confirmingIfSure()}
            >
              {t('common.submit')}
            </CButton>
            <CButton
              hidden={!checkingIfSure}
              disabled={waiting}
              color="primary"
              onClick={() => doAction(false)}
            >
              {waiting && !doingNow ? 'Loading...' : 'Yes'} {'   '}
              <CSpinner hidden={!waiting || doingNow} component="span" size="sm" />
            </CButton>
            <CButton color="secondary" onClick={toggleModal}>
              {t('common.cancel')}
            </CButton>
          </CModalFooter>
        </div>
      )}
    </CModal>
  );
};

ConfigureModal.propTypes = {
  show: PropTypes.bool.isRequired,
  toggleModal: PropTypes.func.isRequired,
};

export default ConfigureModal;
