/* eslint-disable-rule prefer-destructuring */
import React, { useState, useEffect } from 'react';
import {
  CCardHeader,
  CCardBody,
  CCollapse,
  CButton,
  CDataTable,
  CCard,
  CPopover,
  CFormText,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSync, cilTrash } from '@coreui/icons';
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
  const [startError, setStartError] = useState(false);
  const [end, setEnd] = useState('');
  const [endError, setEndError] = useState(false);
  const [logLimit, setLogLimit] = useState(25);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showLoadingMore, setShowLoadingMore] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const toggleDeleteModal = () => {
    setShowDeleteModal(!showDeleteModal);
  };

  const modifyStart = (value) => {
    try {
      new Date(value).toISOString();
      setStartError(false);
      setStart(value);
    } catch (e) {
      setStart('');
      setStartError(true);
    }
  };

  const modifyEnd = (value) => {
    try {
      new Date(value).toISOString();
      setEndError(false);
      setEnd(value);
    } catch (e) {
      setEnd('');
      setEndError(true);
    }
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
      <CCard className="m-0">
        <CCardHeader className="dark-header">
          <div className="d-flex flex-row-reverse align-items-center">
            <div className="pl-2">
              <CPopover content={t('common.refresh')}>
                <CButton size="sm" color="info" onClick={getLogs} disabled={startError || endError}>
                  <CIcon content={cilSync} />
                </CButton>
              </CPopover>
            </div>
            <div className="pl-2">
              <DatePicker
                includeTime
                onChange={(date) => modifyEnd(date)}
                value={end ? new Date(end) : undefined}
              />
              <CFormText color="danger" hidden={!endError}>
                {t('common.invalid_date_explanation')}
              </CFormText>
            </div>
            To:
            <div className="pl-2">
              <DatePicker
                includeTime
                onChange={(date) => modifyStart(date)}
                value={start ? new Date(start) : undefined}
              />
              <CFormText color="danger" hidden={!startError}>
                {t('common.invalid_date_explanation')}
              </CFormText>
            </div>
            From:
            <div className="px-2">
              <CPopover content={t('common.delete')}>
                <CButton onClick={toggleDeleteModal} size="sm" color="danger">
                  <CIcon name="cil-trash" content={cilTrash} />
                </CButton>
              </CPopover>
            </div>
          </div>
        </CCardHeader>
        <CCardBody className="p-1">
          <div className="overflow-auto" style={{ height: 'calc(100vh - 620px)' }}>
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
        </CCardBody>
      </CCard>
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
