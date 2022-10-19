import * as React from 'react';
import {
  Box,
  Button,
  Center,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  SimpleGrid,
  Text,
  Textarea,
  useBoolean,
  useBreakpoint,
  useClipboard,
  UseDisclosureReturn,
} from '@chakra-ui/react';
import { Pen, Plus, X } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { SaveButton } from 'components/Buttons/SaveButton';
import { DataTable } from 'components/DataTables/DataTable';
import FormattedDate from 'components/InformationDisplays/FormattedDate';
import { Modal } from 'components/Modals/Modal';
import DataCell from 'components/TableCells/DataCell';
import { getRevision } from 'helpers/stringHelper';
import { useUpdateUpdateFirmware } from 'hooks/Network/Firmware';
import { Firmware } from 'models/Firmware';
import { Note } from 'models/Note';
import { Column } from 'models/Table';

type Props = {
  modalProps: UseDisclosureReturn;
  firmware: Firmware | undefined;
};
const FirmwareDetailsModal = ({ modalProps, firmware }: Props) => {
  const { t } = useTranslation();
  const updateFirmware = useUpdateUpdateFirmware();
  const copy = useClipboard(firmware?.uri ?? '');
  const breakpoint = useBreakpoint();
  const [newNote, setNewNote] = React.useState<string>('');
  const [isEditingDescription, { toggle }] = useBoolean();
  const [newDescription, setNewDescription] = React.useState<string | undefined>(firmware?.description);

  const onNoteSubmit = React.useCallback(
    (onClose: () => void) => () => {
      updateFirmware.mutate(
        {
          notes: [{ note: newNote, created: 0 }],
          id: firmware?.id ?? '',
        },
        {
          onSuccess: () => {
            onClose();
            setNewNote('');
          },
        },
      );
    },
    [newNote],
  );
  const onNoteChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewNote(e.target.value);
  }, []);
  const notes = React.useMemo(
    () => firmware?.notes?.sort(({ created: a }, { created: b }) => b - a) ?? [],
    [firmware?.notes],
  );
  const dateCell = React.useCallback((created: number) => <FormattedDate date={created} />, []);
  const noteCell = React.useCallback(
    (note: string) => (
      <Text w="100%" overflowWrap="break-word" whiteSpace="pre-wrap">
        {note}
      </Text>
    ),
    [],
  );
  const columns: Column<Note>[] = React.useMemo(
    () => [
      {
        id: 'created',
        Header: t('common.date'),
        Footer: '',
        accessor: 'created',
        Cell: ({ cell }: { cell: { row: { original: { created: number } } } }) => dateCell(cell.row.original.created),
        customWidth: '150px',
      },
      {
        id: 'note',
        Header: t('common.note'),
        Cell: ({ cell }: { cell: { row: { original: { note: string } } } }) => noteCell(cell.row.original.note),
        Footer: '',
        accessor: 'note',
      },
      {
        id: 'by',
        Header: t('common.by'),
        Footer: '',
        accessor: 'createdBy',
        customWidth: '200px',
      },
    ],
    [dateCell],
  );

  const onSaveDescription = React.useCallback(() => {
    updateFirmware.mutate(
      {
        description: newDescription,
        id: firmware?.id ?? '',
      },
      {
        onSuccess: (data) => {
          setNewDescription(data.description);
          toggle();
        },
      },
    );
  }, [newDescription]);
  const onDescriptionChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewDescription(e.target.value);
  }, []);
  const toggleEdit = () => {
    if (isEditingDescription) {
      setNewDescription(firmware?.description);
      toggle();
    } else {
      setNewDescription(firmware?.description);
      toggle();
    }
  };

  React.useEffect(() => {
    if (firmware) {
      setNewDescription(firmware?.description);
    }
  }, [firmware]);

  return (
    <Modal isOpen={modalProps.isOpen} onClose={modalProps.onClose} title={getRevision(firmware?.revision)}>
      <SimpleGrid minChildWidth="400px" spacing={4}>
        <FormControl>
          <FormLabel>{t('commands.revision')}</FormLabel>
          <Heading size="sm">{getRevision(firmware?.revision)}</Heading>
        </FormControl>
        <FormControl>
          <FormLabel>{t('controller.firmware.release')}</FormLabel>
          <Heading size="sm">{firmware?.release}</Heading>
        </FormControl>
        <FormControl>
          <FormLabel>{t('common.created')}</FormLabel>
          <Heading size="sm">{firmware?.created && <FormattedDate date={firmware?.created} />}</Heading>
        </FormControl>
        <FormControl>
          <FormLabel>{t('commands.image_date')}</FormLabel>
          <Heading size="sm">{firmware?.imageDate && <FormattedDate date={firmware?.imageDate} />}</Heading>
        </FormControl>
        <FormControl>
          <FormLabel>{t('common.size')}</FormLabel>
          <Heading size="sm">
            <DataCell bytes={firmware?.size} />
          </Heading>
        </FormControl>
        <FormControl>
          <FormLabel>
            URI
            <Button onClick={copy.onCopy} size="sm" colorScheme="teal" ml={2}>
              {copy.hasCopied ? `${t('common.copied')}!` : t('common.copy')}
            </Button>
          </FormLabel>
          <Box display="flex">
            <Heading size="sm" my="auto">
              {firmware?.uri}
            </Heading>
          </Box>
        </FormControl>
        <FormControl>
          <FormLabel>
            {t('common.description')}
            <IconButton
              aria-label={isEditingDescription ? t('common.stop_editing') : t('common.edit')}
              size="sm"
              icon={isEditingDescription ? <X size={20} /> : <Pen size={20} />}
              onClick={toggleEdit}
              ml={2}
            />
            {isEditingDescription && (
              <SaveButton onClick={onSaveDescription} ml={2} isCompact size="sm" isLoading={updateFirmware.isLoading} />
            )}
          </FormLabel>
          <Textarea
            name="description"
            value={newDescription}
            h="50px"
            onChange={onDescriptionChange}
            isDisabled={!isEditingDescription}
          />
        </FormControl>
        <FormControl>
          <FormLabel>
            {t('common.notes')}{' '}
            <Popover trigger="click" placement="auto">
              {({ onClose }) => (
                <>
                  <PopoverTrigger>
                    <IconButton
                      aria-label={`${t('crud.add')} ${t('common.note')}`}
                      size="sm"
                      icon={<Plus size={20} />}
                    />
                  </PopoverTrigger>
                  <PopoverContent w={breakpoint === 'base' ? 'calc(80vw)' : '500px'}>
                    <PopoverArrow />
                    <PopoverCloseButton alignContent="center" mt={1} />
                    <PopoverHeader display="flex">{t('profile.add_new_note')}</PopoverHeader>
                    <PopoverBody>
                      <Box>
                        <Textarea h="100px" placeholder="Your new note" value={newNote} onChange={onNoteChange} />
                      </Box>
                      <Center mt={2}>
                        <Button
                          colorScheme="blue"
                          isDisabled={newNote.length === 0}
                          onClick={onNoteSubmit(onClose)}
                          isLoading={updateFirmware.isLoading}
                        >
                          {t('crud.add')}
                        </Button>
                      </Center>
                    </PopoverBody>
                  </PopoverContent>
                </>
              )}
            </Popover>
          </FormLabel>
          <Box overflowX="auto" overflowY="auto" maxH="400px">
            <DataTable columns={columns as Column<object>[]} data={notes} obj={t('common.notes')} minHeight="200px" />
          </Box>
        </FormControl>
      </SimpleGrid>
    </Modal>
  );
};

export default FirmwareDetailsModal;
