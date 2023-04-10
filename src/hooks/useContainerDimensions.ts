import * as React from 'react';

const roundToNearest = (num: number, precision: number) => {
  const factor = 1 / precision;
  return Math.round(num * factor) / factor;
};

export type UseContainerDimensionsProps = {
  precision?: 10 | 100 | 1000;
};

export const useContainerDimensions = ({ precision }: UseContainerDimensionsProps) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    const getDimensions = () => ({
      width: (ref && ref.current?.offsetWidth) || 0,
      height: (ref && ref.current?.offsetHeight) || 0,
    });

    const handleResize = () => {
      const { width, height } = getDimensions();
      if (!precision) {
        if (dimensions.width !== width && dimensions.height !== height) setDimensions({ width, height });
      } else {
        const newDimensions = { width, height };
        newDimensions.width = roundToNearest(newDimensions.width, precision);
        newDimensions.height = roundToNearest(newDimensions.height, precision);
        if (newDimensions.width !== dimensions.width || newDimensions.height !== dimensions.height) {
          setDimensions(newDimensions);
        }
      }
    };

    if (ref.current) {
      handleResize();
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [ref, dimensions]);

  return React.useMemo(
    () => ({
      dimensions,
      ref,
    }),
    [dimensions.height, dimensions.width],
  );
};
