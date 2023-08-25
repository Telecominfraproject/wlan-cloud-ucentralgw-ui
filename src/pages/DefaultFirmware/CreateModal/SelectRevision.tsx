import * as React from 'react';
import { Box, Flex, Heading, Select, Switch, Text, useBoolean } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { compactDate } from 'helpers/dateFormatting';
import { getRevision } from 'helpers/stringHelper';
import { useGetFirmwareDeviceType } from 'hooks/Network/Firmware';

type Props = {
  deviceTypes: string[];
  goNext: (revision: string) => void;
  setNextCallback: React.Dispatch<React.SetStateAction<(() => (Promise<void> | void) | undefined) | undefined>>;
};

const DefaultFirmwareRevisionSelection = ({ deviceTypes, goNext, setNextCallback }: Props) => {
  const { t } = useTranslation();
  const [isShowingDev, setIsShowingDev] = useBoolean();
  const [revision, setRevision] = React.useState<string>('');
  const getFirmware = useGetFirmwareDeviceType({
    deviceType: deviceTypes[0] ?? 'eap_101',
  });

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRevision(event.target.value);
  };

  const onNext = () => {
    goNext(revision);
  };

  const firmwareOptions = React.useMemo(() => {
    if (isShowingDev) return getFirmware.data?.sort((a, b) => (a.imageDate > b.imageDate ? -1 : 1));
    return getFirmware.data
      ?.filter((fms) => !fms.revision.includes('dev'))
      ?.sort((a, b) => (a.imageDate > b.imageDate ? -1 : 1));
  }, [getFirmware.data, isShowingDev]);

  React.useEffect(() => {
    if (revision.length === 0) {
      setNextCallback(undefined);
    } else {
      setNextCallback(() => onNext);
    }
  }, [revision, onNext]);

  return (
    <>
      <Heading mb={4} size="sm">
        {t('firmware.select_default_revision')}
      </Heading>
      <Flex mb={2}>
        <Text>{t('controller.firmware.show_dev_releases')}</Text>
        <Switch ml={2} isChecked={isShowingDev} onChange={setIsShowingDev.toggle} size="lg" />
      </Flex>
      <Box w="unset">
        <Select w="unset" value={revision} onChange={handleChange}>
          {revision.length === 0 && (
            <option key="default" value="" disabled>
              {' '}
            </option>
          )}
          {firmwareOptions?.map((firmware) => (
            <option key={firmware.revision} value={firmware.revision}>
              {compactDate(firmware.imageDate)} - {getRevision(firmware.revision)}
            </option>
          ))}
        </Select>
      </Box>
    </>
  );
};

export default DefaultFirmwareRevisionSelection;
