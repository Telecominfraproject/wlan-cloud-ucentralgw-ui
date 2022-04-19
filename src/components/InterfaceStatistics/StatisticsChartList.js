import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { CSpinner } from '@coreui/react';
import { useTranslation } from 'react-i18next';
import { v4 as createUuid } from 'uuid';
import axiosInstance from 'utils/axiosInstance';
import { useAuth, useDevice } from 'ucentral-libs';
import {
  capitalizeFirstLetter,
  datesSameDay,
  dateToUnix,
  prettyDate,
  unixToTime,
} from 'utils/helper';
import DeviceStatisticsChart from './DeviceStatisticsChart';

const StatisticsChartList = ({ setOptions, section, setStart, setEnd, time }) => {
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
    let sortedData = data.sort((a, b) => {
      if (a.recorded > b.recorded) return 1;
      if (b.recorded > a.recorded) return -1;
      return 0;
    });

    const dataLength = sortedData.length;
    if (dataLength > 1000 && dataLength < 3000) {
      sortedData = sortedData.filter((dat, index) => index % 4 === 0);
    } else if (dataLength >= 3000 && dataLength < 5000) {
      sortedData = sortedData.filter((dat, index) => index % 8 === 0);
    } else if (dataLength >= 5000 && dataLength < 7000) {
      sortedData = sortedData.filter((dat, index) => index % 12 === 0);
    } else if (dataLength > 7000) {
      sortedData = sortedData.filter((dat, index) => index % 20 === 0);
    }

    // Looping through data to build our memory graph data
    const memoryUsed = [
      {
        titleName: t('statistics.memory'),
        name: 'Used',
        backgroundColor: 'rgb(228,102,81,0.9)',
        data: [],
        fill: true,
      },
      {
        titleName: t('statistics.memory'),
        name: 'Buffered',
        backgroundColor: 'rgb(228,102,81,0.9)',
        data: [],
        fill: true,
      },
      {
        titleName: t('statistics.memory'),
        name: 'Cached',
        backgroundColor: 'rgb(228,102,81,0.9)',
        data: [],
        fill: true,
      },
    ];

    for (const log of sortedData) {
      memoryUsed[0].data.push(
        Math.floor((log.data.unit.memory.total - log.data.unit.memory.free) / 1024 / 1024),
      );
      memoryUsed[1].data.push(Math.floor(log.data.unit.memory.buffered / 1024 / 1024));
      memoryUsed[2].data.push(Math.floor(log.data.unit.memory.cached / 1024 / 1024));
    }

    const newUsed = memoryUsed[0].data;
    if (newUsed.length > 0) newUsed.shift();
    memoryUsed[0].data = newUsed;
    const newBuff = memoryUsed[1].data;
    if (newBuff.length > 0) newBuff.shift();
    memoryUsed[1].data = newBuff;
    const newCached = memoryUsed[2].data;
    if (newCached.length > 0) newCached.shift();
    memoryUsed[2].data = newCached;

    // This dictionary will have a key that is the interface name and a value of it's index in the final array
    const interfaceTypes = {};
    const interfaceList = [];
    const categories = [];
    let i = 0;
    const areSameDay = datesSameDay(
      new Date(sortedData[0].recorded * 1000),
      new Date(sortedData[sortedData.length - 1].recorded * 1000),
    );

    // Just building the array for all the interfaces
    for (const log of sortedData) {
      categories.push(areSameDay ? unixToTime(log.recorded) : prettyDate(log.recorded));
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
    const prevTxObj = {};
    const prevRxObj = {};
    for (const log of sortedData) {
      // Looping through the interfaces of the log
      const version = log.data.version ?? 0;
      for (const inter of log.data.interfaces) {
        if (version > 0) {
          const prevTx = prevTxObj[inter.name] !== undefined ? prevTxObj[inter.name] : 0;
          const prevRx = prevTxObj[inter.name] !== undefined ? prevRxObj[inter.name] : 0;
          const tx = inter.counters ? inter.counters.tx_bytes : 0;
          const rx = inter.counters ? inter.counters.rx_bytes : 0;
          interfaceList[interfaceTypes[inter.name]][0].data.push(Math.max(0, tx - prevTx));
          interfaceList[interfaceTypes[inter.name]][1].data.push(Math.max(0, rx - prevRx));
          prevTxObj[inter.name] = tx;
          prevRxObj[inter.name] = rx;
        } else {
          interfaceList[interfaceTypes[inter.name]][0].data.push(
            inter.counters ? Math.floor(inter.counters.tx_bytes) : 0,
          );
          interfaceList[interfaceTypes[inter.name]][1].data.push(
            inter.counters ? Math.floor(inter.counters.rx_bytes) : 0,
          );
        }
      }
    }

    for (let y = 0; y < interfaceList.length; y += 1) {
      for (let z = 0; z < interfaceList[y].length; z += 1) {
        const newArray = interfaceList[y][z].data;
        if (newArray.length > 0) newArray.shift();
        interfaceList[y][z].data = newArray;
      }
    }

    const newCategories = categories;
    if (newCategories.length > 0) newCategories.shift();
    const interfaceOptions = {
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
        categories: newCategories,
        tickAmount: areSameDay ? 15 : 10,
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
        tickAmount: areSameDay ? 15 : 10,
        title: {
          text: 'Time',
          style: {
            fontSize: '15px',
          },
        },
        categories,
      },
      yaxis: {
        tickAmount: 5,
        title: {
          text: t('statistics.data_mb'),
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
      memory: [memoryUsed],
      interfaceOptions,
      memoryOptions,
      start: new Date(sortedData[0].recorded * 1000).toISOString(),
      end: new Date(sortedData[sortedData.length - 1].recorded * 1000).toISOString(),
    };

    if (statOptions !== newOptions) {
      const sectionOptions = newOptions.interfaceList.map((opt) => ({
        value: opt[0].titleName,
        label: opt[0].titleName,
      }));
      setOptions([...sectionOptions, { value: 'memory', label: t('statistics.memory') }]);
      setStatOptions({ ...newOptions });
      if (sortedData.length > 0) {
        setStart(new Date(sortedData[0].recorded * 1000));
        setEnd(new Date(sortedData[sortedData.length - 1].recorded * 1000));
      }
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
      params: {},
    };

    let extraParams = '';
    if (time.start !== null && time.end !== null) {
      const utcStart = new Date(time.start).toISOString();
      const utcEnd = new Date(time.end).toISOString();
      options.params.startDate = dateToUnix(utcStart);
      options.params.endDate = dateToUnix(utcEnd);
      options.params.limit = 10000;
    } else {
      extraParams = '?newest=true&limit=50';
    }

    axiosInstance
      .get(
        `${endpoints.owgw}/api/v1/device/${deviceSerialNumber}/statistics${extraParams}`,
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
  }, [deviceSerialNumber, time.refreshId]);

  if (loading) {
    return (
      <div className="text-center">
        <CSpinner size="xl" />
      </div>
    );
  }
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
  time: PropTypes.instanceOf(Object).isRequired,
  setStart: PropTypes.func.isRequired,
  setEnd: PropTypes.func.isRequired,
};

export default React.memo(StatisticsChartList);
