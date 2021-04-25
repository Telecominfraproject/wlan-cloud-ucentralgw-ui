import React from 'react'
import {
  TheContent,
  TheSidebar,
  TheFooter,
  TheHeader
} from './index';
import { useSelector } from 'react-redux';

const TheLayout = (props) => {
  const { isLoggedIn } = useSelector(state => state.connected);
  if(isLoggedIn){
    return (
        <div>
            {props.children}
        </div>
    );
  }
  return (
    <div className="c-app c-default-layout">
      <TheSidebar/>
      <div className="c-wrapper">
        <TheHeader/>
        <div className="c-body">
          <TheContent/>
        </div>
        <TheFooter/>
      </div>
    </div>
  )
}

export default TheLayout
