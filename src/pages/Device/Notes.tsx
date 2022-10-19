import * as React from 'react';
import { Card } from 'components/Containers/Card';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import { CardBody } from 'components/Containers/Card/CardBody';
import {
  Box,
  Button,
  Center,
  Heading,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Spacer,
  Text,
  Textarea,
  useToast,
  useBreakpoint,
} from '@chakra-ui/react';
import { Plus } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { useGetDevice, useUpdateDevice } from 'hooks/Network/Devices';
import { DataTable } from 'components/DataTables/DataTable';
import { Column } from 'models/Table';
import FormattedDate from 'components/InformationDisplays/FormattedDate';
import { Note } from 'models/Note';

type Props = {
  serialNumber: string;
};

const DeviceNotes = ({ serialNumber }: Props) => {
  const { t } = useTranslation();
  const getDevice = useGetDevice({ serialNumber });
  const [newNote, setNewNote] = React.useState('');
  const updateDevice = useUpdateDevice({ serialNumber });
  const toast = useToast();
  const breakpoint = useBreakpoint();

  const onNoteChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewNote(e.target.value);
  }, []);

  const onNoteSubmit = React.useCallback(
    (onClose: () => void) => () => {
      updateDevice.mutateAsync(
        {
          serialNumber,
          notes: [{ note: newNote, created: 0 }],
        },
        {
          onSuccess: () => {
            toast({
              id: 'device-update-success',
              title: t('common.success'),
              description: t('controller.devices.update_success'),
              status: 'success',
              duration: 5000,
              isClosable: true,
              position: 'top-right',
            });
            onClose();
            setNewNote('');
          },
        },
      );
    },
    [newNote],
  );

  const notes = React.useMemo(
    () => getDevice.data?.notes?.sort(({ created: a }, { created: b }) => b - a) ?? [],
    [getDevice.data?.notes],
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

  return (
    <Card mb={4} p={4}>
      <CardHeader mb={2}>
        <Heading size="md">{t('common.notes')}</Heading>
        <Spacer />
        <Popover trigger="click" placement="auto">
          {({ onClose }) => (
            <>
              <PopoverTrigger>
                <IconButton
                  aria-label={`${t('crud.add')} ${t('common.note')}`}
                  icon={<Plus size={20} />}
                  colorScheme="teal"
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
                      colorScheme="teal"
                      isDisabled={newNote.length === 0}
                      onClick={onNoteSubmit(onClose)}
                      isLoading={updateDevice.isLoading}
                    >
                      {t('crud.add')}
                    </Button>
                  </Center>
                </PopoverBody>
              </PopoverContent>
            </>
          )}
        </Popover>
      </CardHeader>
      <CardBody display="block">
        <Box overflowX="auto">
          <DataTable columns={columns as Column<object>[]} data={notes} obj={t('common.notes')} minHeight="200px" />
        </Box>
      </CardBody>
    </Card>
  );
};

export default DeviceNotes;
