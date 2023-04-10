import * as React from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  Tooltip,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { Globe } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { GoogleMap } from 'components/Maps/GoogleMap';
import { GoogleMapMarker } from 'components/Maps/GoogleMap/Marker';
import { Modal } from 'components/Modals/Modal';
import { useGetSystemSecret } from 'hooks/Network/Secrets';
import { useGetDeviceLastStats } from 'hooks/Network/Statistics';

type Props = {
  serialNumber: string;
  isCompact?: boolean;
};

const LocationDisplayButton = ({ serialNumber, isCompact }: Props) => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const getGoogleApiKey = useGetSystemSecret({ secret: 'google.maps.apikey' });
  const getLastStats = useGetDeviceLastStats({ serialNumber });
  const iconColor = useColorModeValue('blue.500', 'blue.200');

  const location: google.maps.LatLngLiteral | undefined = React.useMemo(() => {
    if (!getLastStats.data?.gps) return undefined;

    try {
      return {
        lat: Number.parseFloat(getLastStats.data.gps.latitude),
        lng: Number.parseFloat(getLastStats.data.gps.longitude),
      };
    } catch (e) {
      return undefined;
    }
  }, [getLastStats.data?.gps]);

  if (!location) {
    return null;
  }

  return (
    <>
      {isCompact ? (
        <Tooltip label={t('locations.view_gps')}>
          <Icon as={Globe} boxSize={6} onClick={onOpen} color={iconColor} cursor="pointer" />
        </Tooltip>
      ) : (
        <Button variant="link" onClick={onOpen} rightIcon={<Globe size={20} />} colorScheme="blue">
          {t('locations.view_gps')}
        </Button>
      )}
      <Modal isOpen={isOpen} onClose={onClose} title={t('locations.one')}>
        <Box w="100%" h="100%">
          <Flex mb={4}>
            <FormControl w="unset">
              <FormLabel>{t('locations.lat')}</FormLabel>
              <pre>{location.lat}</pre>
            </FormControl>
            <FormControl w="unset" mx={4}>
              <FormLabel>{t('locations.longitude')}</FormLabel>
              <pre>{location.lng}</pre>
            </FormControl>
            <FormControl w="unset">
              <FormLabel>{t('locations.elevation')}</FormLabel>
              <pre>{getLastStats.data?.gps?.elevation}</pre>
            </FormControl>
          </Flex>
          {getGoogleApiKey.data ? (
            <Box h="500px">
              <Wrapper apiKey={getGoogleApiKey.data.value}>
                <GoogleMap center={location} style={{ flexGrow: '1', height: '100%' }} zoom={10}>
                  <GoogleMapMarker position={location} />
                </GoogleMap>
              </Wrapper>
            </Box>
          ) : null}
        </Box>
      </Modal>
    </>
  );
};

export default LocationDisplayButton;
