import React, { useCallback, useMemo, useState } from 'react';
import { AddIcon } from '@chakra-ui/icons';
import { IconButton, Input, InputGroup, InputRightElement, Tooltip } from '@chakra-ui/react';
import { Trash } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import { DataTable } from '../../../DataTables/DataTable';
import FormattedDate from '../../../InformationDisplays/FormattedDate';
import { useAuth } from 'contexts/AuthProvider';
import { useFastField } from 'hooks/useFastField';
import { Note } from 'models/Note';

export interface NotesFieldProps {
  name?: string;
  isDisabled?: boolean;
  hasDeleteButton?: boolean;
}

const _NotesField: React.FC<NotesFieldProps> = ({ name, isDisabled, hasDeleteButton }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { value: notes, onChange: setNotes } = useFastField({ name: name ?? 'notes' });
  const [newNote, setNewNote] = useState('');

  const addNoteToForm = () => {
    const newNotes = [
      ...notes,
      {
        note: newNote,
        isNew: true,
        createdBy: user?.email,
        created: Math.floor(new Date().getTime() / 1000),
      },
    ];
    setNotes(newNotes);
    setNewNote('');
  };

  const removeNote = (index: number) => {
    const newArr = [...notes];
    newArr.splice(index, 1);
    setNotes(newArr);
  };

  // @ts-ignore
  const memoizedDate = useCallback((cell) => <FormattedDate date={cell.row.values.created} key={uuid()} />, []);

  const removeAction = useCallback(
    // @ts-ignore
    (cell) => (
      <Tooltip hasArrow label={t('common.remove')} placement="top">
        <IconButton
          aria-label="Remove Object"
          ml={2}
          colorScheme="red"
          icon={<Trash size={20} />}
          size="sm"
          onClick={() => removeNote(cell.row.index)}
        />
      </Tooltip>
    ),
    [notes],
  );

  const columns = useMemo(() => {
    const cols = [
      {
        id: 'created',
        Header: t('common.date'),
        Footer: '',
        accessor: 'created',
        Cell: ({ cell }: { cell: unknown }) => memoizedDate(cell),
        customWidth: '150px',
      },
      {
        id: 'note',
        Header: t('common.note'),
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
    ];
    if (hasDeleteButton)
      cols.push({
        id: 'actions',
        Header: t('common.actions'),
        Footer: '',
        accessor: 'Id',
        customWidth: '80px',
        Cell: ({ cell }) => removeAction(cell),
      });
    return cols;
  }, [memoizedDate, removeAction]);

  return (
    <>
      <InputGroup mb={6} hidden={isDisabled}>
        <Input
          borderRadius="15px"
          fontSize="sm"
          type="text"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewNote(e.target.value)}
          placeholder={t('common.your_new_note')}
          value={newNote}
        />
        <InputRightElement>
          <Tooltip hasArrow label={t('crud.add')} placement="top">
            <IconButton
              aria-label="Add Note"
              colorScheme="blue"
              icon={<AddIcon />}
              onClick={addNoteToForm}
              isDisabled={newNote.length === 0}
            />
          </Tooltip>
        </InputRightElement>
      </InputGroup>
      <DataTable
        columns={columns}
        data={notes.sort((a: Note, b: Note) => b.created - a.created)}
        obj={hasDeleteButton ? undefined : t('common.notes')}
        minHeight="200px"
      />
    </>
  );
};

export const NotesField = React.memo(_NotesField);
