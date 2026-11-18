import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

export const authGuard: CanActivateFn = (route, state) => {
  const platform_id = inject(PLATFORM_ID);
  const userService = inject(UserService);
  const router = inject(Router);
  let token: string;
  if (isPlatformBrowser(platform_id)) {
    token = localStorage.getItem('token')!;
    if (!token) token = sessionStorage.getItem('token')!;
    if (token) {
      if (userService.isValidUser()) {
        return true;
      }
    }
  }
  router.navigate(['/home']);
  return false;
};
