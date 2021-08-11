import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { RadioGraph as Graph } from 'ucentral-libs';

const associationStyle = {
  background: '#3399ff',
  color: 'white',
  border: '1px solid #777',
  width: 220,
  padding: 20,
};

const recognizedRadioStyle = {
  background: '#2eb85c',
  color: 'white',
  width: 220,
  padding: 20,
};

const unrecognizedRadioStyle = {
  background: '#e55353',
  color: 'white',
  width: 220,
  padding: 20,
};

const RadioGraph = ({ radios, associations }) => {
  const [loading, setLoading] = useState(false);
  const [elements, setElements] = useState([]);

  const getX = (associationsAdded) => {
    if (associationsAdded === 0) return 0;
    if ((associationsAdded + 1) % 2 === 0) return -140 * (associationsAdded + 1);
    return 140 * associationsAdded;
  };

  const parseData = () => {
    setLoading(true);
    const newElements = [];
    const radiosAdded = {};

    // Creating the radio nodes
    for (const radio of radios) {
      if (radiosAdded[radio.radio] === undefined) {
        newElements.push({
          id: `r-${radio.radio}`,
          data: { label: `Radio #${radio.radio}` },
          position: { x: 0, y: 200 * radio.radio },
          type: 'input',
          style: recognizedRadioStyle,
        });
        radiosAdded[radio.radio] = 0;
      }
    }

    // Creating the association nodes and their edges
    for (let i = 0; i < associations.length; i += 1) {
      const assoc = associations[i];

      // If the radio has not been added, we create a new unknown radio based on its index
      if (radiosAdded[assoc.radio.radioIndex] === undefined) {
        newElements.push({
          id: `r-${assoc.radio.radioIndex}`,
          data: { label: `Radio #${assoc.radio.radioIndex} (Unrecognized)` },
          position: { x: 0, y: 200 * assoc.radio.radioIndex },
          type: 'input',
          style: unrecognizedRadioStyle,
        });
        radiosAdded[assoc.radio.radioIndex] = 0;
      }

      // Adding the association
      newElements.push({
        id: `a-${assoc.bssid}`,
        data: { label: <>BSSID: {assoc.bssid}</> },
        position: {
          x: getX(radiosAdded[assoc.radio.radioIndex]),
          y: 100 + 240 * assoc.radio.radioIndex,
        },
        style: associationStyle,
        type: 'output',
      });
      radiosAdded[assoc.radio.radioIndex] += 1;

      // Creating the edge
      newElements.push({
        id: `e-${assoc.radio.radioIndex}-${assoc.bssid}`,
        source: `r-${assoc.radio.radioIndex}`,
        target: `a-${assoc.bssid}`,
        arrowHeadType: 'arrowclosed',
      });
    }

    setElements(newElements);
    setLoading(false);
  };

  useEffect(() => {
    if (radios !== null && associations !== null) {
      parseData();
    }
  }, [radios, associations]);

  return <Graph loading={loading} elements={elements} setElements={setElements} />;
};

RadioGraph.propTypes = {
  radios: PropTypes.instanceOf(Array),
  associations: PropTypes.instanceOf(Array),
};

RadioGraph.defaultProps = {
  radios: null,
  associations: null,
};

export default RadioGraph;
