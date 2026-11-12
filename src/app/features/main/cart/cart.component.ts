import { TranslatePipe } from '@ngx-translate/core';
import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { UserService } from '../../../core/auth/services/user.service';
import { RouterLink } from '@angular/router';
import { Icart, ICartData, ICartRes } from '../../../core/models/cart/icart.interface';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent implements OnInit {
  private readonly userService = inject(UserService);
  cartItems: WritableSignal<Icart[]> = signal([]);
  cart: WritableSignal<ICartData | null> = signal(null);
  done: WritableSignal<boolean> = signal(false);

  ngOnInit(): void {
    this.getCart();
  }

  getCart() {
    this.userService.getCart().subscribe((res: ICartRes) => {
      this.cartItems.set(res.data.products);
      this.cart.set(res.data);
      this.userService.refreshCartCount();
            setTimeout(() => {
        this.done.set(true);
      }, 500);
    });
  }

  updateCartProductQuantity(id: string, count: number, itemCount: number) {
    const newCount = `${count + itemCount}`;
    const payload = {
      count: newCount,
    };
    this.userService.updateCartProductQuantity(id, payload).subscribe((res: ICartRes) => {
      this.cartItems.set(res.data.products);
      this.cart.set(res.data);
      this.userService.refreshCartCount();
    });
  }

  removeItem(id: string) {
    this.userService.removefromCart(id).subscribe((res: ICartRes) => {
      this.cartItems.set(res.data.products);
      this.cart.set(res.data);
      this.userService.refreshCartCount();
    });
  }

  clearCart() {
    this.userService.clearCart().subscribe((res: ICartRes) => {
      this.cartItems.set([]);
      this.cart.set(null);
      this.userService.refreshCartCount();
    });
  }
}
