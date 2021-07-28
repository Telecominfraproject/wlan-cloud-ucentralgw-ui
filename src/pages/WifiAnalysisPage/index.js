import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { WifiAnalysisTable, RadioAnalysisTable } from 'ucentral-libs';
import { useAuth } from 'contexts/AuthProvider';
import axiosInstance from 'utils/axiosInstance';
import { cleanBytesString, prettyDate, secondsToDetailed } from 'utils/helper';
import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react';

const WifiAnalysisPage = () => {
  const { t } = useTranslation();
  const { deviceId } = useParams();
  const { currentToken, endpoints } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tableTime, setTableTime] = useState('');
  const [parsedAssociationStats, setParsedAssociationStats] = useState([]);
  const [selectedAssociationStats, setSelectedAssociationStats] = useState([]);
  const [parsedRadioStats, setParsedRadioStats] = useState([]);
  const [selectedRadioStats, setSelectedRadioStats] = useState([]);
  const [range, setRange] = useState(19);

  const secondsToLabel = (seconds) =>
    secondsToDetailed(
      seconds,
      t('common.day'),
      t('common.days'),
      t('common.hour'),
      t('common.hours'),
      t('common.minute'),
      t('common.minutes'),
      t('common.second'),
      t('common.seconds'),
    );

  const extractIp = (json, bssid) => {
    const ips = {
      ipV4: [],
      ipV6: [],
    };
    for (const obj of json.interfaces) {
      if ('clients' in obj) {
        for (const client of obj.clients) {
          if (client.mac === bssid) {
            ips.ipV4 = ips.ipV4.concat(client.ipv4_addresses ?? []);
            ips.ipV6 = ips.ipV6.concat(client.ipv6_addresses ?? []);
          }
        }
      }
    }
    return ips;
  };

  const parseAssociationStats = (json) => {
    const dbmNumber = 4294967295;
    const newParsedAssociationStats = [];
    const newParsedRadioStats = [];

    for (const stat of json.data) {
      const associations = [];
      const radios = [];
      const timeStamp = prettyDate(stat.recorded);

      if (stat.data.radios !== undefined) {
        for (let i = 0; i < stat.data.radios.length; i += 1) {
          const radio = stat.data.radios[i];
          radios.push({
            timeStamp,
            radio: i,
            channel: radio.channel,
            channelWidth: radio.channel_width,
            noise: radio.noise ? (dbmNumber - radio.noise) * -1 : '-',
            txPower: radio.tx_power,
            activeMs: secondsToLabel(radio?.active_ms ? Math.floor(radio.active_ms / 1000) : 0),
            busyMs: secondsToLabel(radio?.busy_ms ? Math.floor(radio.busy_ms / 1000) : 0),
            receiveMs: secondsToLabel(radio?.receive_ms ? Math.floor(radio.receive_ms / 1000) : 0),
          });
        }
        newParsedRadioStats.push(radios);
      }

      // Looping through the interfaces
      for (const deviceInterface of stat.data.interfaces) {
        if ('counters' in deviceInterface && 'ssids' in deviceInterface) {
          for (const ssid of deviceInterface.ssids) {
            // Information common between all associations
            const radioInfo = {
              found: false,
            };

            if (ssid.phy !== undefined) {
              radioInfo.radio = `${stat.data.radios.findIndex(
                (element) => element.phy === ssid.phy,
              )}`;
              radioInfo.found = radioInfo.radio !== undefined;
            }

            if (!radioInfo.found && ssid.radio !== undefined) {
              const radioArray = ssid.radio.$ref.split('/');
              const radioIndex = radioArray !== undefined ? radioArray[radioArray.length - 1] : '-';
              radioInfo.found = stat.data.radios[radioIndex] !== undefined;
              radioInfo.radio = radioIndex;
            }

            if (!radioInfo.found) {
              radioInfo.radio = '-';
            }

            if ('associations' in ssid) {
              for (const association of ssid.associations) {
                const data = {
                  radio: radioInfo,
                  ...extractIp(stat.data, association.bssid),
                  bssid: association.bssid,
                  ssid: ssid.ssid,
                  rssi: association.rssi ? (dbmNumber - association.rssi) * -1 : '-',
                  mode: ssid.mode,
                  rxBytes: cleanBytesString(association.rx_bytes, 0),
                  rxRate: association.rx_rate.bitrate,
                  rxMcs: association.rx_rate.mcs ?? '-',
                  rxNss: association.rx_rate.nss ?? '-',
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
      newParsedAssociationStats.push(associations);
    }

    // Radio Stats
    const ascOrderedRadioStats = newParsedRadioStats.reverse();
    setParsedRadioStats(ascOrderedRadioStats);
    setSelectedRadioStats(ascOrderedRadioStats[ascOrderedRadioStats.length - 1]);

    const ascOrderedAssociationStats = newParsedAssociationStats.reverse();
    setParsedAssociationStats(ascOrderedAssociationStats);
    setSelectedAssociationStats(ascOrderedAssociationStats[ascOrderedAssociationStats.length - 1]);

    setRange(ascOrderedRadioStats.length > 0 ? ascOrderedRadioStats.length - 1 : 0);
    setTableTime(
      ascOrderedRadioStats.length > 0
        ? ascOrderedRadioStats[ascOrderedRadioStats.length - 1][0]?.timeStamp
        : '',
    );
    setLoading(false);
  };

  const getLatestAssociationStats = () => {
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
        parseAssociationStats(response.data);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const updateSelectedStats = (index) => {
    setTableTime(parsedRadioStats[index][0].timeStamp);
    setSelectedAssociationStats(parsedAssociationStats[index]);
    setSelectedRadioStats(parsedRadioStats[index]);
  };

  useEffect(() => {
    if (deviceId && deviceId.length > 0) {
      getLatestAssociationStats();
    }
  }, [deviceId]);

  return (
    <div>
      <CCard>
        <CCardHeader>
          <CRow>
            <CCol className="text-center">
              <input
                type="range"
                style={{ width: '80%' }}
                className="form-range"
                min="0"
                max={range}
                step="1"
                onChange={(e) => updateSelectedStats(e.target.value)}
                defaultValue={range}
                disabled={!selectedRadioStats}
              />
              <h5>
                {t('common.timestamp')}: {tableTime}
              </h5>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody className="overflow-auto" style={{ height: 'calc(100vh - 300px)' }}>
          <h5 className="pb-3 text-center">{t('wifi_analysis.radios')}</h5>
          <RadioAnalysisTable data={selectedRadioStats ?? []} loading={loading} range={range} />
          <h5 className="pt-5 pb-3 text-center">{t('wifi_analysis.associations')}</h5>
          <WifiAnalysisTable
            t={t}
            data={selectedAssociationStats ?? []}
            loading={loading}
            range={range}
          />
        </CCardBody>
      </CCard>
    </div>
  );
};

export default WifiAnalysisPage;
