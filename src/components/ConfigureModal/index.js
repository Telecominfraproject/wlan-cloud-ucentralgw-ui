import {
  CAlert,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSpinner,
  CCol,
  CRow,
  CForm,
  CTextarea,
  CInvalidFeedback,
  CInputFile,
  CPopover,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilX } from '@coreui/icons';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import 'react-widgets/styles.css';
import { useAuth, useDevice, useToast } from 'ucentral-libs';
import { checkIfJson } from 'utils/helper';
import axiosInstance from 'utils/axiosInstance';
import eventBus from 'utils/eventBus';
import SuccessfulActionModalBody from 'components/SuccessfulActionModalBody';

const ConfigureModal = ({ show, toggleModal }) => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const { addToast } = useToast();
  const { deviceSerialNumber } = useDevice();
  const [hadSuccess, setHadSuccess] = useState(false);
  const [hadFailure, setHadFailure] = useState(false);
  const [doingNow, setDoingNow] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [newConfig, setNewConfig] = useState('');
  const [responseBody, setResponseBody] = useState('');
  const [checkingIfSure, setCheckingIfSure] = useState(false);
  const [errorJson, setErrorJson] = useState(false);
  const [inputKey, setInputKey] = useState(0);

  let fileReader;

  const confirmingIfSure = () => {
    if (checkIfJson(newConfig)) {
      setCheckingIfSure(true);
    } else {
      setErrorJson(true);
    }
  };

  useEffect(() => {
    setHadSuccess(false);
    setHadFailure(false);
    setWaiting(false);
    setResponseBody('');
    setCheckingIfSure(false);
    setDoingNow(false);
    setNewConfig('');
    setErrorJson(false);
    setInputKey(0);
  }, [show]);

  useEffect(() => {
    setErrorJson(false);
  }, [newConfig]);

  const doAction = (isNow) => {
    setDoingNow(isNow);
    setHadFailure(false);
    setHadSuccess(false);
    setWaiting(true);

    const parameters = {
      serialNumber: deviceSerialNumber,
      when: 0,
      UUID: 1,
      configuration: JSON.parse(newConfig),
    };

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };

    axiosInstance
      .post(
        `${endpoints.owgw}/api/v1/device/${encodeURIComponent(deviceSerialNumber)}/configure`,
        parameters,
        { headers },
      )
      .then(() => {
        addToast({
          title: t('common.success'),
          body: t('commands.command_success'),
          color: 'success',
          autohide: true,
        });
        toggleModal();
      })
      .catch((e) => {
        setResponseBody('Error while submitting command!');
        addToast({
          title: t('common.error'),
          body: `${t('common.general_error')}: ${e.response?.data?.ErrorDescription}`,
          color: 'danger',
          autohide: true,
        });
        setHadFailure(true);
      })
      .finally(() => {
        setDoingNow(false);
        setCheckingIfSure(false);
        setWaiting(false);
        eventBus.dispatch('actionCompleted', { message: 'An action has been completed' });
      });
  };

  const handleJsonRead = () => {
    setErrorJson(false);
    const content = fileReader.result;
    if (checkIfJson(content)) {
      setNewConfig(content);
    } else {
      setErrorJson(true);
    }
  };

  const handleJsonFile = (file) => {
    fileReader = new FileReader();
    fileReader.onloadend = handleJsonRead;
    fileReader.readAsText(file);
  };

  const resetText = () => {
    setInputKey(inputKey + 1);
    setNewConfig('');
  };

  return (
    <CModal show={show} onClose={toggleModal} size="lg">
      <CModalHeader className="p-1">
        <CModalTitle className="pl-1 pt-1">{t('configure.title')}</CModalTitle>
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
            <CRow>
              <CCol md="10" className="mt-1">
                <h6>{t('configure.enter_new')}</h6>
              </CCol>
              <CCol>
                <CButton
                  type="reset"
                  size="sm"
                  onClick={resetText}
                  color="danger"
                  variant="outline"
                >
                  {t('common.clear')}
                </CButton>
              </CCol>
            </CRow>
            <CRow className="mt-4">
              <CCol>
                <CForm>
                  <CTextarea
                    name="textarea-input"
                    id="textarea-input"
                    rows="9"
                    placeholder={t('configure.placeholder')}
                    value={newConfig}
                    onChange={(event) => setNewConfig(event.target.value)}
                    invalid={errorJson}
                  />
                  <CInvalidFeedback className="help-block">
                    {t('configure.valid_json')}
                  </CInvalidFeedback>
                </CForm>
              </CCol>
            </CRow>
            <CRow className="mt-4">
              <CCol>{t('configure.choose_file')}</CCol>
              <CCol>
                <CInputFile
                  id="file-input"
                  name="file-input"
                  accept=".json"
                  onChange={(e) => handleJsonFile(e.target.files[0])}
                  key={inputKey}
                />
              </CCol>
            </CRow>
            <CAlert color="danger" hidden={!hadSuccess && !hadFailure}>
              {responseBody}
            </CAlert>
          </CModalBody>
          <CModalFooter>
            <div hidden={!checkingIfSure}>Are you sure?</div>
            <CButton
              disabled={waiting}
              hidden={checkingIfSure}
              color="primary"
              onClick={confirmingIfSure}
            >
              {t('common.save')}
            </CButton>
            <CButton
              hidden={!checkingIfSure}
              disabled={waiting}
              color="primary"
              onClick={() => doAction(false)}
            >
              {waiting && !doingNow ? t('common.saving') : t('common.yes')} {'   '}
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
