import React from 'react';
import {
  CCard,
  CCardHeader,
  CCardBody,
  CFormGroup,
  CCol,
  CLabel,
  CForm,
  CInput,
  CCollapse,
  CCardFooter,
  CButton,
} from '@coreui/react';
import { useSelector } from 'react-redux';

const DeviceStatus = () => {
  const device = useSelector((state) => state.selectedDevice);

  if (device) {
    const barColor = device.connected ? 'gradient-success' : 'gradient-warning';

    return (
      <CWidgetProgressIcon
        header={sanityLevel ? `${sanityLevel}%` : 'Unknown'}
        text="Device Health"
        value={sanityLevel ?? 100}
        color={barColor}
        inverse
      >
        <CDropdown>
          {/* Need inline styling because CDropdownToggle does not take into account the
                    parent's inverse value */}
          <CDropdownToggle style={{ color: 'white' }}>
            <CIcon content={cilSettings} />
          </CDropdownToggle>
          <CDropdownMenu placement="bottom-end">
            <CDropdownItem>View Logs</CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
      </CWidgetProgressIcon>
    );
  }

  if (device) {
    return (
      <CCard>
        <CCardHeader>Device #{device.serialNumber} Configuration</CCardHeader>
        <CCardBody>
          <CForm action="" method="post" encType="multipart/form-data" className="form-horizontal">
            <CFormGroup row>
              <CCol md="3">
                <CLabel>UUID : </CLabel>
              </CCol>
              <CCol xs="12" md="9">
                {device.UUID}
              </CCol>
            </CFormGroup>
            <CFormGroup row>
              <CCol md="3">
                <CLabel>Serial Number : </CLabel>
              </CCol>
              <CCol xs="12" md="9">
                {device.serialNumber}
              </CCol>
            </CFormGroup>
            <CFormGroup row>
              <CCol md="3">
                <CLabel>Device Type : </CLabel>
              </CCol>
              <CCol xs="12" md="9">
                {device.deviceType}
              </CCol>
            </CFormGroup>
            <CFormGroup row>
              <CCol md="3">
                <CLabel>Last Configuration Change : </CLabel>
              </CCol>
              <CCol xs="12" md="9">
                {cleanTimestamp(device.lastConfigurationChange)}
              </CCol>
            </CFormGroup>
            <CFormGroup row>
              <CCol md="3">
                <CLabel>MAC address :</CLabel>
              </CCol>
              <CCol xs="12" md="9">
                {device.macAddress}
              </CCol>
            </CFormGroup>
            <CCollapse show={collapse}>
              <CFormGroup row>
                <CCol md="3">
                  <CLabel>Created : </CLabel>
                </CCol>
                <CCol xs="12" md="9">
                  {cleanTimestamp(device.createdTimestamp)}
                </CCol>
              </CFormGroup>
              <CFormGroup row>
                <CCol md="3">
                  <CLabel>Last Configuration Download : </CLabel>
                </CCol>
                <CCol xs="12" md="9">
                  {cleanTimestamp(device.lastConfigurationDownload)}
                </CCol>
              </CFormGroup>
              <CFormGroup row>
                <CCol md="3">
                  <CLabel>Manufacturer :</CLabel>
                </CCol>
                <CCol xs="12" md="9">
                  {device.manufacturer}
                </CCol>
              </CFormGroup>
              <CFormGroup row>
                <CCol md="3">
                  <CLabel htmlFor="text-input">Notes :</CLabel>
                </CCol>
                <CCol xs="12" md="9">
                  <CInput id="text-input" name="text-input" placeholder={device.notes} />
                </CCol>
              </CFormGroup>
              <CFormGroup row>
                <CCol md="3">
                  <CLabel>Owner :</CLabel>
                </CCol>
                <CCol xs="12" md="9">
                  {device.owner}
                </CCol>
              </CFormGroup>
              <CFormGroup row>
                <CCol md="3">
                  <CLabel>Location :</CLabel>
                </CCol>
                <CCol xs="12" md="9">
                  {device.location}
                </CCol>
              </CFormGroup>
            </CCollapse>
            <CCardFooter>
              <CButton color="primary" onClick={toggle} className="mb-1">
                More details
              </CButton>
            </CCardFooter>
          </CForm>
        </CCardBody>
      </CCard>
    );
  }

  return (
    <CCard>
      <CCardHeader>Device Configuration</CCardHeader>
      <CCardBody />
    </CCard>
  );
};

export default DeviceStatus;
