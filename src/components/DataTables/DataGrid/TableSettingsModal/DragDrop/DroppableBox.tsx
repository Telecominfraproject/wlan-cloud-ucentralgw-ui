import * as React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { Droppable } from '@hello-pangea/dnd';
import { DataGridColumn } from '../../useDataGrid';
import DraggableColumn from './DraggableColumn';

type Props<TValue> = {
  items: string[];
  columns: DataGridColumn<TValue>[];
  droppableId: string;
  isDropDisabled?: boolean;
};
const DroppableBox = <TValue extends object>({ items, columns, droppableId, isDropDisabled }: Props<TValue>) => {
  const notDraggingBackground = useColorModeValue('gray.200', 'gray.600');
  const isDraggingOverBackground = useColorModeValue('blue.300', 'blue.500');

  return (
    <Droppable droppableId={droppableId} direction="vertical" isCombineEnabled={false} isDropDisabled={isDropDisabled}>
      {(provided, snapshot) => (
        <Box
          ref={provided.innerRef}
          backgroundColor={snapshot.isDraggingOver ? isDraggingOverBackground : notDraggingBackground}
          padding={2}
          borderRadius={15}
        >
          {items.map((item, index) => {
            const found = columns.find((col) => col.id === item);
            return found ? <DraggableColumn key={item} draggableId={item} index={index} column={found} /> : null;
          })}
          {provided.placeholder}
        </Box>
      )}
    </Droppable>
  );
};

export default React.memo(DroppableBox);
