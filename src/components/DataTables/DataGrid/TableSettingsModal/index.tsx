import * as React from 'react';
import { SettingsIcon } from '@chakra-ui/icons';
import { Box, IconButton, Tooltip, useDisclosure } from '@chakra-ui/react';
import { ClockCounterClockwise } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../../Modals/Modal';
import { DataGridColumn, UseDataGridReturn } from '../useDataGrid';
import TableDragDrop from './DragDrop';

type Props<TValue extends object> = {
  controller: UseDataGridReturn;
  columns: DataGridColumn<TValue>[];
};

const TableSettingsModal = <TValue extends object>({ controller, columns }: Props<TValue>) => {
  const { t } = useTranslation();
  const modalProps = useDisclosure();

  return (
    <>
      <Tooltip label={t('table.preferences')}>
        <IconButton
          aria-label={t('table.preferences')}
          icon={<SettingsIcon weight="bold" />}
          onClick={modalProps.onOpen}
        />
      </Tooltip>
      <Modal
        title={t('table.preferences')}
        topRightButtons={
          <Tooltip label={t('table.reset')}>
            <IconButton
              aria-label={t('table.reset')}
              icon={<ClockCounterClockwise size={20} />}
              onClick={controller.resetPreferences}
            />
          </Tooltip>
        }
        options={{
          modalSize: 'md',
          maxWidth: { sm: '600px', md: '600px', lg: '600px', xl: '600px' },
        }}
        {...modalProps}
      >
        <Box w="100%">
          <TableDragDrop<TValue>
            shownColumns={columns.filter((col) => controller.columnVisibility[col.id] !== false)}
            hiddenColumns={columns.filter((col) => controller.columnVisibility[col.id] === false)}
            controller={controller}
          />
        </Box>
      </Modal>
    </>
  );
};

export default React.memo(TableSettingsModal);
