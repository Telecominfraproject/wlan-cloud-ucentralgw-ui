import * as React from 'react';
import { isLatLngLiteral } from '@googlemaps/typescript-guards';
import { createCustomEqual } from 'fast-equals';

const deepCompareEqualsForMaps = createCustomEqual((deepEqual) =>
  // @ts-ignore
  (a: number | google.maps.LatLng | google.maps.LatLngLiteral, b: number | google.maps.LatLng | google.maps.LatLngLiteral) => {
    if (
      isLatLngLiteral(a) ||
      a instanceof google.maps.LatLng ||
      isLatLngLiteral(b) ||
      b instanceof google.maps.LatLng
    ) {
      return new google.maps.LatLng(a).equals(new google.maps.LatLng(b));
    }

    // @ts-ignore
    return deepEqual(a, b);
  },
);

const useDeepCompareMemoize = (value: unknown) => {
  const ref = React.useRef<unknown>();

  if (!deepCompareEqualsForMaps(value, ref.current)) {
    ref.current = value;
  }

  return ref.current;
};

const useDeepCompareEffectForMaps = (callback: React.EffectCallback, dependencies: unknown[]) => {
  React.useEffect(callback, dependencies.map(useDeepCompareMemoize));
};

export interface GoogleMapProps extends google.maps.MapOptions {
  style: { [key: string]: string };
  onClick?: (e: google.maps.MapMouseEvent) => void;
  onIdle?: (map: google.maps.Map) => void;
  children?: React.ReactNode;
}

const _GoogleMap = ({ style, onClick, onIdle, children, ...options }: GoogleMapProps) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = React.useState<google.maps.Map>();

  // because React does not do deep comparisons, a custom hook is used
  useDeepCompareEffectForMaps(() => {
    if (map) {
      map.setOptions(options);
    }
  }, [map, options]);

  React.useEffect(() => {
    if (ref.current && !map) {
      setMap(new window.google.maps.Map(ref.current, {}));
    }
  }, [ref, map]);

  React.useEffect(() => {
    if (map) {
      ['click', 'idle'].forEach((eventName) => google.maps.event.clearListeners(map, eventName));

      if (onClick) {
        map.addListener('click', onClick);
      }

      if (onIdle) {
        map.addListener('idle', () => onIdle(map));
      }
    }
  }, [map, onClick, onIdle]);

  return (
    <>
      <div ref={ref} style={style} />
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // set the map prop on the child component
          // @ts-ignore
          return React.cloneElement(child, { map });
        }
        return null;
      })}
    </>
  );
};

export const GoogleMap = React.memo(_GoogleMap);
