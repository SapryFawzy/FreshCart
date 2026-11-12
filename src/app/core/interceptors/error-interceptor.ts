import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, tap, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastr = inject(ToastrService);

  function showError(msg: string) {
    toastr.error(msg, 'Error!');
  }
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = error.error?.message || error.message || 'Something went wrong!';
      const isCheckoutDataRequest =
        req.method === 'GET' &&
        (req.url.includes('/addresses') || req.url.includes('/cart'));
      if (!(isCheckoutDataRequest && error.status === 401)) showError(message);
      return throwError(() => error);
    }),
  );
};
