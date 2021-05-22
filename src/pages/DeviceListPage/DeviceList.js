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
} from '@coreui/react';
import ReactPaginate from 'react-paginate';
import Select from 'react-select';
import PropTypes from 'prop-types';
import { cilSync, cilInfo, cilBadge, cilBan } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { getToken } from '../../utils/authHelper';
import axiosInstance from '../../utils/axiosInstance';
import { cleanBytesString, cropStringWithEllipsis } from '../../utils/helper';
import meshIcon from '../../assets/icons/Mesh.png';
import apIcon from '../../assets/icons/AP.png';
import internetSwitch from '../../assets/icons/Switch.png';

const DeviceList = () => {
  const [loadedSerials, setLoadedSerials] = useState(false);
  const [serialNumbers, setSerialNumbers] = useState([]);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [devicesPerPage, setDevicesPerPage] = useState(10);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  const getSerialNumbers = () => {
    const token = getToken();
    setLoading(true);

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    };

    axiosInstance
      .get('/devices?serialOnly=true', {
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
    const token = getToken();
    setLoading(true);

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const startIndex = page * devicesPerPage;
    const endIndex = parseInt(startIndex, 10) + parseInt(devicesPerPage, 10);
    const serialsToGet = serialNumbers.slice(startIndex, endIndex).join(',');

    axiosInstance
      .get(`/devices?deviceWithStatus=true&select=${serialsToGet}`, {
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
    const token = getToken();
    setLoading(true);

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    };

    axiosInstance
      .get(`/devices?deviceWithStatus=true&select=${serialNumber}`, {
        headers,
      })
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
    setDevicesPerPage(value);
  };

  const updatePageCount = ({ selected: selectedPage }) => {
    setPage(selectedPage);
  };

  // Initial load
  useEffect(() => {
    getSerialNumbers();
  }, []);

  // Updating the devices only if serial numbers, page number or devices per page changes
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
      pageCount={pageCount}
      updatePage={updatePageCount}
      pageRangeDisplayed={5}
      refreshDevice={refreshDevice}
    />
  );
};

const DeviceListDisplay = ({
  devices,
  loading,
  updateDevicesPerPage,
  pageCount,
  updatePage,
  refreshDevice,
}) => {
  const columns = [
    { key: 'deviceType', label: '', filter: false, sorter: false, _style: { width: '5%' } },
    { key: 'verifiedCertificate', label: 'Certificate', _style: { width: '1%' } },
    { key: 'serialNumber', _style: { width: '5%' } },
    { key: 'UUID', label: 'Config Id', _style: { width: '5%' } },
    { key: 'firmware', filter: false, _style: { width: '20%' } },
    { key: 'compatible', filter: false, _style: { width: '20%' } },
    { key: 'txBytes', label: 'Tx', filter: false, _style: { width: '10%' } },
    { key: 'rxBytes', label: 'Rx', filter: false, _style: { width: '10%' } },
    { key: 'ipAddress', _style: { width: '20%' } },
    {
      key: 'show_details',
      label: '',
      _style: { width: '3%' },
      sorter: false,
      filter: false,
    },
    {
      key: 'refresh',
      label: '',
      _style: { width: '2%' },
      sorter: false,
      filter: false,
    },
  ];

  const selectOptions = [
    { value: '10', label: '10' },
    { value: '25', label: '25' },
    { value: '50', label: '50' },
  ];

  const getDeviceIcon = (deviceType) => {
    if (deviceType === 'AP_Default' || deviceType === 'AP') {
      return <img src={apIcon} style={{ height: '32px', width: '32px' }} alt="AP" />;
      // return <CIcon name="cilRouter" size="2xl" alt="AP" />;
    }
    if (deviceType === 'MESH') {
      return <img src={meshIcon} style={{ height: '32px', width: '32px' }} alt="MESH" />;
    }
    if (deviceType === 'SWITCH') {
      return <img src={internetSwitch} style={{ height: '32px', width: '32px' }} alt="SWITCH" />;
    }
    return null;
  };

  const getCertBadge = (cert) => {
    if (cert === 'NO_CERTIFICATE') {
      return (
        <div style={{ position: 'relative' }}>
          <CIcon
            style={{ position: 'absolute', left: '31%', marginTop: '8%' }}
            name="cil-badge"
            content={cilBadge}
            size="2xl"
            alt="AP"
          />
          <CIcon
            style={{ position: 'absolute', zIndex: 99, left: '21%', color: '#e55353' }}
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
          <CBadge color={color} style={{ backgroundColor: '#FFFF5C' }}>
            <CIcon name="cil-badge" content={cilBadge} size="2xl" alt="AP" />
          </CBadge>
        );
      case 'VERIFIED':
        color = 'success';
        break;
      default:
        return (
          <div style={{ position: 'relative' }}>
            <CIcon
              style={{ position: 'absolute', left: '31%', marginTop: '8%' }}
              name="cil-badge"
              content={cilBadge}
              size="2xl"
              alt="AP"
            />
            <CIcon
              style={{ position: 'absolute', zIndex: 99, left: '21%', color: '#e55353' }}
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
            <CCol xs={2}>
              <Select
                isClearable={false}
                options={selectOptions}
                defaultValue={{ value: '10', label: '10' }}
                onChange={(value) => updateDevicesPerPage(value.value)}
              />
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody>
          <CDataTable
            items={devices ?? []}
            fields={columns}
            border
            hover
            loading={loading}
            scopedSlots={{
              serialNumber: (item) => (
                <td style={{ textAlign: 'center' }}>
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
                <td style={{ textAlign: 'center' }}>
                  <CPopover
                    content={item.connected ? 'Connected' : 'Not Connected'}
                    placement="top"
                  >
                    <CBadge color={getStatusBadge(item.connected)}>
                      {getDeviceIcon(item.deviceType) ?? item.deviceType}
                    </CBadge>
                  </CPopover>
                </td>
              ),
              verifiedCertificate: (item) => (
                <td style={{ textAlign: 'center' }}>
                  <CPopover content={item.verifiedCertificate ?? 'Unknown'} placement="top">
                    {getCertBadge(item.verifiedCertificate)}
                  </CPopover>
                </td>
              ),
              firmware: (item) => (
                <td>
                  <CPopover content={item.firmware ? item.firmware : 'N/A'} placement="top">
                    <p>{cropStringWithEllipsis(item.firmware, 16)}</p>
                  </CPopover>
                </td>
              ),
              compatible: (item) => (
                <td>
                  <CPopover content={item.compatible ? item.compatible : 'N/A'} placement="top">
                    <p>{cropStringWithEllipsis(item.compatible, 16)}</p>
                  </CPopover>
                </td>
              ),
              txBytes: (item) => <td>{cleanBytesString(item.txBytes)}</td>,
              rxBytes: (item) => <td>{cleanBytesString(item.rxBytes)}</td>,
              ipAddress: (item) => (
                <td>
                  <CPopover content={item.ipAddress ? item.ipAddress : 'N/A'} placement="top">
                    <p>{cropStringWithEllipsis(item.ipAddress, 20)}</p>
                  </CPopover>
                </td>
              ),
              refresh: (item) => (
                <td className="py-2">
                  <CButton
                    onClick={() => refreshDevice(item.serialNumber)}
                    color="primary"
                    variant="outline"
                    size="sm"
                  >
                    <CIcon name="cil-sync" content={cilSync} size="sm" />
                  </CButton>
                </td>
              ),
              show_details: (item) => (
                <td className="py-2">
                  <CLink
                    className="c-subheader-nav-link"
                    aria-current="page"
                    to={() => `/devices/${item.serialNumber}`}
                  >
                    <CButton color="primary" variant="outline" shape="square" size="sm">
                      <CIcon name="cil-info" content={cilInfo} size="sm" />
                    </CButton>
                  </CLink>
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
  refreshDevice: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default DeviceList;
