import * as React from 'react';
import { Tooltip, useColorMode, useColorModeValue } from '@chakra-ui/react';
import {
  AsyncSelect,
  ChakraStylesConfig,
  GroupBase,
  LoadingIndicatorProps,
  OptionBase,
  OptionsOrGroups,
  chakraComponents,
} from 'chakra-react-select';
import { useNavigate } from 'react-router-dom';
import { useControllerStore } from 'contexts/ControllerSocketProvider/useStore';
import debounce from 'helpers/debounce';
import { getUsernameRadiusSessions } from 'hooks/Network/Radius';

const chakraStyles: (
  colorMode: 'light' | 'dark',
) => ChakraStylesConfig<SearchOption, false, GroupBase<SearchOption>> = (colorMode) => ({
  dropdownIndicator: (provided) => ({
    ...provided,
    width: '32px',
  }),
  placeholder: (provided) => ({
    ...provided,
    lineHeight: '1',
    pointerEvents: 'none',
    userSelect: 'none',
    MozUserSelect: 'none',
    WebkitUserSelect: 'none',
    msUserSelect: 'none',
  }),
  container: (provided) => ({
    ...provided,
    width: '320px',
    backgroundColor: colorMode === 'light' ? 'white' : 'gray.600',
    borderRadius: '15px',
  }),
  input: (provided) => ({
    ...provided,
    gridArea: '1 / 2 / 4 / 4 !important',
  }),
});

interface SearchOption extends OptionBase {
  label: string;
  value: string;
  type: 'serial' | 'radius-username' | 'radius-mac';
}

const asyncComponents = {
  LoadingIndicator: (props: LoadingIndicatorProps<SearchOption, false, GroupBase<SearchOption>>) => {
    const { color, emptyColor } = useColorModeValue(
      {
        color: 'blue.500',
        emptyColor: 'blue.100',
      },
      {
        color: 'blue.300',
        emptyColor: 'blue.900',
      },
    );

    return (
      <chakraComponents.LoadingIndicator
        color={color}
        emptyColor={emptyColor}
        speed="750ms"
        spinnerSize="md"
        thickness="3px"
        {...props}
      />
    );
  },
};

const GlobalSearchBar = () => {
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const store = useControllerStore((state) => ({
    searchSerialNumber: state.searchSerialNumber,
  }));

  const onNewSearch = React.useCallback(
    async (v: string, callback: (options: OptionsOrGroups<SearchOption, GroupBase<SearchOption>>) => void) => {
      if (v.length < 3) return callback([]);

      if (v.includes('rad:')) {
        const trimmed = v.replace('rad:', '').trim();
        if (trimmed.length < 3) return callback([]);
        const cleaned = trimmed.toLowerCase();
        return getUsernameRadiusSessions(cleaned)
          .then((res) =>
            callback(
              res
                .map((r) => ({
                  label: r.serialNumber,
                  value: r.serialNumber,
                  type: 'radius-username',
                }))
                .filter(({ value }, i, a) => a.findIndex((t) => t.value === value) === i) as SearchOption[],
            ),
          )
          .then(() => callback([]));
      }
      if (v.match('^[a-fA-F0-9-*]+$')) {
        let result: { label: string; value: string; type: 'serial' }[] = [];
        let tryAgain = true;

        await store
          .searchSerialNumber(v)
          .then((res) => {
            result = res.map((r) => ({
              label: r,
              value: r,
              type: 'serial',
            }));
            tryAgain = false;
          })
          .catch(() => {
            result = [];
          });

        if (tryAgain) {
          // Wait 1 second and try again
          await new Promise((resolve) => setTimeout(resolve, 1000));

          await store
            .searchSerialNumber(v)
            .then((res) => {
              result = res.map((r) => ({
                label: r,
                value: r,
                type: 'serial',
              }));
              tryAgain = false;
            })
            .catch(() => {
              result = [];
            });
        }

        callback(result);
      }
      return callback([]);
    },
    [],
  );

  const debouncedNewSearch = React.useCallback(
    debounce(
      // @ts-ignore
      ({
        v,
        callback,
      }: {
        v: string;
        callback: (options: OptionsOrGroups<SearchOption, GroupBase<SearchOption>>) => void;
      }) => {
        onNewSearch(v as string, callback);
      },
      300,
    ),
    [],
  );

  const styles = React.useMemo(() => chakraStyles(colorMode), [colorMode]);

  return (
    <Tooltip
      label={`Search serial numbers and radius clients. For radius clients you can either use the client's username (rad:client@client.com)
       or use the client's station ID (rad:11:22:33:44:55:66)`}
      shouldWrapChildren
      placement="left"
    >
      <AsyncSelect<SearchOption, false, GroupBase<SearchOption>>
        name="global_search"
        chakraStyles={styles}
        closeMenuOnSelect
        placeholder="Search MACs or radius clients"
        components={asyncComponents}
        loadOptions={(inputValue, callback) => {
          debouncedNewSearch({ v: inputValue, callback });
        }}
        value={null}
        onChange={(newValue) => {
          if (newValue) {
            navigate(`/devices/${newValue.value}`);
          }
        }}
      />
    </Tooltip>
  );
};

export default GlobalSearchBar;
