import React, { useState } from 'react'
import {
    CWidgetProgress,
    CCollapse,
    CButton,
    CDataTable,
    CCard,
    CCardBody
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { useSelector } from 'react-redux';
import { cleanTimestamp } from '../utils/helper';

const DeviceHealth = () => {
    const [collapse, setCollapse] = useState(false);
    const [details, setDetails] = useState([]);
    let selectedDevice = useSelector(state => state.selectedDevice);
    let sanityLevel;
    let healthChecks;
    let barColor;

    const toggle = (e) => {
        setCollapse(!collapse);
        e.preventDefault();
    }

    //Function called from the button on the table so that a user can see more details
    const toggleDetails = (index) => {
        const position = details.indexOf(index)
        let newDetails = details.slice()
        
        if (position !== -1) {
            newDetails.splice(position, 1)
        }
        else {
            newDetails = [...details, index]
        }
        setDetails(newDetails)
    }

    const columns = [
        { key: 'UUID', label: 'Config. Id'},
        { key: 'recorded'},
        { key: 'sanity'},
        {
            key: 'show_details',
            label: '',
            _style: { width: '1%' },
            sorter: false,
            filter: false
          }
    ];

    if(selectedDevice && selectedDevice.healthChecks && selectedDevice.healthChecks.length > 0){
        sanityLevel = selectedDevice.healthChecks[0].sanity;
        healthChecks = selectedDevice.healthChecks;
        if(sanityLevel === 100)
            barColor = "gradient-success";
        else if (sanityLevel >= 90)
            barColor = "gradient-warning";
        else
            barColor = "gradient-danger";
    }
    return (
        <CWidgetProgress
            header={sanityLevel ? `${sanityLevel}%` : 'Unknown'}
            text="Device Health"
            value={sanityLevel ?? 100}
            color={barColor}
            inverse
            footer={
                <div>
                    <CCollapse show={collapse}>
                        <CCard>
                        <div className="overflow-auto" style={{height: '250px'}}>
                            <CDataTable
                                items={healthChecks ?? [] }
                                fields={columns}
                                style={{color: 'white'}}
                                sorterValue={{column: 'recorded', desc:'true'}}
                                scopedSlots = {{
                                    'recorded':
                                    (item)=>(
                                        <td>
                                        {cleanTimestamp(item.recorded)}
                                        </td>
                                    ),
                                    'sanity':
                                    (item)=>(
                                        <td>
                                            {`${item.sanity}%`}
                                        </td>
                                    ),
                                    'show_details':
                                    (item, index)=>{
                                        if(item.sanity === 100){
                                            return (<></>);
                                        }
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
                                        );
                                    },
                                    'details':
                                        (item, index)=>{
                                            return (
                                                <CCollapse show={details.includes(index)}>
                                                    <CCardBody>
                                                        <h5>Details</h5>
                                                        <div><pre>{JSON.stringify(item.values, null, 4)}</pre></div>
                                                    </CCardBody>
                                                </CCollapse>
                                            );
                                    }
                                }}
                            >
                            </CDataTable>
                        </div>
                        </CCard>
                    </CCollapse>
                    <CButton show={collapse} color="transparent" onClick = { toggle } block>
                        <CIcon name={collapse ? "cilChevronTop" : "cilChevronBottom"} style={{color: 'white'}} size="l"/>
                    </CButton>
                </div>
            }
        >
        </CWidgetProgress>
    );
}

export default DeviceHealth