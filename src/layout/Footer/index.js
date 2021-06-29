import React from 'react';
import { CFooter } from '@coreui/react';
import { Translation } from 'react-i18next';

const TheFooter = () => (
  <Translation>
    {(t) => (
      <CFooter fixed={false}>
        <div>{t('footer.version')} 0.9.5</div>
        <div className="mfs-auto">
          <span className="mr-1">{t('footer.powered_by')}</span>
          <a href="https://coreui.io/react" target="_blank" rel="noopener noreferrer">
            {t('footer.coreui_for_react')}
          </a>
        </div>
      </CFooter>
    )}
  </Translation>
);

export default React.memo(TheFooter);
