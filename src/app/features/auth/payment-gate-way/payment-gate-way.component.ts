import { TranslatePipe } from '@ngx-translate/core';
import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';
import { UserService } from '../../../core/auth/services/user.service';
import { Iaddress } from '../../../core/models/address/iaddress.interface';
import { Icart, ICartRes } from '../../../core/models/cart/icart.interface';
import { ErrorMsgComponent } from '../../../shared/ui/error-msg/error-msg.component';

@Component({
  selector: 'app-payment-gate-way',
  imports: [ReactiveFormsModule, RouterLink, ErrorMsgComponent, TranslatePipe],
  templateUrl: './payment-gate-way.component.html',
  styleUrl: './payment-gate-way.component.css',
})
export class PaymentGateWayComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  addresses: WritableSignal<Iaddress[]> = signal([]);
  cart: WritableSignal<Icart[]> = signal([]);
  cartId: WritableSignal<string> = signal('');
  selectedAddress: WritableSignal<Iaddress | null> = signal(null);
  addressForm: FormGroup = this.fb.group({
    city: ['', [Validators.required]],
    details: ['', [Validators.required]],
    phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
  });
  cash: WritableSignal<boolean> = signal(false);
  card: WritableSignal<boolean> = signal(false);
  adding = signal(false);
  done = signal(false);
  attemptedSubmit = signal(false);
  errorMessage = signal('');
  subtotal = signal(0);

  get shippingCost(): number {
    return this.subtotal() >= 500 ? 0 : 50;
  }

  get finalTotal(): number {
    return this.subtotal() + this.shippingCost;
  }

  ngOnInit(): void {
    this.auth.getAddresses().subscribe({
      next: (res: any) => {
        const addressData = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.addresses)
            ? res.data.addresses
            : Array.isArray(res?.addresses)
              ? res.addresses
              : [];
        this.addresses.set(addressData.filter((address: Iaddress) => Boolean(address?._id)));
      },
      error: () => this.addresses.set([]),
    });
    this.userService.getCart().subscribe({
      next: (res: ICartRes) => {
        this.cart.set(res.data?.products ?? []);
        this.subtotal.set(res.data?.totalCartPrice ?? 0);
        this.cartId.set(res.cartId);
      },
      error: () => {
        this.cart.set([]);
        this.subtotal.set(0);
      },
    });
  }

  selectAddress(address: Iaddress): void {
    this.selectedAddress.set(address);
    this.addressForm.reset();
    this.errorMessage.set('');
  }

  onAddressFormInput(): void {
    const hasCustomAddress = Object.values(this.addressForm.getRawValue()).some((value) =>
      String(value ?? '').trim(),
    );
    if (hasCustomAddress) this.selectedAddress.set(null);
    this.errorMessage.set('');
  }

  selectPayment(method: 'cash' | 'card'): void {
    this.cash.set(method === 'cash');
    this.card.set(method === 'card');
    this.errorMessage.set('');
  }

  placeOrder(): void {
    this.attemptedSubmit.set(true);
    this.errorMessage.set('');
    if (!this.selectedAddress() && this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      this.errorMessage.set('UI.PAYMENT_ADDRESS_REQUIRED');
      return;
    }
    if (!this.cash() && !this.card()) {
      this.errorMessage.set('UI.PAYMENT_METHOD_REQUIRED');
      return;
    }
    if (!this.cart().length) {
      this.errorMessage.set('UI.PAYMENT_EMPTY_CART');
      return;
    }

    this.adding.set(true);

    const selectedAddress = this.selectedAddress();
    const shippingAddress = selectedAddress
      ? {
          details: selectedAddress.details,
          phone: selectedAddress.phone,
          city: selectedAddress.city,
        }
      : this.addressForm.getRawValue();
    const payload = { shippingAddress };
    const orderRequest = this.card()
      ? this.auth.checkoutSession(this.cartId(), payload)
      : this.auth.createCashOrder(this.cartId(), payload);

    orderRequest.subscribe({
      next: (res: any) => {
        if (this.card()) {
          const checkoutUrl = res?.session?.url ?? res?.url;
          if (checkoutUrl) {
            window.location.assign(checkoutUrl);
            return;
          }
          this.adding.set(false);
          this.errorMessage.set('UI.PAYMENT_PAGE_FAILED');
          return;
        }

        this.done.set(true);
        setTimeout(() => this.router.navigate(['/orders']), 700);
      },
      error: (error) => {
        this.adding.set(false);
        this.errorMessage.set(
          error?.error?.message ?? 'UI.ORDER_FAILED',
        );
      },
    });
  }
}
