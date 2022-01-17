import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  CButton,
  CDataTable,
  CPopover,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilX } from '@coreui/icons';
import { v4 as createUuid } from 'uuid';

const WifiAnalysisTable = ({ t, data, loading }) => {
  const [show, setShow] = useState(false);
  const [ips, setIps] = useState(null);

  const toggle = (ssid, v4, v6) => {
    if (v4 && v6) setIps({ ssid, v4, v6 });
    setShow(!show);
  };
  const columns = [
    { key: 'radio', label: '#', _style: { width: '1%' } },
    { key: 'bssid', label: 'BSSID', _style: { width: '1%' } },
    { key: 'vendor', label: t('wifi_analysis.vendor'), _style: { width: '15%' }, sorter: false },
    { key: 'mode', label: t('wifi_analysis.mode'), _style: { width: '1%' }, sorter: false },
    { key: 'ssid', label: 'SSID', _style: { width: '15%' } },
    { key: 'rssi', label: 'RSSI', _style: { width: '5%' }, sorter: false },
    { key: 'rxRate', label: 'Rx Rate', _style: { width: '7%' }, sorter: false },
    { key: 'rxBytes', label: 'Rx', _style: { width: '7%' }, sorter: false },
    { key: 'rxMcs', label: 'Rx MCS', _style: { width: '6%' }, sorter: false },
    { key: 'rxNss', label: 'Rx NSS', _style: { width: '6%' }, sorter: false },
    { key: 'txRate', label: 'Tx Rate', _style: { width: '7%' }, sorter: false },
    { key: 'txBytes', label: 'Tx', _style: { width: '7%' }, sorter: false },
    { key: 'ips', label: 'IP', _style: { width: '1%' }, sorter: false },
  ];

  const centerIfEmpty = (value) => (
    <td
      className={
        !value || value === '' || value === '-'
          ? 'text-center align-middle'
          : 'text-right align-middle'
      }
    >
      {value}
    </td>
  );

  const displayIp = (ssid, v4, v6) => {
    const count = v4.length + v6.length;

    return (
      <td className="ignore-overflow text-center align-middle">
        {count > 0 ? (
          <CPopover content="View">
            <CButton
              color="primary"
              size="sm"
              onClick={() => toggle(ssid, v4, v6)}
              className="py-1"
            >
              {count}
            </CButton>
          </CPopover>
        ) : (
          count
        )}
      </td>
    );
  };

  return (
    <div>
      <CDataTable
        addTableClasses="ignore-overflow mb-5 table-sm"
        fields={columns}
        items={data}
        hover
        border
        loading={loading}
        sorter
        sorterValue={{ column: 'radio', asc: true }}
        scopedSlots={{
          bssid: (item) => (
            <td
              className="text-center align-middle"
              style={{ fontFamily: 'monospace', fontSize: '0.96rem' }}
            >
              {item.bssid}
            </td>
          ),
          radio: (item) => <td className="text-center align-middle">{item.radio.radio}</td>,
          ssid: (item) => <td className="align-middle">{item.ssid}</td>,
          mode: (item) => <td className="align-middle">{item.mode}</td>,
          vendor: (item) => <td className="align-middle">{item.vendor}</td>,
          rxMcs: (item) => centerIfEmpty(item.rxMcs),
          rxRate: (item) => centerIfEmpty(item.rxRate),
          rxBytes: (item) => centerIfEmpty(item.rxBytes),
          txRate: (item) => centerIfEmpty(item.txRate),
          txBytes: (item) => centerIfEmpty(item.txBytes),
          rxNss: (item) => centerIfEmpty(item.rxNss),
          rssi: (item) => centerIfEmpty(item.rssi),
          ips: (item) => displayIp(item.ssid, item.ipV4, item.ipV6),
        }}
      />
      <CModal size="lg" show={show} onClose={toggle}>
        <CModalHeader className="p-1">
          <CModalTitle className="pl-1 pt-1">{ips?.ssid}</CModalTitle>
          <div className="text-right">
            <CPopover content={t('common.close')}>
              <CButton color="primary" variant="outline" className="ml-2" onClick={toggle}>
                <CIcon content={cilX} />
              </CButton>
            </CPopover>
          </div>
        </CModalHeader>
        <CModalBody>
          <div>
            IpV4
            <ul>
              {ips?.v4?.map((ip) => (
                <li key={createUuid()}>{ip}</li>
              ))}
            </ul>
            IpV6
            <ul>
              {ips?.v6?.map((ip) => (
                <li key={createUuid()}>{ip}</li>
              ))}
            </ul>
          </div>
        </CModalBody>
      </CModal>
    </div>
  );
};

WifiAnalysisTable.propTypes = {
  t: PropTypes.func.isRequired,
  data: PropTypes.instanceOf(Object).isRequired,
  loading: PropTypes.bool.isRequired,
};
export default WifiAnalysisTable;
