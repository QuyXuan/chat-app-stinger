import {
  faBell,
  faGear,
  faMessage,
  faRightFromBracket,
  faUserFriends,
} from '@fortawesome/free-solid-svg-icons';
import { ISidebarData } from './side-bar-helpers';

export const sideBarRoutingData: ISidebarData[] = [
  {
    label: 'People',
    icon: faUserFriends,
    routerLink: 'people',
    outlet: 'body',
    items: [
      {
        routerLink: 'list-my-friends',
        label: 'My Friends',
      },
      {
        routerLink: 'list-pending-friends',
        label: 'Pending Friends',
      },
      {
        routerLink: 'list-new-friends',
        label: 'New Friends',
      },
    ],
  },
  {
    label: 'Chats',
    icon: faMessage,
    routerLink: 'chat',
    outlet: 'body',
  },
  {
    label: 'Notifications',
    icon: faBell,
    routerLink: 'chat',
    outlet: 'body',
  },
  {
    label: 'Settings',
    icon: faGear,
    routerLink: 'settings',
    outlet: 'side-body',
  },
  {
    label: 'Logout',
    icon: faRightFromBracket,
    routerLink: '',
  },
];
