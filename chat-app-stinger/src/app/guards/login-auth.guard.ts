import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { inject } from '@angular/core';
import { NgToastService } from 'ng-angular-popup';

/**
 * Author: TaiPV - created: 2023/11/03  
 * Check whether the user already logged in, if not then redirect to Login page, else
 * redirect to Dashboard page
 * @returns boolean
 */
export const loginAuth: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authService = inject(AuthService);
    const toastService = inject(NgToastService);

    if (authService.isLoggedIn()) {
        const url: string = state.url;
        const router = inject(Router);

        // Nếu đã login rồi thì chuyển hướng đến dashboard component
        router.navigate(['/dashboard']);

        if (url.includes('login')) {
            toastService.success({
                detail: 'Hmm!',
                summary: 'You have already logged in.',
                duration: 2000
            });
        } else {
            toastService.info({
                detail: 'Hmm!',
                summary: 'You must log out first to perform this action.',
                duration: 3000
            });
        }

        // Chặn không cho vào Login page
        return false;
    } else {
        // Cho phép truy cập nếu chưa đăng nhập
        return true;
    }
};
