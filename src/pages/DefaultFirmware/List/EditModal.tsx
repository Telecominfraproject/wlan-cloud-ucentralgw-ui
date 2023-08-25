import * as React from 'react';
import { CopyIcon } from '@chakra-ui/icons';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  IconButton,
  Select,
  Switch,
  Text,
  Textarea,
  Tooltip,
  UseDisclosureReturn,
  useBoolean,
  useClipboard,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { DefaultFirmware, useUpdateDefaultFirmware } from 'hooks/Network/DefaultFirmware';
import { useGetFirmwareDeviceType } from 'hooks/Network/Firmware';
import { AtLeast } from 'models/General';
import { AxiosError } from 'models/Axios';
import { getRevision } from 'helpers/stringHelper';
import { compactDate } from 'helpers/dateFormatting';
import { Firmware } from 'models/Firmware';
import { Modal } from 'components/Modals/Modal';
import { SaveButton } from 'components/Buttons/SaveButton';
import { ToggleEditButton } from 'components/Buttons/ToggleEditButton';
import FormattedDate from 'components/InformationDisplays/FormattedDate';
import { ConfirmCloseAlertModal } from 'components/Modals/ConfirmCloseAlert';

type Props = {
  modalProps: UseDisclosureReturn;
  defaultFirmware: DefaultFirmware;
};
const EditDefaultFirmwareModal = ({ modalProps, defaultFirmware }: Props) => {
  const { t } = useTranslation();
  const toast = useToast();
  const copy = useClipboard(defaultFirmware.uri);
  const warningModalProps = useDisclosure();
  const [isEditing, setIsEditing] = useBoolean();
  const updateFirmware = useUpdateDefaultFirmware();
  const [showDev, setShowDev] = useBoolean(false);
  const getFirmware = useGetFirmwareDeviceType({ deviceType: defaultFirmware.deviceType });
  const [formValues, setFormValues] = React.useState<{
    revision: string;
    imageDate: number;
    uri: string;
    description: string;
  }>({
    revision: defaultFirmware.revision,
    uri: defaultFirmware.uri,
    imageDate: defaultFirmware.imageCreationDate,
    description: defaultFirmware.description,
  });

  const currentFirmware = {
    revision: defaultFirmware.revision,
    uri: defaultFirmware.uri,
    imageDate: defaultFirmware.imageCreationDate,
  };

  const availableFirmware = React.useMemo(() => {
    let allAvailable: (
      | Firmware
      | {
          revision: string;
          uri: string;
          imageDate: number;
        }
    )[] = getFirmware.data ?? [];

    if (!allAvailable.find(({ revision }) => revision === currentFirmware.revision)) {
      allAvailable = [currentFirmware, ...allAvailable];
    }

    allAvailable.sort((a, b) => b.imageDate - a.imageDate);

    return allAvailable;
  }, [getFirmware.data, currentFirmware]);

  const options = availableFirmware
    ?.filter(({ revision }) => (showDev ? true : !revision.includes('dev')))
    .map((firmware) => ({
      value: firmware.revision,
      label:
        firmware.revision === currentFirmware.revision
          ? `${compactDate(firmware.imageDate)} - ${getRevision(firmware.revision)} (Current Value)`
          : `${compactDate(firmware.imageDate)} - ${getRevision(firmware.revision)}`,
    }));

  const onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === currentFirmware.revision) {
      setFormValues({
        ...formValues,
        revision: currentFirmware.revision,
        uri: currentFirmware.uri,
        imageDate: currentFirmware.imageDate,
      });
    } else {
      const found = availableFirmware.find(({ revision }) => revision === e.target.value);
      if (found) {
        setFormValues({
          ...formValues,
          revision: found.revision,
          uri: found.uri,
          imageDate: found.imageDate,
        });
      }
    }
  };

  const onClose = () => {
    if (isEditing) {
      warningModalProps.onOpen();
    } else {
      modalProps.onClose();
    }
  };

  const onSave = () => {
    const newValues: AtLeast<DefaultFirmware, 'deviceType'> = {
      deviceType: defaultFirmware.deviceType,
      description: formValues.description,
    };

    if (formValues.revision !== currentFirmware.revision) {
      newValues.revision = formValues.revision;
      newValues.uri = formValues.uri;
      newValues.imageCreationDate = formValues.imageDate;
    }

    updateFirmware.mutate(newValues, {
      onSuccess: () => {
        toast({
          id: `config-edit-success`,
          title: t('common.success'),
          description: t('firmware.default_update_success', { deviceType: defaultFirmware.deviceType }),
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
        setIsEditing.off();
        modalProps.onClose();
      },
      onError: (error) => {
        const e = error as AxiosError;
        toast({
          id: `config-edit-error`,
          title: t('common.error'),
          description: e?.response?.data?.ErrorDescription,
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
      },
    });
  };

  const onCloseAfterWarning = () => {
    setIsEditing.off();
    warningModalProps.onClose();
    modalProps.onClose();
  };

  React.useEffect(() => {
    copy.setValue(defaultFirmware.uri);
    setFormValues({
      revision: defaultFirmware.revision,
      description: defaultFirmware.description,
      uri: defaultFirmware.uri,
      imageDate: defaultFirmware.imageCreationDate,
    });
  }, [defaultFirmware.uri, defaultFirmware.description, defaultFirmware.revision, isEditing]);

  // TODO -> Only thing editable is the firmware and description. Make sure I can deal with a revision not existing anymore

  return (
    <>
      <Modal
        {...modalProps}
        onClose={onClose}
        title={defaultFirmware.deviceType}
        topRightButtons={
          <>
            <SaveButton hidden={!isEditing} onClick={onSave} isLoading={updateFirmware.isLoading} />
            <ToggleEditButton toggleEdit={setIsEditing.toggle} isEditing={isEditing} />
          </>
        }
      >
        <Box>
          <Alert status="info">
            <AlertIcon />
            <AlertDescription>
              {t('firmware.edit_default_title', { deviceType: defaultFirmware.deviceType })}
            </AlertDescription>
          </Alert>
          {isEditing ? (
            <Box mb={4}>
              <Heading size="md" mb={2}>
                New Values
              </Heading>
              <Heading size="sm">{t('commands.revision')}</Heading>
              <Flex mb={2}>
                <Text>{t('controller.firmware.show_dev_releases')}</Text>
                <Switch ml={2} isChecked={showDev} onChange={setShowDev.toggle} size="md" mt={0.5} />
              </Flex>
              <Box display="inline-flex">
                <Select value={formValues.revision} onChange={onSelectChange}>
                  {options?.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Box>
              <Grid>
                <GridItem colSpan={1} alignContent="center" alignItems="center" display="flex">
                  <Heading size="sm">URI</Heading>
                </GridItem>
                <GridItem colSpan={1} alignContent="center" alignItems="center">
                  {formValues.uri}
                </GridItem>
                <GridItem colSpan={1} alignContent="center" alignItems="center">
                  <Heading size="sm">{t('commands.image_date')}</Heading>
                </GridItem>
                <GridItem colSpan={1} alignContent="center" alignItems="center">
                  <FormattedDate date={formValues.imageDate} />
                </GridItem>
              </Grid>
              <Heading size="sm">{t('common.description')}</Heading>
              <Textarea
                value={formValues.description}
                onChange={(e) =>
                  setFormValues({
                    ...formValues,
                    description: e.target.value,
                  })
                }
              />
            </Box>
          ) : null}
          <Grid templateColumns="repeat(1, 1fr)" gap={1} mt={4} w="100%">
            <GridItem colSpan={1} alignContent="center" alignItems="center" hidden={!isEditing}>
              <Heading size="md">Current Values</Heading>
            </GridItem>
            <GridItem colSpan={1} alignContent="center" alignItems="center">
              <Heading size="sm">{t('commands.revision')}</Heading>
            </GridItem>
            <GridItem colSpan={1} alignContent="center" alignItems="center">
              {getRevision(defaultFirmware.revision)}
            </GridItem>
            <GridItem colSpan={1} alignContent="center" alignItems="center" display="flex">
              <Heading size="sm">URI</Heading>
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
                  mx={0.5}
                />
              </Tooltip>
            </GridItem>
            <GridItem colSpan={1} alignContent="center" alignItems="center">
              {defaultFirmware.uri}
            </GridItem>
            <GridItem colSpan={1} alignContent="center" alignItems="center">
              <Heading size="sm">{t('commands.image_date')}</Heading>
            </GridItem>
            <GridItem colSpan={1} alignContent="center" alignItems="center">
              <FormattedDate date={defaultFirmware.imageCreationDate} />
            </GridItem>
            <GridItem colSpan={1} alignContent="center" alignItems="center">
              <Heading size="sm">{t('common.modified')}</Heading>
            </GridItem>
            <GridItem colSpan={1} alignContent="center" alignItems="center">
              <FormattedDate date={defaultFirmware.lastModified} />
            </GridItem>
            <GridItem colSpan={1} alignContent="center" alignItems="center">
              <Heading size="sm">{t('common.description')}</Heading>
            </GridItem>
            <GridItem colSpan={1} alignContent="center" alignItems="center">
              {defaultFirmware.description.length === 0 ? (
                <Text fontStyle="italic">{t('common.none')}</Text>
              ) : (
                <Text>{defaultFirmware.description}</Text>
              )}
            </GridItem>
          </Grid>
        </Box>
      </Modal>
      <ConfirmCloseAlertModal
        isOpen={warningModalProps.isOpen}
        confirm={onCloseAfterWarning}
        cancel={warningModalProps.onClose}
      />
    </>
  );
};

export default EditDefaultFirmwareModal;
