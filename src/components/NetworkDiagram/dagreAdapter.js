import dagre from 'dagre';
import { isNode } from 'react-flow-renderer';

const setupDag = (elements, nodeWidth, nodeHeight) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB' });

  elements.forEach((el) => {
    if (isNode(el)) {
      dagreGraph.setNode(el.id, { width: nodeWidth, height: nodeHeight });
    } else {
      dagreGraph.setEdge(el.source, el.target);
    }
  });

  dagre.layout(dagreGraph);

  return elements.map((el) => {
    const newElement = el;
    if (isNode(newElement)) {
      const nodeWithPosition = dagreGraph.node(newElement.id);
      newElement.targetPosition = 'top';
      newElement.sourcePosition = 'bottom';
      newElement.position = {
        x: nodeWithPosition.x - nodeWidth / 2 + Math.random() / 1000,
        y: nodeWithPosition.y - nodeHeight / 2,
      };
    }
    return newElement;
  });
};

export default setupDag;
