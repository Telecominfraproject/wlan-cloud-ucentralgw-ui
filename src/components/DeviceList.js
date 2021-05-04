import React, { useEffect, useState } from 'react'
import {
	CBadge,
	CCardBody,
	CDataTable,
	CCollapse,
	CButton,
	CLink,
	CCard,
	CCardHeader,
	CRow,
	CCol
} from '@coreui/react'
import ReactPaginate from 'react-paginate';
import Select from 'react-select'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfo } from '@fortawesome/free-solid-svg-icons'
import { getToken } from '../utils/authHelper';
import axiosInstance from '../utils/axiosInstance';
import { cleanTimestamp, cleanBytesString } from '../utils/helper';
import iotIcon from '../assets/icons/iot.png'
import internetSwitch from '../assets/icons/networkswitch.png';
import { cilRouter } from '@coreui/icons';
import CIcon from '@coreui/icons-react';

const DeviceList = () => {
	const [loadedSerials, setLoadedSerials] = useState(false);
	const [serialNumbers, setSerialNumbers] = useState([]);
	const [page, setPage] = useState(0);
	const [pageCount, setPageCount] = useState(0);
	const [devicesPerPage, setDevicesPerPage] = useState(10);
	const [devices, setDevices] = useState([]);
	const [details, setDetails] = useState([]);
	const [loading, setLoading] = useState(true);
	const [lastRefresh, setLastRefresh] = useState([]);

	const getSerialNumbers = () => {
		const token = getToken();
		setLoading(true);

		const headers = {
			'Accept': 'application/json',
			'Authorization': `Bearer ${token}`
		};

		axiosInstance.get('/devices?serialOnly=true', {
			headers: headers
		})
		.then((response) => {
			setSerialNumbers(response.data.serialNumbers);
			setLoadedSerials(true);
		})
		.catch(error => {
			setLoading(false);
			console.log(error.response);
		});
	};

	const getDeviceInformation = () => {
		const token = getToken();
		setLoading(true);

		const headers = {
			'Accept': 'application/json',
			'Authorization': `Bearer ${token}`
		};

		const startIndex = page * devicesPerPage;
		const serialsToGet = serialNumbers.slice(startIndex, (startIndex + devicesPerPage)).join(',');
		
		console.log(serialsToGet);

		axiosInstance.get(`/devices?deviceWithStatus=true&select=${serialsToGet}`, {
			headers: headers
		})
		.then((response) => {
			setDevices(response.data.devicesWithStatus);
			setLoading(false);
			updateRefresh();
		})
		.catch(error => {
			setLoading(false);
			console.log(error.response);
		});
	}

	const updateRefresh = () => {
		const date = new Date();
		const dateAsString = date.toLocaleString();
		setLastRefresh(dateAsString);
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

	const updateDevicesPerPage = (value) => {
		console.log('update devices per page ' + value)
		setDevicesPerPage(value);
	}

	const updatePageCount = ({ selected: selectedPage }) => {
		setPage(selectedPage);
	}

	//Initial load
	useEffect(() => {
		getSerialNumbers();
	}, []);

	//Updating the devices only if serial numbers, page number or devices per page changes
	useEffect(()=>{
		console.log('in get device effect');
		if(loadedSerials) getDeviceInformation();
    }, [serialNumbers, page, devicesPerPage, loadedSerials]);

	useEffect(() => {
		if(loadedSerials) {
			const count = Math.ceil(serialNumbers.length / devicesPerPage);
			setPageCount(count);
		} 
	}, [devicesPerPage, loadedSerials]);



  	return (
		<DeviceListDisplay 
		devices={devices} 
		toggleDetails={toggleDetails} 
		details={details}
		loading={loading} 
		updateDevicesPerPage={updateDevicesPerPage}
		pageCount={pageCount}
		updatePage={updatePageCount}
		pageRangeDisplayed={5}
		/>
  	);
}

const DeviceListDisplay = ({ devices, toggleDetails, details, loading, updateDevicesPerPage, pageCount, updatePage }) => {
  const columns = [
	{ key: 'serialNumber'},
	{ key: 'UUID', label: 'Config Id'},
	{ 
	  key: 'lastConfigurationChange'
	  ,filter: false
	  ,label: 'Configuration Change'
	},
	{ key: 'firmware', filter: false },
	{ key: 'deviceType', filter: false, sorter: false},
	{ key: 'connected', _style: { width: '1%' }, sorter: false},
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

  const selectOptions = [
	{ value: '10', label: '10' },
	{ value: '25', label: '25' },
	{ value: '50', label: '50' }
  ]


  const getDeviceIcon = (deviceType) =>{
	if(deviceType === "AP_Default"){
	  return <CIcon name="cilRouter" size="2xl"></CIcon>;
	}
	else if(deviceType === "IOT"){
	  return <img src={iotIcon} style={{height:'32px', width:'32px'}}/>;
	}
	else if(deviceType === "SWITCH"){
	  return <img src={internetSwitch} style={{height:'32px', width:'32px'}}/>;
	}
	return null;
  }

  const getStatusBadge = (status) => {
	if(status){
	  return 'success';
	}
	return 'danger';
  }
  
  return (
	<>
	  <CCard>
		<CCardHeader>
			<CRow>
				<CCol>
					Device List
				</CCol>
				<CCol xs={2}>
					<Select 
						isClearable = { false } 
						options = { selectOptions } 
						defaultValue = {{ value : '10', label: '10' }}  
						onChange={value => updateDevicesPerPage(value.value)}
					/>
				</CCol>
			</CRow>
		</CCardHeader>
		<CCardBody>
		  <CDataTable
			items={devices}
			fields={columns}
			border
			hover
			loading = {loading}
			scopedSlots = {{
				'lastConfigurationChange':
				(item)=>(
					<td>
					{cleanTimestamp(item.lastConfigurationChange)}
					</td>
				),
				'deviceType':
				(item)=>(
					<td style={{textAlign: 'center'}}>
					{getDeviceIcon(item.deviceType) ?? item.deviceType}
					</td>
				),
				'firmware':
				(item)=>(
					<td>
					{item.firmware && item.firmware !== "" ? item.firmware : 'N/A'}
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
						<FontAwesomeIcon icon={faInfo}/>
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
			}}/>
		  	<ReactPaginate
				previousLabel={"← Previous"}
				nextLabel={"Next →"}
				pageCount={pageCount}
				onPageChange={updatePage} 
				breakClassName={'page-item'}
				breakLinkClassName={'page-link'}
				containerClassName={'pagination'}
				pageClassName={'page-item'}
				pageLinkClassName={'page-link'}
				previousClassName={'page-item'}
				previousLinkClassName={'page-link'}
				nextClassName={'page-item'}
				nextLinkClassName={'page-link'}
				activeClassName={'active'}
			/>
		</CCardBody>
	  </CCard>
	</>
  );
};


export default DeviceList;