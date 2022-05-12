import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CCol,
  CRow,
  CSwitch,
  CPopover,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilX } from '@coreui/icons';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import 'react-widgets/styles.css';
import axiosInstance from 'utils/axiosInstance';
import eventBus from 'utils/eventBus';
import { LoadingButton, useAuth, useDevice } from 'ucentral-libs';
import SuccessfulActionModalBody from 'components/SuccessfulActionModalBody';
import WaitingForLogDumpBody from './WaitingForLogDumpBody';

const LogDumpModal = ({ show, toggle }) => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const { deviceSerialNumber, getDeviceConnection } = useDevice();
  const [hadSuccess, setHadSuccess] = useState(false);
  const [hadFailure, setHadFailure] = useState(false);
  const [blockFields, setBlockFields] = useState(false);
  const [responseBody, setResponseBody] = useState('');
  const [isDeviceConnected, setIsDeviceConnected] = useState(false);
  const [waitForLogDump, setWaitForLogDump] = useState(false);
  const [waitingForLogDump, setWaitingForLogDump] = useState(false);
  const [commandUuid, setCommandUuid] = useState(null);

  const toggleWaitForLogDump = () => {
    setWaitForLogDump(!waitForLogDump);
  };

  useEffect(() => {
    setWaitForLogDump(false);
    setHadSuccess(false);
    setHadFailure(false);
    setResponseBody('');
    setWaitingForLogDump(false);
  }, [show]);

  const doAction = () => {
    setBlockFields(true);
    setHadFailure(false);
    setHadSuccess(false);

    const parameters = {
      serialNumber: deviceSerialNumber,
      when: 0,
    };

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };

    axiosInstance
      .post(
        `${endpoints.owgw}/api/v1/device/${encodeURIComponent(deviceSerialNumber)}/logdump`,
        parameters,
        { headers },
      )
      .then((response) => {
        setHadSuccess(true);
        if (waitForLogDump) {
          setCommandUuid(response.data.UUID);
          setWaitingForLogDump(true);
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
          endpoints.owgw,
        );
        setIsDeviceConnected(isConnected);
      };
      asyncGet();
    }
  }, [show]);

  const getBody = () => {
    if (waitingForLogDump) {
      return (
        <WaitingForLogDumpBody
          toggle={toggle}
          serialNumber={deviceSerialNumber}
          commandUuid={commandUuid}
        />
      );
    }
    if (hadSuccess) {
      return <SuccessfulActionModalBody toggleModal={toggle} />;
    }
    return (
      <div>
        <CModalBody>
          <h6>{t('logdump.directions')}</h6>
          <CRow className="mt-3" hidden={!isDeviceConnected}>
            <CCol md="8">
              <p>{t('logdump.wait_for_file')}</p>
            </CCol>
            <CCol>
              <CSwitch
                disabled={blockFields}
                color="primary"
                defaultChecked={waitForLogDump}
                onClick={toggleWaitForLogDump}
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
            label={t('logdump.logdump')}
            isLoadingLabel={t('common.loading_ellipsis')}
            isLoading={blockFields}
            action={doAction}
            block={false}
            disabled={blockFields}
          />
          <CButton color="secondary" onClick={toggle}>
            {t('common.cancel')}
          </CButton>
        </CModalFooter>
      </div>
    );
  };

  return (
    <CModal show={show} onClose={toggle}>
      <CModalHeader className="p-1">
        <CModalTitle className="pl-1 pt-1">{t('logdump.title')}</CModalTitle>
        <div className="text-right">
          <CPopover content={t('common.close')}>
            <CButton color="primary" variant="outline" className="ml-2" onClick={toggle}>
              <CIcon content={cilX} />
            </CButton>
          </CPopover>
        </div>
      </CModalHeader>
      {getBody()}
    </CModal>
  );
};

LogDumpModal.propTypes = {
  show: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
};

export default LogDumpModal;
