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
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-widgets/DatePicker';
import { prettyDate, dateToUnix } from 'utils/helper';
import axiosInstance from 'utils/axiosInstance';
import { useAuth } from 'contexts/AuthProvider';
import { useDevice } from 'contexts/DeviceProvider';
import eventBus from 'utils/eventBus';
import { LoadingButton } from 'ucentral-libs';
import DeleteLogModal from 'components/DeleteLogModal';
import styles from './index.module.scss';

const DeviceLogs = () => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const { deviceSerialNumber } = useDevice();
  const [collapse, setCollapse] = useState(false);
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

  const toggle = (e) => {
    setCollapse(!collapse);
    e.preventDefault();
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
        `${endpoints.ucentralgw}/api/v1/device/${encodeURIComponent(
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
      return <pre className="ignore">{JSON.stringify(logDetails, null, 4)}</pre>;
    return <pre className="ignore" />;
  };

  const columns = [
    { key: 'log', label: t('device_logs.log') },
    { key: 'severity', label: t('device_logs.severity') },
    { key: 'recorded', label: t('common.recorded') },
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
        inverse="true"
        color="gradient-info"
        header={t('device_logs.title')}
        footerSlot={
          <div className={styles.footer}>
            <CCollapse show={collapse}>
              <div className={styles.alignRight}>
                <CPopover content={t('common.delete')}>
                  <CButton
                    color="light"
                    shape="square"
                    size="sm"
                    onClick={() => {
                      toggleDeleteModal();
                    }}
                  >
                    <CIcon name="cilTrash" size="lg" />
                  </CButton>
                </CPopover>
              </div>
              <CRow className={styles.datepickerRow}>
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
                <div className={[styles.scrollableCard, 'overflow-auto'].join(' ')}>
                  <CDataTable
                    items={logs ?? []}
                    fields={columns}
                    loading={loading}
                    className={styles.whiteIcon}
                    sorterValue={{ column: 'recorded', desc: 'true' }}
                    scopedSlots={{
                      recorded: (item) => <td>{prettyDate(item.recorded)}</td>,
                      show_details: (item, index) => (
                        <td className="py-2">
                          <CButton
                            color="primary"
                            variant={details.includes(index) ? '' : 'outline'}
                            shape="square"
                            size="sm"
                            onClick={() => {
                              toggleDetails(index);
                            }}
                          >
                            <CIcon name="cilList" size="lg" />
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
                  <CRow className={styles.loadMoreRow}>
                    {showLoadingMore && (
                      <LoadingButton
                        label={t('common.view_more')}
                        isLoadingLabel={t('common.loading_more_ellipsis')}
                        isLoading={loadingMore}
                        action={showMoreLogs}
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
                className={styles.whiteIcon}
                size="lg"
              />
            </CButton>
          </div>
        }
      />
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
