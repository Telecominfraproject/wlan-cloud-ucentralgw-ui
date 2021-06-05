import React from 'react';
import { CFooter } from '@coreui/react';

const TheFooter = () => (
  <CFooter fixed={false}>
    <div>Version 0.0.16</div>
    <div className="mfs-auto">
      <span className="mr-1">Powered by</span>
      <a href="https://coreui.io/react" target="_blank" rel="noopener noreferrer">
        CoreUI for React
      </a>
    </div>
  </CFooter>
);

export default React.memo(TheFooter);
