import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CCol,
  CRow,
  CSelect,
  CSwitch,
  CForm,
  CInputRadio,
  CFormGroup,
  CLabel,
} from '@coreui/react';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import 'react-widgets/styles.css';
import axiosInstance from 'utils/axiosInstance';
import eventBus from 'utils/eventBus';
import { LoadingButton, useAuth, useDevice } from 'ucentral-libs';
import SuccessfulActionModalBody from 'components/SuccessfulActionModalBody';
import WaitingForTraceBody from './WaitingForTraceBody';

const TraceModal = ({ show, toggleModal }) => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const { deviceSerialNumber, getDeviceConnection } = useDevice();
  const [hadSuccess, setHadSuccess] = useState(false);
  const [hadFailure, setHadFailure] = useState(false);
  const [blockFields, setBlockFields] = useState(false);
  const [usingDuration, setUsingDuration] = useState(true);
  const [duration, setDuration] = useState(20);
  const [packets, setPackets] = useState(100);
  const [responseBody, setResponseBody] = useState('');
  const [chosenInterface, setChosenInterface] = useState('up');
  const [isDeviceConnected, setIsDeviceConnected] = useState(false);
  const [waitForTrace, setWaitForTrace] = useState(false);
  const [waitingForTrace, setWaitingForTrace] = useState(false);
  const [commandUuid, setCommandUuid] = useState(null);

  const toggleWaitForTrace = () => {
    setWaitForTrace(!waitForTrace);
  };

  useEffect(() => {
    setWaitForTrace(false);
    setHadSuccess(false);
    setHadFailure(false);
    setResponseBody('');
    setDuration(20);
    setPackets(100);
    setChosenInterface('up');
    setWaitingForTrace(false);
  }, [show]);

  const doAction = () => {
    setBlockFields(true);
    setHadFailure(false);
    setHadSuccess(false);

    const parameters = {
      serialNumber: deviceSerialNumber,
      when: 0,
      network: chosenInterface,
    };

    if (usingDuration) {
      parameters.duration = parseInt(duration, 10);
    } else {
      parameters.numberOfPackets = parseInt(packets, 10);
    }

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };

    axiosInstance
      .post(
        `${endpoints.ucentralgw}/api/v1/device/${encodeURIComponent(deviceSerialNumber)}/trace`,
        parameters,
        { headers },
      )
      .then((response) => {
        setHadSuccess(true);
        if (waitForTrace) {
          setCommandUuid(response.data.UUID);
          setWaitingForTrace(true);
        }
      })
      .catch(() => {
        setResponseBody(t('commands.error'));
        setHadFailure(true);
      })
      .finally(() => {
        setBlockFields(false);
        setBlockFields(false);
        eventBus.dispatch('actionCompleted', { message: 'An action has been completed' });
      });
  };

  useEffect(() => {
    if (deviceSerialNumber !== null && show) {
      const asyncGet = async () => {
        const isConnected = await getDeviceConnection(
          deviceSerialNumber,
          currentToken,
          endpoints.ucentralgw,
        );
        setIsDeviceConnected(isConnected);
      };
      asyncGet();
    }
  }, [show]);

  const getBody = () => {
    if (waitingForTrace) {
      return (
        <WaitingForTraceBody
          toggle={toggleModal}
          serialNumber={deviceSerialNumber}
          commandUuid={commandUuid}
        />
      );
    }
    if (hadSuccess) {
      return <SuccessfulActionModalBody toggleModal={toggleModal} />;
    }
    return (
      <div>
        <CModalBody>
          <h6>{t('trace.directions')}</h6>
          <CRow className="mt-3">
            <CCol>
              <CButton
                disabled={blockFields}
                block
                color="primary"
                onClick={() => setUsingDuration(true)}
              >
                {t('common.duration')}
              </CButton>
            </CCol>
            <CCol>
              <CButton
                disabled={blockFields}
                block
                color="primary"
                onClick={() => setUsingDuration(false)}
              >
                {t('trace.packets')}
              </CButton>
            </CCol>
          </CRow>
          <CRow className="mt-3">
            <CCol md="4" className="pt-2">
              {usingDuration ? 'Duration: ' : 'Packets: '}
            </CCol>
            <CCol xs="12" md="8">
              {usingDuration ? (
                <CSelect
                  custom
                  defaultValue={duration}
                  disabled={blockFields}
                  onChange={(e) => setDuration(e.target.value)}
                >
                  <option value="20">20s</option>
                  <option value="40">40s</option>
                  <option value="60">60s</option>
                  <option value="120">120s</option>
                </CSelect>
              ) : (
                <CSelect
                  custom
                  defaultValue={packets}
                  disabled={blockFields}
                  onChange={(e) => setPackets(e.target.value)}
                >
                  <option value="100">100</option>
                  <option value="250">250</option>
                  <option value="500">500</option>
                  <option value="1000">1000</option>
                </CSelect>
              )}
            </CCol>
          </CRow>
          <CRow className="mt-3">
            <CCol md="7">{t('trace.choose_network')}:</CCol>
            <CCol>
              <CForm>
                <CFormGroup variant="checkbox" onClick={() => setChosenInterface('up')}>
                  <CInputRadio
                    defaultChecked={chosenInterface === 'up'}
                    id="traceRadio1"
                    name="radios"
                    value="traceOption1"
                  />
                  <CLabel variant="checkbox" htmlFor="traceRadio1">
                    Up
                  </CLabel>
                </CFormGroup>
                <CFormGroup variant="checkbox" onClick={() => setChosenInterface('down')}>
                  <CInputRadio
                    defaultChecked={chosenInterface === 'down'}
                    id="traceRadio2"
                    name="radios"
                    value="traceOption2"
                  />
                  <CLabel variant="checkbox" htmlFor="traceRadio2">
                    Down
                  </CLabel>
                </CFormGroup>
              </CForm>
            </CCol>
          </CRow>
          <CRow className="mt-3" hidden={!isDeviceConnected}>
            <CCol md="8">
              <p>{t('trace.wait_for_file')}</p>
            </CCol>
            <CCol>
              <CSwitch
                disabled={blockFields}
                color="primary"
                defaultChecked={waitForTrace}
                onClick={toggleWaitForTrace}
                labelOn={t('common.yes')}
                labelOff={t('common.no')}
              />
            </CCol>
          </CRow>
          <div hidden={!hadSuccess && !hadFailure}>
            <div>
              <pre className="ignore">{responseBody} </pre>
            </div>
          </div>
        </CModalBody>
        <CModalFooter>
          <LoadingButton
            label={t('trace.trace')}
            isLoadingLabel={t('common.loading_ellipsis')}
            isLoading={blockFields}
            action={doAction}
            block={false}
            disabled={blockFields}
          />
          <CButton color="secondary" onClick={toggleModal}>
            {t('common.cancel')}
          </CButton>
        </CModalFooter>
      </div>
    );
  };

  return (
    <CModal show={show} onClose={toggleModal}>
      <CModalHeader closeButton>
        <CModalTitle>{t('trace.title')}</CModalTitle>
      </CModalHeader>
      {getBody()}
    </CModal>
  );
};

TraceModal.propTypes = {
  show: PropTypes.bool.isRequired,
  toggleModal: PropTypes.func.isRequired,
};

export default TraceModal;
