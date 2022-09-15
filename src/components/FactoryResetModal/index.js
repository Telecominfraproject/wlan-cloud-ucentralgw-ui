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
  CPopover,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilX } from '@coreui/icons';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import 'react-widgets/styles.css';
import { useAuth, useDevice, useToast } from 'ucentral-libs';
import axiosInstance from 'utils/axiosInstance';
import SuccessfulActionModalBody from 'components/SuccessfulActionModalBody';

const ConfigureModal = ({ show, toggleModal }) => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const { deviceSerialNumber } = useDevice();
  const { addToast } = useToast();
  const [hadSuccess, setHadSuccess] = useState(false);
  const [hadFailure, setHadFailure] = useState(false);
  const [doingNow, setDoingNow] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [keepRedirector, setKeepRedirector] = useState(true);
  const [responseBody, setResponseBody] = useState('');
  const [checkingIfSure, setCheckingIfSure] = useState(false);

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
      serialNumber: deviceSerialNumber,
      keepRedirector,
    };

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };

    axiosInstance
      .post(
        `${endpoints.owgw}/api/v1/device/${encodeURIComponent(deviceSerialNumber)}/factory`,
        parameters,
        { headers },
      )
      .then(() => {
        setHadSuccess(true);
      })
      .catch((e) => {
        if (e.response?.data?.ErrorDescription !== undefined) {
          const split = e.response?.data?.ErrorDescription.split(':');
          if (split !== undefined && split.length >= 2) {
            addToast({
              title: t('common.error'),
              body: split[1],
              color: 'danger',
              autohide: true,
            });
          }
        }
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
      <CModalHeader className="p-1">
        <CModalTitle className="pl-1 pt-1">{t('factory_reset.title')}</CModalTitle>
        <div className="text-right">
          <CPopover content={t('common.close')}>
            <CButton color="primary" variant="outline" className="ml-2" onClick={toggleModal}>
              <CIcon content={cilX} />
            </CButton>
          </CPopover>
        </div>
      </CModalHeader>
      {hadSuccess ? (
        <SuccessfulActionModalBody toggleModal={toggleModal} />
      ) : (
        <div>
          <CModalBody>
            <CAlert color="danger">{t('factory_reset.warning')}</CAlert>
            <CRow className="mt-3">
              <p className="pl-4">{t('factory_reset.redirector')}</p>
              <CForm className="pl-4">
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
              {t('factory_reset.reset')}
            </CButton>
            <CButton
              hidden={!checkingIfSure}
              disabled={waiting}
              color="primary"
              onClick={() => doAction(false)}
            >
              {waiting && !doingNow ? t('factory_reset.resetting') : t('common.yes')} {'   '}
              <CSpinner color="light" hidden={!waiting || doingNow} component="span" size="sm" />
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
