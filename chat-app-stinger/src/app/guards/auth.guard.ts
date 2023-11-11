import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  if (authService.isLoggedIn()) {
    return true;
  }
  const router = inject(Router);
  const urlTree: UrlTree = router.createUrlTree(['login']);
  authService.isNotLoggedInSubject.next(true);
  return urlTree;
};
