import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { CChartLine } from '@coreui/react-chartjs';
import axiosInstance from '../../../utils/axiosInstance';
import { getToken } from '../../../utils/authHelper';
import { addDays, dateToUnix } from '../../../utils/helper';

const DeviceStatisticsChart = ({ selectedDeviceId }) => {
    const [loading, setLoading] = useState(false);
    const [dataset, setDataset] = useState([]);
    const [start, setStart] = useState(addDays(new Date(), -7).toString());
    const [end, setEnd] = useState(addDays(new Date(), -6).toString());

    const transformIntoDataset = (data) => {
        const sortedData = data.sort((a,b) => {
            if(a.recorded > b.recorded) return 1;
            if(b.recorded > a.recorded) return -1;
            return 0;
        });
        const interfaces = [
            {
                label: 'wan',
                backgroundColor: 'rgb(228,102,81,0.9)',
                data: [],
                fill: false
            },
            {
                label: 'lan',
                backgroundColor: 'rgb(0,216,255,0.9)',
                data: [],
                fill: false
            }
        ];

        const interfaceIndexes = {
            'wan': 0,
            'lan': 1
        };

        for (const log of sortedData){
            for (const inter of log.data.interfaces){
                interfaces[interfaceIndexes[inter.name]].data.push(inter.counters.tx_bytes);
            }
        }
        setDataset(interfaces);
    }

    const getStatistics = () => {
        if (loading) return;
        setLoading(true);
        const utcStart = new Date(start).toISOString();
        const utcEnd = new Date(end).toISOString();

        const options = {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${getToken()}`,
            },
            params: {
                serialNumber: "24f5a207a130",
                startDate: dateToUnix(utcStart),
                endDate: dateToUnix(utcEnd),
            }
        };

        axiosInstance
            .get(`/device/${selectedDeviceId}/statistics`, options)
            .then((response) => {
            transformIntoDataset(response.data.data);
            })
            .catch(() => {})
            .finally(() => {
            setLoading(false);
        });
    };

    useEffect(() => {
        if (selectedDeviceId) {
            setStart(addDays(new Date(), -7).toString());
            setEnd(addDays(new Date(), -6.8).toString());
            getStatistics();
        }
    }, [selectedDeviceId]);

    return (
        <div>
            <CChartLine
                datasets={dataset}
            
            
            
            />
        </div>
    );
}

DeviceStatisticsChart.propTypes = {
    selectedDeviceId: PropTypes.string.isRequired,
};

export default DeviceStatisticsChart;