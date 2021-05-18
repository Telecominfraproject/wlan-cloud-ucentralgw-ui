import {
    CButton,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CSpinner,
    CRow,
    CFormGroup,
    CInputRadio,
    CLabel,
    CForm
  } from '@coreui/react';
  import React, { useState, useEffect } from 'react';
  import { useSelector } from 'react-redux';
  import WifiChannelTable from '../components/WifiChannels/WifiChannelTable';
  import 'react-widgets/styles.css';
  import { getToken } from '../utils/authHelper';
  import axiosInstance from '../utils/axiosInstance';
  
  const WifiScanModalWidget = ({ show, toggleModal }) => {
    const [hadSuccess, setHadSuccess] = useState(false);
    const [hadFailure, setHadFailure] = useState(false);
    const [waiting, setWaiting] = useState(false);
    const [choseVerbose, setVerbose] = useState(true);
    const [channelList, setChannelList] = useState([]);
    const [checkingIfSure, setCheckingIfSure] = useState(false);
    const selectedDeviceId = useSelector((state) => state.selectedDeviceId);
  

    const confirmingIfSure = () => {
      setCheckingIfSure(true);
    };
  
    useEffect(() => {
      setHadSuccess(false);
      setHadFailure(false);
      setWaiting(false);
      setChannelList([]);
      setCheckingIfSure(false);
      setVerbose(true);
    }, [show]);
  
    const parseThroughList = (scanList) => {
        const dbmNumber = 4294967295;
        const listOfChannels = [];

        scanList.forEach((scan) => {
            if(!listOfChannels.includes(scan.channel)){
                listOfChannels.push(scan.channel);
            }
        });

        const finalList = [];
        listOfChannels.forEach((channelNumber) => {
            const channel = { 
                channel: channelNumber,
                devices: []
            };

            scanList.forEach((device) => {
               if(device.channel === channelNumber){
                   const deviceToAdd = {};
                   deviceToAdd.SSID = device.ssid ?? 'N/A';
                   deviceToAdd.Signal = (dbmNumber - device.signal) * -1;
                   channel.devices.push(deviceToAdd);
               } 
            });

            finalList.push(channel);
        });
        return finalList;
    }

    const doAction = () => {
      setHadFailure(false);
      setHadSuccess(false);
      setWaiting(true);
  
      const token = getToken();
  
      const parameters = {
        serialNumber: selectedDeviceId,
        verbose: choseVerbose
      };
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      };
  
      axiosInstance
        .post(`/device/${selectedDeviceId}/wifiscan`, parameters, { headers })
        .then((response) => {
            const scanList = response.data.results.status.scan.scan;

            if(scanList){
              setChannelList(parseThroughList(scanList));
              setHadSuccess(true);
            }
            else{
              setHadFailure(true);
            }
            
        })
        .catch((error) => {
          setHadFailure(true);
          console.log(error);
          console.log(error.response);
        })
        .finally(() => {
          setCheckingIfSure(false);
          setWaiting(false);
        });
    };

    return (
      <CModal size="lg" show={show} onClose={toggleModal}>
        <CModalHeader closeButton>
          <CModalTitle>Wifi Scan</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <h6>
            Launch a wifi scan of this device, which should take approximately 25 seconds.
          </h6>
          <CRow style={{ marginTop: '20px' }}>
            <CForm style={{paddingLeft: '5%'}}>
                <CFormGroup variant="checkbox" onClick={() => setVerbose(true)}>
                    <CInputRadio checked={choseVerbose} id="radio1" name="radios" value="option1" />
                    <CLabel variant="checkbox" htmlFor="radio1">With verbose</CLabel>
                </CFormGroup>
                <CFormGroup variant="checkbox" onClick={() => setVerbose(false)}>
                    <CInputRadio checked={!choseVerbose} id="radio2" name="radios" value="option2" />
                    <CLabel variant="checkbox" htmlFor="radio2">Without verbose</CLabel>
                </CFormGroup>
            </CForm>
          </CRow>
          <div style={{marginTop: '3%'}} hidden={!hadSuccess && !hadFailure}>
            <WifiChannelTable channels={channelList}/>
          </div>
        </CModalBody>
        <CModalFooter>
          <div hidden={!checkingIfSure}>Are you sure?</div>
          <CButton hidden={checkingIfSure} color="primary" onClick={() => confirmingIfSure()}>
            {(hadSuccess || hadFailure) ? 'Re-Scan' : 'Scan'}
          </CButton>
          <CButton
            hidden={!checkingIfSure}
            disabled={waiting}
            color="primary"
            onClick={() => doAction()}
          >
            {waiting ? 'Loading...' : 'Yes'} {'   '}
            <CSpinner hidden={!waiting} component="span" size="sm" />
          </CButton>
          <CButton color="secondary" onClick={toggleModal}>
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>
    );
  };
  
  export default WifiScanModalWidget;
  