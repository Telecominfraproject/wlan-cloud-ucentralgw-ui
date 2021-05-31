import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { v4 as createUuid } from 'uuid';
import DeviceStatisticsChart from './DeviceStatisticsChart';
import axiosInstance from '../../../utils/axiosInstance';
import { getToken } from '../../../utils/authHelper';
import { unixToTime } from '../../../utils/helper';

const StatisticsChartList = ({ selectedDeviceId }) => {
    const [loading, setLoading] = useState(false);
    const [deviceStats, setStats] = useState([]);
    const [statOptions, setStatOptions] = useState({});

    const transformIntoDataset = (data) => {
        const sortedData = data.sort((a,b) => {
            if(a.recorded > b.recorded) return 1;
            if(b.recorded > a.recorded) return -1;
            return 0;
        });

        // This dictionary will have a key that is the interface name and a value of it's index in the final array
        const interfaceTypes = {}
        const interfaceList = [];
        const categories = [];
        let i = 0;

        // Just building the array for all the interfaces
        for (const log of sortedData){
            categories.push(unixToTime(log.recorded));
            for (const logInterface of log.data.interfaces){
                if(interfaceTypes[logInterface.name] === undefined) {
                    interfaceTypes[logInterface.name] = i;
                    interfaceList.push([{
                        name: 'Tx',
                        backgroundColor: 'rgb(228,102,81,0.9)',
                        data: [],
                        fill: false
                    },
                    {
                        name: 'Rx',
                        backgroundColor: 'rgb(0,216,255,0.9)',
                        data: [],
                        fill: false
                    }]);
                    i += 1;
                }
            }
        }

        // Looping through all the data
        for (const log of sortedData){
            // Looping through the interfaces of the log
            for (const inter of log.data.interfaces){
                if(inter.name === 'up'){
                    interfaceList[0][0].data.push(inter.counters.tx_bytes);
                    interfaceList[0][1].data.push(inter.counters.rx_bytes);
                }
                if(inter.name === 'down'){
                    interfaceList[1][0].data.push(inter.counters.tx_bytes);
                    interfaceList[1][1].data.push(inter.counters.rx_bytes);
                }

                /* interfaceList[interfaceTypes[inter.name]][0].data.push(inter.counters.tx_bytes);
                interfaceList[interfaceTypes[inter.name]][1].data.push(inter.counters.rx_bytes); */
            }
        }

        const options = {
            chart: {
                id: 'chart',
                group: 'txrx'
              },
            xaxis: {
                title: {
                    text: 'Time'
                },
                categories
            },
            yaxis: {
                title: {
                    text: 'Data (KB)'
                }
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right',
                floating: true,
                offsetY: -20,
                offsetX: -5
            }
        };

        console.log(interfaceList);
        setStatOptions(options);
        setStats(interfaceList);
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
            {
                deviceStats.map(
                    (data) =>  <div key={createUuid()}><DeviceStatisticsChart key={createUuid()} data={data} options={statOptions} /></div>
                )
            }
        </div>
    );
}

StatisticsChartList.propTypes = {
    selectedDeviceId: PropTypes.string.isRequired,
};

export default StatisticsChartList;