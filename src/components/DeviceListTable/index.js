import React, { useEffect, useState } from 'react';
import {
  CBadge,
  CCardBody,
  CDataTable,
  CButton,
  CLink,
  CCard,
  CCardHeader,
  CRow,
  CCol,
  CPopover,
  CSelect,
  CContainer,
} from '@coreui/react';
import ReactPaginate from 'react-paginate';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { cilSync, cilInfo, cilBadge, cilBan, cilNotes } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { useAuth } from 'contexts/AuthProvider';
import axiosInstance from 'utils/axiosInstance';
import { cleanBytesString } from 'utils/helper';
import meshIcon from 'assets/icons/Mesh.png';
import apIcon from 'assets/icons/AP.png';
import internetSwitch from 'assets/icons/Switch.png';
import iotIcon from 'assets/icons/IotIcon.png';
import { getItem, setItem } from 'utils/localStorageHelper';
import styles from './index.module.scss';

const DeviceList = () => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const [loadedSerials, setLoadedSerials] = useState(false);
  const [serialNumbers, setSerialNumbers] = useState([]);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [devicesPerPage, setDevicesPerPage] = useState(getItem('devicesPerPage') || '10');
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  const getSerialNumbers = () => {
    setLoading(true);

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };

    axiosInstance
      .get(`${endpoints.ucentralgw}/api/v1/devices?serialOnly=true`, {
        headers,
      })
      .then((response) => {
        setSerialNumbers(response.data.serialNumbers);
        setLoadedSerials(true);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const getDeviceInformation = () => {
    setLoading(true);

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };

    const startIndex = page * devicesPerPage;
    const endIndex = parseInt(startIndex, 10) + parseInt(devicesPerPage, 10);
    const serialsToGet = serialNumbers
      .slice(startIndex, endIndex)
      .map((x) => encodeURIComponent(x))
      .join(',');

    axiosInstance
      .get(`${endpoints.ucentralgw}/api/v1/devices?deviceWithStatus=true&select=${serialsToGet}`, {
        headers,
      })
      .then((response) => {
        setDevices(response.data.devicesWithStatus);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const refreshDevice = (serialNumber) => {
    setLoading(true);

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };

    axiosInstance
      .get(
        `${endpoints.ucentralgw}/api/v1/devices?deviceWithStatus=true&select=${encodeURIComponent(
          serialNumber,
        )}`,
        {
          headers,
        },
      )
      .then((response) => {
        const device = response.data.devicesWithStatus[0];
        const foundIndex = devices.findIndex((obj) => obj.serialNumber === serialNumber);
        const newList = devices;
        newList[foundIndex] = device;
        setDevices(newList);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const updateDevicesPerPage = (value) => {
    setItem('devicesPerPage', value);
    setDevicesPerPage(value);
  };

  const updatePageCount = ({ selected: selectedPage }) => {
    setPage(selectedPage);
  };

  useEffect(() => {
    getSerialNumbers();
  }, []);

  useEffect(() => {
    if (loadedSerials) getDeviceInformation();
  }, [serialNumbers, page, devicesPerPage, loadedSerials]);

  useEffect(() => {
    if (loadedSerials) {
      const count = Math.ceil(serialNumbers.length / devicesPerPage);
      setPageCount(count);
    }
  }, [devicesPerPage, loadedSerials]);

  return (
    <DeviceListDisplay
      devices={devices}
      loading={loading}
      updateDevicesPerPage={updateDevicesPerPage}
      devicesPerPage={devicesPerPage}
      pageCount={pageCount}
      updatePage={updatePageCount}
      pageRangeDisplayed={5}
      refreshDevice={refreshDevice}
      t={t}
    />
  );
};

const DeviceListDisplay = ({
  devices,
  devicesPerPage,
  loading,
  updateDevicesPerPage,
  pageCount,
  updatePage,
  refreshDevice,
  t,
}) => {
  const columns = [
    { key: 'deviceType', label: '', filter: false, sorter: false, _style: { width: '5%' } },
    { key: 'verifiedCertificate', label: t('common.certificate'), _style: { width: '1%' } },
    { key: 'serialNumber', label: t('common.serial_number'), _style: { width: '5%' } },
    { key: 'UUID', label: t('common.config_id'), _style: { width: '5%' } },
    { key: 'firmware', label: t('common.firmware'), filter: false },
    { key: 'compatible', label: t('common.compatible'), filter: false, _style: { width: '15%' } },
    { key: 'txBytes', label: 'Tx', filter: false, _style: { width: '12%' } },
    { key: 'rxBytes', label: 'Rx', filter: false, _style: { width: '12%' } },
    { key: 'ipAddress', label: t('common.ip_address'), _style: { width: '16%' } },
    {
      key: 'show_details',
      label: '',
      _style: { width: '15%' },
      sorter: false,
      filter: false,
    },
  ];

  const getDeviceIcon = (deviceType) => {
    if (deviceType === 'AP_Default' || deviceType === 'AP') {
      return <img src={apIcon} className={styles.icon} alt="AP" />;
    }
    if (deviceType === 'MESH') {
      return <img src={meshIcon} className={styles.icon} alt="MESH" />;
    }
    if (deviceType === 'SWITCH') {
      return <img src={internetSwitch} className={styles.icon} alt="SWITCH" />;
    }
    if (deviceType === 'IOT') {
      return <img src={iotIcon} className={styles.icon} alt="SWITCH" />;
    }
    return null;
  };

  const getCertBadge = (cert) => {
    if (cert === 'NO_CERTIFICATE') {
      return (
        <div className={styles.certificateWrapper}>
          <CIcon className={styles.badge} name="cil-badge" content={cilBadge} size="2xl" alt="AP" />
          <CIcon
            className={styles.badCertificate}
            name="cil-ban"
            content={cilBan}
            size="3xl"
            alt="AP"
          />
        </div>
      );
    }

    let color = 'transparent';
    switch (cert) {
      case 'VALID_CERTIFICATE':
        color = 'danger';
        break;
      case 'MISMATCH_SERIAL':
        return (
          <CBadge color={color} className={styles.mismatchBackground}>
            <CIcon name="cil-badge" content={cilBadge} size="2xl" alt="AP" />
          </CBadge>
        );
      case 'VERIFIED':
        color = 'success';
        break;
      default:
        return (
          <div className={styles.certificateWrapper}>
            <CIcon
              className={styles.badge}
              name="cil-badge"
              content={cilBadge}
              size="2xl"
              alt="AP"
            />
            <CIcon
              className={styles.badCertificate}
              name="cil-ban"
              content={cilBan}
              size="3xl"
              alt="AP"
            />
          </div>
        );
    }
    return (
      <CBadge color={color}>
        <CIcon name="cil-badge" content={cilBadge} size="2xl" alt="AP" />
      </CBadge>
    );
  };

  const getStatusBadge = (status) => {
    if (status) {
      return 'success';
    }
    return 'danger';
  };

  return (
    <>
      <CCard>
        <CCardHeader>
          <CRow>
            <CCol />
            <CCol xs={1}>
              <CSelect
                custom
                defaultValue={devicesPerPage}
                onChange={(e) => updateDevicesPerPage(e.target.value)}
                disabled={loading}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </CSelect>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody>
          <CDataTable
            items={devices ?? []}
            fields={columns}
            hover
            border
            loading={loading}
            scopedSlots={{
              serialNumber: (item) => (
                <td className={styles.column}>
                  <CLink
                    className="c-subheader-nav-link"
                    aria-current="page"
                    to={() => `/devices/${item.serialNumber}`}
                  >
                    {item.serialNumber}
                  </CLink>
                </td>
              ),
              deviceType: (item) => (
                <td className={styles.column}>
                  <CPopover
                    content={item.connected ? t('common.connected') : t('common.not_connected')}
                    placement="top"
                  >
                    <CBadge color={getStatusBadge(item.connected)}>
                      {getDeviceIcon(item.deviceType) ?? item.deviceType}
                    </CBadge>
                  </CPopover>
                </td>
              ),
              verifiedCertificate: (item) => (
                <td className={styles.column}>
                  <CPopover
                    content={item.verifiedCertificate ?? t('common.unknown')}
                    placement="top"
                  >
                    {getCertBadge(item.verifiedCertificate)}
                  </CPopover>
                </td>
              ),
              firmware: (item) => (
                <td>
                  <CPopover
                    content={item.firmware ? item.firmware : t('common.na')}
                    placement="top"
                  >
                    <p style={{ width: '225px' }} className="text-truncate">
                      {item.firmware}
                    </p>
                  </CPopover>
                </td>
              ),
              compatible: (item) => (
                <td>
                  <CPopover
                    content={item.compatible ? item.compatible : t('common.na')}
                    placement="top"
                  >
                    <p style={{ width: '150px' }} className="text-truncate">
                      {item.compatible}
                    </p>
                  </CPopover>
                </td>
              ),
              txBytes: (item) => <td>{cleanBytesString(item.txBytes)}</td>,
              rxBytes: (item) => <td>{cleanBytesString(item.rxBytes)}</td>,
              ipAddress: (item) => (
                <td>
                  <CPopover
                    content={item.ipAddress ? item.ipAddress : t('common.na')}
                    placement="top"
                  >
                    <p style={{ width: '150px' }} className="text-truncate">
                      {item.ipAddress}
                    </p>
                  </CPopover>
                </td>
              ),
              show_details: (item) => (
                <td>
                  <CContainer fluid>
                    <CRow>
                      <CCol>
                        <CPopover content={t('common.refresh_device')}>
                          <CButton
                            onClick={() => refreshDevice(item.serialNumber)}
                            color="primary"
                            variant="outline"
                            size="sm"
                          >
                            <CIcon name="cil-sync" content={cilSync} size="sm" />
                          </CButton>
                        </CPopover>
                      </CCol>
                      <CCol>
                        <CPopover content={t('configuration.details')}>
                          <CLink
                            className="c-subheader-nav-link"
                            aria-current="page"
                            to={() => `/devices/${item.serialNumber}`}
                          >
                            <CButton color="primary" variant="outline" shape="square" size="sm">
                              <CIcon name="cil-info" content={cilInfo} size="sm" />
                            </CButton>
                          </CLink>
                        </CPopover>
                      </CCol>
                      <CCol className="mr-4">
                        <CPopover content={t('wifi_analysis.title')}>
                          <CLink
                            className="c-subheader-nav-link"
                            aria-current="page"
                            to={() => `/devices/${item.serialNumber}/wifianalysis`}
                          >
                            <CButton color="primary" variant="outline" shape="square" size="sm">
                              <CIcon name="cil-notes" content={cilNotes} size="sm" />
                            </CButton>
                          </CLink>
                        </CPopover>
                      </CCol>
                    </CRow>
                  </CContainer>
                </td>
              ),
            }}
          />
          <ReactPaginate
            previousLabel="← Previous"
            nextLabel="Next →"
            pageCount={pageCount}
            onPageChange={updatePage}
            breakClassName="page-item"
            breakLinkClassName="page-link"
            containerClassName="pagination"
            pageClassName="page-item"
            pageLinkClassName="page-link"
            previousClassName="page-item"
            previousLinkClassName="page-link"
            nextClassName="page-item"
            nextLinkClassName="page-link"
            activeClassName="active"
          />
        </CCardBody>
      </CCard>
    </>
  );
};

DeviceListDisplay.propTypes = {
  devices: PropTypes.instanceOf(Array).isRequired,
  updateDevicesPerPage: PropTypes.func.isRequired,
  pageCount: PropTypes.number.isRequired,
  updatePage: PropTypes.func.isRequired,
  devicesPerPage: PropTypes.string.isRequired,
  refreshDevice: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default DeviceList;
