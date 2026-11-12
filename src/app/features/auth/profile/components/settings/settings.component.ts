import { TranslatePipe } from '@ngx-translate/core';
import { Component, inject, OnInit, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../../../../core/auth/services/auth.service';
import { Router } from '@angular/router';
import { ErrorMsgComponent } from '../../../../../shared/ui/error-msg/error-msg.component';
import { isPlatformBrowser } from '@angular/common';
import { Iuser } from '../../../../../core/models/user/iuser.interface';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule, ErrorMsgComponent, TranslatePipe],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly paltform_id = inject(PLATFORM_ID);
  private readonly toastr = inject(ToastrService);
  userloading: WritableSignal<boolean> = signal(false);
  user: WritableSignal<Iuser> = signal({} as Iuser);
  passwordloading: WritableSignal<boolean> = signal(false);
  userForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
  });
  changePasswordForm: FormGroup = this.fb.group(
    {
      currentPassword: [
        '',
        [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)],
      ],
      password: [
        '',
        [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)],
      ],
      rePassword: ['', [Validators.required]],
    },
    {
      validators: this.passwordMatchValidator.bind(this),
    },
  );

  ngOnInit(): void {
    if (isPlatformBrowser(this.paltform_id)) {
      let user = JSON.parse(localStorage.getItem('user')!);
      if (!user) user = JSON.parse(sessionStorage.getItem('user')!);
      if (user) this.user.set(user);
    }

    this.userForm.get('name')?.setValue(this.user().name);
    this.userForm.get('email')?.setValue(this.user().email);
  }

  updateUser(): void {
    if (this.userForm.valid) {
      this.userloading.set(true);
      this.auth.saveUserData(this.userForm.value).subscribe((res:any)=>{
        this.toastr.success(res.message,'Fresh Cart');
      });
      setTimeout(() => {
        this.userloading.set(false);
      }, 1000);
    } else {
      this.userForm.markAllAsTouched();
    }
  }

  updatePassword(): void {
    if (this.changePasswordForm.valid) {
      this.passwordloading.set(true);
      this.auth.changePassword(this.changePasswordForm.value).subscribe((res:any)=>{
        this.toastr.success(res.message,'Fresh Cart');
      });
      setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        this.passwordloading.set(false);
        this.router.navigate(['/login']);
      }, 1000);
    } else {
      this.changePasswordForm.markAllAsTouched();
    }
  }

  togglePassword(e: HTMLInputElement, icon: HTMLElement): void {
    if (e.type === 'password') icon.classList.replace('fa-eye-slash', 'fa-eye');
    else icon.classList.replace('fa-eye', 'fa-eye-slash');
    e.type = e.type === 'password' ? 'text' : 'password';
  }

  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const rePassword = form.get('rePassword')?.value;
    if (form.get('password')?.touched && form.get('rePassword')?.touched) {
      if (!password || !rePassword) {
        return null;
      }
      return password === rePassword ? null : { mismatch: true };
    }
    return null;
  }

  get passwordStrength(): { label: string; color: string; width: string } {
    const password = this.changePasswordForm.get('password')?.value || '';
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const levels = [
      { label: 'UI.VERY_WEAK', color: 'bg-red-500', width: '20' },
      { label: 'UI.WEAK', color: 'bg-orange-500', width: '40' },
      { label: 'UI.MEDIUM', color: 'bg-yellow-500', width: '60' },
      { label: 'UI.STRONG', color: 'bg-blue-500', width: '80' },
      { label: 'UI.VERY_STRONG', color: 'bg-green-500', width: '100' },
    ];
    return score === 0
      ? { label: 'UI.VERY_VERY_WEAK', color: 'bg-gray-200', width: '0' }
      : levels[score - 1];
  }
}
