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
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { useSelector } from 'react-redux';
import DatePicker from 'react-widgets/DatePicker';
import { prettyDate, addDays } from '../utils/helper';
import axiosInstance from '../utils/axiosInstance';
import { getToken } from '../utils/authHelper';
import WifiChannelTable from './WifiChannels/WifiChannelTable';

const DeviceCommands = () => {
  const [collapse, setCollapse] = useState(false);
  const [details, setDetails] = useState([]);
  const [commands, setCommands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [start, setStart] = useState(addDays(new Date(), -3).toString());
  const [end, setEnd] = useState(new Date().toString());
  const selectedDeviceId = useSelector((state) => state.selectedDeviceId);

  const toggle = (e) => {
    setCollapse(!collapse);
    e.preventDefault();
  };

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
  const getCommands = () => {
    setLoading(true);
    const utcStart = new Date(start).toISOString();
    const utcEnd = new Date(end).toISOString();

    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      params: {
        startDate: utcStart,
        endDate: utcEnd,
      },
    };

    axiosInstance
      .get(`/commands?serialNumber=${selectedDeviceId}`, options)
      .then((response) => {
        setCommands(response.data.commands);
      })
      .catch(() => {
      })
      .finally(() => {
        setLoading(false);
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

  const getDetails = (command, commandDetails) => {
    if (command === 'wifiscan') {
      const scanList = commandDetails.results.status.scan.scan;
      if(scanList)
        return (
          <WifiChannelTable channels={parseThroughList(scanList)}/>
        );
    }
    else if (command === 'reboot' || command === 'leds'){
      const result = commandDetails.results;
      if(result)
        return (
          <pre>{JSON.stringify(result, null, 4)}</pre>
        );
    }
      return <pre>{JSON.stringify(commandDetails, null, 4)}</pre>
    
  }
  const columns = [
    { key: 'UUID', label: 'Id' },
    { key: 'command' },
    { key: 'completed' },
    {
      key: 'show_details',
      label: '',
      _style: { width: '1%' },
      sorter: false,
      filter: false,
    },
  ];

  useEffect(() => {
    getCommands();
    setStart(addDays(new Date(), -3).toString());
    setEnd(new Date().toString());
  }, []);

  useEffect(() => {
    getCommands();
  }, [start, end]);

  return (
    <CWidgetDropdown
      inverse
      color="gradient-primary"
      header="Device Commands"
      footerSlot={
        <div style={{ padding: '20px' }}>
          <CCollapse show={collapse}>
            <CRow style={{ marginBottom: '10px' }}>
              <CCol>
                From:
                <DatePicker
                  selected={start === '' ? new Date() : new Date(start)}
                  value={start === '' ? new Date() : new Date(start)}
                  includeTime
                  selectTime
                  onChange={(date) => setStart(date)}
                />
              </CCol>
              <CCol>
                To:
                <DatePicker
                  selected={end === '' ? new Date() : new Date(end)}
                  value={end === '' ? new Date() : new Date(end)}
                  includeTime
                  selectTime
                  onChange={(date) => setEnd(date)}
                />
              </CCol>
            </CRow>
            <CCard>
              <div className="overflow-auto" style={{ height: '250px' }}>
                <CDataTable
                  loading={loading}
                  items={commands ?? []}
                  fields={columns}
                  style={{ color: 'white' }}
                  border
                  sorterValue={{ column: 'completed', desc: 'true' }}
                  scopedSlots={{
                    completed: (item) => <td>{prettyDate(item.completed)}</td>,
                    show_details: (item, index) => (
                      <td className="py-2">
                        <CButton
                          color="primary"
                          variant={details.includes(index) ? "" : "outline"}
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
                          <h5>Details</h5>
                          <div>
                            {getDetails(item.command, item)}
                          </div>
                        </CCardBody>
                      </CCollapse>
                    ),
                  }}
                />
              </div>
            </CCard>
          </CCollapse>
          <CButton show={collapse} color="transparent" onClick={toggle} block>
            <CIcon
              name={collapse ? 'cilChevronTop' : 'cilChevronBottom'}
              style={{ color: 'white' }}
              size="lg"
            />
          </CButton>
        </div>
      }
    >
      <CIcon name="cilNotes" style={{ color: 'white' }} size="lg" />
    </CWidgetDropdown>
  );
};

export default DeviceCommands;
