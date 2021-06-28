import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { CModalBody, CButton, CSpinner, CModalFooter } from '@coreui/react';
import { getToken } from 'utils/authHelper';
import axiosInstance from 'utils/axiosInstance';

import styles from './index.module.scss';

const WaitingForTraceBody = ({serialNumber, commandUuid, toggle}) => {
  const { t } = useTranslation();
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [waitingForFile, setWaitingForFile] = useState(true);

  const getTraceResult = () => {
    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
    };

    axiosInstance
      .get(`/command/${encodeURIComponent(commandUuid)}`, options)
      .then((response) => {
        if(response.data.waitingForFile === 0){
          setWaitingForFile(false);
        }
      })
      .catch(() => {});
  }

  const downloadTrace = () => {
    const options = {
      headers: {
        Accept: 'application/octet-stream',
        Authorization: `Bearer ${getToken()}`,
      },
      responseType: 'arraybuffer',
    };

    axiosInstance
      .get(`/file/${commandUuid}?serialNumber=${serialNumber}`, options)
      .then((response) => {
        const blob = new Blob([response.data], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `Trace_${commandUuid}.pcap`;
        link.click();
      });
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed(secondsElapsed + 1);
    }, 1000);
    if(!waitingForFile){
      clearInterval(timer);
    }
    return () => {
      clearInterval(timer);
    }
  }, [waitingForFile, secondsElapsed]);

  useEffect(() => {
    const refreshStatus = setInterval(() => {
      getTraceResult();
    }, 5000);
    if(!waitingForFile){
      clearInterval(refreshStatus);
    }
    return () => {
      clearInterval(refreshStatus);
    }
  }, [waitingForFile]);

  return (
    <div>
      <CModalBody>
        <h6>{t('trace.waiting_seconds', {seconds: secondsElapsed})}</h6>
        <p>{t('trace.waiting_directions')}</p>
        <div className={styles.centerDiv}>
          <CSpinner hidden={!waitingForFile} />
        </div>
        <CButton
          hidden={waitingForFile}
          onClick={downloadTrace}
          disabled={waitingForFile}
          color="link"
          block
        >
          {t('trace.download_trace')}
        </CButton>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" block onClick={toggle}>
          {t('common.close')}
        </CButton>
      </CModalFooter>
    </div>

  );
}

WaitingForTraceBody.propTypes = {
  serialNumber: PropTypes.string.isRequired,
  commandUuid: PropTypes.string.isRequired,
  toggle: PropTypes.func.isRequired
};

export default WaitingForTraceBody;
