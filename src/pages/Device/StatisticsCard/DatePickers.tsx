import * as React from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Spacer,
  Tooltip,
  useBreakpoint,
} from '@chakra-ui/react';
import { Clock, Prohibit } from 'phosphor-react';
import ReactDatePicker from 'react-datepicker';
import { useTranslation } from 'react-i18next';
import { CloseButton } from 'components/Buttons/CloseButton';
import { SaveButton } from 'components/Buttons/SaveButton';

const CustomInputButton = React.forwardRef(
  ({ value, onClick }: { value: string; onClick: () => void }, ref: React.LegacyRef<HTMLButtonElement>) => (
    <Button colorScheme="gray" size="sm" onClick={onClick} ref={ref} mt={1}>
      {value}
    </Button>
  ),
);

const getStart = () => {
  const date = new Date();
  date.setHours(date.getHours() - 1);
  return date;
};
type Props = {
  defaults?: { start: Date; end: Date };
  setTime: (start: Date, end: Date) => void;
  onClear: () => void;
};

const StatisticsCardDatePickers = ({ defaults, setTime, onClear }: Props) => {
  const { t } = useTranslation();
  const [start, setStart] = React.useState<Date>(defaults?.start ?? getStart());
  const [end, setEnd] = React.useState<Date>(defaults?.end ?? new Date());
  const breakpoint = useBreakpoint();

  const onStartChange = (newDate: Date) => {
    setStart(newDate);
  };
  const onEndChange = (newDate: Date) => {
    setEnd(newDate);
  };
  const clear = (onClose: () => void) => () => {
    onClear();
    onClose();
  };
  const onSave = (onClose: () => void) => () => {
    onClose();
    setTime(start, end);
  };

  const width = (isOpen: boolean) => {
    if (isOpen) {
      return breakpoint === 'base' ? '360px' : '460px';
    }
    return undefined;
  };

  React.useEffect(() => {
    setStart(defaults?.start ?? getStart());
    setEnd(defaults?.end ?? new Date());
  }, [defaults]);

  return (
    <Popover>
      {({ isOpen, onClose }) => (
        <>
          <PopoverTrigger>
            <Box>
              <Tooltip label={t('controller.crud.choose_time')}>
                <IconButton aria-label={t('controller.crud.choose_time')} icon={<Clock />} />
              </Tooltip>
            </Box>
          </PopoverTrigger>
          <PopoverContent w={width(isOpen)}>
            <PopoverArrow />
            <PopoverHeader display="flex">
              <Heading size="sm" my="auto">
                {t('controller.crud.choose_time')}
              </Heading>
              <Spacer />
              <HStack>
                <Tooltip label={t('controller.crud.clear_time')}>
                  <IconButton
                    colorScheme="red"
                    aria-label={t('controller.crud.clear_time')}
                    onClick={clear(onClose)}
                    icon={<Prohibit />}
                  />
                </Tooltip>
                <SaveButton onClick={onSave(onClose)} isCompact />
                <CloseButton onClick={onClose} />
              </HStack>
            </PopoverHeader>
            <PopoverBody>
              {breakpoint === 'base' ? (
                <Box>
                  <Flex>
                    <Heading size="sm" my="auto" mr={2}>
                      {t('system.start')}:{' '}
                    </Heading>
                    <Box w="170px">
                      <ReactDatePicker
                        selected={start}
                        onChange={onStartChange}
                        timeInputLabel={`${t('common.time')}: `}
                        dateFormat="dd/MM/yyyy hh:mm aa"
                        timeFormat="p"
                        showTimeSelect
                        // @ts-ignore
                        customInput={<CustomInputButton />}
                      />
                    </Box>
                  </Flex>
                  <Flex>
                    <Heading size="sm" my="auto" mr={4}>
                      {t('common.end')}:{' '}
                    </Heading>
                    <Box w="170px">
                      <ReactDatePicker
                        selected={end}
                        onChange={onEndChange}
                        timeInputLabel={`${t('common.time')}: `}
                        dateFormat="dd/MM/yyyy hh:mm aa"
                        timeFormat="p"
                        showTimeSelect
                        // @ts-ignore
                        customInput={<CustomInputButton />}
                      />
                    </Box>
                  </Flex>
                </Box>
              ) : (
                <Flex>
                  <Heading size="sm" my="auto" mr={2}>
                    {t('system.start')}:{' '}
                  </Heading>
                  <Box w="170px">
                    <ReactDatePicker
                      selected={start}
                      onChange={onStartChange}
                      timeInputLabel={`${t('common.time')}: `}
                      dateFormat="dd/MM/yyyy hh:mm aa"
                      timeFormat="p"
                      showTimeSelect
                      // @ts-ignore
                      customInput={<CustomInputButton />}
                    />
                  </Box>
                  <Heading size="sm" my="auto" mr={2}>
                    {t('common.end')}:{' '}
                  </Heading>
                  <Box w="170px">
                    <ReactDatePicker
                      selected={end}
                      onChange={onEndChange}
                      timeInputLabel={`${t('common.time')}: `}
                      dateFormat="dd/MM/yyyy hh:mm aa"
                      timeFormat="p"
                      showTimeSelect
                      // @ts-ignore
                      customInput={<CustomInputButton />}
                    />
                  </Box>
                </Flex>
              )}
            </PopoverBody>
          </PopoverContent>
        </>
      )}
    </Popover>
  );
};

export default StatisticsCardDatePickers;
