import { TranslatePipe } from '@ngx-translate/core';
import {
  Component,
  inject,
  input,
  InputSignal,
  OnInit,
  PLATFORM_ID,
  signal,
  WritableSignal,
} from '@angular/core';
import { Iproduct } from '../../../../../core/models/product/iproduct.interface';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../../../core/auth/services/user.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly platform_id = inject(PLATFORM_ID);
  product: InputSignal<Iproduct> = input({} as Iproduct);
  isProductInWishList = () => this.userService.wishlistIds().has(this.product()._id);
  adding: WritableSignal<boolean> = signal(false);
  done: WritableSignal<boolean> = signal(false);
  stars = Array(5);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platform_id)) {
      let token: string = localStorage.getItem('token')!;
      if (!token) token = sessionStorage.getItem('token')!;
      if (token) {
        this.userService.loadWishlist();
      }
    }
  }

  addToWithList(productId: string): void {
    const exists = this.userService.wishlistIds().has(productId);
    const action = exists
      ? this.userService.removefromWithList(productId)
      : this.userService.addToWithList({ productId });
    action.subscribe(() => this.userService.setWishlistMembership(productId, !exists));
  }

  addToCart(id: string) {
    this.adding.set(true);
    this.done.set(false);
    const payload = {
      productId: id,
    };
    this.userService.addToCart(payload).subscribe(() => {
      this.userService.refreshCartCount();
      this.adding.set(false);
      this.done.set(true);
      setTimeout(() => {
        this.done.set(false);
      }, 1000);
    });
  }
}
