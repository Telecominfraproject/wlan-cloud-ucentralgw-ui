import * as React from 'react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { Button, Checkbox, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';

type Props = {
  availableLogTypes: { id: number; helper?: string }[];
  hiddenLogIds: number[];
  setHiddenLogIds: (ids: number[]) => void;
};
const ShownLogsDropdown = ({ availableLogTypes, hiddenLogIds, setHiddenLogIds }: Props) => {
  const { t } = useTranslation();

  const labels: { [key: number]: string } = {
    1: t('logs.one'),
    1000: t('controller.dashboard.device_dashboard_refresh'),
    2000: t('logs.configuration_upgrade'),
    3000: t('logs.device_firmware_upgrade'),
    4000: t('common.connected'),
    5000: t('common.disconnected'),
    6000: t('controller.devices.new_statistics'),
  };

  const isActive = (id: number) => !hiddenLogIds.includes(id);
  const onToggle = (id: number) => () => {
    if (isActive(id)) {
      setHiddenLogIds([...hiddenLogIds, id]);
    } else {
      setHiddenLogIds(hiddenLogIds.filter((hid) => hid !== id));
    }
  };
  const label = (id: number, helper?: string) => {
    if (labels[id] !== undefined) {
      return labels[id];
    }
    return helper ?? id;
  };

  return (
    <Menu closeOnSelect={false}>
      <MenuButton as={Button} rightIcon={<ChevronDownIcon />} isDisabled={availableLogTypes.length === 0}>
        {t('logs.receiving_types')} ({availableLogTypes.length - hiddenLogIds.length})
      </MenuButton>
      <MenuList>
        {availableLogTypes.map((logType) => (
          <MenuItem key={uuid()} onClick={onToggle(logType.id)} isFocusable={false}>
            <Checkbox isChecked={isActive(logType.id)}>{label(logType.id, logType.helper)}</Checkbox>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default ShownLogsDropdown;
