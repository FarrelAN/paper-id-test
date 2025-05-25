import { NavItem } from './nav-item.model';

export const APP_NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    icon: 'dashboard',
    path: '/dashboard',
    exactMatch: true,
  },
  {
    label: 'User Management',
    icon: 'group',
    path: '/users',
    exactMatch: false,
  },
  { label: 'Settings', icon: 'settings', path: '/settings', exactMatch: true },
];
export { NavItem };
