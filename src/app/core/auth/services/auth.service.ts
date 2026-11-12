import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

type newAddress = {
  name: string;
  details: string;
  phone: string;
  city: string;
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly httpClint = inject(HttpClient);

  signup(body: JSON): Observable<object> {
    return this.httpClint.post(`${environment.basUrlV1}/auth/signup`, body);
  }

  signin(body: JSON): Observable<object> {
    return this.httpClint.post(`${environment.basUrlV1}/auth/signin`, body);
  }

  forgotPassword(email: { email: string }): Observable<object> {
    return this.httpClint.post(`${environment.basUrlV1}/auth/forgotPasswords`, email);
  }

  verifyResetCode(code: { resetCode: string }): Observable<object> {
    return this.httpClint.post(`${environment.basUrlV1}/auth/verifyResetCode`, code);
  }

  resetPassword(body: { email: string; newPassword: string }): Observable<object> {
    return this.httpClint.put(`${environment.basUrlV1}/auth/resetPassword`, body);
  }

  changePassword(body: {
    currentPassword: string;
    password: string;
    rePassword: string;
  }): Observable<object> {
    return this.httpClint.put(`${environment.basUrlV1}/users/changeMyPassword`, body);
  }

  saveUserData(body: { name: string; email: string; phone: string }): Observable<object> {
    return this.httpClint.put(`${environment.basUrlV1}/users/updateMe/`, body);
  }

  getAddresses(): Observable<object> {
    return this.httpClint.get(`${environment.basUrlV1}/addresses`);
  }

  addAddresse(body: newAddress | [id: string, newAddress]): Observable<object> {
    return this.httpClint.post(`${environment.basUrlV1}/addresses`, body);
  }

  deleteAddresse(id: string): Observable<object> {
    return this.httpClint.delete(`${environment.basUrlV1}/addresses/${id}`);
  }

  createCashOrder(cartId: string, body: any): Observable<object> {
    return this.httpClint.post(`${environment.basUrlV1}/orders/${cartId}`, body);
  }

  checkoutSession(cartId: string, body: any): Observable<object> {
    return this.httpClint.post(
      `${environment.basUrlV1}/orders/checkout-session/${cartId}?url=${environment.url}`,
      body,
    );
  }
}
