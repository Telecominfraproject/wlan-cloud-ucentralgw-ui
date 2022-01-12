import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ReactFlow, { removeElements, MiniMap, Controls, Background } from 'react-flow-renderer';

const NetworkDiagram = ({ show, elements, setElements }) => {
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const onElementsRemove = (elementsToRemove) => {
    setElements((els) => removeElements(elementsToRemove, els));
  };

  const onLoad = (instance) => {
    setReactFlowInstance(instance);
  };

  useEffect(() => {
    if (show && reactFlowInstance !== null && elements.length > 0) {
      setTimeout(() => reactFlowInstance.fitView(), 100);
    }
  }, [show, reactFlowInstance, elements]);

  return (
    <div style={{ height: '80vh', width: '100%' }}>
      <ReactFlow
        elements={elements}
        onElementsRemove={onElementsRemove}
        onLoad={onLoad}
        snapToGrid
        snapGrid={[20, 20]}
      >
        <MiniMap
          nodeColor={(n) => {
            if (n.style?.background) return n.style.background;

            return '#fff';
          }}
          nodeBorderRadius={5}
        />
        <Controls />
        <Background color="#aaa" gap={20} />
      </ReactFlow>
    </div>
  );
};

NetworkDiagram.propTypes = {
  show: PropTypes.bool,
  elements: PropTypes.instanceOf(Array).isRequired,
  setElements: PropTypes.func.isRequired,
};

NetworkDiagram.defaultProps = {
  show: true,
};

export default React.memo(NetworkDiagram);
