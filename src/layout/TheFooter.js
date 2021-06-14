import React from 'react';
import { CFooter } from '@coreui/react';
import { Translation } from "react-i18next";

const TheFooter = () => (
  <Translation>
  {(t) => (
      <CFooter fixed={false}>
        <div>{t("version")} 0.0.23</div>
        <div className="mfs-auto">
          <span className="mr-1">{t("poweredby")}</span>
          <a href="https://coreui.io/react" target="_blank" rel="noopener noreferrer">
            {t("coreuiforreact")}
          </a>
        </div>
      </CFooter>
    )}
  </Translation>
);

export default React.memo(TheFooter);
