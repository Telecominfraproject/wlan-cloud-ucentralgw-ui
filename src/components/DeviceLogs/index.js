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
import { cilTrash } from '@coreui/icons';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-widgets/DatePicker';
import { dateToUnix } from 'utils/helper';
import axiosInstance from 'utils/axiosInstance';
import eventBus from 'utils/eventBus';
import { LoadingButton, useAuth, useDevice, FormattedDate } from 'ucentral-libs';
import DeleteLogModal from 'components/DeleteLogModal';

const DeviceLogs = () => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const { deviceSerialNumber } = useDevice();
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [logLimit, setLogLimit] = useState(25);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showLoadingMore, setShowLoadingMore] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const toggleDeleteModal = () => {
    setShowDeleteModal(!showDeleteModal);
  };

  const modifyStart = (value) => {
    setStart(value);
  };

  const modifyEnd = (value) => {
    setEnd(value);
  };

  const showMoreLogs = () => {
    setLogLimit(logLimit + 50);
  };

  const getLogs = () => {
    if (loading) return;
    setLoadingMore(true);
    setLoading(true);

    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
      params: {
        limit: logLimit,
      },
    };

    let extraParams = '?newest=true';
    if (start !== '' && end !== '') {
      const utcStart = new Date(start).toISOString();
      const utcEnd = new Date(end).toISOString();
      options.params.startDate = dateToUnix(utcStart);
      options.params.endDate = dateToUnix(utcEnd);
      extraParams = '';
    }

    axiosInstance
      .get(
        `${endpoints.owgw}/api/v1/device/${encodeURIComponent(
          deviceSerialNumber,
        )}/logs${extraParams}`,
        options,
      )
      .then((response) => {
        setLogs(response.data.values);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  };

  const toggleDetails = (index) => {
    const position = details.indexOf(index);
    let newDetails = details.slice();

    if (position !== -1) {
      newDetails.splice(position, 1);
    } else {
      newDetails = [...details, index];
    }
    setDetails(newDetails);
  };

  const getDetails = (index, logDetails) => {
    if (details.includes(index))
      return <pre className="ignore">{JSON.stringify(logDetails, null, 2)}</pre>;
    return <pre className="ignore" />;
  };

  const columns = [
    { key: 'recorded', label: t('common.recorded'), _style: { width: '15%' } },
    { key: 'UUID', label: t('common.config_id'), _style: { width: '10%' } },
    { key: 'severity', label: t('device_logs.severity'), _style: { width: '5%' } },
    { key: 'log', label: t('device_logs.log') },
    {
      key: 'show_details',
      label: '',
      _style: { width: '1%' },
      sorter: false,
      filter: false,
    },
  ];

  useEffect(() => {
    if (deviceSerialNumber) {
      setLogLimit(25);
      setLoadingMore(false);
      setShowLoadingMore(true);
      setStart('');
      setEnd('');
      getLogs();
    }
  }, [deviceSerialNumber]);

  useEffect(() => {
    if (logLimit !== 25) {
      getLogs();
    }
  }, [logLimit]);

  useEffect(() => {
    if (logs.length === 0 || (logs.length > 0 && logs.length < logLimit)) {
      setShowLoadingMore(false);
    } else {
      setShowLoadingMore(true);
    }
  }, [logs]);

  useEffect(() => {
    if (deviceSerialNumber && start !== '' && end !== '') {
      getLogs();
    } else if (deviceSerialNumber && start === '' && end === '') {
      getLogs();
    }
  }, [start, end, deviceSerialNumber]);

  useEffect(() => {
    eventBus.on('deletedLogs', () => getLogs());

    return () => {
      eventBus.remove('deletedLogs');
    };
  }, []);

  return (
    <div>
      <CWidgetDropdown
        className="m-0"
        inverse="true"
        color="gradient-info"
        header={t('device_logs.title')}
        footerSlot={
          <div className="pb-1 px-3">
            <CRow className="mb-3">
              <CCol>
                {t('common.from')}
                <DatePicker includeTime onChange={(date) => modifyStart(date)} />
              </CCol>
              <CCol>
                {t('common.to')}
                <DatePicker includeTime onChange={(date) => modifyEnd(date)} />
              </CCol>
            </CRow>
            <CCard>
              <div className="overflow-auto" style={{ height: '250px' }}>
                <CDataTable
                  addTableClasses="ignore-overflow table-sm"
                  border
                  items={logs ?? []}
                  fields={columns}
                  loading={loading}
                  className="text-white"
                  sorterValue={{ column: 'recorded', desc: 'true' }}
                  scopedSlots={{
                    recorded: (item) => (
                      <td className="align-middle">
                        <FormattedDate date={item.recorded} />
                      </td>
                    ),
                    UUID: (item) => <td className="align-middle">{item.UUID}</td>,
                    severity: (item) => <td className="align-middle">{item.severity}</td>,
                    log: (item) => <td className="align-middle">{item.log}</td>,
                    show_details: (item, index) => (
                      <td className="align-middle">
                        <CButton
                          color="primary"
                          variant={details.includes(index) ? '' : 'outline'}
                          shape="square"
                          size="sm"
                          onClick={() => {
                            toggleDetails(index);
                          }}
                        >
                          <CIcon name="cilList" />
                        </CButton>
                      </td>
                    ),
                    details: (item, index) => (
                      <CCollapse show={details.includes(index)}>
                        <CCardBody>
                          <h5>{t('common.details')}</h5>
                          <div>{getDetails(index, item)}</div>
                        </CCardBody>
                      </CCollapse>
                    ),
                  }}
                />
                {showLoadingMore && (
                  <div className="mb-3">
                    <LoadingButton
                      label={t('common.view_more')}
                      isLoadingLabel={t('common.loading_more_ellipsis')}
                      isLoading={loadingMore}
                      action={showMoreLogs}
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
          <CPopover content={t('common.delete')}>
            <CButton onClick={toggleDeleteModal} size="sm">
              <CIcon name="cil-trash" content={cilTrash} className="text-white" size="2xl" />
            </CButton>
          </CPopover>
        </div>
      </CWidgetDropdown>
      <DeleteLogModal
        serialNumber={deviceSerialNumber}
        object="logs"
        show={showDeleteModal}
        toggle={toggleDeleteModal}
      />
    </div>
  );
};

export default DeviceLogs;
