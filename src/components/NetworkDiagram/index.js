import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { CRow, CCol } from '@coreui/react';
import { useTranslation } from 'react-i18next';
import createLayoutedElements from './dagreAdapter';
import Graph from './Graph';

const associationStyle = {
  background: '#3399ff',
  color: 'white',
  border: '1px solid #777',
  width: 220,
  padding: 10,
};

const recognizedRadioStyle = {
  background: '#2eb85c',
  color: 'white',
  width: 220,
  padding: 15,
};

const unrecognizedRadioStyle = {
  background: '#e55353',
  color: 'white',
  width: 220,
  padding: 15,
};

const recognizedRadioNode = (radio) => (
  <div className="align-middle">
    <h6 className="align-middle mb-0">
      Radio #{radio.radio} ({radio.channel < 16 ? '2G' : '5G'})
    </h6>
  </div>
);

const unrecognizedRadioNode = (t, radio) => (
  <div className="align-middle">
    <h6 className="align-middle mb-0">
      Radio #{radio.radioIndex} ({t('common.unrecognized')})
    </h6>
  </div>
);

const associationNode = (associationInfo) => (
  <div>
    <CRow>
      <CCol className="text-center">
        <h6>{associationInfo.bssid}</h6>
      </CCol>
    </CRow>
    <CRow>
      <CCol className="text-left pl-4">Rx Rate : {associationInfo.rxRate}</CCol>
    </CRow>
    <CRow>
      <CCol className="text-left pl-4">Tx Rate : {associationInfo.txRate}</CCol>
    </CRow>
  </div>
);

const NetworkDiagram = ({ show, radios, associations }) => {
  const { t } = useTranslation();
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
          data: { label: recognizedRadioNode(radio) },
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
          data: { label: unrecognizedRadioNode(t, assoc.radio) },
          position: { x: 0, y: 200 * assoc.radio.radioIndex },
          type: 'input',
          style: unrecognizedRadioStyle,
        });
        radiosAdded[assoc.radio.radioIndex] = 0;
      }

      // Adding the association
      newElements.push({
        id: `a-${assoc.bssid}`,
        data: { label: associationNode(assoc) },
        position: {
          x: getX(radiosAdded[assoc.radio.radioIndex]),
          y: 80 + 240 * assoc.radio.radioIndex,
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

  return (
    <Graph
      show={show}
      loading={loading}
      elements={createLayoutedElements(elements, 220, 80)}
      setElements={setElements}
    />
  );
};

NetworkDiagram.propTypes = {
  show: PropTypes.bool,
  radios: PropTypes.instanceOf(Array),
  associations: PropTypes.instanceOf(Array),
};

NetworkDiagram.defaultProps = {
  show: true,
  radios: null,
  associations: null,
};

export default NetworkDiagram;
