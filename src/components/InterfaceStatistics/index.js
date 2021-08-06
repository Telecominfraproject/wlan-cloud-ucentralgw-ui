import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';
import { CCard, CCardHeader, CCardBody, CRow, CCol, CPopover, CButton } from '@coreui/react';
import { cilSync } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import eventBus from 'utils/eventBus';
import StatisticsChartList from './StatisticsChartList';
import LatestStatisticsModal from './LatestStatisticsModal';

const DeviceStatisticsCard = () => {
  const history = useHistory();
  const { deviceId } = useParams();
  const { t } = useTranslation();
  const [showLatestModal, setShowLatestModal] = useState(false);

  const toggleLatestModal = () => {
    setShowLatestModal(!showLatestModal);
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
              <div className="text-value-lg pt-2">{t('statistics.title')}</div>
            </CCol>
            <CCol sm="3" className="pt-2">
              <CRow>
                <CCol sm="5" className="text-right">
                  <CButton color="secondary" onClick={goToAnalysis}>
                    {t('wifi_analysis.title')}
                  </CButton>
                </CCol>
                <CCol sm="5" className="text-center">
                  <CButton color="secondary" onClick={toggleLatestModal}>
                    {t('statistics.show_latest')}
                  </CButton>
                </CCol>
                <CCol sm="2" className="text-center">
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
      <LatestStatisticsModal show={showLatestModal} toggle={toggleLatestModal} />
    </div>
  );
};

export default DeviceStatisticsCard;
