import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { v4 as createUuid } from 'uuid';
import axiosInstance from 'utils/axiosInstance';
import { useAuth, useDevice } from 'ucentral-libs';
import { unixToTime, capitalizeFirstLetter } from 'utils/helper';
import eventBus from 'utils/eventBus';
import DeviceStatisticsChart from './DeviceStatisticsChart';

const StatisticsChartList = ({ setOptions, section }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { currentToken, endpoints } = useAuth();
  const { deviceSerialNumber } = useDevice();
  const [statOptions, setStatOptions] = useState({
    interfaceList: [],
    memory: [],
    settings: {},
  });

  const transformIntoDataset = (data) => {
    const sortedData = data.sort((a, b) => {
      if (a.recorded > b.recorded) return 1;
      if (b.recorded > a.recorded) return -1;
      return 0;
    });

    // Looping through data to build our memory graph data
    const memoryUsed = {
      titleName: t('statistics.memory'),
      name: '% Used',
      backgroundColor: 'rgb(228,102,81,0.9)',
      data: [],
      fill: true,
    };

    for (const log of sortedData) {
      memoryUsed.data.push(
        Math.floor(
          ((log.data.unit.memory.total - log.data.unit.memory.free) / log.data.unit.memory.total) *
            100,
        ),
      );
    }

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
          inter.counters?.tx_bytes ? Math.floor(inter.counters.tx_bytes / 1024) : 0,
        );
        interfaceList[interfaceTypes[inter.name]][1].data.push(
          inter.counters?.rx_bytes ? Math.floor(inter.counters.rx_bytes / 1024) : 0,
        );
      }
    }

    const interfaceOptions = {
      chart: {
        id: 'chart',
        group: 'txrx',
      },
      stroke: {
        curve: 'smooth',
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

    const memoryOptions = {
      chart: {
        id: 'chart',
      },
      stroke: {
        curve: 'smooth',
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
        min: 0,
        max: 100,
        tickAmount: 5, // set tickAmount to split x-axis
        ticks: { min: 0, max: 100, stepSize: 20 },
        title: {
          text: t('statistics.used'),
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
      memory: [[memoryUsed]],
      interfaceOptions,
      memoryOptions,
    };

    if (statOptions !== newOptions) {
      const sectionOptions = newOptions.interfaceList.map((opt) => ({
        value: opt[0].titleName,
        label: opt[0].titleName,
      }));
      setOptions([...sectionOptions, { value: 'memory', label: t('statistics.memory') }]);
      setStatOptions({ ...newOptions });
    }
  };

  const getInterface = useCallback(() => {
    if (statOptions.interfaceList.length === 0) return <p>N/A</p>;

    const interfaceToShow = statOptions.interfaceList.find(
      (inter) => inter[0].titleName === section,
    );

    if (interfaceToShow) {
      const options = {
        data: interfaceToShow,
        options: {
          ...statOptions.interfaceOptions,
          title: {
            text: capitalizeFirstLetter(interfaceToShow[0].titleName),
            align: 'left',
            style: {
              fontSize: '25px',
            },
          },
        },
      };
      return (
        <div key={createUuid()}>
          <DeviceStatisticsChart chart={options} />
        </div>
      );
    }
    return <p>N/A</p>;
  }, [statOptions, section]);

  const getStatistics = () => {
    setLoading(true);

    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    axiosInstance
      .get(
        `${endpoints.owgw}/api/v1/device/${deviceSerialNumber}/statistics?newest=true&limit=50`,
        options,
      )
      .then((response) => {
        transformIntoDataset(response.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (deviceSerialNumber) {
      getStatistics();
    }
  }, [deviceSerialNumber]);

  useEffect(() => {
    eventBus.on('refreshInterfaceStatistics', () => getStatistics());

    return () => {
      eventBus.remove('refreshInterfaceStatistics');
    };
  }, []);

  return (
    <div>
      {section !== 'memory' && !loading && getInterface()}
      {section === 'memory' &&
        !loading &&
        statOptions.memory.map((data) => {
          const options = {
            data,
            options: {
              ...statOptions.memoryOptions,
              title: {
                text: capitalizeFirstLetter(data[0].titleName),
                align: 'left',
                style: {
                  fontSize: '25px',
                },
              },
            },
          };
          return (
            <div key={createUuid()}>
              <DeviceStatisticsChart chart={options} section={section} />
            </div>
          );
        })}
    </div>
  );
};

StatisticsChartList.propTypes = {
  setOptions: PropTypes.func.isRequired,
  section: PropTypes.string.isRequired,
};

export default React.memo(StatisticsChartList);
