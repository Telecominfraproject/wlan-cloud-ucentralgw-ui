import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { CCard, CCardHeader, CCardBody, CPopover, CRow, CCol } from '@coreui/react';
import { cilSync } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import StatisticsChartList from './StatisticsChartList';
import styles from './index.module.scss';

const DeviceStatisticsCard = ({ selectedDeviceId }) => {
  const { t } = useTranslation();
  const [lastRefresh, setLastRefresh] = useState(new Date().toString());

  const refresh = () => {
    setLastRefresh(new Date().toString());
  };

  return (
    <CCard>
      <CCardHeader>
        <CRow>
          <CCol>{t('statistics.title')}</CCol>
          <CCol className={styles.alignRight}>
            <CPopover content={t('common.refresh')}>
              <CIcon
                onClick={refresh}
                name="cil-sync"
                content={cilSync}
                size="lg"
                color="primary"
              />
            </CPopover>
          </CCol>
        </CRow>
      </CCardHeader>
      <CCardBody className={styles.statsBody}>
        <StatisticsChartList selectedDeviceId={selectedDeviceId} lastRefresh={lastRefresh} />
      </CCardBody>
    </CCard>
  );
};

DeviceStatisticsCard.propTypes = {
  selectedDeviceId: PropTypes.string.isRequired,
};

export default DeviceStatisticsCard;
