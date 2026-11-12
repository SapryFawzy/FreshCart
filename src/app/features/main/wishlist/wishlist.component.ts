import { TranslatePipe } from '@ngx-translate/core';
import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { UserService } from '../../../core/auth/services/user.service';
import { RouterLink } from '@angular/router';
import { Iwishlist } from '../../../core/models/wishlist/iwishlist.interface';

@Component({
  selector: 'app-wishlist',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css',
})
export class WishlistComponent implements OnInit {
  private readonly userService = inject(UserService);
  wishList: WritableSignal<Iwishlist[]> = signal([]);
  done: WritableSignal<boolean> = signal(false);

  ngOnInit(): void {
    this.getWishList();
  }

  getWishList() {
    this.userService.getWithList().subscribe((res: any) => {
      this.wishList.set(res.data ?? []);
      setTimeout(() => {
        this.done.set(true);
      }, 500);
    });
  }

  removeItem(id: string) {
    this.userService.removefromWithList(id).subscribe((res: any) => {
      this.getWishList();
      this.userService.refreshWishListCount();
    });
  }
}
