import React, { LazyExoticComponent } from 'react';

export type RouteName = string | ((t: (s: string) => string) => string);

export type SubRoute = {
  id: string;
  authorized: string[];
  path: string;
  name: RouteName;
  component: React.ReactElement | LazyExoticComponent<React.ComponentType<unknown>>;
  navName?: RouteName;
  hidden?: boolean;
  icon?: undefined;
  navButton?: undefined;
  isEntity?: undefined;
  isCustom?: undefined;
  children?: undefined;
};

export type RouteGroup = {
  id: string;
  authorized: string[];
  name: RouteName;
  icon: (active: boolean) => React.ReactElement;
  children: SubRoute[];
  hidden?: boolean;
  path?: undefined;
  navName?: undefined;
  navButton?: undefined;
  isEntity?: undefined;
  isCustom?: undefined;
};

export type SingleRoute = {
  id: string;
  authorized: string[];
  path: string;
  name: RouteName;
  navName?: RouteName;
  icon: (active: boolean) => React.ReactElement;
  navButton?: (
    isActive: boolean,
    toggleSidebar: () => void,
    route: Route,
  ) => React.ReactElement | LazyExoticComponent<React.ComponentType<unknown>>;
  isEntity?: boolean;
  component: React.ReactElement | LazyExoticComponent<React.ComponentType<unknown>>;
  hidden?: boolean;
  isCustom?: boolean;
  children?: undefined;
};

export type Route = SingleRoute | RouteGroup;
