import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CCard, CCardHeader, CCardBody, CPopover, CButton } from '@coreui/react';
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
        <CCardHeader className="p-1">
          <div className="d-flex flex-row-reverse align-items-center">
            <div className="pl-2">
              <CPopover content={t('common.refresh')}>
                <CButton size="sm" color="primary" variant="outline" onClick={refresh}>
                  <CIcon content={cilSync} />
                </CButton>
              </CPopover>
            </div>
            <div className="pl-2">
              <CButton size="sm" color="primary" variant="outline" onClick={toggleLifetimeModal}>
                Lifetime Statistics
              </CButton>
            </div>
            <div className="pl-2">
              <CButton size="sm" color="primary" variant="outline" onClick={toggleLatestModal}>
                {t('statistics.show_latest')}
              </CButton>
            </div>
          </div>
        </CCardHeader>
        <CCardBody className="p-1">
          <StatisticsChartList />
        </CCardBody>
      </CCard>
      <LatestStatisticsmodal show={showLatestModal} toggle={toggleLatestModal} />
      <LifetimeStatsmodal show={showLifetimeModal} toggle={toggleLifetimeModal} />
    </div>
  );
};

export default DeviceStatisticsCard;
