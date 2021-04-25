import React from 'react'
import {
    CButton,
    CCard,
    CCardHeader,
    CCardBody,
    CRow,
    CCol
  } from '@coreui/react'
import { useSelector } from 'react-redux';

const DeviceActions = () => {
    let selectedDevice = useSelector(state => state.selectedDevice);
    console.log(selectedDevice);
    return (
        <CCard>
            <CCardHeader>
                Device Actions
            </CCardHeader>
            <CCardBody>
                <CRow>
                    <CCol>
                        <CButton block color="primary">Reboot</CButton>
                    </CCol>
                    <CCol>
                        <CButton block color="primary">Blink</CButton>
                    </CCol>

                </CRow>
            </CCardBody>
        </CCard>
    );
}

export default DeviceActions