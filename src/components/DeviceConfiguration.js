import React, { useState, useEffect } from 'react'
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
    CButton
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { useSelector } from 'react-redux';
import { cleanTimestamp } from '../utils/helper';
import axiosInstance from '../utils/axiosInstance';
import { getToken } from '../utils/authHelper';


const DeviceConfiguration = () => {
    const [collapse, setCollapse] = useState(false);
    const [device, setDevice] = useState(null);
    const [loading, setLoading] = useState(false);
    const selectedDeviceId = useSelector(state => state.selectedDeviceId);

    const getDevice = () => {
        const options = {
            headers : {
                'Accept': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            }
        };

        axiosInstance.get(`/device/${selectedDeviceId}`, options)
        .then((response) => {
            setDevice(response.data);
            setLoading(false);
        })
        .catch(error => {
            setLoading(false);
            console.log(error);
            console.log(error.response);
        });
    }

    useEffect(() => {
        setLoading(true);
        getDevice();
    },[]);

    const toggle = (e) => {
        setCollapse(!collapse);
        e.preventDefault();
    }

    if(device){
        return (
            <CCard>
                <CCardHeader>
                    #{device.serialNumber} Details
                </CCardHeader>
                <CCardBody>
                    <CForm action="" method="post" encType="multipart/form-data" className="form-horizontal">
                        <CFormGroup row>
                            <CCol md="3">
                                <CLabel>UUID : </CLabel>
                            </CCol>
                            <CCol xs="12" md="9">
                                {device.UUID }
                            </CCol>
                        </CFormGroup>
                        <CFormGroup row>
                            <CCol md="3">
                                <CLabel>Serial Number : </CLabel>
                            </CCol>
                            <CCol xs="12" md="9">
                                {device.serialNumber }
                            </CCol>
                        </CFormGroup>
                        <CFormGroup row>
                                <CCol md="3">
                                    <CLabel>Device Type : </CLabel>
                                </CCol>
                                <CCol xs="12" md="9">
                                    { device.deviceType }
                                </CCol>
                            </CFormGroup>
                        <CFormGroup row>
                            <CCol md="3">
                                <CLabel>Last Configuration Change : </CLabel>
                            </CCol>
                            <CCol xs="12" md="9">
                                {cleanTimestamp(device.lastConfigurationChange) }
                            </CCol>
                        </CFormGroup>
                        <CFormGroup row>
                            <CCol md="3">
                                <CLabel>MAC address :</CLabel>
                            </CCol>
                            <CCol xs="12" md="9">
                                { device.macAddress }
                            </CCol>
                        </CFormGroup>
                        <CCollapse show={collapse}>
                            <CFormGroup row>
                                <CCol md="3">
                                    <CLabel>Created : </CLabel>
                                </CCol>
                                <CCol xs="12" md="9">
                                    { cleanTimestamp(device.createdTimestamp) }
                                </CCol>
                            </CFormGroup>
                            <CFormGroup row>
                                <CCol md="3">
                                    <CLabel>Last Configuration Download : </CLabel>
                                </CCol>
                                <CCol xs="12" md="9">
                                    {cleanTimestamp(device.lastConfigurationDownload) }
                                </CCol>
                            </CFormGroup>
                            <CFormGroup row>
                                <CCol md="3">
                                    <CLabel>Manufacturer :</CLabel>
                                </CCol>
                                <CCol xs="12" md="9">
                                    { device.manufacturer }
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
                                    { device.owner }
                                </CCol>
                            </CFormGroup>
                            <CFormGroup row>
                                <CCol md="3">
                                    <CLabel>Location :</CLabel>
                                </CCol>
                                <CCol xs="12" md="9">
                                    { device.location }
                                </CCol>
                            </CFormGroup>
                        </CCollapse>
                        <CCardFooter>
                            <CButton show={collapse} color="transparent" onClick = { toggle } block>
                                <CIcon name={collapse ? "cilChevronTop" : "cilChevronBottom"} size="lg"/>
                            </CButton>
                        </CCardFooter>
                    </CForm>
                </CCardBody>
            </CCard>
        );
    }

    return (
            <CCard>
                <CCardHeader>
                    Device Configuration
                </CCardHeader>
                <CCardBody>
                </CCardBody>
            </CCard>
    );
}

export default DeviceConfiguration