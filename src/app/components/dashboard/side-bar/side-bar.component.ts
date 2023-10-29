import {
  Component,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
} from '@angular/core';
import {
  faUserFriends,
  faMessage,
  faBell,
  faGear,
  faRightFromBracket,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { NgToastService } from 'ng-angular-popup';
import { AuthService } from 'src/app/services/auth/auth.service';

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css'],
})
export class SideBarComponent implements OnInit {
  @Output() onToggleSideNav: EventEmitter<SideNavToggle> = new EventEmitter();
  screenWidth = 0;
  collapsed = false;
  closeIcon = faTimes;
  sideBarData = [
    { label: 'Chats', icon: faMessage, routerLink: 'chat' },
    {
      label: 'People',
      icon: faUserFriends,
      routerLink: 'people',
    },
    {
      label: 'Notifications',
      icon: faBell,
      routerLink: '/notification',
    },
    { label: 'Settings', icon: faGear, routerLink: 'setting' },
    { label: 'Logout', icon: faRightFromBracket, routerLink: '' },
  ];

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
    private toastService: NgToastService
  ) {}
  ngOnInit(): void {
    this.screenWidth = window.innerWidth;
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

  logout() {
    this.authService.logout();
    this.toastService.success({
      detail: 'SUCCESS',
      summary: 'Logout successfully',
      duration: 3000,
    });
  }
}
