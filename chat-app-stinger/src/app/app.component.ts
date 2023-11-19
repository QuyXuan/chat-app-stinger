import { Component, HostListener } from '@angular/core';
import { AuthService } from './services/auth/auth.service';
import { Router } from '@angular/router';
import { ToastService } from './services/toast/toast.service';

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
    private toastService: ToastService
  ) {
    this.authService.isNotLoggedInSubject.subscribe((res) => {
      this.toastService.showSuccess('You must login first');
    });
  }

  /**
   * Khi người dùng bị mất kết nối thì toast này sẽ được hiển thị
   * @param event
   */
  @HostListener('window:offline', ['$event'])
  onOffline(event: Event): void {
    this.toastService.showError('You are offline');
  }
}
