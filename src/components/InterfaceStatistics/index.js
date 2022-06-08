import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as createUuid } from 'uuid';
import {
  CCard,
  CCardHeader,
  CCardBody,
  CPopover,
  CButton,
  CSelect,
  CFormText,
} from '@coreui/react';
import DatePicker from 'react-widgets/DatePicker';
import { cilSync } from '@coreui/icons';
import { useDevice } from 'ucentral-libs';
import CIcon from '@coreui/icons-react';
import { useGlobalWebSocket } from 'contexts/WebSocketProvider';
import StatisticsChartList from './StatisticsChartList';
import LatestStatisticsmodal from './LatestStatisticsModal';

const getStart = () => {
  const date = new Date();
  date.setHours(date.getHours() - 1);
  return date;
};
const DeviceStatisticsCard = () => {
  const { t } = useTranslation();
  const [showLatestModal, setShowLatestModal] = useState(false);
  const [options, setOptions] = useState([]);
  const [section, setSection] = useState('');
  const [startError, setStartError] = useState(false);
  const [endError, setEndError] = useState(false);
  const { deviceSerialNumber } = useDevice();
  const [nextUpdate, setNextUpdate] = useState(undefined);
  const { addDeviceListener, removeDeviceListener } = useGlobalWebSocket();
  const [time, setTime] = useState({
    refreshId: '0',
    start: getStart(),
    end: new Date().toISOString(),
  });

  const toggleLatestModal = () => {
    setShowLatestModal(!showLatestModal);
  };

  const modifyStart = (value, refresh = true) => {
    try {
      new Date(value).toISOString();
      setStartError(false);
      if (refresh) setTime({ ...time, refreshId: createUuid(), start: value, isChosen: true });
      else setTime({ ...time, start: value, isChosen: true });
    } catch (e) {
      setStartError(true);
    }
  };

  const modifyEnd = (value, refresh = true) => {
    try {
      new Date(value).toISOString();
      setEndError(false);
      if (refresh) setTime({ ...time, refreshId: createUuid(), end: value, isChosen: true });
      else setTime({ ...time, end: value, isChosen: true });
    } catch (e) {
      setEndError(true);
    }
  };

  const refresh = () => {
    setTime({ refreshId: createUuid(), start: getStart(), end: new Date().toISOString() });
  };

  const handleRefreshClick = () => {
    refresh();
  };

  useEffect(() => {
    if (section === '' && options.length > 0) setSection(options[0].value);
  }, [options]);

  useEffect(() => {
    if (nextUpdate && !time.isChosen) {
      setTime({ refreshId: createUuid(), start: getStart(), end: new Date().toISOString() });
      setNextUpdate(undefined);
    }
  }, [nextUpdate, time]);

  useEffect(() => {
    setNextUpdate(undefined);
    if (deviceSerialNumber) {
      addDeviceListener({
        serialNumber: deviceSerialNumber,
        types: ['device_statistics'],
        onTrigger: () => setNextUpdate(1),
      });
      refresh();
    }

    return () => {
      if (deviceSerialNumber) {
        removeDeviceListener({
          serialNumber: deviceSerialNumber,
        });
      }
    };
  }, [deviceSerialNumber]);

  return (
    <div>
      <CCard className="m-0">
        <CCardHeader className="dark-header">
          <div className="d-flex flex-row-reverse align-items-center">
            <div className="pl-2">
              <CPopover content={t('common.refresh')}>
                <CButton
                  size="sm"
                  color="info"
                  onClick={handleRefreshClick}
                  disabled={startError || endError}
                >
                  <CIcon content={cilSync} />
                </CButton>
              </CPopover>
            </div>
            <div className="pl-2">
              <DatePicker
                includeTime
                onChange={(date) => modifyEnd(date)}
                value={time.end ? new Date(time.end) : undefined}
              />
              <CFormText color="danger" hidden={!endError}>
                {t('common.invalid_date_explanation')}
              </CFormText>
            </div>
            To:
            <div className="pl-2">
              <DatePicker
                includeTime
                onChange={(date) => modifyStart(date)}
                value={time.start ? new Date(time.start) : undefined}
              />
              <CFormText color="danger" hidden={!startError}>
                {t('common.invalid_date_explanation')}
              </CFormText>
            </div>
            From:
            <div className="px-2">
              <CSelect
                custom
                value={section}
                disabled={options.length === 0}
                onChange={(e) => setSection(e.target.value)}
              >
                {options.map((opt) => (
                  <option value={opt.value} key={createUuid()}>
                    {opt.label}
                  </option>
                ))}
              </CSelect>
            </div>
            <div className="pl-2">
              <CButton size="sm" color="info" onClick={toggleLatestModal}>
                {t('statistics.show_latest')}
              </CButton>
            </div>
          </div>
        </CCardHeader>
        <CCardBody className="p-1">
          <StatisticsChartList
            deviceSerialNumber={deviceSerialNumber}
            setOptions={setOptions}
            section={section}
            time={time}
          />
        </CCardBody>
      </CCard>
      <LatestStatisticsmodal show={showLatestModal} toggle={toggleLatestModal} />
    </div>
  );
};

export default DeviceStatisticsCard;
