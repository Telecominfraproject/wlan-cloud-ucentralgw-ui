import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem, CCard, CCardHeader, CCardBody, CRow, CCol } from '@coreui/react';
import { cilOptions } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import StatisticsChartList from './StatisticsChartList';
import LatestStatisticsModal from './LatestStatisticsModal';
import styles from './index.module.scss';

const DeviceStatisticsCard = ({ selectedDeviceId }) => {
  const { t } = useTranslation();
  const [lastRefresh, setLastRefresh] = useState(new Date().toString());
  const [showLatestModal, setShowLatestModal] = useState(false);

  const toggleLatestModal = () => {
    setShowLatestModal(!showLatestModal);
  }

  const refresh = () => {
    setLastRefresh(new Date().toString());
  };

  return (
    <div>
      <CCard>
        <CCardHeader>
          <CRow>
            <CCol><h4>{t('statistics.title')}</h4></CCol>
            <CCol className={styles.alignRight}>
              <CDropdown className="m-1 btn-group">
                <CDropdownToggle>
                  <CIcon
                    name="cil-options"
                    content={cilOptions}
                    size="lg"
                    color="primary"
                  />
                </CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem onClick={refresh}>{t('common.refresh')}</CDropdownItem>
                  <CDropdownItem onClick={toggleLatestModal}>{t('statistics.show_latest')}</CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody className={styles.statsBody}>
          <StatisticsChartList selectedDeviceId={selectedDeviceId} lastRefresh={lastRefresh} />
        </CCardBody>
      </CCard>
      <LatestStatisticsModal show={showLatestModal} toggle={toggleLatestModal} serialNumber={selectedDeviceId}/>
    </div>
  );
};

DeviceStatisticsCard.propTypes = {
  selectedDeviceId: PropTypes.string.isRequired,
};

export default DeviceStatisticsCard;
