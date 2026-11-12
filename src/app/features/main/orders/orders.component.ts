import { TranslatePipe } from '@ngx-translate/core';
import { CurrencyPipe, DatePipe, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { UserService } from '../../../core/auth/services/user.service';
import { Iorder } from './model/order/iorder.interface';

@Component({
  selector: 'app-orders',
  imports: [RouterLink, DatePipe, CurrencyPipe, TranslatePipe],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
})
export class OrdersComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly platformId = inject(PLATFORM_ID);
  readonly orders = signal<Iorder[]>([]);
  readonly expandedOrderId = signal<string | null>(null);

  ngOnInit(): void {
    this.getOrders();
  }

  getOrders(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    let token = localStorage.getItem('token');
    if (!token) token = sessionStorage.getItem('token');
    if (!token) return;

    try {
      const decoded = jwtDecode<{ id?: string }>(token);
      if (!decoded.id) return;
      this.userService.getUserOrders(decoded.id).subscribe({
        next: (response) => {
          this.orders.set(Array.isArray(response) ? response.filter(this.isValidOrder) : []);
        },
        error: () => this.orders.set([]),
      });
    } catch {
      this.orders.set([]);
    }
  }

  toggleDetails(order: Iorder): void {
    const id = this.orderId(order);
    if (id) this.expandedOrderId.update((current) => (current === id ? null : id));
  }

  isExpanded(order: Iorder): boolean {
    return this.expandedOrderId() === this.orderId(order);
  }

  orderId(order: Iorder): string {
    return order._id;
  }

  orderNumber(order: Iorder): string {
    return this.orderId(order).slice(-6).toUpperCase() || '—';
  }

  items(order: Iorder): Iorder['cartItems'] {
    return order.cartItems.filter((item) => !!item?.product);
  }

  itemCount(order: Iorder): number {
    return this.items(order).reduce((total, item) => total + (Number(item.count) || 0), 0);
  }

  firstImage(order: Iorder): string | null {
    return this.items(order)[0]?.product?.imageCover || null;
  }

  shippingIsFree(order: Iorder): boolean {
    return order.shippingPrice <= 0;
  }

  private readonly isValidOrder = (value: Iorder): boolean => {
    if (!value || typeof value !== 'object') return false;
    return typeof value._id === 'string' && Array.isArray(value.cartItems);
  };
}
