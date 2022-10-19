import React from 'react';
import { v4 as uuid } from 'uuid';
import NavLinkButton from './NavLinkButton';
import { Route } from 'models/Routes';

const createLinks = (
  routes: Route[],
  activeRoute: (path: string, otherRoute: string | undefined) => string,
  role: string,
) =>
  routes.map((route) => (
    <NavLinkButton key={uuid()} activeRoute={activeRoute} role={role} route={route} />
  ));

export default createLinks;
