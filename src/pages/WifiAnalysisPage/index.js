import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { WifiAnalysisTable } from 'ucentral-libs';
import { useAuth } from 'contexts/AuthProvider';
import axiosInstance from 'utils/axiosInstance';
import { cleanBytesString, prettyDate } from 'utils/helper';
import { CCard, CCardBody } from '@coreui/react';

const WifiAnalysisPage = () => {
  const { t } = useTranslation();
  const { deviceId } = useParams();
  const { currentToken, endpoints } = useAuth();
  const [loading, setLoading] = useState(false);
  const [parsedStats, setParsedStats] = useState([]);
  const [selectedStats, setSelectedStats] = useState([]);
  const [range, setRange] = useState(19);

  const extractIp = (json, bssid) => {
    const ips = {
      ipV4: '',
      ipV6: '',
    };
    for (const obj of json.interfaces) {
      if ('clients' in obj) {
        for (const client of obj.clients) {
          if (client.mac === bssid) {
            ips.ipV4 = client.ipv4_addresses ?? '';
            ips.ipV6 = client.ipv6_addresses ?? '';
          }
        }
      }
    }
    return ips;
  };

  const parseStats = (json) => {
    const dbmNumber = 4294967295;
    const newParsedStats = [];

    for (const stat of json.data) {
      const associations = [];
      const timeStamp = prettyDate(stat.recorded);

      // Looping through the interfaces
      for (const deviceInterface of stat.data.interfaces) {
        if ('counters' in deviceInterface && 'ssids' in deviceInterface) {
          for (const ssid of deviceInterface.ssids) {
            // Information common between all associations
            const radioArray = ssid.radio.$ref.split('/');
            const radioIndex = radioArray[radioArray.length - 1];
            const radioInfo = {
              radio: radioIndex,
              channel: stat.data.radios[radioIndex].channel,
              channelWidth: stat.data.radios[radioIndex].channel_width,
              txPower: stat.data.radios[radioIndex].tx_power,
            };

            if ('associations' in ssid) {
              for (const association of ssid.associations) {
                const data = {
                  ...radioInfo,
                  ...extractIp(stat.data, association.bssid),
                  ssid: ssid.ssid,
                  rssi: (dbmNumber - association.rssi) * -1,
                  mode: ssid.mode,
                  rxBytes: cleanBytesString(association.rx_bytes, 0),
                  rxRate: association.rx_rate.bitrate,
                  rxMcs: association.rx_rate.mcs ?? '',
                  rxNss: association.rx_rate.nss ?? '',
                  txBytes: cleanBytesString(association.tx_bytes, 0),
                  txMcs: association.tx_rate.mcs,
                  txNss: association.tx_rate.nss,
                  txRate: association.tx_rate.bitrate,
                  timeStamp,
                };
                associations.push(data);
              }
            }
          }
        }
      }
      newParsedStats.push(associations);
    }
    const ascOrderedStats = newParsedStats.reverse();
    setRange(ascOrderedStats.length - 1);
    setParsedStats(ascOrderedStats);
    setSelectedStats(ascOrderedStats[ascOrderedStats.length - 1]);
    setLoading(false);
  };

  const getLatestStats = () => {
    setLoading(true);
    setRange(19);

    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    axiosInstance
      .get(
        `${endpoints.ucentralgw}/api/v1/device/${deviceId}/statistics?newest=true&limit=20`,
        options,
      )
      .then((response) => {
        parseStats(response.data);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const updateSelectedStats = (index) => {
    setSelectedStats(parsedStats[index]);
  };

  useEffect(() => {
    if (deviceId && deviceId.length > 0) {
      getLatestStats();
    }
  }, [deviceId]);

  return (
    <div>
      <CCard>
        <CCardBody>
          <WifiAnalysisTable
            t={t}
            data={selectedStats}
            loading={loading}
            range={range}
            updateSelectedStats={updateSelectedStats}
          />
        </CCardBody>
      </CCard>
    </div>
  );
};

export default WifiAnalysisPage;
