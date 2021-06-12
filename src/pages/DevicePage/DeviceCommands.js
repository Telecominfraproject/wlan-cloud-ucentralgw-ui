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
  CPopover,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import DatePicker from 'react-widgets/DatePicker';
import { cilCloudDownload, cilSync } from '@coreui/icons';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardCheck } from '@fortawesome/free-solid-svg-icons';
import { prettyDate, dateToUnix } from 'utils/helper';
import axiosInstance from 'utils/axiosInstance';
import { getToken } from 'utils/authHelper';
import eventBus from 'utils/EventBus';
import ConfirmModal from 'components/ConfirmModal';
import LoadingButton from 'components/LoadingButton';
import WifiScanResultModalWidget from './WifiScanResultModal';
import DeviceCommandsCollapse from './DeviceCommandsCollapse';

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
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [commandLimit, setCommandLimit] = useState(25);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showLoadingMore, setShowLoadingMore] = useState(true);

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

  const showMoreCommands = () => {
    setCommandLimit(commandLimit + 50);
  };

  const modifyStart = (value) => {
    setStart(value);
  };

  const modifyEnd = (value) => {
    setEnd(value);
  };

  const deleteCommandFromList = (commandUuid) => {
    const indexToDelete = commands.map((e) => e.UUID).indexOf(commandUuid);
    const newCommands = commands;
    newCommands.splice(indexToDelete, 1);
    setCommands(newCommands);
  };

  const getCommands = () => {
    if (loading) return;
    setLoadingMore(true);
    setLoading(true);

    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      params: {
        limit: commandLimit,
      },
    };

    let extraParams = '&newest=true';
    if (start !== '' && end !== '') {
      const utcStart = new Date(start).toISOString();
      const utcEnd = new Date(end).toISOString();
      options.params.startDate = dateToUnix(utcStart);
      options.params.endDate = dateToUnix(utcEnd);
      extraParams = '';
    }

    axiosInstance
      .get(`/commands?serialNumber=${encodeURIComponent(selectedDeviceId)}${extraParams}`, options)
      .then((response) => {
        setCommands(response.data.commands);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  };

  const downloadTrace = (uuid) => {
    const options = {
      headers: {
        Accept: 'application/octet-stream',
        Authorization: `Bearer ${getToken()}`,
      },
      responseType: 'arraybuffer',
    };

    axiosInstance
      .get(`/file/${uuid}?serialNumber=${selectedDeviceId}`, options)
      .then((response) => {
        const blob = new Blob([response.data], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `Trace_${uuid}.pcap`;
        link.click();
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
    if (item.command === 'wifiscan') {
      setChosenWifiScan(item.results.status.scan);
      setScanDate(item.completed);
      setShowScanModal(true);
    } else if (item.command === 'trace' && item.waitingForFile === 0) {
      downloadTrace(item.UUID);
    } else {
      const position = details.indexOf(index);
      let newDetails = details.slice();

      if (position !== -1) {
        newDetails.splice(position, 1);
      } else {
        newDetails = [...details, index];
      }
      setDetails(newDetails);
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
    getCommands();
  };

  const getDetails = (command, index) => {
    if (!details.includes(index)) {
      return <pre className="ignore" />;
    }
    if (command.results) {
      const result = command.results;
      if (result) return <pre className="ignore">{JSON.stringify(result, null, 4)}</pre>;
    }
    return <pre className="ignore">{JSON.stringify(command, null, 4)}</pre>;
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
    if (selectedDeviceId && start !== '' && end !== '') {
      getCommands();
    } else if (selectedDeviceId && start === '' && end === '') {
      getCommands();
    }
  }, [selectedDeviceId, start, end]);

  useEffect(() => {
    eventBus.on('actionCompleted', () => refreshCommands());

    return () => {
      eventBus.remove('actionCompleted');
    };
  }, []);

  useEffect(() => {
    if (selectedDeviceId) {
      setCommandLimit(25);
      setLoadingMore(false);
      setShowLoadingMore(true);
      setStart('');
      setEnd('');
      getCommands();
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    if (commandLimit !== 25) {
      getCommands();
    }
  }, [commandLimit]);

  useEffect(() => {
    if (commands.length === 0 || (commands.length > 0 && commands.length < commandLimit)) {
      setShowLoadingMore(false);
    } else {
      setShowLoadingMore(true);
    }
  }, [commands]);

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
                <DatePicker includeTime onChange={(date) => modifyStart(date)} />
              </CCol>
              <CCol>
                To:
                <DatePicker includeTime onChange={(date) => modifyEnd(date)} />
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
                  sorterValue={{ column: 'submitted', desc: 'true' }}
                  scopedSlots={{
                    completed: (item) => (
                      <td>
                        {item.completed && item.completed !== 0
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
                            <CPopover content={item.command === 'trace' ? 'Download' : 'Results'}>
                              <CButton
                                color="primary"
                                variant={details.includes(index) ? '' : 'outline'}
                                disabled={
                                  item.completed === 0 ||
                                  (item.command === 'trace' && item.waitingForFile !== 0)
                                }
                                shape="square"
                                size="sm"
                                onClick={() => {
                                  toggleDetails(item, index);
                                }}
                              >
                                {item.command === 'trace' ? (
                                  <CIcon content={cilCloudDownload} size="lg" />
                                ) : (
                                  <FontAwesomeIcon
                                    icon={faClipboardCheck}
                                    className="c-icon c-icon-lg"
                                    style={{ height: '19px' }}
                                  />
                                )}
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
                      <DeviceCommandsCollapse
                        details={details}
                        responses={responses}
                        index={index}
                        getDetails={getDetails}
                        getResponse={getResponse}
                        item={item}
                      />
                    ),
                  }}
                />
                <CRow style={{ marginBottom: '1%', marginRight: '1%' }}>
                  {showLoadingMore && (
                    <LoadingButton
                      label="View More"
                      isLoadingLabel="Loading More..."
                      isLoading={loadingMore}
                      action={showMoreCommands}
                      variant="outline"
                    />
                  )}
                </CRow>
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
      <ConfirmModal show={showConfirmModal} toggle={toggleConfirmModal} action={deleteCommand} />
      <CIcon name="cilNotes" style={{ color: 'white' }} size="lg" />
    </CWidgetDropdown>
  );
};

DeviceCommands.propTypes = {
  selectedDeviceId: PropTypes.string.isRequired,
};

export default DeviceCommands;
