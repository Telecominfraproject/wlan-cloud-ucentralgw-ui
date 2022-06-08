import {
  CCard,
  CCardTitle,
  CCardBody,
  CDataTable,
  CButton,
  CPopover,
  CCardHeader,
} from '@coreui/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import 'react-widgets/styles.css';
import { Buffer } from 'buffer';
import IE_OPTIONS from '../WifiScanModal/IE_OPTIONS.json';

const parseDbm = (value) => {
  if (!value) return '-';
  if (value > -150 && value < 100) return value;
  return 4294967295 + value;
};

const getIeName = (type) => {
  for (const [key, value] of Object.entries(IE_OPTIONS)) {
    if (value === type) return `${key} (${type})`;
  }

  return type;
};

const parseIe = ({ name, type, data, content }) => {
  try {
    if (data) {
      const ie = Buffer.from(data, 'base64');
      const arr = new Uint16Array(ie);
      const finalArr = [];
      for (let i = 0; i < arr.length; i += 8) {
        const slice = arr.slice(i, i + 8);
        finalArr.push(
          Object.keys(slice).map((k) => {
            const num = slice[k].toString(16);
            return num.length === 1 ? `0${num}` : num;
          }),
        );
      }
      const finalName = name ? `${name} (${type})` : getIeName(type);

      return { name: finalName, byteArr: finalArr };
    }
    if (content) {
      return { name: name ? `${name} (${type})` : getIeName(type), data: content };
    }

    return { name: name ? `${name} (${type})` : getIeName(type), data: content ?? data };
  } catch {
    return { name: name ? `${name} (${type}, error while parsing)` : getIeName(type), data };
  }
};

const WifiChannelCard = ({ channel, setIes }) => {
  const { t } = useTranslation();
  const columns = [{ key: 'SSID', _style: { width: '70%' } }, { key: 'Signal' }, { key: 'IE' }];

  const displayIe = (ies) => {
    const parsedIes = ies.map((ie) => parseIe(ie));

    const str = ies.map(({ type, data }) => `${type}: ${data}\n`);

    return (
      <td className="ignore-overflow text-center align-middle">
        {str.length > 0 ? (
          <CPopover content="View IEs">
            <CButton color="primary" size="sm" onClick={() => setIes(parsedIes)}>
              {ies.length}
            </CButton>
          </CPopover>
        ) : (
          ies.length
        )}
      </td>
    );
  };

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
            addTableClasses="ignore-overflow table-sm"
            items={channel.devices}
            fields={columns}
            className="text-white"
            scopedSlots={{
              Signal: (item) => <td className="align-middle">{parseDbm(item.Signal)}</td>,
              IE: (item) => displayIe(item.ies),
            }}
          />
        </div>
      </CCardBody>
    </CCard>
  );
};

WifiChannelCard.propTypes = {
  channel: PropTypes.instanceOf(Object).isRequired,
  setIes: PropTypes.func.isRequired,
};

export default WifiChannelCard;
