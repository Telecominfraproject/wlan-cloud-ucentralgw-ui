import { ReactNode } from 'react';

export interface Route {
  authorized: string[];
  path: string;
  name: string;
  navName?: string;
  icon: (active: boolean) => ReactNode;
  navButton?: (isActive: boolean, toggleSidebar: () => void, route: Route) => React.ReactNode;
  isEntity?: boolean;
  component: unknown;
  hidden?: boolean;
  isCustom?: boolean;
}
