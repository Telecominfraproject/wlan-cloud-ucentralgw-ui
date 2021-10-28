/* eslint-disable-rule prefer-destructuring */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CWidgetDropdown,
  CRow,
  CCol,
  CButton,
  CDataTable,
  CCard,
  CPopover,
  CButtonToolbar,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import DatePicker from 'react-widgets/DatePicker';
import { cilCloudDownload, cilSync, cilCalendarCheck } from '@coreui/icons';
import { dateToUnix } from 'utils/helper';
import axiosInstance from 'utils/axiosInstance';
import eventBus from 'utils/eventBus';
import ConfirmModal from 'components/ConfirmModal';
import { LoadingButton, useAuth, useDevice, FormattedDate } from 'ucentral-libs';
import WifiScanResultModalWidget from 'components/WifiScanResultModal';
import DetailsModal from './DetailsModal';

const DeviceCommands = () => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const { deviceSerialNumber } = useDevice();
  // Wifiscan result related
  const [chosenWifiScan, setChosenWifiScan] = useState(null);
  const [showScanModal, setShowScanModal] = useState(false);
  const [chosenWifiScanDate, setChosenWifiScanDate] = useState('');
  // Delete modal related
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [uuidDelete, setUuidDelete] = useState('');
  // Details modal related
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsUuid, setDetailsUuid] = useState('');
  const [modalDetails, setModalDetails] = useState({});
  // General states
  const [commands, setCommands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [commandLimit, setCommandLimit] = useState(25);
  // Load more button related
  const [loadingMore, setLoadingMore] = useState(false);
  const [showLoadingMore, setShowLoadingMore] = useState(true);

  const toggleScanModal = () => {
    setShowScanModal(!showScanModal);
  };

  const toggleConfirmModal = (uuid) => {
    setUuidDelete(uuid);
    setShowConfirmModal(!showConfirmModal);
  };

  const toggleDetailsModal = () => {
    setShowDetailsModal(!showDetailsModal);
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
        Authorization: `Bearer ${currentToken}`,
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
      .get(
        `${endpoints.owgw}/api/v1/commands?serialNumber=${encodeURIComponent(
          deviceSerialNumber,
        )}${extraParams}`,
        options,
      )
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
        Authorization: `Bearer ${currentToken}`,
      },
      responseType: 'arraybuffer',
    };

    axiosInstance
      .get(`${endpoints.owgw}/api/v1/file/${uuid}?serialNumber=${deviceSerialNumber}`, options)
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
        Authorization: `Bearer ${currentToken}`,
      },
    };
    return axiosInstance
      .delete(`${endpoints.owgw}/api/v1/command/${uuidDelete}`, options)
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

  const toggleDetails = (item) => {
    if (item.command === 'wifiscan') {
      setChosenWifiScan(item.results.status.scan);
      setChosenWifiScanDate(item.completed);
      setShowScanModal(true);
    } else if (item.command === 'trace' && item.waitingForFile === 0) {
      downloadTrace(item.UUID);
    } else {
      setModalDetails(item.results ?? item);
      setDetailsUuid(item.UUID);
      toggleDetailsModal();
    }
  };

  const toggleResponse = (item) => {
    setModalDetails(item);
    setDetailsUuid(item.UUID);
    toggleDetailsModal();
  };

  const refreshCommands = () => {
    getCommands();
  };

  const columns = [
    { key: 'submitted', label: t('common.submitted'), filter: false, _style: { width: '20%' } },
    { key: 'command', label: t('common.command'), _style: { width: '15%' } },
    { key: 'executed', label: t('common.executed'), filter: false, _style: { width: '16%' } },
    { key: 'completed', label: t('common.completed'), filter: false, _style: { width: '16%' } },
    { key: 'errorCode', label: t('common.error_code'), filter: false, _style: { width: '8%' } },
    {
      key: 'show_buttons',
      label: '',
      sorter: false,
      filter: false,
      _style: { width: '1%' },
    },
  ];

  useEffect(() => {
    if (deviceSerialNumber && start !== '' && end !== '') {
      getCommands();
    } else if (deviceSerialNumber && start === '' && end === '') {
      getCommands();
    }
  }, [deviceSerialNumber, start, end]);

  useEffect(() => {
    eventBus.on('actionCompleted', () => refreshCommands());

    return () => {
      eventBus.remove('actionCompleted');
    };
  }, []);

  useEffect(() => {
    if (deviceSerialNumber) {
      setCommandLimit(25);
      setLoadingMore(false);
      setShowLoadingMore(true);
      setStart('');
      setEnd('');
      getCommands();
    }
  }, [deviceSerialNumber]);

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
    <div>
      <CWidgetDropdown
        className="m-0"
        inverse="true"
        color="gradient-primary"
        header={t('commands.title')}
        footerSlot={
          <div className="pb-1 px-3">
            <CRow className="mb-2">
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
              <div className="overflow-auto" style={{ height: '200px' }}>
                <CDataTable
                  addTableClasses="ignore-overflow table-sm"
                  border
                  loading={loading}
                  items={commands ?? []}
                  fields={columns}
                  className="text-white"
                  sorterValue={{ column: 'created', desc: 'true' }}
                  scopedSlots={{
                    command: (item) => <td className="align-middle">{item.command}</td>,
                    completed: (item) => (
                      <td className="align-middle">
                        {item.completed && item.completed !== 0 ? (
                          <FormattedDate date={item.completed} />
                        ) : (
                          'Pending'
                        )}
                      </td>
                    ),
                    executed: (item) => (
                      <td className="align-middle">
                        {item.executed && item.executed !== 0 ? (
                          <FormattedDate date={item.executed} />
                        ) : (
                          'Pending'
                        )}
                      </td>
                    ),
                    submitted: (item) => (
                      <td className="align-middle">
                        {item.submitted && item.submitted !== '' ? (
                          <FormattedDate date={item.submitted} />
                        ) : (
                          'Pending'
                        )}
                      </td>
                    ),
                    errorCode: (item) => <td className="align-middle">{item.errorCode}</td>,
                    show_buttons: (item, index) => (
                      <td className="align-middle">
                        <CButtonToolbar
                          role="group"
                          className="justify-content-flex-end"
                          style={{ width: '160px' }}
                        >
                          <CPopover
                            content={
                              item.command === 'trace' ? t('common.download') : t('common.result')
                            }
                          >
                            <CButton
                              color="primary"
                              variant="outline"
                              shape="square"
                              size="sm"
                              className="mx-2"
                              onClick={() => {
                                toggleDetails(item);
                              }}
                            >
                              {item.command === 'trace' ? (
                                <CIcon
                                  name="cil-cloud-download"
                                  content={cilCloudDownload}
                                  size="md"
                                />
                              ) : (
                                <CIcon
                                  name="cil-calendar-check"
                                  content={cilCalendarCheck}
                                  size="md"
                                />
                              )}
                            </CButton>
                          </CPopover>
                          <CPopover content={t('common.details')}>
                            <CButton
                              color="primary"
                              variant="outline"
                              shape="square"
                              size="sm"
                              className="mx-2"
                              onClick={() => {
                                toggleResponse(item);
                              }}
                            >
                              <CIcon name="cilList" size="md" />
                            </CButton>
                          </CPopover>
                          <CPopover content={t('common.delete')}>
                            <CButton
                              color="primary"
                              variant="outline"
                              shape="square"
                              size="sm"
                              className="mx-2"
                              onClick={() => {
                                toggleConfirmModal(item.UUID, index);
                              }}
                            >
                              <CIcon name="cilTrash" size="mdå" />
                            </CButton>
                          </CPopover>
                        </CButtonToolbar>
                      </td>
                    ),
                  }}
                />

                {showLoadingMore && (
                  <div className="mb-3">
                    <LoadingButton
                      label={t('common.view_more')}
                      isLoadingLabel={t('common.loading_more_ellipsis')}
                      isLoading={loadingMore}
                      action={showMoreCommands}
                      variant="outline"
                    />
                  </div>
                )}
              </div>
            </CCard>
          </div>
        }
      >
        <div className="text-right float-right">
          <CButton onClick={refreshCommands} size="sm">
            <CIcon name="cil-sync" content={cilSync} className="text-white" size="2xl" />
          </CButton>
        </div>
      </CWidgetDropdown>

      <WifiScanResultModalWidget
        show={showScanModal}
        toggle={toggleScanModal}
        scanResults={chosenWifiScan}
        date={chosenWifiScanDate}
      />
      <ConfirmModal show={showConfirmModal} toggle={toggleConfirmModal} action={deleteCommand} />
      <DetailsModal
        t={t}
        show={showDetailsModal}
        toggle={toggleDetailsModal}
        details={modalDetails}
        commandUuid={detailsUuid}
      />
    </div>
  );
};

export default DeviceCommands;
