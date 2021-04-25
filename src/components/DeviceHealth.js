import React from 'react'
import {
    CWidgetProgressIcon,
    CWidgetDropdown,
    CDropdown,
    CDropdownToggle,
    CDropdownItem,
    CDropdownMenu,
    CCardFooter,
    CLink,
    CProgressBar
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilHeart, cilSettings } from '@coreui/icons';
import { useSelector } from 'react-redux';

const healthPopoverContent = "100%: Perfect 90%-99%: Good 0%-90%: Bad";

const DeviceHealth = () => {
    let selectedDevice = useSelector(state => state.selectedDevice);
    let sanityLevel;
    let barColor;

    if(selectedDevice && selectedDevice.healthChecks && selectedDevice.healthChecks.length > 0){
        sanityLevel = selectedDevice.healthChecks[0].sanity;

        if(sanityLevel === 100)
            barColor = "gradient-success";
        else if (sanityLevel >= 90)
            barColor = "gradient-warning";
        else
            barColor = "gradient-danger";

    }

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
                    parent's inverse value*/}
                    <CDropdownToggle style={{color: 'white'}}>
                        <CIcon content={cilSettings}/>
                    </CDropdownToggle>
                    <CDropdownMenu placement="bottom-end">
                        <CDropdownItem>View Logs</CDropdownItem>
                    </CDropdownMenu>
                </CDropdown>
            </CWidgetProgressIcon>
    );
}

export default DeviceHealth