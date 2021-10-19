import { CCard, CCardTitle, CCardBody, CDataTable, CCardHeader } from '@coreui/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import 'react-widgets/styles.css';

const parseDbm = (value) => {
  if (!value) return '-';
  if (value > -150 && value < 100) return value;
  return 4294967295 + value;
};

const WifiChannelCard = ({ channel }) => {
  const { t } = useTranslation();
  const columns = [{ key: 'SSID', _style: { width: '70%' } }, { key: 'Signal' }];

  return (
    <CCard>
      <CCardHeader>
        <CCardTitle className="text-dark">
          {t('scan.channel')} #{channel.channel}
        </CCardTitle>
      </CCardHeader>
      <CCardBody>
        <div className="overflow-auto" style={{ height: '250px' }}>
          <CDataTable
            items={channel.devices}
            fields={columns}
            className="text-white"
            scopedSlots={{
              Signal: (item) => <td>{parseDbm(item.Signal)}</td>,
            }}
          />
        </div>
      </CCardBody>
    </CCard>
  );
};

WifiChannelCard.propTypes = {
  channel: PropTypes.instanceOf(Object).isRequired,
};

export default WifiChannelCard;
