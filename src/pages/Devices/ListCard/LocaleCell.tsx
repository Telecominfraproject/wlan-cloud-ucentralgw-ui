import * as React from 'react';
import { CopyIcon } from '@chakra-ui/icons';
import { Box, IconButton, Text, Tooltip, useClipboard } from '@chakra-ui/react';
import ReactCountryFlag from 'react-country-flag';
import { useTranslation } from 'react-i18next';
import { DeviceWithStatus } from 'hooks/Network/Devices';

const ICON_STYLE = { width: '24px', height: '24px', borderRadius: '20px' };

type Props = {
  device: DeviceWithStatus;
};

const DeviceLocaleCell = ({ device }: Props) => {
  const { t } = useTranslation();
  const copy = useClipboard(device.ipAddress);

  return (
    <Tooltip label={`${device.locale !== '' ? `${device.locale} - ` : ''}${device.ipAddress}`} placement="top">
      <Box w="100%" display="flex">
        {device.locale !== '' && device.ipAddress !== '' && (
          <ReactCountryFlag style={ICON_STYLE} countryCode={device.locale} svg />
        )}
        <Tooltip
          label={copy.hasCopied ? `${t('common.copied')}!` : t('common.copy')}
          hasArrow
          closeOnClick={false}
          shouldWrapChildren
        >
          <IconButton
            aria-label={t('common.copy')}
            icon={<CopyIcon h={4} w={4} />}
            onClick={(e) => {
              copy.onCopy();
              e.stopPropagation();
            }}
            size="xs"
            colorScheme="teal"
            hidden={device.ipAddress.length === 0}
            mx={0.5}
          />
        </Tooltip>
        <Text my="auto" textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap">{`  ${
          device.ipAddress.length > 0 ? device.ipAddress : '-'
        }`}</Text>
      </Box>
    </Tooltip>
  );
};

export default DeviceLocaleCell;
