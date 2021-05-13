import React from 'react';
import { useSelector } from 'react-redux';
import TheContent from './TheContent';
import TheSidebar from './TheSidebar';
import TheFooter from './TheFooter';
import TheHeader from './TheHeader';

const TheLayout = (props) => {
  const { isLoggedIn } = useSelector((state) => state.connected);
  if (isLoggedIn) {
    return <div>{props.children}</div>;
  }
  return (
    <div className="c-app c-default-layout">
      <TheSidebar />
      <div className="c-wrapper">
        <TheHeader />
        <div className="c-body">
          <TheContent />
        </div>
        <TheFooter />
      </div>
    </div>
  );
};

export default TheLayout;
