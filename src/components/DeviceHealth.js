import React, { useState } from 'react'
import {
    CWidgetProgress,
    CCollapse,
    CButton,
    CDataTable,
    CCard
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilChevronBottom, cilChevronTop } from '@coreui/icons';
import { useSelector } from 'react-redux';
import { cleanTimestamp } from '../utils/helper';

const DeviceHealth = () => {
    const [collapse, setCollapse] = useState(false);
    let selectedDevice = useSelector(state => state.selectedDevice);
    let sanityLevel;
    let healthChecks;
    let barColor;

    const toggle = (e) => {
        setCollapse(!collapse);
        e.preventDefault();
    }

    const columns = [
        { key: 'UUID', label: 'Config. Id'},
        { key: 'recorded'},
        { key: 'sanity'}
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
                            <div className="overflow-auto" style={{height: '200px'}}>
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