import {
  Component,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
} from '@angular/core';
import {
  faTimes,
  faChevronCircleRight,
  faChevronCircleDown,
} from '@fortawesome/free-solid-svg-icons';
import { NgToastService } from 'ng-angular-popup';
import { AuthService } from 'src/app/services/auth/auth.service';
import { sideBarRoutingData } from './side-bar-routing-data';
import { ISidebarData, fadeInOut } from './side-bar-helpers';
import {
  animate,
  keyframes,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Router } from '@angular/router';
import { DataTransferService } from 'src/app/services/data-transfer/data.service';
import { SelectedItem } from 'src/app/services/data-transfer/selected-item';
import { NotificationService } from 'src/app/services/notification/notification.service';

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css'],
  animations: [
    fadeInOut,
    trigger('rotate', [
      transition(':enter', [
        animate(
          '1000ms',
          keyframes([
            style({ transform: 'rotate(0deg)', offset: '0' }),
            style({ transform: 'rotate(2turn)', offset: '1' }),
          ])
        ),
      ]),
    ]),
  ],
})
export class SideBarComponent implements OnInit {
  displayName!: string;

  // Mặc định mới vào sẽ active menu item Chat
  selectedNavLinkId: number = 1;
  hasNewNotifications: boolean = false;

  @Output() onToggleSideNav: EventEmitter<SideNavToggle> = new EventEmitter();

  // Gửi tên component được click trên sideBar đến dashboard
  @Output() onClickNavLink = new EventEmitter<string>();

  screenWidth = 0;
  collapsed = false;
  closeIcon = faTimes;
  faChevronCircleRight = faChevronCircleRight;
  faChevronCircleDown = faChevronCircleDown;
  sideBarData = sideBarRoutingData;
  multiple: boolean = false;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.screenWidth = window.innerWidth;
    if (this.screenWidth <= 768) {
      this.collapsed = false;
      this.onToggleSideNav.emit({
        collapsed: this.collapsed,
        screenWidth: this.screenWidth,
      });
    }
  }
  constructor(
    private authService: AuthService,
    private toastService: NgToastService,
    private router: Router,
    private dataTransferService: DataTransferService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.screenWidth = window.innerWidth;
    this.toggleCollapse();

    this.displayName = localStorage.getItem('displayName') ?? 'Stinger';
    this.dataTransferService.displayName.subscribe((displayName: string) => {
      this.displayName = displayName;
    });

    this.dataTransferService.selectedNavLink.subscribe((data: SelectedItem) => {
      this.selectedNavLinkId = data.id;
    });

    this.dataTransferService.newNotifications.subscribe((newNotificationsCount) => {
      this.hasNewNotifications = newNotificationsCount != 0;
    });

    if (this.router.url.includes('people')) {
      this.dataTransferService.updateSelectedNavLinkId(new SelectedItem(0, ''));
      this.sideBarData[0].expanded = true;
    }
  }

  getRouterLink(data: ISidebarData) {
    if (data.outlet === 'body') {
      return ['/dashboard', { outlets: { body: [data.routerLink] } }];
    }
    return [''];
  }

  toggleCollapse() {
    this.collapsed = !this.collapsed;
    this.onToggleSideNav.emit({
      collapsed: this.collapsed,
      screenWidth: this.screenWidth,
    });
  }

  closeSideNav() {
    this.collapsed = false;
    this.onToggleSideNav.emit({
      collapsed: this.collapsed,
      screenWidth: this.screenWidth,
    });
  }

  handleClick(item: ISidebarData) {
    if (!this.multiple) {
      for (let modelItem of this.sideBarData) {
        if (item !== modelItem && modelItem.expanded) {
          modelItem.expanded = false;
        }
      }
    }
    item.expanded = !item.expanded;
  }

  getActiveClass(data: ISidebarData): string {
    return this.router.url.includes(data.routerLink) ? 'active' : '';
  }

  logout() {
    this.authService.logout();
    this.toastService.success({
      detail: 'SUCCESS',
      summary: 'Logout successfully',
      duration: 3000,
    });
  }

  handleClickNavLink(navLinkIndex: number): void {
    if (this.sideBarData[navLinkIndex].label === 'Notifications') {
      this.hasNewNotifications = false;
      this.notificationService.seenNewNotifications();
    }
    this.selectedNavLinkId = navLinkIndex;
    this.dataTransferService.updateSelectedNavLinkId(new SelectedItem(navLinkIndex, this.sideBarData[navLinkIndex].label))
    this.onClickNavLink.emit(this.sideBarData[navLinkIndex].label);
  }

  getRouterNavLink(navLinkIndex: number) {
    if (navLinkIndex == this.sideBarData.length - 1) {
      // Khi nhấn logout
      return '';
    }
    if (this.sideBarData[navLinkIndex].label === 'Chats') {
      return ['/dashboard', { outlets: { 'body': 'chat' } }];
    }
    return ['/dashboard'];
  }
}