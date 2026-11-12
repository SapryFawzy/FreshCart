import { TranslatePipe } from '@ngx-translate/core';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';
import { ErrorMsgComponent } from '../../../shared/ui/error-msg/error-msg.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  imports: [RouterLink, ReactiveFormsModule, ErrorMsgComponent, TranslatePipe],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  loading: WritableSignal<boolean> = signal(false);
  stage: WritableSignal<number> = signal(1);
  mailForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });
  codeForm: FormGroup = this.fb.group({
    resetCode: ['', [Validators.required, Validators.minLength(6)]],
  });
  newPasswordForm: FormGroup = this.fb.group(
    {
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

  sendVrifyCode(): void {
    if (this.mailForm.valid) {
      this.loading.set(true);
      this.auth.forgotPassword(this.mailForm.value).subscribe((res : any) => {
        this.toastr.success(res.message,'Fresh Cart');
        setTimeout(() => {
          this.loading.set(false);
          this.stage.set(2);
        }, 500);
      });
    }
  }

  verifyCode() {
    if (this.codeForm.valid) {
      this.loading.set(true);
      const payload = {
        resetCode: this.codeForm.get('resetCode')?.value,
      };
      this.auth.verifyResetCode(payload).subscribe((res : any) => {
        this.toastr.success(res.message,'Fresh Cart');
        setTimeout(() => {
          this.loading.set(false);
          this.stage.set(3);
        }, 500);
      });
    } else {
      this.codeForm.markAllAsTouched();
    }
  }

  updatePassword() {
    if (this.newPasswordForm.valid) {
      this.loading.set(true);
      const payload = {
        email: this.mailForm.get('email')?.value,
        newPassword: this.newPasswordForm.get('password')?.value,
      };
      this.auth.resetPassword(payload).subscribe((res : any) => {
        this.toastr.success(res.message,'Fresh Cart');
        setTimeout(() => {
          this.loading.set(false);
          this.router.navigate(['/login']);
        }, 500);
      });
    } else {
      this.newPasswordForm.markAllAsTouched();
    }
  }

  submit() {
    if (this.stage() === 1) {
      this.sendVrifyCode();
    } else if (this.stage() === 2) {
      this.verifyCode();
    } else if (this.stage() === 3) {
      this.updatePassword();
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
    const password = this.newPasswordForm.get('password')?.value || '';
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

  goBackToFristStep(): void {
    this.stage.set(1);
  }
}
