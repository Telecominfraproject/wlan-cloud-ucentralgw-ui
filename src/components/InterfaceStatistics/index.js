import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';
import { CCard, CCardHeader, CCardBody, CRow, CCol, CPopover, CButton } from '@coreui/react';
import { cilSync } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import eventBus from 'utils/eventBus';
import LifetimeStatsmodal from 'components/LifetimeStatsModal';
import StatisticsChartList from './StatisticsChartList';
import LatestStatisticsmodal from './LatestStatisticsModal';

const DeviceStatisticsCard = () => {
  const history = useHistory();
  const { deviceId } = useParams();
  const { t } = useTranslation();
  const [showLatestModal, setShowLatestModal] = useState(false);
  const [showLifetimeModal, setShowLifetimeModal] = useState(false);

  const toggleLatestModal = () => {
    setShowLatestModal(!showLatestModal);
  };

  const toggleLifetimeModal = () => {
    setShowLifetimeModal(!showLifetimeModal);
  };

  const goToAnalysis = () => {
    history.push(`/devices/${deviceId}/wifianalysis`);
  };

  const refresh = () => {
    eventBus.dispatch('refreshInterfaceStatistics', { message: 'Refresh interface statistics' });
  };

  return (
    <div>
      <CCard>
        <CCardHeader>
          <CRow>
            <CCol>
              <div className="text-value-xxl pt-2">{t('statistics.title')}</div>
            </CCol>
            <CCol sm="6" xxl="6">
              <CRow>
                <CCol sm="1" xxl="5" />
                <CCol sm="4" xxl="2" className="text-right">
                  <CButton color="secondary" onClick={goToAnalysis}>
                    {t('wifi_analysis.title')}
                  </CButton>
                </CCol>
                <CCol sm="3" xxl="2" className="text-right">
                  <CButton color="secondary" onClick={toggleLatestModal}>
                    {t('statistics.show_latest')}
                  </CButton>
                </CCol>
                <CCol sm="3" xxl="2" className="text-right">
                  <CButton color="secondary" onClick={toggleLifetimeModal}>
                    Lifetime Statistics
                  </CButton>
                </CCol>
                <CCol sm="1" xxl="1" className="text-center">
                  <CPopover content={t('common.refresh')}>
                    <CButton color="secondary" onClick={refresh} size="sm">
                      <CIcon content={cilSync} />
                    </CButton>
                  </CPopover>
                </CCol>
              </CRow>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody className="p-5">
          <StatisticsChartList />
        </CCardBody>
      </CCard>
      <LatestStatisticsmodal show={showLatestModal} toggle={toggleLatestModal} />
      <LifetimeStatsmodal show={showLifetimeModal} toggle={toggleLifetimeModal} />
    </div>
  );
};

export default DeviceStatisticsCard;
