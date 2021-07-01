import React, { useState } from 'react';
import TheContent from './Content';
import TheSidebar from './Sidebar';
import TheFooter from './Footer';
import TheHeader from './Header';

const TheLayout = () => {
  const [showSidebar, setShowSidebar] = useState('responsive');

  return (
    <div className="c-app c-default-layout">
      <TheSidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
      <div className="c-wrapper">
        <TheHeader showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
        <div className="c-body">
          <TheContent />
        </div>
        <TheFooter />
      </div>
    </div>
  );
};

export default TheLayout;
