import * as React from 'react';
import { Alert, AlertIcon, Box, Button, Center, useDisclosure, useToast } from '@chakra-ui/react';
import { AxiosError } from 'axios';
import ReactDatePicker from 'react-datepicker';
import { useTranslation } from 'react-i18next';
import { DeleteButton } from 'components/Buttons/DeleteButton';
import { Modal } from 'components/Modals/Modal';
import 'react-datepicker/dist/react-datepicker.css';
import { useDeleteHealthChecks } from 'hooks/Network/HealthChecks';

const CustomInputButton = React.forwardRef(
  ({ value, onClick }: { value: string; onClick: () => void }, ref: React.LegacyRef<HTMLButtonElement>) => (
    <Button colorScheme="gray" onClick={onClick} ref={ref}>
      {value}
    </Button>
  ),
);

type Props = { serialNumber: string };
const DeleteHealthChecksModal = ({ serialNumber }: Props) => {
  const { t } = useTranslation();
  const toast = useToast();
  const modalProps = useDisclosure();
  const deleteHealthChecks = useDeleteHealthChecks();
  const [date, setDate] = React.useState<Date>(new Date());

  const onDeleteClick = () => {
    deleteHealthChecks.mutate(
      { endDate: Math.floor(date.getTime() / 1000), serialNumber },
      {
        onSuccess: () => {
          modalProps.onClose();
          toast({
            id: `success-delete-healthchecks`,
            title: t('common.success'),
            description: t('controller.crud.delete_success_obj', {
              obj: t('controller.devices.healthchecks'),
            }),
            status: 'success',
            duration: 5000,
            isClosable: true,
            position: 'top-right',
          });
        },
        onError: (e) => {
          const error = e as AxiosError;
          toast({
            id: `error-delete-healthchecks`,
            title: t('common.error'),
            description: error?.response?.data?.ErrorDescription,
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'top-right',
          });
        },
      },
    );
  };
  const onChange = (newDate: Date) => {
    setDate(newDate);
  };

  return (
    <>
      <DeleteButton onClick={modalProps.onOpen} isCompact />
      <Modal
        isOpen={modalProps.isOpen}
        onClose={modalProps.onClose}
        title={`${t('crud.delete')} ${t('controller.devices.healthchecks')}`}
      >
        <Box>
          <Center>
            <Alert status="warning" borderRadius="15px" w="unset">
              <AlertIcon />
              {t('controller.devices.delete_health_explanation')}
            </Alert>
          </Center>
          <Center mt={4}>
            <Box w="186px">
              <ReactDatePicker
                selected={date}
                onChange={onChange}
                timeInputLabel={`${t('common.time')}: `}
                dateFormat="dd/MM/yyyy hh:mm aa"
                timeFormat="p"
                showTimeSelect
                // @ts-ignore
                customInput={<CustomInputButton />}
                disabled={deleteHealthChecks.isLoading}
              />
            </Box>
            <DeleteButton ml={2} onClick={onDeleteClick} isLoading={deleteHealthChecks.isLoading} />
          </Center>
        </Box>
      </Modal>
    </>
  );
};

export default DeleteHealthChecksModal;
