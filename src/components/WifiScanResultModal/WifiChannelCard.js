import { CCard, CCardTitle, CCardBody, CDataTable, CCardHeader } from '@coreui/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import 'react-widgets/styles.css';
import styles from './index.module.scss';

const WifiChannelCard = ({ channel }) => {
  const { t } = useTranslation();
  const columns = [{ key: 'SSID', _style: { width: '70%' } }, { key: 'Signal' }];

  return (
    <CCard>
      <CCardHeader>
        <CCardTitle className={styles.cardTitle}>
          {t('scan.channel')} #{channel.channel}
        </CCardTitle>
      </CCardHeader>
      <CCardBody>
        <div className={[styles.scrollable, 'overflow-auto'].join(' ')}>
          <CDataTable items={channel.devices} fields={columns} className={styles.datatable} />
        </div>
      </CCardBody>
    </CCard>
  );
};

WifiChannelCard.propTypes = {
  channel: PropTypes.instanceOf(Object).isRequired,
};

export default WifiChannelCard;
