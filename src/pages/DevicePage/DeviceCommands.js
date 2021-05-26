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
  CPopover,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import DatePicker from 'react-widgets/DatePicker';
import { cilSync } from '@coreui/icons';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardCheck } from '@fortawesome/free-solid-svg-icons'
import { prettyDate, addDays, dateToUnix } from '../../utils/helper';
import axiosInstance from '../../utils/axiosInstance';
import { getToken } from '../../utils/authHelper';
import WifiScanResultModalWidget from './WifiScanResultModal';
import ConfirmModal from '../../components/ConfirmModal';
import eventBus from '../../utils/EventBus';

const DeviceCommands = ({ selectedDeviceId }) => {
  const [showScanModal, setShowScanModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [chosenWifiScan, setChosenWifiScan] = useState(null);
  const [uuidDelete, setUuidDelete] = useState('');
  const [scanDate, setScanDate] = useState('');
  const [collapse, setCollapse] = useState(false);
  const [details, setDetails] = useState([]);
  const [responses, setResponses] = useState([]);
  const [commands, setCommands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [start, setStart] = useState(addDays(new Date(), -3).toString());
  const [end, setEnd] = useState(new Date().toString());

  const toggle = (e) => {
    setCollapse(!collapse);
    e.preventDefault();
  };

  const toggleScanModal = () => {
    setShowScanModal(!showScanModal);
  };

  const toggleConfirmModal = (uuid) => {
    setUuidDelete(uuid);
    setShowConfirmModal(!showConfirmModal);
  };

  const modifyStart = (value) => {
    setStart(value);
  };

  const modifyEnd = (value) => {
    setEnd(value);
  };

  const deleteCommandFromList = (commandUuid) => {
    const indexToDelete = commands.map(e => e.UUID).indexOf(commandUuid);
    const newCommands = commands;
    newCommands.splice(indexToDelete, 1);
    setCommands(newCommands);
  }

  const getCommands = () => {
    if(loading) return;
    setLoading(true);
    const utcStart = new Date(start).toISOString();
    const utcEnd = new Date(end).toISOString();

    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      params: {
        startDate: dateToUnix(utcStart),
        endDate: dateToUnix(utcEnd),
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
  
  const deleteCommand = async () => {
    if (uuidDelete === '') {
      return false;
    }
    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
    };
    return axiosInstance
      .delete(`/command/${uuidDelete}`, options)
      .then(() => {
        deleteCommandFromList(uuidDelete);
        setUuidDelete('');
        return true;
      })
      .catch(() => {
        setUuidDelete('');
        return false;
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
      setChosenWifiScan(item.results.status.scan);
      setScanDate(item.completed);
      setShowScanModal(true);
    }
  };

  const toggleResponse = (item, index) => {
    const position = responses.indexOf(index);
    let newResponses = responses.slice();

    if (position !== -1) {
      newResponses.splice(position, 1);
    } else {
      newResponses = [...newResponses, index];
    }
    setResponses(newResponses);
  };

  const refreshCommands = () => {
    setEnd(new Date());
  };

  const getDetails = (command, commandDetails, index) => {
    if (!details.includes(index)) {
      return <pre className="ignore" />;
    }
    if (command === 'reboot' || command === 'leds') {
      const result = commandDetails.results;
      if (result) return <pre className="ignore">{JSON.stringify(result, null, 4)}</pre>;
    }

    return <pre className="ignore">{JSON.stringify(commandDetails, null, 4)}</pre>;
  };

  const getResponse = (commandDetails, index) => {
    if (!responses.includes(index)) {
      return <pre className="ignore" />;
    }
    return <pre className="ignore">{JSON.stringify(commandDetails, null, 4)}</pre>;
  };

  const columns = [
    { key: 'UUID', label: 'Id', _style: { width: '28%' } },
    { key: 'command', _style: { width: '10%' } },
    { key: 'completed', filter: false, _style: { width: '16%' } },
    { key: 'submitted', filter: false, _style: { width: '16%' } },
    { key: 'executed', filter: false, _style: { width: '16%' } },
    {
      key: 'show_buttons',
      label: '',
      sorter: false,
      filter: false,
      _style: { width: '14%' },
    },
  ];

  useEffect(() => {
    if (selectedDeviceId) {
      getCommands();
    }
  }, [selectedDeviceId, start, end]);

  useEffect(() => {
    eventBus.on("actionCompleted", () =>
      getCommands()
    );

    return () => {
      eventBus.remove("actionCompleted");
    }
  }, []);

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
              <div className="overflow-auto" style={{ height: '400px' }}>
                <CDataTable
                  loading={loading}
                  items={commands ?? []}
                  fields={columns}
                  style={{ color: 'white' }}
                  border
                  columnFilter
                  sorter
                  sorterValue={{ column: 'completed', desc: 'true' }}
                  scopedSlots={{
                    completed: (item) => (
                      <td>
                        {item.completed && item.completed === 0
                          ? prettyDate(item.completed)
                          : 'Pending'}
                      </td>
                    ),
                    submitted: (item) => (
                      <td>
                        {item.submitted && item.submitted !== ''
                          ? prettyDate(item.submitted)
                          : 'Pending'}
                      </td>
                    ),
                    executed: (item) => (
                      <td>
                        {item.executed && item.executed !== ''
                          ? prettyDate(item.executed)
                          : 'Pending'}
                      </td>
                    ),
                    show_buttons: (item, index) => (
                      <td>
                        <CRow>
                          <CCol>
                            <CPopover content="Results">
                              <CButton
                                color="primary"
                                variant={details.includes(index) ? '' : 'outline'}
                                disabled={item.completed === 0}
                                shape="square"
                                size="sm"
                                onClick={() => {
                                  toggleDetails(item, index);
                                }}
                              >
                                <FontAwesomeIcon icon={faClipboardCheck} className='c-icon c-icon-lg' style={{height:'19px'}}/>
                              </CButton>
                            </CPopover>
                          </CCol>
                          <CCol>
                            <CPopover content="Full Details">
                              <CButton
                                color="primary"
                                variant={responses.includes(index) ? '' : 'outline'}
                                shape="square"
                                size="sm"
                                onClick={() => {
                                  toggleResponse(item, index);
                                }}
                              >
                                <CIcon name="cilList" size="lg" />
                              </CButton>
                            </CPopover>
                          </CCol>
                          <CCol>
                            <CPopover content="Delete">
                              <CButton
                                color="primary"
                                variant="outline"
                                shape="square"
                                size="sm"
                                onClick={() => {
                                  toggleConfirmModal(item.UUID, index);
                                }}
                              >
                                <CIcon name="cilTrash" size="lg" />
                              </CButton>
                            </CPopover>
                          </CCol>
                        </CRow>
                      </td>
                    ),
                    details: (item, index) => (
                      <div>
                        <CCollapse show={details.includes(index)}>
                          <CCardBody>
                            <h5>Result</h5>
                            <div>{getDetails(item.command, item, index)}</div>
                          </CCardBody>
                        </CCollapse>
                        <CCollapse show={responses.includes(index)}>
                          <CCardBody>
                            <h5>Details</h5>
                            <div>{getResponse(item, index)}</div>
                          </CCardBody>
                        </CCollapse>
                      </div>
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
        show={showScanModal}
        toggle={toggleScanModal}
        scanResults={chosenWifiScan}
        date={scanDate}
      />
      <ConfirmModal 
        show={showConfirmModal} 
        toggle={toggleConfirmModal} 
        action={deleteCommand}
      />
      <CIcon name="cilNotes" style={{ color: 'white' }} size="lg" />
    </CWidgetDropdown>
  );
};

DeviceCommands.propTypes = {
  selectedDeviceId: PropTypes.string.isRequired,
};

export default DeviceCommands;
