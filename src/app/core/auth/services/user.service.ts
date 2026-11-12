import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ICartRes } from '../../models/cart/icart.interface';
import { Iorder } from '../../../features/main/orders/model/order/iorder.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly httpClient = inject(HttpClient);
  wishListCount: WritableSignal<number> = signal(0);
  cartCount: WritableSignal<number> = signal(0);
  readonly wishlistIds = signal<Set<string>>(new Set());
  private wishlistLoaded = false;
  private wishlistLoading = false;

  //wishList Actions
  getWithList(): Observable<object> {
    return this.httpClient.get(`${environment.basUrlV1}/wishlist`);
  }

  loadWishlist(): void {
    if (this.wishlistLoaded || this.wishlistLoading) return;
    this.wishlistLoading = true;
    this.getWithList().subscribe({
      next: (res: any) => {
        const ids = new Set<string>((res.data ?? []).map((item: any) => item.id ?? item._id));
        this.wishlistIds.set(ids);
        this.wishListCount.set(res.count ?? ids.size);
        this.wishlistLoaded = true;
        this.wishlistLoading = false;
      },
      error: (err) => {
        this.wishlistLoading = false;
        console.error('Wishlist error:', err);
      },
    });
  }

  setWishlistMembership(productId: string, exists: boolean): void {
    const ids = new Set(this.wishlistIds());
    exists ? ids.add(productId) : ids.delete(productId);
    this.wishlistIds.set(ids);
    this.wishListCount.set(ids.size);
    this.wishlistLoaded = true;
  }

  refreshWishListCount(): void {
    this.loadWishlist();
    this.wishListCount.set(this.wishlistIds().size);
  }

  addToWithList(productId: { productId: string }): Observable<object> {
    return this.httpClient.post(`${environment.basUrlV1}/wishlist`, productId);
  }
  removefromWithList(productId: string): Observable<object> {
    return this.httpClient.delete(`${environment.basUrlV1}/wishlist/${productId}`);
  }

  //Cart Actions
  refreshCartCount(): void {
    this.getCart().subscribe({
      next: (res: any) => {
        const count = res.numOfCartItems ?? res.data.products?.length ?? 0;
        this.cartCount.set(count);
      },
      error: (err) => console.error('Cart error:', err),
    });
  }

  getCart(): Observable<ICartRes> {
    return this.httpClient.get<ICartRes>(`${environment.basUrlV1}/cart`);
  }

  addToCart(productId: { productId: string }): Observable<ICartRes> {
    return this.httpClient.post<ICartRes>(`${environment.basUrlV1}/cart`, productId);
  }

  removefromCart(productId: string): Observable<ICartRes> {
    return this.httpClient.delete<ICartRes>(`${environment.basUrlV1}/cart/${productId}`);
  }

  clearCart(): Observable<ICartRes> {
    return this.httpClient.delete<ICartRes>(`${environment.basUrlV1}/cart`);
  }

  updateCartProductQuantity(id: string, count: { count: string }): Observable<ICartRes> {
    return this.httpClient.put<ICartRes>(`${environment.basUrlV1}/cart/${id}`, count);
  }

  createCashOrder(
    cartId: string,
    shippingAddress: { city: string; details: string; phone: string },
  ): Observable<object> {
    return this.httpClient.post(`${environment.basUrlV1}/orders/${cartId}`, { shippingAddress });
  }

  createCardCheckout(
    shippingAddress: { city: string; details: string; phone: string },
    cartId: string,
    url: string,
  ): Observable<object> {
    return this.httpClient.post(
      `${environment.basUrlV1}/orders/checkout-session/${cartId}?url=${encodeURIComponent(url)}`,
      { shippingAddress },
    );
  }

  getUserOrders(userID: string): Observable<Iorder[]> {
    return this.httpClient.get<Iorder[]>(`${environment.basUrlV1}/orders/user/${userID}`);
  }

  createReviewForProduct(
    productId: string,
    body: { review: string; rating: number },
  ): Observable<any> {
    return this.httpClient.post(`${environment.basUrlV1}/products/${productId}/reviews`, body);
  }

  updateReviewForProduct(
    reviewId: string,
    body: { review: string; rating: number },
  ): Observable<any> {
    return this.httpClient.put(`${environment.basUrlV1}/reviews/${reviewId}`, body);
  }

  deleteReviewForProduct(reviewId: string): Observable<any> {
    return this.httpClient.delete(`${environment.basUrlV1}/reviews/${reviewId}`);
  }

  getReviewsForProduct(productId: string): Observable<any> {
    return this.httpClient.get(`${environment.basUrlV1}/products/${productId}/reviews`);
  }
}
