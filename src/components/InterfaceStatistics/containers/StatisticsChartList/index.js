import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { v4 as createUuid } from 'uuid';
import axiosInstance from 'utils/axiosInstance';
import { getToken } from 'utils/authHelper';
import { unixToTime, capitalizeFirstLetter } from 'utils/helper';
import DeviceStatisticsChart from '../DeviceStatisticsChart';

const StatisticsChartList = ({ selectedDeviceId, lastRefresh }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [statOptions, setStatOptions] = useState({
    interfaceList: [],
    settings: {},
  });

  const transformIntoDataset = (data) => {
    const sortedData = data.sort((a, b) => {
      if (a.recorded > b.recorded) return 1;
      if (b.recorded > a.recorded) return -1;
      return 0;
    });

    // This dictionary will have a key that is the interface name and a value of it's index in the final array
    const interfaceTypes = {};
    const interfaceList = [];
    const categories = [];
    let i = 0;

    // Just building the array for all the interfaces
    for (const log of sortedData) {
      categories.push(unixToTime(log.recorded));
      for (const logInterface of log.data.interfaces) {
        if (interfaceTypes[logInterface.name] === undefined) {
          interfaceTypes[logInterface.name] = i;
          interfaceList.push([
            {
              titleName: logInterface.name,
              name: 'Tx',
              backgroundColor: 'rgb(228,102,81,0.9)',
              data: [],
              fill: false,
            },
            {
              titleName: logInterface.name,
              name: 'Rx',
              backgroundColor: 'rgb(0,216,255,0.9)',
              data: [],
              fill: false,
            },
          ]);
          i += 1;
        }
      }
    }

    // Looping through all the data
    for (const log of sortedData) {
      // Looping through the interfaces of the log
      for (const inter of log.data.interfaces) {
        interfaceList[interfaceTypes[inter.name]][0].data.push(
          Math.floor(inter.counters.tx_bytes / 1024),
        );
        interfaceList[interfaceTypes[inter.name]][1].data.push(
          Math.floor(inter.counters.rx_bytes / 1024),
        );
      }
    }

    const options = {
      chart: {
        id: 'chart',
        group: 'txrx',
      },
      xaxis: {
        title: {
          text: 'Time',
          style: {
            fontSize: '15px',
          },
        },
        categories,
        tickAmount: 20,
      },
      yaxis: {
        labels: {
          minWidth: 40,
        },
        title: {
          text: t('statistics.data'),
          style: {
            fontSize: '15px',
          },
        },
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        float: true,
      },
    };

    const newOptions = {
      interfaceList,
      settings: options,
    };

    if (statOptions !== newOptions) {
      setStatOptions(newOptions);
    }
  };

  const getStatistics = () => {
    if (!loading) {
      setLoading(true);

      const options = {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        params: {
          serialNumber: '24f5a207a130',
        },
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
    }
  };

  useEffect(() => {
    if (selectedDeviceId) {
      getStatistics();
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    if (!loading && lastRefresh !== '' && selectedDeviceId) {
      getStatistics();
    }
  }, [lastRefresh]);

  return (
    <div>
      {statOptions.interfaceList.map((data) => (
        <div key={createUuid()}>
          <DeviceStatisticsChart
            key={createUuid()}
            data={data}
            options={{
              ...statOptions.settings,
              title: {
                text: capitalizeFirstLetter(data[0].titleName),
                align: 'left',
                style: {
                  fontSize: '25px',
                },
              },
            }}
          />
        </div>
      ))}
    </div>
  );
};

StatisticsChartList.propTypes = {
  lastRefresh: PropTypes.string,
  selectedDeviceId: PropTypes.string.isRequired,
};

StatisticsChartList.defaultProps = {
  lastRefresh: '',
};

export default StatisticsChartList;
