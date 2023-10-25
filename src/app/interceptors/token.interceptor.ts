import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, catchError, throwError, switchMap } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { NgToastService } from 'ng-angular-popup';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private toastService: NgToastService,
    private router: Router
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const myToken = this.authService.getAccessToken();
    if (myToken) {
      request = request.clone({
        setHeaders: { Authorization: `Bearer ${myToken}` },
      });
    }
    return next.handle(request).pipe(
      catchError((error: any) => {
        if (error instanceof HttpErrorResponse) {
          if (error.status === 401) {
            return this.handleUnAuthorizedError(request, next);
          } else {
            return throwError(() => new Error('Some Other Error Occurred'));
          }
        }
        return throwError(() => error);
      })
    );
  }

  handleUnAuthorizedError(req: HttpRequest<any>, next: HttpHandler) {
    const token = this.authService.createToken({
      accessToken: this.authService.getAccessToken(),
      refreshToken: this.authService.getRefreshToken(),
    });
    const tokenExpiration = JSON.parse(atob(token.split('.')[1])).exp * 1000;
    if (Date.now() < tokenExpiration) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      return next.handle(req);
    } else {
      return throwError(() => {
        this.toastService.warning({
          detail: 'WARNING',
          summary: 'Login Session Expire',
          duration: 5000,
        });
        this.router.navigate(['login']);
      });
    }
  }
}
