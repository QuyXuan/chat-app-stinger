import { Component, Input } from '@angular/core';
import { ISidebarData, fadeInOut } from './side-bar-helpers';
import {
  faCircle,
  faChevronCircleDown,
  faChevronCircleRight,
} from '@fortawesome/free-solid-svg-icons';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Router } from '@angular/router';
import { DataTransferService } from 'src/app/services/data-transfer/data.service';
import { SelectedItem } from 'src/app/services/data-transfer/selected-item';

@Component({
  selector: 'app-sub-level-menu',
  template: `
    <ul
      *ngIf="collapsed && data.items && data.items.length > 0"
      [@submenu]="
        expanded
          ? {
              value: 'visible',
              params: {
                transitionParams: '400ms cubic-bezier(0.86, 0, 0.07, 1)',
                height: '*'
              }
            }
          : {
              value: 'hidden',
              params: {
                transitionParams: '400ms cubic-bezier(0.86, 0, 0.07, 1)',
                height: '0'
              }
            }
      "
      class="sublevel-nav"
    >
      <li *ngFor="let item of data.items" class="sublevel-nav-item">
        <a
          class="sublevel-nav-link"
          (click)="handleClick(item)"
          *ngIf="item.items && item.items.length > 0"
          [ngClass]="getActiveClass(item)"
        >
          <fa-icon [icon]="faCircle" class="sublevel-link-icon"></fa-icon>
          <span *ngIf="collapsed" @fadeInOut class="sublevel-link-text">
            {{ item.label }}
          </span>
          <fa-icon
            *ngIf="item.items && item.items.length > 0"
            [icon]="item.expanded ? faChevronCircleDown : faChevronCircleRight"
            class="menu-collapse-icon"
          ></fa-icon>
        </a>
        <a
          class="sublevel-nav-link"
          *ngIf="!item.items || (item.items && item.items.length === 0)"
          [routerLink]="[
            '/dashboard',
            { outlets: { body: [data.routerLink, item.routerLink] } }
          ]"
          routerLinkActive="active-sublevel"
          [routerLinkActiveOptions]="{ exact: true }"
          (click) = "handleClick(item)"
        >
          <fa-icon [icon]="faCircle" class="sublevel-link-icon"></fa-icon>
          <span *ngIf="collapsed" @fadeInOut class="sublevel-link-text">
            {{ item.label }}
          </span>
        </a>
        <div *ngIf="item.items && item.items.length > 0">
          <app-sub-level-menu
            [data]="item"
            [collapsed]="collapsed"
            [multiple]="multiple"
            [expanded]="item.expanded"
          ></app-sub-level-menu>
        </div>
      </li>
    </ul>
  `,
  styleUrls: ['./side-bar.component.css'],
  animations: [
    fadeInOut,
    trigger('submenu', [
      state(
        'hidden',
        style({
          height: '0',
          overflow: 'hidden',
        })
      ),
      state(
        'visible',
        style({
          height: '*',
        })
      ),
      transition('visible <=> hidden', [
        style({ overflow: 'hidden' }),
        animate('{{transitionParams}}'),
      ]),
      transition('void => *', animate(0)),
    ]),
  ],
})
export class SubLevelMenuComponent {
  faCircle = faCircle;
  faChevronCircleDown = faChevronCircleDown;
  faChevronCircleRight = faChevronCircleRight;

  @Input() data: ISidebarData = {
    routerLink: '',
    label: '',
    icon: undefined,
    items: [],
  };
  @Input() collapsed: boolean = false;
  @Input() animating: boolean | undefined;
  @Input() expanded: boolean | undefined;
  @Input() multiple: boolean = false;

  constructor(private router: Router, private dataTransferService: DataTransferService) {}

  handleClick(item: any) {
    this.dataTransferService.updateSelectedNavLinkId(new SelectedItem(0, ''));
    if (!this.multiple) {
      if (this.data.items && this.data.items.length > 0) {
        for (let modelItem of this.data.items) {
          if (item !== modelItem && modelItem.expanded) {
            modelItem.expanded = false;
          }
        }
      }
    }
    item.expanded = !item.expanded;
  }

  getActiveClass(item: ISidebarData): string {
    return item.expanded && this.router.url.includes(item.routerLink)
      ? 'active-sublevel'
      : '';
  }
}
