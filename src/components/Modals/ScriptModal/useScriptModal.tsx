import * as React from 'react';
import { useDisclosure, UseDisclosureProps } from '@chakra-ui/react';
import { ScriptModal } from '.';
import { GatewayDevice } from 'models/Device';

export type UseScriptModalReturn = {
  modalProps: UseDisclosureProps;
  device: GatewayDevice;
  openModal: (device: GatewayDevice) => void;
};

export const useScriptModal = () => {
  const [device, setDevice] = React.useState<GatewayDevice>();
  const modalProps = useDisclosure();

  const openModal = (newDevice: GatewayDevice) => {
    setDevice(newDevice);
    modalProps.onOpen();
  };

  return React.useMemo(
    () => ({
      modalProps,
      device,
      openModal,
      modal: <ScriptModal device={device} modalProps={modalProps} />,
    }),
    [device, modalProps.isOpen],
  );
};
