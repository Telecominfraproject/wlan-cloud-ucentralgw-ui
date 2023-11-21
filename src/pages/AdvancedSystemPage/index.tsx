import * as React from 'react';
import {
  Box,
  Button,
  Center,
  Heading,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Text,
} from '@chakra-ui/react';
import { Trash } from '@phosphor-icons/react';
import { Card } from 'components/Containers/Card';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import { CardBody } from 'components/Containers/Card/CardBody';
import { DeleteButton } from 'components/Buttons/DeleteButton';
import { useNotification } from 'hooks/useNotification';
import { useDeleteSimulatedDevices } from 'hooks/Network/Simulations';

const AdvancedSystemPage = () => {
  const { successToast, apiErrorToast } = useNotification();
  const deleteSimulatedDevices = useDeleteSimulatedDevices();

  const handleDeleteSimulatedDevices = async () =>
    deleteSimulatedDevices.mutateAsync(undefined, {
      onSuccess: () => {
        successToast({
          id: 'delete-simulated-devices',
          description: 'Simulated devices deleted!',
        });
      },
      onError: (e) => {
        apiErrorToast({
          id: 'delete-simulated-devices',
          e,
          fallbackMessage: 'Error deleting simulated devices',
        });
      },
    });

  return (
    <Card>
      <CardHeader>
        <Heading size="md">Operations</Heading>
      </CardHeader>
      <CardBody>
        <Box>
          <Heading size="sm">Delete Simulated Devices</Heading>
          <Text fontStyle="italic">Delete all simulated devices from the database. This action cannot be undone.</Text>
          <Popover>
            {({ onClose }) => (
              <>
                <PopoverTrigger>
                  <Button colorScheme="red" rightIcon={<Trash size={20} />}>
                    Delete
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverHeader>Confirm</PopoverHeader>
                  <PopoverBody>
                    <Text>Are you sure you want to delete all simulated devices?</Text>
                    <Center mt={4}>
                      <Button onClick={onClose} mr={1}>
                        Cancel
                      </Button>
                      <DeleteButton
                        ml={1}
                        isLoading={deleteSimulatedDevices.isLoading}
                        onClick={async () => {
                          await handleDeleteSimulatedDevices();
                          onClose();
                        }}
                        isCompact={false}
                      />
                    </Center>
                  </PopoverBody>
                </PopoverContent>
              </>
            )}
          </Popover>
        </Box>
      </CardBody>
    </Card>
  );
};

export default AdvancedSystemPage;
