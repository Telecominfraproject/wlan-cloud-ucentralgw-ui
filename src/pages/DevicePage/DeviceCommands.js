/* eslint-disable-rule prefer-destructuring */
import React, { useState, useEffect } from 'react';
import {
  CWidgetDropdown,
  CRow,
  CCol,
  CCollapse,
  CButton,
  CDataTable,
  CCard,
  CCardBody,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import DatePicker from 'react-widgets/DatePicker';
import { cilSync } from '@coreui/icons';
import PropTypes from 'prop-types';
import { prettyDate, addDays } from '../../utils/helper';
import axiosInstance from '../../utils/axiosInstance';
import { getToken } from '../../utils/authHelper';
import WifiScanResultModalWidget from './WifiScanResultModal';

const DeviceCommands = ({ selectedDeviceId }) => {
  const [showModal, setShowModal] = useState(false);
  const [chosenWifiScan, setChosenWifiScan] = useState(null);
  const [scanDate, setScanDate] = useState('');
  const [collapse, setCollapse] = useState(false);
  const [details, setDetails] = useState([]);
  const [commands, setCommands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [start, setStart] = useState(addDays(new Date(), -3).toString());
  const [end, setEnd] = useState(new Date().toString());

  const toggle = (e) => {
    setCollapse(!collapse);
    e.preventDefault();
  };

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const modifyStart = (value) => {
    setStart(value);
  };

  const modifyEnd = (value) => {
    setEnd(value);
  };

  const getCommands = () => {
    setLoading(true);
    const utcStart = new Date(start).toISOString();
    const utcEnd = new Date(end).toISOString();

    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      params: {
        startDate: utcStart,
        endDate: utcEnd,
      },
    };

    axiosInstance
      .get(`/commands?serialNumber=${selectedDeviceId}`, options)
      .then((response) => {
        setCommands(response.data.commands);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  };

  const toggleDetails = (item, index) => {
    if (item.command !== 'wifiscan' || !item.results.status) {
      const position = details.indexOf(index);
      let newDetails = details.slice();

      if (position !== -1) {
        newDetails.splice(position, 1);
      } else {
        newDetails = [...details, index];
      }
      setDetails(newDetails);
    } else {
      setChosenWifiScan(item.results.status.scan.scan);
      setScanDate(item.completed);
      setShowModal(true);
    }
  };

  const refreshCommands = () => {
    setEnd(new Date());
  };

  const getDetails = (command, commandDetails) => {
    if (command === 'reboot' || command === 'leds') {
      const result = commandDetails.results;
      if (result) return <pre className="ignore">{JSON.stringify(result, null, 4)}</pre>;
    }

    return <pre className="ignore">{JSON.stringify(commandDetails, null, 4)}</pre>;
  };
  const columns = [
    { key: 'UUID', label: 'Id' },
    { key: 'command' },
    { key: 'completed' },
    {
      key: 'show_details',
      label: '',
      _style: { width: '1%' },
      sorter: false,
      filter: false,
    },
  ];

  useEffect(() => {
    if (selectedDeviceId) {
      getCommands();
    }
  }, [selectedDeviceId, start, end]);

  useEffect(() => {
    if (selectedDeviceId) {
      setStart(addDays(new Date(), -3).toString());
      setEnd(new Date().toString());
      getCommands();
    }
  }, [selectedDeviceId]);

  return (
    <CWidgetDropdown
      inverse="true"
      color="gradient-primary"
      header="Device Commands"
      footerSlot={
        <div style={{ padding: '20px' }}>
          <CCollapse show={collapse}>
            <CRow>
              <CCol />
              <CCol>
                <div style={{ float: 'right' }}>
                  <CButton onClick={() => refreshCommands()} size="sm">
                    <CIcon
                      name="cil-sync"
                      content={cilSync}
                      style={{ color: 'white' }}
                      size="2xl"
                    />
                  </CButton>
                </div>
              </CCol>
            </CRow>
            <CRow style={{ marginBottom: '10px' }}>
              <CCol>
                From:
                <DatePicker
                  selected={start === '' ? new Date() : new Date(start)}
                  value={start === '' ? new Date() : new Date(start)}
                  includeTime
                  onChange={(date) => modifyStart(date)}
                />
              </CCol>
              <CCol>
                To:
                <DatePicker
                  selected={end === '' ? new Date() : new Date(end)}
                  value={end === '' ? new Date() : new Date(end)}
                  includeTime
                  onChange={(date) => modifyEnd(date)}
                />
              </CCol>
            </CRow>
            <CCard>
              <div className="overflow-auto" style={{ height: '250px' }}>
                <CDataTable
                  loading={loading}
                  items={commands ?? []}
                  fields={columns}
                  style={{ color: 'white' }}
                  border
                  sorterValue={{ column: 'completed', desc: 'true' }}
                  scopedSlots={{
                    completed: (item) => (
                      <td>
                        {item.completed && item.completed !== ''
                          ? prettyDate(item.completed)
                          : 'Pending'}
                      </td>
                    ),
                    show_details: (item, index) => (
                      <td className="py-2">
                        <CButton
                          color="primary"
                          variant={details.includes(index) ? '' : 'outline'}
                          shape="square"
                          size="sm"
                          onClick={() => {
                            toggleDetails(item, index);
                          }}
                        >
                          <CIcon name="cilList" size="lg" />
                        </CButton>
                      </td>
                    ),
                    details: (item, index) => (
                      <CCollapse show={details.includes(index)}>
                        <CCardBody>
                          <h5>Details</h5>
                          <div>{getDetails(item.command, item)}</div>
                        </CCardBody>
                      </CCollapse>
                    ),
                  }}
                />
              </div>
            </CCard>
          </CCollapse>
          <CButton show={collapse ? 'true' : 'false'} color="transparent" onClick={toggle} block>
            <CIcon
              name={collapse ? 'cilChevronTop' : 'cilChevronBottom'}
              style={{ color: 'white' }}
              size="lg"
            />
          </CButton>
        </div>
      }
    >
      <WifiScanResultModalWidget
        show={showModal}
        toggle={toggleModal}
        scanResults={chosenWifiScan}
        date={scanDate}
      />
      <CIcon name="cilNotes" style={{ color: 'white' }} size="lg" />
    </CWidgetDropdown>
  );
};

DeviceCommands.propTypes = {
  selectedDeviceId: PropTypes.string.isRequired,
};

export default DeviceCommands;
