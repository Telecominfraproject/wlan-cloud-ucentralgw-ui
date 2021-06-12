import {
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
} from '@coreui/react';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import 'react-widgets/styles.css';
import { getToken } from 'utils/authHelper';
import { checkIfJson } from 'utils/helper';
import axiosInstance from 'utils/axiosInstance';
import eventBus from 'utils/EventBus';
import SuccessfulActionModalBody from 'components/SuccessfulActionModalBody/SuccessfulActionModalBody';

const ConfigureModal = ({ show, toggleModal }) => {
  const [hadSuccess, setHadSuccess] = useState(false);
  const [hadFailure, setHadFailure] = useState(false);
  const [doingNow, setDoingNow] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [newConfig, setNewConfig] = useState('');
  const [responseBody, setResponseBody] = useState('');
  const [checkingIfSure, setCheckingIfSure] = useState(false);
  const [errorJson, setErrorJson] = useState(false);
  const [inputKey, setInputKey] = useState(0);
  const selectedDeviceId = useSelector((state) => state.selectedDeviceId);
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

    const token = getToken();

    const parameters = {
      serialNumber: selectedDeviceId,
      when: 0,
      UUID: 1,
      configuration: JSON.parse(newConfig),
    };

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    };

    axiosInstance
      .post(`/device/${encodeURIComponent(selectedDeviceId)}/configure`, parameters, { headers })
      .then(() => {
        setResponseBody('Command submitted!');
        setHadSuccess(true);
      })
      .catch(() => {
        setResponseBody('Error while submitting command!');
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
    <CModal show={show} onClose={toggleModal}>
      <CModalHeader closeButton>
        <CModalTitle>Configure Device</CModalTitle>
      </CModalHeader>
      {hadSuccess ? (
        <SuccessfulActionModalBody toggleModal={toggleModal} />
      ) : (
        <div>
          <CModalBody>
            <CRow>
              <CCol md="10" style={{ marginTop: '3px' }}>
                <h6>Enter new device configuration: </h6>
              </CCol>
              <CCol>
                <CButton
                  type="reset"
                  size="sm"
                  onClick={resetText}
                  color="danger"
                  variant="outline"
                >
                  Clear
                </CButton>
              </CCol>
            </CRow>
            <CRow style={{ marginTop: '20px' }}>
              <CCol>
                <CForm>
                  <CTextarea
                    name="textarea-input"
                    id="textarea-input"
                    rows="9"
                    placeholder="Config JSON"
                    value={newConfig}
                    onChange={(event) => setNewConfig(event.target.value)}
                    invalid={errorJson}
                  />
                  <CInvalidFeedback className="help-block">
                    You need to enter valid JSON
                  </CInvalidFeedback>
                </CForm>
              </CCol>
            </CRow>
            <CRow style={{ marginTop: '20px' }}>
              <CCol>Choose a JSON config file:</CCol>
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
              onClick={confirmingIfSure}
            >
              Submit
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
              Cancel
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
