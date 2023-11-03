import { animate, style, transition, trigger } from '@angular/animations';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

export interface ISidebarData {
  routerLink: string;
  icon?: IconDefinition;
  label: string;
  expanded?: boolean;
  items?: ISidebarData[];
  outlet?: string;
  sideRouterLink?: string;
}

export const fadeInOut = trigger('fadeInOut', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('350ms', style({ opacity: 1 })),
  ]),
  transition(':leave', [
    style({ opacity: 0 }),
    animate('350ms', style({ opacity: 1 })),
  ]),
]);
