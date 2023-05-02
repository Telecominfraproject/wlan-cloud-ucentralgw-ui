import * as React from 'react';
import { Box, Flex, Heading } from '@chakra-ui/react';
import { DragDropContext, DragStart, DropResult } from '@hello-pangea/dnd';
import { useTranslation } from 'react-i18next';
import { DataGridColumn, UseDataGridReturn } from '../../useDataGrid';
import DroppableBox from './DroppableBox';

const reorder = (list: string[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  if (removed) {
    result.splice(endIndex, 0, removed);
  }

  return result;
};

const getShownColumns = <TValue extends object>(columns: DataGridColumn<TValue>[], columnOrder: string[]) => {
  const order = [...columnOrder];

  for (const col of columns) {
    if (!order.includes(col.id)) {
      order.push(col.id);
    }
  }

  return order;
};

type Props<TValue extends object> = {
  controller: UseDataGridReturn;
  shownColumns: DataGridColumn<TValue>[];
  hiddenColumns: DataGridColumn<TValue>[];
};

const TableDragDrop = <TValue extends object>({ controller, shownColumns, hiddenColumns }: Props<TValue>) => {
  const { t } = useTranslation();
  const [shownOrder, setShowOrder] = React.useState(getShownColumns(shownColumns, controller.columnOrder));
  const [hiddenOrder, setHiddenOrder] = React.useState(hiddenColumns.map((col) => col.id));
  const [currentDraggingColumn, setCurrentDraggingColumn] = React.useState<DataGridColumn<TValue>>();

  const handleDragStart = React.useCallback(
    (start: DragStart) => {
      const foundColumn =
        shownColumns.find(({ id }) => id === start.draggableId) ??
        hiddenColumns.find(({ id }) => id === start.draggableId);
      setCurrentDraggingColumn(foundColumn);
    },
    [shownColumns, hiddenColumns],
  );

  const minimumIndex = React.useMemo(() => {
    let index = 0;
    for (const [i, col] of shownColumns.entries()) {
      if (col.meta?.anchored) {
        index = i;
      }
    }
    return index + 1;
  }, [shownColumns]);

  const handleDragEnd = React.useCallback(
    (result: DropResult) => {
      const { source, destination, draggableId } = result;

      if (destination === null) return;

      if (source.droppableId === destination.droppableId) {
        const newOrder = reorder(shownOrder, source.index, Math.max(destination.index, minimumIndex));
        if (destination.droppableId === 'displayed-columns') {
          controller.setColumnOrder(newOrder);
          setShowOrder(newOrder);
        } else setHiddenOrder(newOrder);
      }
      // This means we are moving from displayed to hidden
      else if (source.droppableId === 'displayed-columns') {
        // Toggle the column visibility in user preferences
        const results = controller.hideColumn(draggableId);
        if (results) {
          setHiddenOrder([...results.hiddenColumns]);
          setShowOrder([...results.columnOrder]);
        }
      }
      // This means we are moving from hidden to displayed
      else if (source.droppableId === 'hidden-columns') {
        const newOrder = Array.from(shownOrder);
        newOrder.splice(Math.max(destination.index, minimumIndex), 0, draggableId);
        const results = controller.unhideColumn(draggableId, newOrder);
        if (results) {
          setHiddenOrder(results.hiddenColumns);
          setShowOrder([...results.columnOrder]);
          setHiddenOrder([...results.hiddenColumns]);
        }
      }

      setCurrentDraggingColumn(undefined);
    },
    [shownColumns, hiddenColumns, controller.hideColumn, controller.unhideColumn, minimumIndex],
  );

  return (
    <>
      <Heading size="md">{t('table.columns')}</Heading>
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <Flex mt={4}>
          <Box w="50%" mr={2}>
            <Heading size="sm" mb={4}>
              Visible ({shownOrder.length})
            </Heading>
            <DroppableBox droppableId="displayed-columns" items={shownOrder} columns={shownColumns} />
          </Box>
          <Box ml={2} w="50%">
            <Heading size="sm" mb={4}>
              Hidden ({hiddenColumns.length})
            </Heading>
            <DroppableBox
              droppableId="hidden-columns"
              items={hiddenOrder}
              columns={hiddenColumns}
              isDropDisabled={currentDraggingColumn?.meta?.alwaysShow}
            />
          </Box>
        </Flex>
      </DragDropContext>
    </>
  );
};

export default TableDragDrop;
