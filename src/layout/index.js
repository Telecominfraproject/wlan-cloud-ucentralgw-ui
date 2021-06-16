import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import TheContent from './Content';
import TheSidebar from './Sidebar';
import TheFooter from './Footer';
import TheHeader from './Header';

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

TheLayout.propTypes = {
  children: PropTypes.instanceOf(Object),
};

TheLayout.defaultProps = {
  children: {},
};

export default TheLayout;
