import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as createUuid } from 'uuid';
import { CCard, CCardHeader, CCardBody, CPopover, CButton, CSelect } from '@coreui/react';
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

  const toggleLatestModal = () => {
    setShowLatestModal(!showLatestModal);
  };

  const toggleLifetimeModal = () => {
    setShowLifetimeModal(!showLifetimeModal);
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
          </div>
        </CCardHeader>
        <CCardBody className="p-1">
          <StatisticsChartList setOptions={setOptions} section={section} />
        </CCardBody>
      </CCard>
      <LatestStatisticsmodal show={showLatestModal} toggle={toggleLatestModal} />
      <LifetimeStatsmodal show={showLifetimeModal} toggle={toggleLifetimeModal} />
    </div>
  );
};

export default DeviceStatisticsCard;
