import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Select, { components } from 'react-select';
import { useTranslation } from 'react-i18next';

const DeviceSearchBarInput = ({ search, results, history, action, isDisabled }) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState('');
  const NoOptionsMessage = (props) => (
    <components.NoOptionsMessage {...props}>
      <span>{t('common.no_devices_found')}</span>
    </components.NoOptionsMessage>
  );

  const onInputChange = (value) => {
    if (value === '' || value.match('^[a-fA-F0-9-*]+$')) {
      setSelected(value);
      search(value);
    }
  };

  return (
    <Select
      components={{ NoOptionsMessage }}
      options={results.map((serial) => ({ label: serial, value: serial }))}
      filterOption={() => true}
      inputValue={selected}
      placeholder={t('common.search')}
      isDisabled={isDisabled}
      styles={{
        placeholder: (provided) => ({
          ...provided,
          // disable placeholder mouse events
          pointerEvents: 'none',
          userSelect: 'none',
          MozUserSelect: 'none',
          WebkitUserSelect: 'none',
          msUserSelect: 'none',
        }),
        input: (css) => ({
          ...css,
          /* expand the Input Component div */
          flex: '1 1 auto',
          /* expand the Input Component child div */
          '> div': {
            width: '100%',
          },
          /* expand the Input Component input */
          input: {
            width: '100% !important',
            textAlign: 'left',
          },
        }),
      }}
      onInputChange={onInputChange}
      onChange={(property) =>
        action === null ? history.push(`/devices/${property.value}`) : action(property.value)
      }
    />
  );
};

DeviceSearchBarInput.propTypes = {
  search: PropTypes.func.isRequired,
  results: PropTypes.instanceOf(Array).isRequired,
  history: PropTypes.instanceOf(Object).isRequired,
  isDisabled: PropTypes.bool.isRequired,
  action: PropTypes.func,
};

DeviceSearchBarInput.defaultProps = {
  action: null,
};

export default DeviceSearchBarInput;
