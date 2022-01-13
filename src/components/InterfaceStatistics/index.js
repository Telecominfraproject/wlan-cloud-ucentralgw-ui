import React, { useState } from 'react';
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
import CIcon from '@coreui/icons-react';
import eventBus from 'utils/eventBus';
import LifetimeStatsmodal from 'components/LifetimeStatsModal';
import StatisticsChartList from './StatisticsChartList';
import LatestStatisticsmodal from './LatestStatisticsModal';

const DeviceStatisticsCard = () => {
  const { t } = useTranslation();
  const [showLatestModal, setShowLatestModal] = useState(false);
  const [showLifetimeModal, setShowLifetimeModal] = useState(false);
  const [options, setOptions] = useState([]);
  const [section, setSection] = useState('memory');
  const [start, setStart] = useState('');
  const [startError, setStartError] = useState(false);
  const [end, setEnd] = useState('');
  const [endError, setEndError] = useState(false);

  const toggleLatestModal = () => {
    setShowLatestModal(!showLatestModal);
  };

  const toggleLifetimeModal = () => {
    setShowLifetimeModal(!showLifetimeModal);
  };

  const modifyStart = (value) => {
    try {
      new Date(value).toISOString();
      setStartError(false);
      setStart(value);
    } catch (e) {
      setStart('');
      setStartError(true);
    }
  };

  const modifyEnd = (value) => {
    try {
      new Date(value).toISOString();
      setEndError(false);
      setEnd(value);
    } catch (e) {
      setEnd('');
      setEndError(true);
    }
  };

  const refresh = () => {
    eventBus.dispatch('refreshInterfaceStatistics', { message: 'Refresh interface statistics' });
  };

  return (
    <div>
      <CCard className="m-0">
        <CCardHeader className="dark-header">
          <div className="d-flex flex-row-reverse align-items-center">
            <div className="pl-2">
              <CPopover content={t('common.refresh')}>
                <CButton size="sm" color="info" onClick={refresh}>
                  <CIcon content={cilSync} />
                </CButton>
              </CPopover>
            </div>
            <div className="pl-2">
              <CButton size="sm" color="info" onClick={toggleLifetimeModal}>
                Lifetime Statistics
              </CButton>
            </div>
            <div className="pl-2">
              <CButton size="sm" color="info" onClick={toggleLatestModal}>
                {t('statistics.show_latest')}
              </CButton>
            </div>
            <div className="pl-2">
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
              <DatePicker includeTime onChange={(date) => modifyEnd(date)} />
              <CFormText color="danger" hidden={!endError}>
                {t('common.invalid_date_explanation')}
              </CFormText>
            </div>
            To:
            <div className="pl-2">
              <DatePicker includeTime onChange={(date) => modifyStart(date)} />
              <CFormText color="danger" hidden={!startError}>
                {t('common.invalid_date_explanation')}
              </CFormText>
            </div>
            From:
          </div>
        </CCardHeader>
        <CCardBody className="p-1">
          <StatisticsChartList setOptions={setOptions} section={section} start={start} end={end} />
        </CCardBody>
      </CCard>
      <LatestStatisticsmodal show={showLatestModal} toggle={toggleLatestModal} />
      <LifetimeStatsmodal show={showLifetimeModal} toggle={toggleLifetimeModal} />
    </div>
  );
};

export default DeviceStatisticsCard;
