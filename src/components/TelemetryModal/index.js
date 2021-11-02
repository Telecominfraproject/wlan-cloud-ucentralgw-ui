import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import Select from 'react-select';
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CButton,
  CPopover,
  CRow,
  CCol,
  CInput,
  CSpinner,
  CAlert,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilX } from '@coreui/icons';
import { useDevice, useAuth, useToast } from 'ucentral-libs';
import axiosInstance from 'utils/axiosInstance';
import { checkIfJson } from 'utils/helper';

const typeOptions = [
  { value: 'wifi-frames', label: 'wifi-frames' },
  { value: 'dhcp-snooping', label: 'dhcp-snooping' },
  { value: 'state', label: 'state' },
];

const TelemetryModal = ({ show, toggle }) => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const { deviceSerialNumber } = useDevice();
  const { addToast } = useToast();
  const [socket, setSocket] = useState(null);
  const [lastMessage, setLastMessage] = useState({});
  const [receivedMessages, setReceivedMessages] = useState(0);
  const [types, setTypes] = useState([]);
  const [interval, setInterval] = useState(3);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState('');

  const onIntervalChange = (e) => setInterval(e.target.value);

  const closeSocket = () => {
    if (socket !== null) {
      socket.close();
      setSocket(null);
    }
  };

  const getUrl = () => {
    setLastUpdate('');
    setLastMessage({});
    setLoading(true);

    const parameters = {
      serialNumber: deviceSerialNumber,
      interval: parseInt(interval, 10),
      types: types.map((type) => type.value),
    };

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };

    axiosInstance
      .post(
        `${endpoints.owgw}/api/v1/device/${encodeURIComponent(deviceSerialNumber)}/telemetry`,
        parameters,
        { headers },
      )
      .then((response) => {
        if (response.data.uri && response.data.uri !== '') {
          setReceivedMessages(0);
          setSocket(new WebSocket(response.data.uri));
        }
      })
      .catch((e) => {
        addToast({
          title: t('common.error'),
          body: t('telemetry.connection_failed', { error: e.response?.data?.ErrorDescription }),
          color: 'danger',
          autohide: true,
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (socket !== null) {
      socket.onopen = () => {
        socket.send(`token:${currentToken}`);
      };

      socket.onmessage = (event) => {
        if (checkIfJson(event.data)) {
          const result = JSON.parse(event.data);
          setLastMessage(result);
          setLastUpdate(new Date().toLocaleString());
        }
      };
    }

    return () => closeSocket();
  }, [socket]);

  useEffect(() => {
    if (!show && socket !== null) {
      closeSocket();
    }
  }, [show, socket]);

  useEffect(() => {
    if (lastMessage !== {}) setReceivedMessages(receivedMessages + 1);
  }, [lastMessage]);

  return (
    <CModal className="text-dark" size="lg" show={show} onClose={toggle}>
      <CModalHeader className="p-1">
        <CModalTitle className="pl-1 pt-1">{t('actions.telemetry')}</CModalTitle>
        <div className="text-right">
          <CPopover content={t('common.close')}>
            <CButton color="primary" variant="outline" className="ml-2" onClick={toggle}>
              <CIcon content={cilX} />
            </CButton>
          </CPopover>
        </div>
      </CModalHeader>
      <CModalBody className="px-5">
        {socket === null ? (
          <div>
            <CRow>
              <CCol>{`${t('telemetry.interval')}: ${interval} ${t('common.seconds')}`}</CCol>
            </CRow>
            <CRow>
              <CCol>
                <CInput
                  type="range"
                  min="1"
                  max="120"
                  step="1"
                  onChange={onIntervalChange}
                  value={interval}
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol sm="2" className="pt-2">
                {t('telemetry.types')}:
              </CCol>
              <CCol sm="6">
                <Select
                  isMulti
                  closeMenuOnSelect={false}
                  name="Device Types"
                  options={typeOptions}
                  onChange={setTypes}
                  value={types}
                  className="basic-multi-select"
                  classNamePrefix="select"
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol className="text-center p-4">
                <CButton color="primary" onClick={getUrl} disabled={loading || types.length === 0}>
                  Start Telemetry!
                </CButton>
              </CCol>
            </CRow>
          </div>
        ) : (
          <div>
            <CRow>
              <CCol>
                {t('telemetry.interval')}: {interval} {t('common.seconds')}
              </CCol>
            </CRow>
            <CRow>
              <CCol>
                {t('telemetry.types')}: {types.map((type) => type.label).join(', ')}
              </CCol>
            </CRow>
            <CRow>
              <CCol>
                {t('telemetry.last_update')}: {lastUpdate}
              </CCol>
            </CRow>
            <CRow>
              <CCol className="font-weight-bold">Received Messages: {receivedMessages}</CCol>
            </CRow>
            <CRow>
              <CCol>
                <pre>{JSON.stringify(lastMessage, null, 2)}</pre>
              </CCol>
            </CRow>
            <CRow>
              {socket.readyState === WebSocket.OPEN ||
              socket.readyState === WebSocket.CONNECTING ? (
                <CCol className="d-flex justify-content-center align-items-center">
                  <CSpinner />
                </CCol>
              ) : (
                <CCol>
                  <CAlert color="danger">{t('common.socket_connection_closed')}</CAlert>
                </CCol>
              )}
            </CRow>
          </div>
        )}
      </CModalBody>
    </CModal>
  );
};

TelemetryModal.propTypes = {
  show: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
};

export default TelemetryModal;
