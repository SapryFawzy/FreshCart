import { TranslatePipe } from '@ngx-translate/core';
import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../../core/auth/services/auth.service';
import { Iaddress } from '../../../../../core/models/address/iaddress.interface';
import { ErrorMsgComponent } from '../../../../../shared/ui/error-msg/error-msg.component';
import { ToastrService } from 'ngx-toastr';
import { map } from 'rxjs';

@Component({
  selector: 'app-addresses',
  imports: [ReactiveFormsModule, ErrorMsgComponent, TranslatePipe],
  templateUrl: './addresses.component.html',
  styleUrl: './addresses.component.css',
})
export class AddressesComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly toastr = inject(ToastrService);
  addresses: WritableSignal<Iaddress[]> = signal([]);
  creating: WritableSignal<boolean> = signal(false);
  openMenu: WritableSignal<boolean> = signal(false);
  addressID: WritableSignal<string> = signal('');
  addressForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    details: ['', [Validators.required]],
    phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
    city: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.getAllAddresses();
  }

  addAddresse(): void {
    if (this.addressForm.valid) {
      this.creating.set(true);
      let payload = this.addressForm.value;
      if (this.addressID()) {
        payload = [this.addressID, payload];
      }
      this.auth
        .addAddresse(payload)
        .pipe(
          map((res: any) => {
            const uniqueAddresses = new Map<string, any>();
            (res.data ?? []).forEach((address: any) => {
              if (!address || !address._id) return;
              uniqueAddresses.set(address._id, address);
            });
            return [...uniqueAddresses.values()];
          }),
        )
        .subscribe((res: any) => {
          this.addresses.set(res.data);
          this.toastr.success(res.message, 'Fresh Cart');
        });
      setTimeout(() => {
        this.creating.set(false);
        this.closePopUpForm();
      }, 1000);
    } else {
      this.addressForm.markAllAsTouched();
    }
  }

  closePopUpForm(): void {
    this.openMenu.set(false);
    this.addressForm.reset();
  }

  openPopUpForm(): void {
    this.openMenu.set(true);
  }

  editAddress(address: Iaddress): void {
    this.addressForm.get('name')?.setValue(address.name);
    this.addressForm.get('details')?.setValue(address.details);
    this.addressForm.get('phone')?.setValue(address.phone);
    this.addressForm.get('city')?.setValue(address.city);
    this.addressID.set(address._id);
    this.openPopUpForm();
  }

  deleteAddresse(id: string): void {
    this.auth.deleteAddresse(id).subscribe((res: any) => {
      this.addresses.set(res.data);
      this.toastr.success(res.message, 'Fresh Cart');
    });
  }

  getAllAddresses(): void {
    this.auth
      .getAddresses()
      .pipe(
        map((res: any) => {
          const uniqueAddresses = new Map<string, any>();
          (res.data ?? []).forEach((address: any) => {
            if (!address || !address._id) return;
            uniqueAddresses.set(address._id, address);
          });
          return [...uniqueAddresses.values()];
        }),
      )
      .subscribe((res: any) => {
        this.addresses.set(res);
      });
  }
}
