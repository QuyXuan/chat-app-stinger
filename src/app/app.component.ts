import { Component, HostListener } from '@angular/core';
import { AuthService } from './services/auth/auth.service';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'chatappstinger';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: NgToastService,
  ) {
    this.authService.isNotLoggedInSubject.subscribe((res) => {
      this.toastService.error({
        detail: 'ERROR',
        summary: 'You must login first',
        duration: 5000,
      });
    });
  }

  /**
   * Khi người dùng bị mất kết nối thì toast này sẽ được hiển thị
   * @param event 
   */
  @HostListener('window:offline', ['$event'])
  onOffline(event: Event): void {
    this.toastService.error({
      detail: 'Disconnect',
      summary: 'You are offline',
      position: 'bottomLeft',
      sticky: true
    });
  }
}
