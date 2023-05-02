import * as React from 'react';
import { Box, Icon, Text, Tooltip, useColorModeValue } from '@chakra-ui/react';
import { Draggable } from '@hello-pangea/dnd';
import { ArrowsDownUp, Lock } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { DataGridColumn } from '../../useDataGrid';

type Props<TValue> = {
  draggableId: string;
  index: number;
  column: DataGridColumn<TValue>;
};

const DraggableColumn = <TValue extends object>({ draggableId, index, column }: Props<TValue>) => {
  const { t } = useTranslation();
  const isDraggingBackground = useColorModeValue('blue.100', 'blue.600');
  const notDraggingBackground = useColorModeValue('gray.50', 'gray.700');

  let label = column.header?.toString() ?? 'Unrecognized column';
  if (column.meta?.columnSelectorOptions?.label) label = column.meta.columnSelectorOptions.label;

  const tooltipLabel = () => {
    if (column.meta?.anchored) return t('table.drag_locked');
    if (column.meta?.alwaysShow) return t('table.drag_always_show');

    return t('table.drag_explanation');
  };

  return (
    <Draggable draggableId={draggableId} index={index} isDragDisabled={column.meta?.anchored}>
      {(itemProvided, itemSnapshot) => (
        <Tooltip label={tooltipLabel()}>
          <Box
            ref={itemProvided.innerRef}
            {...itemProvided.draggableProps}
            {...itemProvided.dragHandleProps}
            display="flex"
            backgroundColor={itemSnapshot.isDragging ? isDraggingBackground : notDraggingBackground}
            px={6}
            py={2}
            my={2}
            borderRadius={15}
            cursor={column.meta?.anchored ? 'not-allowed' : undefined}
          >
            <Icon as={column.meta?.anchored ? Lock : ArrowsDownUp} boxSize={5} ml={0.5} mr={2} my="auto" />
            <Text my="auto">{label}</Text>
          </Box>
        </Tooltip>
      )}
    </Draggable>
  );
};

export default DraggableColumn;
