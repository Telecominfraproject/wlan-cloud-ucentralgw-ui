import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Chart from 'react-apexcharts'
import axiosInstance from '../../../utils/axiosInstance';
import { getToken } from '../../../utils/authHelper';

const DeviceStatisticsChart = ({ selectedDeviceId }) => {
    const [loading, setLoading] = useState(false);
    const [chartSeries, setChartSeries] = useState([]);
    const [chartOptions, setChartOptions] = useState({});

    const transformIntoDataset = (data) => {
        const sortedData = data.sort((a,b) => {
            if(a.recorded > b.recorded) return 1;
            if(b.recorded > a.recorded) return -1;
            return 0;
        });

        const interfaces = [
            {
                name: 'wan',
                backgroundColor: 'rgb(228,102,81,0.9)',
                data: [],
                fill: false
            },
            {
                name: 'lan',
                backgroundColor: 'rgb(0,216,255,0.9)',
                data: [],
                fill: false
            }
        ];

        const options = {
            chart: {
                id: 'chart'
              },
            xaxis: {
                categories: []
            }
        };

        const interfaceIndexes = {
            'wan': 0,
            'lan': 1
        };

        console.log(sortedData);
        for (const log of sortedData){
            options.xaxis.categories.push(log.recorded);
            for (const inter of log.data.interfaces){
                console.log('hey');
                interfaces[interfaceIndexes[inter.name]].data.push(inter.counters.tx_bytes);
            }
        }

        setChartOptions(options);
        setChartSeries(interfaces);
    }

    const getStatistics = () => {
        if (loading) return;
        setLoading(true);

        const options = {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${getToken()}`,
            },
            params: {
                serialNumber: "24f5a207a130"
            }
        };

        axiosInstance
            .get(`/device/${selectedDeviceId}/statistics?newest=true&limit=50`, options)
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
            getStatistics();
        }
    }, [selectedDeviceId]);

    return (
        <div>
            <Chart
                series={chartSeries}
                options={chartOptions}
                type='bar'
            />
        </div>
    );
}

DeviceStatisticsChart.propTypes = {
    selectedDeviceId: PropTypes.string.isRequired,
};

export default DeviceStatisticsChart;