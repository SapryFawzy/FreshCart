import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';

export const httpHeaderInterceptor: HttpInterceptorFn = (req, next) => {
  if (
    req.url.includes('cart') ||
    req.url.includes('wishlist') ||
    req.url.includes('/reviews') ||
    req.url.includes('orders') ||
    req.url.includes('addresses') ||
    req.url.includes('users')
  ) {
    const platform_id = inject(PLATFORM_ID);
    if (isPlatformBrowser(platform_id)) {
      let token: string = localStorage.getItem('token')!;
      if (!token) token = sessionStorage.getItem('token')!;
      req = req.clone({
        setHeaders: {
          token: token,
        },
      });
    }
  }
  return next(req);
};
