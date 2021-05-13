import React from 'react';
import { CCard, CCardBody, CCardHeader, CRow } from '@coreui/react';
import { freeSet } from '@coreui/icons';
import { DocsLink } from 'src/reusable';
import { getIconsView } from '../brands/Brands.js';

const CoreUIIcons = () => (
  <CCard>
    <CCardHeader>
      Free Icons / as CIcon <DocsLink href="https://github.com/coreui/coreui-icons" text="GitHub" />
    </CCardHeader>
    <CCardBody>
      <CRow className="text-center">{getIconsView(freeSet)}</CRow>
    </CCardBody>
  </CCard>
);

export default CoreUIIcons;
