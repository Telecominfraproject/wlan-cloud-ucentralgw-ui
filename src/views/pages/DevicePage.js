import React, { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
    CRow,
    CCol,
    CButton,
  } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../../utils/axiosInstance';
import { getToken } from '../../utils/authHelper';

import DeviceHealth from '../../components/DeviceHealth';
import DeviceConfiguration from '../../components/DeviceConfiguration';
import DeviceActions from '../../components/DeviceActions'

const DevicePage = (props) => {
    const dispatch = useDispatch();
    const [device, setDevice] = useState([]);
    const [lastRefresh, setLastRefresh] = useState([]);

    //Storing the deviceId in the store
    let selectedDeviceId = useSelector(state => state.selectedDeviceId);
    let { deviceId } = useParams();

    if(!selectedDeviceId || selectedDeviceId !== deviceId){
        dispatch({type: 'set', selectedDeviceId: deviceId});
        selectedDeviceId = deviceId;
    }

    const refreshDevice = useCallback(() => {
        const addStatusToDevice = (device, options) => {
            axiosInstance.get(`/device/${device.serialNumber}/status`, options)
            .then((response) => {
                device = {...device, ...response.data};
                device.ipAddress = device.ipAddress.substr(0, device.ipAddress.indexOf(':'));
            })
            .catch(error => {
                console.log(error.response);
            })
            .finally (() => {
                addHealthChecksToDevice(device, options);
            });
        }

        const addHealthChecksToDevice = (device, options) => {
            axiosInstance.get(`/device/${device.serialNumber}/healthchecks`, options)
            .then((response) => {
                device.healthChecks = response.data.values;
            })
            .catch(error => {
                console.log(error);
                console.log(error.response);
            })
            .finally(() => {
                setDevice(device);
                dispatch({type: 'set', selectedDevice: device});
            });
        }

        const options = {
            headers : {
                'Accept': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            }
        };

        axiosInstance.get(`/device/${selectedDeviceId}`, options)
        .then((response) => {
          const date = new Date();
          const dateAsString = date.toLocaleString();
          setLastRefresh(dateAsString);
          addStatusToDevice(response.data, options);
        })
        .catch(error => {
          console.log(error.response);
        });
      }, [selectedDeviceId, dispatch]);

    

    useEffect(() => {refreshDevice();},[refreshDevice]);

    return (
        <DeviceDisplay 
          device={device} 
          refresh={refreshDevice} 
          lastRefresh={lastRefresh}
        />
      )
}

const DeviceDisplay = ({ device, refresh, lastRefresh }) => {
    return (
        <>
        <div className="App">
            <CRow>
                <CCol xs='12' sm='6'>
                    <CButton onClick={ refresh }>
                        <FontAwesomeIcon icon={faSync} color='#007bff' size="2x"/>
                    </CButton>
                </CCol>
                <CCol xs='12' sm='6'>
                    <div className='form-inline justify-content-sm-end'>
                        Last refresh : {lastRefresh}
                    </div>
                </CCol>
            </CRow>
            <CRow>
                <CCol xs='12' sm='6'>
                    <DeviceConfiguration/>
                </CCol>
                <CCol xs='12' sm='6'>
                    <DeviceHealth/>
                    <DeviceActions/>
                </CCol >
            </CRow>
        </div>
        </>
    );
}

export default DevicePage;