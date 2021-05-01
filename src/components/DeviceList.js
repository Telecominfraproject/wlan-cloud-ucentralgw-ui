import React, { useEffect, useState, useCallback } from 'react'
import {
  CBadge,
  CCardBody,
  CDataTable,
  CCollapse,
  CButton,
  CLink
} from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons'
import { getToken } from '../utils/authHelper';
import axiosInstance from '../utils/axiosInstance';
import { cleanTimestamp, cleanBytesString } from '../utils/helper';

const DeviceList = () => {
  const [devices, setDevices] = useState([]);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState([]);

  //Loading the devices
  const refreshDevices = useCallback(() => {
    const token = getToken();
    setLoading(true);

    const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    axiosInstance.get('/devices', {
        headers: headers
    })
    .then((response) => {
      const date = new Date();
      const dateAsString = date.toLocaleString();
      setLastRefresh(dateAsString);
      addStatusToDeviceList(response.data.devices);
    })
    .catch(error => {
      setLoading(false);
      console.log(error.response);
    });
  }, []);
  
  //Getting the status for each device
  const addStatusToDeviceList = (devices) => {
    const token = getToken();
    
    const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    const promises = [];

    for(let i = 0; i< devices.length; i++){
      promises.push(
        axiosInstance.get(`/device/${devices[i].serialNumber}/status`, {
          headers: headers
        })
        .then((response) => {
            devices[i] = {...devices[i], ...response.data};
            devices[i].ipAddress = devices[i].ipAddress.substr(0, devices[i].ipAddress.indexOf(':'));
        })
        .catch(error => {
            console.log(error.response);
        })
      );
    }

    //Waiting for all requests to finish before setting the device array
    Promise.all(promises).then(() =>{
      setDevices(devices);
      setLoading(false);
    });
  }

  //Function called from the button on the table so that a user can see more details
  const toggleDetails = (index) => {
    const position = details.indexOf(index)
    let newDetails = details.slice()
    if (position !== -1) {
      newDetails.splice(position, 1)
    } else {
      newDetails = [...details, index]
    }
    setDetails(newDetails)
  }

  //refreshDevice() has a semicolon after to make it run once on component loading
  useEffect(() => {refreshDevices();},[refreshDevices]);

  return (
    <DeviceListDisplay 
      devices={devices} 
      refresh={refreshDevices} 
      toggleDetails={toggleDetails} 
      details={details}
      loading={loading} 
      lastRefresh={lastRefresh}
    />
  )
}

const DeviceListDisplay = ({ devices, refresh, toggleDetails, details, loading, lastRefresh }) => {
  const columns = [
    { key: 'serialNumber'},
    { key: 'UUID', label: 'Config Id'},
    { 
      key: 'lastConfigurationChange'
      ,filter: false
      ,label: 'Configuration Change'
    },
    { 
      key: 'lastConfigurationDownload'
      ,filter: false 
      ,label: 'Configuration Download'
    },
    { key: 'deviceType'},
    { key: 'connected'},
    { key: 'txBytes', filter: false },
    { key: 'rxBytes', filter: false },
    { key: 'ipAddress'},
    {
      key: 'show_details',
      label: '',
      _style: { width: '1%' },
      sorter: false,
      filter: false
    }
  ];

  const getStatusBadge = (status)=>{
    if(status){
      return 'success';
    }
    return 'danger';
  }
  
  return (
    <>
    <div className='row'>
      <div className='col'>
      <CButton onClick={refresh}>
            <FontAwesomeIcon icon={faSync} color='#007bff' size="2x"/>
        </CButton>
      </div>
      <div className='col'><div className='form-inline justify-content-sm-end'>
          Last refresh : {lastRefresh}
        </div>
      </div>
    </div>
    <CDataTable
      items={devices}
      fields={columns}
      columnFilter
      itemsPerPageSelect
      itemsPerPage={10}
      hover
      sorter
      pagination
      loading = {loading}
      scopedSlots = {{
        'lastConfigurationChange':
          (item)=>(
            <td>
              {cleanTimestamp(item.lastConfigurationChange)}
            </td>
          ),
        'txBytes':
          (item)=>(
            <td>
              {cleanBytesString(item.txBytes)}
            </td>
          ),
        'rxBytes':
          (item)=>(
            <td>
              {cleanBytesString(item.rxBytes)}
            </td>
          ),
        'ipAddress':
          (item)=>(
            <td>
              {item.ipAddress ?? 'N/A'}
            </td>
          ),
        'lastConfigurationDownload':
          (item)=>(
            <td>
              {cleanTimestamp(item.lastConfigurationDownload)}
            </td>
          ),
        'connected':
          (item)=>(
            <td>
              <CBadge color={getStatusBadge(item.connected)}>
                {item.connected ? 'Connected' : 'Not connected'}
              </CBadge>
            </td>
          ),
        'show_details':
          (item, index)=>{
            return (
              <td className="py-2">
                <CButton
                  color="primary"
                  variant="outline"
                  shape="square"
                  size="sm"
                  onClick={()=>{toggleDetails(index)}}
                >
                  {details.includes(index) ? 'Hide' : 'Show'}
                </CButton>
              </td>
              )
          },
        'details':
            (item, index)=>{
              return (
              <CCollapse show={details.includes(index)}>
                <CCardBody>
                  <h4>
                    {item.notes}
                  </h4>
                  <p className="text-muted">Last configuration change: {item.lastConfigurationChange.replace('T', ' ').replace('Z', '')}</p>
                  <CLink 
                    className="c-subheader-nav-link" 
                    aria-current="page" 
                    to={() => `/devices/${item.serialNumber}`}
                  > 
                    <CButton size="sm" color="info">
                      Device Details
                    </CButton>
                  </CLink>
                </CCardBody>
              </CCollapse>
            )
          }
      }}
    />
    </>
  );
};


export default DeviceList;